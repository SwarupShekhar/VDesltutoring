/**
 * Aggregate User Speech Metrics
 * 
 * Collects metrics across ALL session types:
 * - AI Tutor sessions
 * - Live Practice (peer-to-peer)
 * - Human Tutor sessions
 * 
 * Returns a unified metrics object for promotion evaluation.
 */

import { prisma } from "@/lib/prisma";
import type { CEFRLevel, ConfidenceBand } from "./cefrPromotionConfig";

export interface AggregatedMetrics {
    /** Total speaking time in seconds across all sessions */
    totalSeconds: number;

    /** Total words spoken across all sessions */
    totalWords: number;

    /** Total number of completed sessions */
    sessionCount: number;

    /** Number of unique days with activity */
    activeDays: number;

    /** Average mid-sentence pause duration (seconds) */
    avgMidSentencePause: number;

    /** Current confidence band based on recent sessions */
    confidenceBand: ConfidenceBand;

    /** Crutch word rate per minute */
    crutchWordRatePerMin: number;

    /** Active lexical blockers */
    lexicalBlockers: string[];

    /** Unique practice types used (ai_tutor, human_tutor) */
    practiceTypes: string[];

    /** Number of non-English segments detected */
    nonEnglishSegments: number;

    /** Data freshness */
    lastSessionDate: Date | null;
}

export type PracticeType = "ai_tutor" | "human_tutor";

/**
 * Aggregate all speech metrics for a user across all session types.
 * This is the only function that should collect user metrics for promotion.
 */
export async function aggregateUserSpeechMetrics(userId: string): Promise<AggregatedMetrics> {
    // Get date range (last 30 days for recent activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel fetch all session types
    const [aiSessions, humanSessions, fluencyProfile] = await Promise.all([
        // AI Tutor sessions
        prisma.ai_chat_sessions.findMany({
            where: {
                user_id: userId,
                started_at: { gte: thirtyDaysAgo }
            },
            select: {
                id: true,
                started_at: true,
                fluency_score: true,
                grammar_score: true,
                vocabulary_score: true,
                feedback_summary: true
            }
        }),

        // Human Tutor sessions (via student_profiles)
        prisma.sessions.findMany({
            where: {
                student_profiles: {
                    user_id: userId
                },
                status: "COMPLETED",
                start_time: { gte: thirtyDaysAgo }
            },
            select: {
                id: true,
                start_time: true,
                end_time: true,
                completion_notes: true
            }
        }),

        // Current fluency profile
        (prisma as any).user_fluency_profile.findUnique({
            where: { user_id: userId }
        })
    ]);

    // Track unique dates for activeDays calculation
    const activeDates = new Set<string>();
    const practiceTypes = new Set<PracticeType>();

    let totalSeconds = 0;
    let totalWords = 0;
    let sessionCount = 0;
    let totalPauseSum = 0;
    let pauseCount = 0;
    let totalFillers = 0;
    let totalSpeakingMinutes = 0;
    let lastSessionDate: Date | null = null;

    // Process AI Tutor sessions
    for (const session of aiSessions) {
        practiceTypes.add("ai_tutor");
        sessionCount++;
        activeDates.add(session.started_at.toISOString().split("T")[0]);

        if (!lastSessionDate || session.started_at > lastSessionDate) {
            lastSessionDate = session.started_at;
        }

        // Estimate word count from feedback if available
        if (session.feedback_summary) {
            try {
                const summary = JSON.parse(session.feedback_summary);
                if (summary.metrics?.wordCount) {
                    totalWords += summary.metrics.wordCount;
                    // Estimate speaking time (avg 150 words per minute)
                    totalSeconds += (summary.metrics.wordCount / 150) * 60;
                    totalSpeakingMinutes += summary.metrics.wordCount / 150;
                }
                if (summary.metrics?.fillerPercentage) {
                    totalFillers += summary.metrics.fillerPercentage;
                }
            } catch { }
        }
    }

    // Process Human Tutor sessions
    for (const session of humanSessions) {
        practiceTypes.add("human_tutor");
        sessionCount++;
        activeDates.add(session.start_time.toISOString().split("T")[0]);

        if (!lastSessionDate || session.start_time > lastSessionDate) {
            lastSessionDate = session.start_time;
        }

        // Estimate speaking time from session duration (assume 50% speaking)
        if (session.end_time) {
            const durationMs = session.end_time.getTime() - session.start_time.getTime();
            const estimatedSpeakingSeconds = (durationMs / 1000) * 0.5;
            totalSeconds += estimatedSpeakingSeconds;
            totalSpeakingMinutes += estimatedSpeakingSeconds / 60;
            // Estimate words (150 words per minute)
            totalWords += Math.round(estimatedSpeakingSeconds / 60 * 150);
        }
    }

    // Calculate averages
    const avgMidSentencePause = pauseCount > 0 ? totalPauseSum / pauseCount : 0;
    const crutchWordRatePerMin = totalSpeakingMinutes > 0
        ? totalFillers / totalSpeakingMinutes
        : 0;

    // Get confidence band from fluency profile
    const confidenceBand: ConfidenceBand = fluencyProfile?.confidence_band || "Low";

    const lexicalBlockers: string[] = [];

    return {
        totalSeconds: Math.round(totalSeconds),
        totalWords,
        sessionCount,
        activeDays: activeDates.size,
        avgMidSentencePause,
        confidenceBand,
        crutchWordRatePerMin,
        lexicalBlockers,
        practiceTypes: Array.from(practiceTypes),
        nonEnglishSegments: 0, // TODO: Implement language detection
        lastSessionDate
    };
}

/**
 * Cache aggregated metrics to the user's fluency profile
 */
export async function cacheAggregatedMetrics(
    userId: string,
    metrics: AggregatedMetrics
): Promise<void> {
    await (prisma as any).user_fluency_profile.update({
        where: { user_id: userId },
        data: {
            aggregated_metrics: metrics as any,
            last_aggregation: new Date()
        }
    });
}
