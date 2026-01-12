
import { prisma } from "@/lib/prisma";

// --- Formula Constants & Logic ---

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

        // --- E. Save Summary ---
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
                drill_plan: drillPlan
            },
            create: {
                session_id: sessionId,
                user_id: userId,
                confidence_score: Math.round(confidenceScore),
                fluency_score: Math.round(fluencyScore),
                weaknesses: topWeaknesses,
                drill_plan: drillPlan
            }
        });

        console.log(`[FluencyEngine] User ${userId} | Score: ${fluencyScore.toFixed(1)} | Weaknesses: ${topWeaknesses.join(", ")}`);
    }
}

export const fluencyEngine = new FluencyEngine();
