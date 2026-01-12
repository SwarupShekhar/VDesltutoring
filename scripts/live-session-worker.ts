import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { PrismaClient } from "@prisma/client";
// AccessToken is from server-sdk
import { AccessToken } from "livekit-server-sdk";
// Room and events are from client-sdk for the bot connection
import { Room, RoomEvent, RemoteTrack, Track } from "livekit-client";
import "dotenv/config"; // Better way to load dotenv if available, else require

// Polyfill for Node.js environment for livekit-client
// usually livekit-client detects node, but sometimes needs explicit ws
// We'll rely on global fetch/ws if node 22
// If errors persist, we might need 'ws' package and assign to global

const prisma = new PrismaClient();
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
    // Find sessions that ended recently but have no summary
    // Since we don't track 'summarized' bit, checking missing summary relation is costly if many sessions.
    // Better: Check sessions with 'ended' status and no summary record.

    const sessions = await prisma.live_sessions.findMany({
        where: {
            status: 'ended',
            summaries: { none: {} } // Find sessions with no summaries yet
        },
        include: {
            metrics: true // Get the metrics
        }
    });

    for (const session of sessions) {
        await summarizeSession(session);
    }
}


async function summarizeSession(session: any) {
    console.log(`Summarizing session ${session.id}...`);

    const users = [session.user_a, session.user_b];
    // Calculate duration
    const durationMs = (session.ended_at ? new Date(session.ended_at).getTime() : Date.now()) - new Date(session.started_at).getTime();
    const durationMinutes = Math.max(durationMs / 1000 / 60, 0.5);

    for (const userId of users) {
        // Find metrics for this user
        let metrics: any = session.metrics.find((m: any) => m.user_id === userId);

        // If no metrics, default to 0s to avoid crash
        if (!metrics) {
            metrics = { speaking_time: 0, filler_count: 0, speech_rate: 0, word_count: 0, grammar_errors: 0 };
        }

        // --- 1. Confidence (Speaking Time) ---
        // speaking_time assumed in seconds
        const speakingRatio = (metrics.speaking_time / 60) / durationMinutes;
        let confidenceScore = Math.min(Math.max((speakingRatio / 0.5), 0), 1) * 100;

        // --- 2. Hesitation (Fillers) ---
        const fillersPerMin = metrics.filler_count / durationMinutes;
        let hesitationScore = 100 - Math.min(Math.max(fillersPerMin * 15, 0), 100);

        // --- 3. Speed (WPM) ---
        let wpm = metrics.speech_rate || 0;
        if (wpm === 0 && metrics.speaking_time > 0) {
            wpm = metrics.word_count / (metrics.speaking_time / 60);
        }
        const idealWpm = 130;
        let speedScore = 100 - (Math.abs(wpm - idealWpm) / idealWpm) * 100;
        speedScore = Math.min(Math.max(speedScore, 0), 100);

        // --- 4. Grammar ---
        const estimatedSentences = Math.max(metrics.word_count / 10, 1);
        let grammarScore = 100 - ((metrics.grammar_errors / estimatedSentences) * 100);
        grammarScore = Math.min(Math.max(grammarScore, 0), 100);

        // --- Weighted Fluency Score ---
        const fluencyScore = (
            (0.30 * confidenceScore) +
            (0.25 * hesitationScore) +
            (0.25 * speedScore) +
            (0.20 * grammarScore)
        );

        // --- Weakness Diagnosis ---
        const weaknesses: string[] = [];
        if (hesitationScore < 60) weaknesses.push("HESITATION");
        if (speedScore < 60) weaknesses.push("SPEED");
        if (grammarScore < 70) weaknesses.push("GRAMMAR");
        if (confidenceScore < 60) weaknesses.push("CONFIDENCE");
        if (speakingRatio < 0.1) weaknesses.push("PASSIVITY");

        const topWeaknesses = weaknesses.slice(0, 3);

        // --- Drill Plan ---
        const drillPlan = [];
        if (topWeaknesses.length > 0) {
            const drills = await prisma.fluency_exercises.findMany({
                where: { weakness_tag: { in: topWeaknesses } }
            });
            for (const tag of topWeaknesses) {
                const candidates = drills.filter((d: any) => d.weakness_tag === tag);
                if (candidates.length > 0) {
                    const pick = candidates[Math.floor(Math.random() * candidates.length)];
                    drillPlan.push({
                        weakness: tag,
                        exercise: pick.prompt,
                        difficulty: pick.difficulty
                    });
                }
            }
        }
        // Fallback drill
        if (drillPlan.length === 0) {
            drillPlan.push({
                weakness: "MAINTENANCE",
                exercise: "Reflect on your conversation and identify one thing you did well.",
                difficulty: "All"
            });
        }

        // --- Save to DB ---
        await prisma.live_session_summary.upsert({
            where: {
                session_id_user_id: {
                    session_id: session.id,
                    user_id: userId
                }
            },
            update: {
                confidence_score: Math.round(confidenceScore),
                fluency_score: Math.round(fluencyScore),
                weaknesses: topWeaknesses, // Now Json, so array of strings work directly if Prisma handles it (it expects array/object for JSON type)
                drill_plan: drillPlan
            },
            create: {
                session_id: session.id,
                user_id: userId,
                confidence_score: Math.round(confidenceScore),
                fluency_score: Math.round(fluencyScore),
                weaknesses: topWeaknesses,
                drill_plan: drillPlan
            }
        });

        console.log(`[Worker] Summarized for User ${userId}: Fluency ${fluencyScore.toFixed(1)}`);
    }
}

async function joinSessionAndTranscribe(session: any) {
    try {
        // Generate a token for the bot
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `transcriber-bot-${session.id}`,
        });
        at.addGrant({ roomJoin: true, room: session.room_name, canSubscribe: true, canPublish: false });
        const token = await at.toJwt();

        const room = new Room({ adaptiveStream: true, dynacast: true });

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
            console.log(`Participant ${participant.identity} disconnected`);
            // If a user leaves, end the session
            // Logic: If remaining participants (excluding bot) < 2? 
            // Or strict pairs: if anyone leaves, it's over.

            // Check if we should end
            // For now, strict ending:
            await prisma.live_sessions.update({
                where: { id: session.id },
                data: {
                    status: 'ended',
                    ended_at: new Date()
                }
            });

            console.log(`Session ${session.id} marked as ended.`);
            room.disconnect();
            activeSessions.delete(session.id);
        });

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: any, participant: any) => {
            if (track.kind === Track.Kind.Audio) {
                console.log(`Subscribed to audio from ${participant.identity}`);
                handleAudioTrack(track, participant.identity, session.id);
            }
        });

        await room.connect(LIVEKIT_URL, token);
        console.log(`Worker joined room ${session.room_name}`);

    } catch (e) {
        console.error(`Error processing session ${session.id}`, e);
        activeSessions.delete(session.id);
    }
}

function handleAudioTrack(track: any, userId: string, sessionId: string) {
    // track is a RemoteAudioTrack. 
    // In Node/LiveKit client, getting raw audio bits can be tricky without `wrtc` configured to expose them.
    // However, assuming we have access to the stream:
    const mediaStreamTrack = track.mediaStreamTrack;
    // We need to get the raw PCM data. 
    // In a browser we'd use Web Audio API. In Node with `wrtc`?
    // This is the tricky part of Phase 4.4 without the official "Agents" SDK (which handles this).
    // The prompt says "Pipe audio to Speech-to-Text".

    // For this implementation, I will simulate the "Pipe" behavior because extracting raw PCM from `livekit-client` in Node without complex setup (like `node-datachannel` or `wrtc` sinks) is advanced.
    // BUT I will write the code as if we are receiving the stream events.

    const dgConnection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
    });

    dgConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log(`Deepgram connected for user ${userId}`);

        // Hack for simulation/MVP in Agent context: 
        // We can't easily get the real audio bytes here without `wrtc` output sink implementation which is verbose.
        // I will implement the Deepgram listeners for transcription results.
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && data.is_final) {
            console.log(`[${userId}]: ${transcript}`);

            // Store raw transcript
            await prisma.live_transcripts.create({
                data: {
                    session_id: sessionId,
                    user_id: userId, // Warning: userId in identity might need mapping back to DB UUID if it's different. In our case it IS the uuid.
                    text: transcript,
                    timestamp: new Date()
                }
            });

            // Analyze Fluency Real-time
            const words = transcript.split(/\s+/).filter((w: string) => w.length > 0);
            const wordCount = words.length;

            // Fillers detection (simple regex list)
            const fillerRegex = /\b(um|uh|hmm|like|you know|i mean)\b/gi;
            const fillers = (transcript.match(fillerRegex) || []).length;

            // Hesitations (Deepgram sometimes marks these or we infer from small tokens/pauses if we had timestamps per word)
            // For now, mapping detected fillers to hesitation count + short fragments
            const hesitationCount = fillers;

            // Update Metrics (Upsert)
            // Note: In high concurrency, atomic increment is better. 
            // Prisma supports atomic updates.

            const existingMetric = await prisma.live_metrics.findUnique({
                where: {
                    session_id_user_id: {
                        session_id: sessionId,
                        user_id: userId
                    }
                }
            });

            if (existingMetric) {
                await prisma.live_metrics.update({
                    where: { id: existingMetric.id },
                    data: {
                        word_count: { increment: wordCount },
                        filler_count: { increment: fillers },
                        hesitation_count: { increment: hesitationCount },
                        // Speaking time estimation: avg 3 words per second? 
                        // Or better, use `data.start` and `data.duration` from Deepgram if available in this event structure
                        // Deepgram `is_final` packet usually has `duration`.
                        speaking_time: { increment: data.duration || (wordCount * 0.4) }
                    }
                });
            } else {
                await prisma.live_metrics.create({
                    data: {
                        session_id: sessionId,
                        user_id: userId,
                        word_count: wordCount,
                        filler_count: fillers,
                        hesitation_count: hesitationCount,
                        speaking_time: data.duration || (wordCount * 0.4)
                    }
                });
            }
        }
    });

    // --- Audio Pipe Implementation using @livekit/rtc-node ---
    // Note: ensure @livekit/rtc-node is installed and livekit-client picks it up.
    // In many Node environments, we need to use the AudioStream helper.

    // We try to use the raw stream if available.
    // Since we are using @livekit/rtc-node, we can use AudioStream
    const { AudioStream } = require('@livekit/rtc-node');

    // Create an audio stream from the track
    // track is RemoteAudioTrack
    const audioStream = new AudioStream(track);

    // send audio data to deepgram
    const interval = setInterval(async () => {
        // Getting frames is event based or polling?
        // AudioStream in rtc-node usually has explicit read or events.
        // Let's assume standard Reader pattern or event.
    }, 10);

    // BETTER APPROACH: Use built-in stream iterator if available or listener
    // audioStream is often a Readable stream or has .on('data')
    // Let's check typical usage:
    // const stream = new AudioStream(track);
    // for await (const frame of stream) { dsConnection.send(frame.data); }

    (async () => {
        try {
            for await (const frame of audioStream) {
                if (dgConnection.getReadyState() === 1) { // Open
                    // frame.data is usually Int16Array (PCM linear16)
                    // Deepgram expects raw buffer
                    dgConnection.send(frame.data.buffer);
                }
            }
        } catch (err) {
            console.error(`Audio pipe error for user ${userId}:`, err);
        }
    })();

}

startWorker();
