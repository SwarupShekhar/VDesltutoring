import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
// AccessToken is from server-sdk
import { AccessToken } from "livekit-server-sdk";
// Room and events are from rtc-node for Node.js support (replaces livekit-client)
import { Room, RoomEvent, AudioStream, TrackKind } from "@livekit/rtc-node";
import type { RemoteTrack, Track } from "@livekit/rtc-node";
import "dotenv/config";


// Polyfill for Node.js environment overrides if needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;



// Global Error Handlers to prevent crash
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    // In production, we might want to restart, but for this worker, logging is key.
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Track active connections to avoid duplicates
const activeSessions = new Set<string>();

async function startWorker() {
    console.log("Starting Live Session Worker...");

    // 1. Sanity Check on Startup
    await syncLiveSessions();

    // Start polling or listening loop
    setInterval(safeCheckForNewSessions, 5000);
    // Also check for ended sessions to summarize
    setInterval(safeCheckForEndedSessions, 10000);
    // Cleanup stale queue entries
    setInterval(cleanupQueue, 60 * 1000); // Every 1 minute
    // Enforce 15-minute max session duration (Safety)
    setInterval(safeCheckExpiredSessions, 60 * 1000); // Check every minute
}

async function syncLiveSessions() {
    console.log("Running startup sanity check on live sessions...");
    // Find sessions marked 'live' or 'waiting' that might be zombies
    // If we just restarted, we lost all track listeners. 
    // We should assume ANY 'live' session in DB is now unmonitored.
    // Ideally we'd try to reconnect, but for MVP it's safer to mark them as 'ended' 
    // so users aren't stuck status-wise (they can just rejoin).

    // Actually, 'waiting' sessions are fine (they are just in queue matched), 
    // but 'live' sessions require Active Worker monitoring for transcription.
    // If worker died, transcription died.

    const zombies = await prisma.live_sessions.updateMany({
        where: {
            status: { in: ['live', 'waiting'] },
            // Optional: Only kill if started > 10m ago? 
            // For safety, let's just kill them to reset state.
        },
        data: {
            status: 'ended',
            ended_at: new Date()
        }
    });

    console.log(`Sanity Check: Marked ${zombies.count} zombie sessions as ended.`);

    // Also clear the queue? users might be waiting.
    // Let's clean stale queue.
    await cleanupQueue();
}

async function cleanupQueue() {
    try {
        const result = await prisma.live_queue.deleteMany({
            where: {
                joined_at: {
                    lt: new Date(Date.now() - 60 * 1000) // Older than 60s
                }
            }
        });
        if (result.count > 0) {
            console.log(`Cleaned up ${result.count} stale queue entries.`);
        }
    } catch (e) {
        console.error("Queue cleanup error:", e);
    }
}

async function safeCheckForNewSessions() {
    try {
        await checkForNewSessions();
    } catch (e) {
        console.error("Error in checkNewSessions loop:", e);
    }
}

async function checkForNewSessions() {
    // Find sessions that are 'waiting' or 'live' but we aren't tracking
    // Note: In a real app we'd use status 'live' more strictly.
    const sessions = await prisma.live_sessions.findMany({
        where: {
            OR: [{ status: 'waiting' }, { status: 'live' }],
            ended_at: null
        }
    });

    for (const session of sessions) {
        if (!activeSessions.has(session.id)) {
            console.log(`Found active session ${session.id}, joining...`);
            activeSessions.add(session.id);
            // Don't await this inside the loop so one failure doesn't block others
            // But catch its errors
            joinSessionAndTranscribe(session).catch(e =>
                console.error(`Failed to join session ${session.id}:`, e)
            );
        }
    }
}

async function safeCheckForEndedSessions() {
    try {
        await checkForEndedSessions();
    } catch (e) {
        console.error("Error in checkEndedSessions loop:", e);
    }
}

async function safeCheckExpiredSessions() {
    try {
        await checkExpiredSessions();
    } catch (e) {
        console.error("Error in checkExpiredSessions loop:", e);
    }
}

async function checkExpiredSessions() {
    // 🧩 Fix #2 — Expire sessions on inactivity (> 15 mins)
    console.log("Checking for expired sessions...");
    const expiredSessions = await prisma.live_sessions.updateMany({
        where: {
            status: { in: ['live', 'waiting'] },
            started_at: {
                lt: new Date(Date.now() - 15 * 60 * 1000) // Older than 15 mins
            }
        },
        data: {
            status: 'ended',
            ended_at: new Date()
        }
    });

    if (expiredSessions.count > 0) {
        console.log(`[Worker] Expired ${expiredSessions.count} sessions due to timeout (>15m).`);
    }
}

async function checkForEndedSessions() {
    // NOTE:
    // Originally this worker tried to directly call FluencyEngine here to
    // backfill summaries for any 'ended' sessions missing summaries.
    //
    // FluencyEngine is now invoked reliably from:
    // - /api/live-practice/leave
    // - /api/webhooks/livekit
    //
    // To keep the worker decoupled from Next.js internals (and avoid module
    // resolution issues when running via ts-node), this function now simply
    // logs which sessions are missing summaries. The actual evaluation is
    // handled in the app layer.
    const sessions = await prisma.live_sessions.findMany({
        where: {
            status: 'ended',
            summaries: { none: {} }
        },
        select: { id: true, room_name: true }
    });

    if (sessions.length > 0) {
        console.log(
            `[Worker] Found ${sessions.length} ended live_sessions without summaries. ` +
            `These will be evaluated by FluencyEngine via API/webhook on subsequent requests.`
        );
    }
}


// REDUNDANT - Replaced by FluencyEngine.evaluateSession
/*
async function summarizeSession(session: any) {
... (truncated logic) ...
}
*/

async function joinSessionAndTranscribe(session: any) {
    try {
        // Generate a token for the bot
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `transcriber-bot-${session.id}`,
        });
        at.addGrant({ roomJoin: true, room: session.room_name, canSubscribe: true, canPublish: false });
        const token = await at.toJwt();

        const room = new Room();

        // Prepare Deepgram connection
        // We need a separate deepgram stream for EACH user to identify speakers clearly?
        // OR one stream with multichannel? 
        // Prompt says "Separately... User A audio stream... User B audio stream".
        // So we create a Deepgram Live connection PER TRACK.

        // Monitor Room Events for Session Status
        room.on(RoomEvent.ParticipantConnected, async (participant) => {
            console.log(`Participant ${participant.identity} connected`);
            // If we have 2 participants (users) + bot, mark as LIVE
            // Worker is hidden usually, but let's just check if we have > 1 user
            if (room.remoteParticipants.size >= 2) {
                await prisma.live_sessions.update({
                    where: { id: session.id },
                    data: { status: 'live' }
                });
            }
        });

        room.on(RoomEvent.ParticipantDisconnected, async (participant) => {
            console.log(`Participant ${participant.identity} disconnected from ${session.id}. Starting grace period.`);

            // Wait for 15 seconds before ending to allow for blips/rejoins
            setTimeout(async () => {
                try {
                    // Check LiveKit's truth again
                    const participants = Array.from(room.remoteParticipants.values());
                    const humanParticipants = participants.filter(p => !p.identity.startsWith('transcriber-bot-'));

                    if (humanParticipants.length < 2) {
                        console.log(`[Worker] Grace period ended for ${session.id}. Only ${humanParticipants.length} humans remain. Ending session.`);

                        await prisma.live_sessions.update({
                            where: { id: session.id },
                            data: {
                                status: 'ended',
                                ended_at: new Date()
                            }
                        });

                        room.disconnect();
                        activeSessions.delete(session.id);
                    } else {
                        console.log(`[Worker] Participant re-joined ${session.id} during grace period. Session continues.`);
                    }
                } catch (err) {
                    console.error(`Error in grace period cleanup for ${session.id}:`, err);
                }
            }, 15000); // 15s grace period
        });

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: any, participant: any) => {
            if (track.kind === TrackKind.KIND_AUDIO) {
                console.log(`[Worker] Subscribed to AUDIO track from HUMAN: ${participant.identity}`);
                handleAudioTrack(track, participant.identity, session.id);
            } else {
                console.log(`[Worker] Subscribed to NON-AUDIO track (${track.kind}) from ${participant.identity}`);
            }
        });

        await room.connect(LIVEKIT_URL, token);
        console.log(`Worker joined room ${session.room_name}`);

    } catch (e) {
        console.error(`Error processing session ${session.id}`, e);
        activeSessions.delete(session.id);
    }
}

/**
 * Check for lexical ceilings in user's speech patterns.
 * Runs periodically (every ~45 seconds of speech) to detect vocabulary limitations.
 */
async function checkLexicalCeiling(sessionId: string, userId: string) {
    try {
        // NOTE:
        // Real-time lexical ceiling detection in the worker depended on importing
        // `detectLexicalCeiling` from the Next.js app code. That import causes
        // runtime module resolution issues when running this script via ts-node.
        //
        // The more important, authoritative lexical analysis still runs inside
        // `FluencyEngine.evaluateSession(...)` in the app code after the session
        // ends, so this worker-level check is optional.
        //
        // To keep the worker stable and ensure transcripts + metrics are
        // recorded (so FluencyEngine and Gemini feedback work), we temporarily
        // disable the worker's own lexical ceiling check.
        //
        // If needed later, this logic can be reintroduced by duplicating the
        // lexical detection code inside this script instead of importing from
        // the app bundle.
        return;
    } catch (err) {
        console.error(`Error in lexical ceiling check for user ${userId}:`, err);
    }
}

async function handleAudioTrack(track: any, userId: string, sessionId: string) {
    // const { AudioStream } = require('@livekit/rtc-node'); // Imported at top

    // 1. Create Audio Stream (decodes Opus -> PCM)
    // Force 48kHz mono to match Deepgram config
    const audioStream = new AudioStream(track, 48000, 1);

    // 2. Setup Deepgram Connection
    const dgConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        encoding: "linear16", // Raw PCM
        sample_rate: 48000,
        channels: 1,
        vad_events: true, // Help detect speech vs silence
        utterance_end_ms: 3000, // Increased to 3s to capture longer thoughts
        endpointing: 1000, // Increased to avoid cutting off mid-sentence pauses
        no_delay: true, // Minimize processing delay
        filler_words: true, // Capture ums/uhs for fluency metrics
        interim_results: true
    });

    let frameCount = 0;

    dgConnection.on(LiveTranscriptionEvents.Open, async () => {
        console.log(`[Deepgram] Connected for user ${userId}`);

        // 3. Pipe Audio Frames
        try {
            console.log(`[AudioPipe] Starting frame loop for user ${userId}`);

            // Using a while loop with a type-cast to avoid async iterator lint issues
            // while ensuring we get frames from the rtc-node AudioStream
            const stream = audioStream as any;

            // In older versions of rtc-node, we might need to use 'data' events
            // In newer ones, it is an async iterator. Let's try to support both.
            if (typeof stream[Symbol.asyncIterator] === 'function') {
                for await (const frame of stream) {
                    if (dgConnection.getReadyState() === 1 && frame && frame.data) {
                        frameCount++;
                        if (frameCount % 100 === 0) {
                            console.log(`[AudioPipe] ${userId} throughput: ${frameCount} frames sent.`);
                        }
                        // Use Uint8Array which is standard and type-safe for send()
                        const audioData = new Uint8Array(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
                        (dgConnection as any).send(audioData);
                    } else if (dgConnection.getReadyState() > 1) {
                        break;
                    }
                }
            } else {
                console.warn(`[AudioPipe] AudioStream for ${userId} does not support AsyncIterator. falling back to data events.`);
                stream.on('data', (frame: any) => {
                    if (dgConnection.getReadyState() === 1 && frame && frame.data) {
                        const buffer = Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
                        (dgConnection as any).send(buffer);
                    }
                });
            }
            console.log(`[AudioPipe] Loop/Event setup finished for user ${userId}`);
        } catch (err) {
            console.error(`Audio pipe error for user ${userId}:`, err);
        }
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        console.log(`[Deepgram] Raw transcript for ${userId}: "${transcript}" (is_final: ${data.is_final})`);
        if (transcript && data.is_final && transcript.trim().length > 0) {
            console.log(`[Worker] SAVING FINAL TRANSCRIPT [${userId}]: ${transcript}`);

            // A. Store raw transcript with word-level timing
            const wordData = data.channel.alternatives[0].words || [];
            await prisma.live_transcripts.create({
                data: {
                    session_id: sessionId,
                    user_id: userId,
                    text: transcript,
                    word_data: wordData as any,
                    timestamp: new Date()
                }
            });

            // B. Analyze Fluency (Real-time updates)
            const words = transcript.split(/\s+/).filter((w: string) => w.length > 0);
            const wordCount = words.length;

            const fillerRegex = /\b(um|uh|hmm|like|you know|i mean)\b/gi;
            const fillers = (transcript.match(fillerRegex) || []).length;
            const hesitationCount = fillers;

            // Update Metrics Atomic
            await prisma.live_metrics.upsert({
                where: {
                    session_id_user_id: {
                        session_id: sessionId,
                        user_id: userId
                    }
                },
                update: {
                    word_count: { increment: wordCount },
                    filler_count: { increment: fillers },
                    hesitation_count: { increment: hesitationCount },
                    speaking_time: { increment: data.duration || (wordCount * 0.4) }
                },
                create: {
                    session_id: sessionId,
                    user_id: userId,
                    word_count: wordCount,
                    filler_count: fillers,
                    hesitation_count: hesitationCount,
                    speaking_time: data.duration || (wordCount * 0.4)
                }
            });

            // C. Lexical Ceiling Detection (Periodic - every ~45 seconds worth of speech)
            // Check if we should run lexical analysis
            await checkLexicalCeiling(sessionId, userId);
        }
    });

    dgConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log(`[Deepgram] Connection closed for user ${userId}`);
    });

    dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error(`[Deepgram] Error for user ${userId}:`, err);
    });
}

startWorker();
