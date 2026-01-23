
import { prisma } from "@/lib/prisma";
import { CEFR_LEXICAL_TRIGGERS, LEXICAL_ENGINE_CONFIG, CEFRLevel } from "./cefr-lexical-triggers";
import { CEFR_MODEL_VERSION } from "./assessment/updateUserFluencyProfile";

// --- Formula Constants & Logic ---

export interface LexicalCeilingDetection {
    category: "Vocabulary" | "Connectors" | "Nuance";
    detectedWords: string[];
    upgrades: string[];
    explanation: string;
    count: number;
    targetLevel: CEFRLevel;
    currentLimit: CEFRLevel;
}

/**
 * Detect if a speaker is stuck at a CEFR level due to vocabulary limitations.
 * Analyzes transcript for repetitive use of basic vocabulary that indicates a ceiling.
 * 
 * @param transcript - The text to analyze
 * @param targetLevel - The CEFR level the user is attempting to reach
 * @returns Detection result or null if no ceiling detected
 */
export function detectLexicalCeiling(
    transcript: string,
    targetLevel: CEFRLevel
): LexicalCeilingDetection | null {
    const text = transcript.toLowerCase();

    const trigger = CEFR_LEXICAL_TRIGGERS.find(t => t.targetLevel === targetLevel);
    if (!trigger) return null;

    let count = 0;
    const detected: Set<string> = new Set();

    for (const word of trigger.triggers) {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        const matches = text.match(regex);
        if (matches) {
            count += matches.length;
            detected.add(word);
        }
    }

    if (count >= LEXICAL_ENGINE_CONFIG.REPETITION_THRESHOLD) {
        return {
            category: trigger.category,
            detectedWords: Array.from(detected),
            upgrades: trigger.upgrades,
            explanation: trigger.explanation,
            count,
            targetLevel,
            currentLimit: trigger.currentLimit
        };
    }

    return null;
}


export class FluencyEngine {

    /**
     * Run the full analysis for a finished session.
     * Computes scores for ALL users in the session and saves summaries.
     */
    async evaluateSession(sessionId: string) {
        console.log(`[FluencyEngine] Evaluating session ${sessionId}...`);

        // 1. Fetch Session Data
        const session = await prisma.live_sessions.findUnique({
            where: { id: sessionId },
            include: {
                metrics: true,
                transcripts: true
            }
        });

        if (!session) {
            console.error(`[FluencyEngine] Session ${sessionId} not found`);
            return;
        }

        if (!session.ended_at) {
            // If not marked ended, assume now is end or use last update
            console.warn(`[FluencyEngine] Session ${sessionId} not marked ended, using current time.`);
        }

        const durationMs = (session.ended_at ? session.ended_at.getTime() : Date.now()) - session.started_at.getTime();
        const durationMinutes = Math.max(durationMs / 1000 / 60, 0.5); // Minimum 0.5 min to avoid div/0

        // 2. Process Each User
        // We evaluate everyone present in metrics
        const userIds = new Set(session.metrics.map(m => m.user_id));

        for (const userId of userIds) {
            await this.evaluateUser(sessionId, userId, durationMinutes, session.metrics);
        }
    }

    private async evaluateUser(sessionId: string, userId: string, durationMinutes: number, allMetrics: any[]) {
        const metrics = allMetrics.find(m => m.user_id === userId);
        if (!metrics) return;

        // --- A. Compute Raw Scores ---

        // 🛡️ Guard: Insufficient Data (Prevent "B1 on Silence")
        // If user said fewer than 5 words, they get 0.
        if (metrics.word_count < 5) {
            console.log(`[FluencyEngine] User ${userId} insufficient data (${metrics.word_count} words). Forcing 0.`);
            // Force 0 scores
            const zeroScore = 0;
            const topWeaknesses = ["PASSIVITY", "SILENCE"];

            // Save immediately to avoid skewing logic
            await prisma.live_session_summary.upsert({
                where: {
                    session_id_user_id: {
                        session_id: sessionId,
                        user_id: userId
                    }
                },
                create: {
                    session_id: sessionId,
                    user_id: userId,
                    confidence_score: 0,
                    fluency_score: 0,
                    weaknesses: topWeaknesses,
                    drill_plan: [{
                        weakness: "PASSIVITY",
                        exercise: "Try to speak more next time so we can analyze your English.",
                        difficulty: "Beginner"
                    }]
                },
                update: {
                    confidence_score: 0,
                    fluency_score: 0,
                    weaknesses: topWeaknesses,
                    drill_plan: [{
                        weakness: "PASSIVITY",
                        exercise: "Try to speak more next time so we can analyze your English.",
                        difficulty: "Beginner"
                    }]
                }
            });
            return;
        }

        // 1. Confidence (Speaking Time)
        // Ideal is 50% of the time (in a duo). 
        // speaking_time is in seconds (if our worker logic is correct, it was incremented by seconds or similar)
        // Let's assume metrics.speaking_time is seconds.
        const speakingRatio = (metrics.speaking_time / 60) / durationMinutes;
        // If they spoke 50% of time -> 0.5 / 0.5 = 1.0 -> 100 score.
        // If they spoke 10% -> 0.1 / 0.5 = 0.2 -> 20 score.
        let confidenceScore = Math.min(Math.max((speakingRatio / 0.5), 0), 1) * 100;

        // 2. Hesitation (Fillers)
        const fillersPerMin = metrics.filler_count / durationMinutes;
        // Example: 2 fillers/min -> 2 * 15 = 30 penalty -> 70 score.
        // 6 fillers/min -> 90 penalty -> 10 score.
        let hesitationScore = 100 - Math.min(Math.max(fillersPerMin * 15, 0), 100);

        // 3. Speed (WPM)
        // metrics.speech_rate should be populated by worker. If 0, fallback to word_count/time
        let wpm = metrics.speech_rate;
        if (wpm === 0 && metrics.speaking_time > 0) {
            wpm = metrics.word_count / (metrics.speaking_time / 60);
        }

        const idealWpm = 130;
        let speedScore = 100 - (Math.abs(wpm - idealWpm) / idealWpm) * 100;
        speedScore = Math.min(Math.max(speedScore, 0), 100);

        // 4. Grammar
        // We need sentences count. If not tracked, estimate: word_count / 10?
        const estimatedSentences = Math.max(metrics.word_count / 10, 1);
        let grammarScore = 100 - ((metrics.grammar_errors / estimatedSentences) * 100);
        grammarScore = Math.min(Math.max(grammarScore, 0), 100);

        // --- B. Weighted Fluency Score ---
        const fluencyScore = (
            (0.30 * confidenceScore) +
            (0.25 * hesitationScore) +
            (0.25 * speedScore) +
            (0.20 * grammarScore)
        );

        // --- C. Weakness Diagnosis ---
        const weaknesses: string[] = [];

        if (hesitationScore < 60) weaknesses.push("HESITATION");
        if (speedScore < 60) weaknesses.push("SPEED");
        if (grammarScore < 70) weaknesses.push("GRAMMAR");
        if (confidenceScore < 60) weaknesses.push("CONFIDENCE");

        // Limit to top 3 (simplistic order for now)
        const topWeaknesses = weaknesses.slice(0, 3);

        // --- D. Targeted Drill Plan ---
        const drillPlan = [];

        if (topWeaknesses.length > 0) {
            // Fetch drills for these tags
            const drills = await prisma.fluency_exercises.findMany({
                where: {
                    weakness_tag: { in: topWeaknesses }
                }
            });

            // Naive matching: pick one for each weakness
            for (const tag of topWeaknesses) {
                const candidates = drills.filter(d => d.weakness_tag === tag);
                if (candidates.length > 0) {
                    // Random pick
                    const pick = candidates[Math.floor(Math.random() * candidates.length)];
                    drillPlan.push({
                        weakness: tag,
                        exercise: pick.prompt,
                        difficulty: pick.difficulty
                    });
                }
            }
        }

        // If no weaknesses, maybe give a "Maintenance" drill?
        if (drillPlan.length === 0) {
            drillPlan.push({
                weakness: "MAINTENANCE",
                exercise: "Great job! Practice free speech for 2 minutes to maintain your flow.",
                difficulty: "Advanced"
            });
        }

        // --- E. Lexical Ceiling Detection (NEW) ---
        // Analyze transcripts for repetitive basic vocabulary
        if (metrics.word_count > 50) { // Only analyze if sufficient data
            // Fetch Transcripts for this user
            const sessionData = await prisma.live_sessions.findUnique({
                where: { id: sessionId },
                include: { transcripts: true }
            });

            const userTranscripts = sessionData?.transcripts
                .filter(t => t.user_id === userId)
                .map(t => t.text)
                .join(" ") || "";

            if (userTranscripts.length > 0) {
                // Check for common ceilings (A2->B1, B1->B2)
                const targetLevels: CEFRLevel[] = ["B1", "B2", "C1"];

                for (const level of targetLevels) {
                    const detection = detectLexicalCeiling(userTranscripts, level);
                    if (detection) {
                        console.log(`[FluencyEngine] User ${userId} hit lexical ceiling: ${detection.category} for ${level}`);

                        // Save Micro-Fix
                        await prisma.live_micro_fixes.create({
                            data: {
                                user_id: userId,
                                session_id: sessionId,
                                category: detection.category,
                                detected_words: detection.detectedWords,
                                upgrades: detection.upgrades,
                                explanation: detection.explanation,
                                target_level: detection.targetLevel,
                                current_limit: detection.currentLimit
                            }
                        });

                        // Add to weaknesses list if not already there
                        if (!topWeaknesses.includes("LEXICAL_CEILING")) {
                            topWeaknesses.push("LEXICAL_CEILING");
                        }
                    }
                }
            }
        }

        // --- F. Save Summary ---
        await prisma.live_session_summary.upsert({
            where: {
                session_id_user_id: {
                    session_id: sessionId,
                    user_id: userId
                }
            },
            update: {
                confidence_score: Math.round(confidenceScore),
                fluency_score: Math.round(fluencyScore),
                weaknesses: topWeaknesses,
                drill_plan: drillPlan,
                cefr_model_version: CEFR_MODEL_VERSION
            },
            create: {
                session_id: sessionId,
                user_id: userId,
                confidence_score: Math.round(confidenceScore),
                fluency_score: Math.round(fluencyScore),
                weaknesses: topWeaknesses,
                drill_plan: drillPlan,
                cefr_model_version: CEFR_MODEL_VERSION
            }
        });

        console.log(`[FluencyEngine] User ${userId} | Score: ${fluencyScore.toFixed(1)} | Weaknesses: ${topWeaknesses.join(", ")}`);
    }
}

export const fluencyEngine = new FluencyEngine();
