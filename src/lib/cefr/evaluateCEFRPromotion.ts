/**
 * CEFR Promotion Engine
 * 
 * This is the ONLY authority for level-up decisions.
 * No other code should determine CEFR promotions.
 * 
 * Checks all behavioral gates and returns eligibility status.
 */

import {
    CEFRLevel,
    CEFRPromotionGate,
    CEFR_PROMOTION_GATES,
    getNextCEFRLevel,
    ConfidenceBand
} from "./cefrPromotionConfig";
import type { AggregatedMetrics } from "./aggregateUserSpeechMetrics";

export type GateFailure =
    | "INSUFFICIENT_SPEECH_TIME"
    | "INSUFFICIENT_WORD_COUNT"
    | "INSUFFICIENT_SESSIONS"
    | "INSUFFICIENT_DAYS"
    | "PAUSE_TOO_LONG"
    | "CONFIDENCE_TOO_LOW"
    | "LEXICAL_CEILING"
    | "INSUFFICIENT_PRACTICE_DIVERSITY"
    | "CRUTCH_WORDS"
    | "NON_ENGLISH_DETECTED";

export interface PromotionResult {
    /** Whether user is eligible for promotion */
    eligible: boolean;

    /** List of failed gate checks */
    failures: GateFailure[];

    /** The level they would be promoted to */
    nextLevel: CEFRLevel | null;

    /** Detailed gate status */
    gateStatus: {
        gate: keyof CEFRPromotionGate;
        required: number | string | boolean;
        actual: number | string | boolean;
        passed: boolean;
    }[];

    /** Current level */
    currentLevel: CEFRLevel;
}

/**
 * Compare confidence bands
 */
function confidenceMeetsRequirement(
    actual: ConfidenceBand,
    required: ConfidenceBand
): boolean {
    const order: Record<ConfidenceBand, number> = {
        "Low": 1,
        "Medium": 2,
        "High": 3
    };
    return order[actual] >= order[required];
}

/**
 * Evaluate if a user is eligible for CEFR level promotion.
 * 
 * This function is the SINGLE AUTHORITY for promotion decisions.
 * It must be called server-side only.
 * 
 * @param currentLevel - User's current CEFR level
 * @param metrics - Aggregated metrics from all session types
 * @returns PromotionResult with eligibility and gate status
 */
export function evaluateCEFRPromotion(
    currentLevel: CEFRLevel,
    metrics: AggregatedMetrics
): PromotionResult {
    const nextLevel = getNextCEFRLevel(currentLevel);

    // Already at max level
    if (!nextLevel) {
        return {
            eligible: false,
            failures: [],
            nextLevel: null,
            gateStatus: [],
            currentLevel
        };
    }

    // nextLevel is guaranteed to be A2-C2 since A1 has no predecessor and getNextCEFRLevel returns null for C2
    const gate = CEFR_PROMOTION_GATES[nextLevel as Exclude<CEFRLevel, "A1">];
    const failures: GateFailure[] = [];
    const gateStatus: PromotionResult["gateStatus"] = [];

    // Gate 1: Speech Time
    const speechTimePassed = metrics.totalSeconds >= gate.minTotalSpeakingSeconds;
    gateStatus.push({
        gate: "minTotalSpeakingSeconds",
        required: gate.minTotalSpeakingSeconds,
        actual: metrics.totalSeconds,
        passed: speechTimePassed
    });
    if (!speechTimePassed) {
        failures.push("INSUFFICIENT_SPEECH_TIME");
    }

    // Gate 2: Word Count
    const wordCountPassed = metrics.totalWords >= gate.minTotalWords;
    gateStatus.push({
        gate: "minTotalWords",
        required: gate.minTotalWords,
        actual: metrics.totalWords,
        passed: wordCountPassed
    });
    if (!wordCountPassed) {
        failures.push("INSUFFICIENT_WORD_COUNT");
    }

    // Gate 3: Session Count
    const sessionCountPassed = metrics.sessionCount >= gate.minSessions;
    gateStatus.push({
        gate: "minSessions",
        required: gate.minSessions,
        actual: metrics.sessionCount,
        passed: sessionCountPassed
    });
    if (!sessionCountPassed) {
        failures.push("INSUFFICIENT_SESSIONS");
    }

    // Gate 4: Active Days
    const activeDaysPassed = metrics.activeDays >= gate.minDaysActive;
    gateStatus.push({
        gate: "minDaysActive",
        required: gate.minDaysActive,
        actual: metrics.activeDays,
        passed: activeDaysPassed
    });
    if (!activeDaysPassed) {
        failures.push("INSUFFICIENT_DAYS");
    }

    // Gate 5: Mid-Sentence Pause
    const pausePassed = metrics.avgMidSentencePause <= gate.maxMidSentencePauseSec;
    gateStatus.push({
        gate: "maxMidSentencePauseSec",
        required: gate.maxMidSentencePauseSec,
        actual: metrics.avgMidSentencePause,
        passed: pausePassed
    });
    if (!pausePassed) {
        failures.push("PAUSE_TOO_LONG");
    }

    // Gate 6: Confidence Band
    const confidencePassed = confidenceMeetsRequirement(
        metrics.confidenceBand,
        gate.requiredConfidenceBand
    );
    gateStatus.push({
        gate: "requiredConfidenceBand",
        required: gate.requiredConfidenceBand,
        actual: metrics.confidenceBand,
        passed: confidencePassed
    });
    if (!confidencePassed) {
        failures.push("CONFIDENCE_TOO_LOW");
    }

    // Gate 7: Lexical Ceiling (only for B2+)
    if (!gate.lexicalCeilingAllowed && metrics.lexicalBlockers.length > 0) {
        gateStatus.push({
            gate: "lexicalCeilingAllowed",
            required: false,
            actual: metrics.lexicalBlockers.length > 0,
            passed: false
        });
        failures.push("LEXICAL_CEILING");
    }

    // Gate 8: Practice Diversity (if required)
    if (gate.minPracticeTypes && gate.minPracticeTypes > 1) {
        const diversityPassed = metrics.practiceTypes.length >= gate.minPracticeTypes;
        gateStatus.push({
            gate: "minPracticeTypes",
            required: gate.minPracticeTypes,
            actual: metrics.practiceTypes.length,
            passed: diversityPassed
        });
        if (!diversityPassed) {
            failures.push("INSUFFICIENT_PRACTICE_DIVERSITY");
        }
    }

    // Gate 9: Crutch Words (if threshold defined)
    if (gate.maxCrutchWordRatePerMin !== undefined) {
        const crutchPassed = metrics.crutchWordRatePerMin <= gate.maxCrutchWordRatePerMin;
        gateStatus.push({
            gate: "maxCrutchWordRatePerMin",
            required: gate.maxCrutchWordRatePerMin,
            actual: metrics.crutchWordRatePerMin,
            passed: crutchPassed
        });
        if (!crutchPassed) {
            failures.push("CRUTCH_WORDS");
        }
    }

    // Gate 10: Non-English Detection
    if (metrics.nonEnglishSegments > 0) {
        gateStatus.push({
            gate: "minTotalWords", // Using as proxy for language check
            required: 0,
            actual: metrics.nonEnglishSegments,
            passed: false
        });
        failures.push("NON_ENGLISH_DETECTED");
    }

    return {
        eligible: failures.length === 0,
        failures,
        nextLevel,
        gateStatus,
        currentLevel
    };
}

/**
 * Check if user should be demoted (hasn't practiced in required time)
 * This is optional and can be enabled for strict mode.
 */
export function evaluateCEFRDemotion(
    currentLevel: CEFRLevel,
    metrics: AggregatedMetrics,
    daysSinceLastSession: number
): { shouldDemote: boolean; demoteTo: CEFRLevel | null; reason: string | null } {
    // No demotion from A1
    if (currentLevel === "A1") {
        return { shouldDemote: false, demoteTo: null, reason: null };
    }

    // Inactivity threshold (30 days without practice)
    if (daysSinceLastSession > 30) {
        // Soft demotion: drop one level
        const previousLevel = currentLevel === "A2" ? "A1" :
            currentLevel === "B1" ? "A2" :
                currentLevel === "B2" ? "B1" :
                    currentLevel === "C1" ? "B2" :
                        currentLevel === "C2" ? "C1" : null;

        return {
            shouldDemote: true,
            demoteTo: previousLevel,
            reason: `Inactive for ${daysSinceLastSession} days. Practice to maintain your level.`
        };
    }

    return { shouldDemote: false, demoteTo: null, reason: null };
}

/**
 * Get a summary of what's needed to reach the next level
 */
export function getPromotionRequirements(
    currentLevel: CEFRLevel,
    metrics: AggregatedMetrics
): {
    nextLevel: CEFRLevel | null;
    requirements: { name: string; current: number | string; required: number | string; met: boolean }[];
} {
    const nextLevel = getNextCEFRLevel(currentLevel);

    if (!nextLevel) {
        return { nextLevel: null, requirements: [] };
    }

    const gate = CEFR_PROMOTION_GATES[nextLevel as Exclude<CEFRLevel, "A1">];

    return {
        nextLevel,
        requirements: [
            {
                name: "Speaking Time",
                current: `${Math.round(metrics.totalSeconds / 60)} min`,
                required: `${Math.round(gate.minTotalSpeakingSeconds / 60)} min`,
                met: metrics.totalSeconds >= gate.minTotalSpeakingSeconds
            },
            {
                name: "Total Words",
                current: metrics.totalWords.toString(),
                required: gate.minTotalWords.toString(),
                met: metrics.totalWords >= gate.minTotalWords
            },
            {
                name: "Sessions",
                current: metrics.sessionCount.toString(),
                required: gate.minSessions.toString(),
                met: metrics.sessionCount >= gate.minSessions
            },
            {
                name: "Active Days",
                current: metrics.activeDays.toString(),
                required: gate.minDaysActive.toString(),
                met: metrics.activeDays >= gate.minDaysActive
            },
            {
                name: "Confidence",
                current: metrics.confidenceBand,
                required: gate.requiredConfidenceBand,
                met: confidenceMeetsRequirement(metrics.confidenceBand, gate.requiredConfidenceBand)
            }
        ]
    };
}
