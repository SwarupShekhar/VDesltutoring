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
import { detectLexicalCeiling } from "../src/lib/fluency-engine";
import type { CEFRLevel } from "../src/lib/cefr-lexical-triggers";


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

        // 🛡️ Guard: Insufficient Data (Prevent "B1 on Silence")
        if (metrics.word_count < 5) {
            console.log(`[Worker] User ${userId} insufficient data (${metrics.word_count} words). Forcing 0.`);
            await prisma.live_session_summary.upsert({
                where: {
                    session_id_user_id: {
                        session_id: session.id,
                        user_id: userId
                    }
                },
                update: {
                    confidence_score: 0,
                    fluency_score: 0,
                    weaknesses: ["PASSIVITY", "SILENCE"],
                    drill_plan: [{
                        weakness: "PASSIVITY",
                        exercise: "Try to speak more next time so we can analyze your English.",
                        difficulty: "Beginner"
                    }]
                },
                create: {
                    session_id: session.id,
                    user_id: userId,
                    confidence_score: 0,
                    fluency_score: 0,
                    weaknesses: ["PASSIVITY", "SILENCE"],
                    drill_plan: [{
                        weakness: "PASSIVITY",
                        exercise: "Try to speak more next time so we can analyze your English.",
                        difficulty: "Beginner"
                    }]
                }
            });
            continue; // Skip rest of loop for this user
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

/**
 * Check for lexical ceilings in user's speech patterns.
 * Runs periodically (every ~45 seconds of speech) to detect vocabulary limitations.
 */
async function checkLexicalCeiling(sessionId: string, userId: string) {
    try {
        // Get user's target CEFR level from their profile
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { student_profiles: true }
        });

        // Default to B1 if no profile or target level
        const targetLevel: CEFRLevel = "B1"; // TODO: Get from user profile when available

        // Get recent transcripts (last 45 seconds worth)
        const recentTranscripts = await prisma.live_transcripts.findMany({
            where: {
                session_id: sessionId,
                user_id: userId,
                timestamp: {
                    gte: new Date(Date.now() - 45000) // Last 45 seconds
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        if (recentTranscripts.length === 0) return;

        // Combine transcripts into a single text window
        const transcriptWindow = recentTranscripts.map(t => t.text).join(' ');

        // Run lexical detection
        const lexicalFix = detectLexicalCeiling(transcriptWindow, targetLevel);

        if (lexicalFix) {
            // Check if we already logged this issue recently (avoid spam)
            const recentFix = await prisma.live_micro_fixes.findFirst({
                where: {
                    session_id: sessionId,
                    user_id: userId,
                    category: lexicalFix.category,
                    created_at: {
                        gte: new Date(Date.now() - 60000) // Within last minute
                    }
                }
            });

            if (!recentFix) {
                // Log the micro-fix
                await prisma.live_micro_fixes.create({
                    data: {
                        session_id: sessionId,
                        user_id: userId,
                        category: lexicalFix.category,
                        detected_words: lexicalFix.detectedWords,
                        upgrades: lexicalFix.upgrades,
                        explanation: lexicalFix.explanation,
                        target_level: lexicalFix.targetLevel,
                        current_limit: lexicalFix.currentLimit
                    }
                });

                console.log(`[Lexical Fix] User ${userId}: ${lexicalFix.category} ceiling detected (${lexicalFix.detectedWords.join(', ')})`);
            }
        }
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
        utterance_end_ms: 1000,
        interim_results: true
    });

    dgConnection.on(LiveTranscriptionEvents.Open, async () => {
        console.log(`[Deepgram] Connected for user ${userId}`);

        // 3. Pipe Audio Frames
        try {
            const reader = audioStream.getReader();


            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    if (dgConnection.getReadyState() === 1) { // Open
                        // Create a compact ArrayBuffer copy to ensure no offset issues and satisfy types
                        const cleanBuffer = value.data.slice().buffer;
                        dgConnection.send(cleanBuffer);
                    }
                }
            }
        } catch (err) {
            console.error(`Audio pipe error for user ${userId}:`, err);
        }
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && data.is_final && transcript.trim().length > 0) {
            console.log(`[${userId}]: ${transcript}`);

            // A. Store raw transcript
            await prisma.live_transcripts.create({
                data: {
                    session_id: sessionId,
                    user_id: userId,
                    text: transcript,
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
