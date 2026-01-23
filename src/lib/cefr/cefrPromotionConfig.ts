/**
 * CEFR Promotion Config - Single Source of Truth
 * 
 * This file defines ALL promotion rules for Englivo.
 * No CEFR logic is allowed anywhere else.
 * 
 * Users must prove readiness to advance through behavioral gates,
 * not just score thresholds.
 */

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ConfidenceBand = "Low" | "Medium" | "High";

export interface CEFRPromotionGate {
    /** Minimum total speaking time across all sessions (seconds) */
    minTotalSpeakingSeconds: number;

    /** Minimum total words spoken across all sessions */
    minTotalWords: number;

    /** Minimum number of completed sessions */
    minSessions: number;

    /** Minimum number of unique days with activity */
    minDaysActive: number;

    /** Maximum allowed mid-sentence pause duration (seconds) */
    maxMidSentencePauseSec: number;

    /** Required confidence band to pass this gate */
    requiredConfidenceBand: ConfidenceBand;

    /** Maximum crutch word rate (um, uh, like) per minute */
    maxCrutchWordRatePerMin?: number;

    /** Whether lexical ceiling (vocabulary blockers) is allowed */
    lexicalCeilingAllowed: boolean;

    /** Minimum unique practice types required (AI, Live, Human) */
    minPracticeTypes?: number;

    /** Human-readable description of this level's requirement */
    description: string;
}

/**
 * Gate requirements for each CEFR level promotion.
 * 
 * Note: A1 is the starting level, so no gates are defined for it.
 * Each subsequent level has progressively stricter requirements.
 */
export const CEFR_PROMOTION_GATES: Record<Exclude<CEFRLevel, "A1">, CEFRPromotionGate> = {
    A2: {
        minTotalSpeakingSeconds: 60,
        minTotalWords: 80,
        minSessions: 2,
        minDaysActive: 1,
        maxMidSentencePauseSec: 3.0,
        requiredConfidenceBand: "Low",
        lexicalCeilingAllowed: true,
        minPracticeTypes: 1,
        description: "Can produce basic independent speech with simple vocabulary"
    },
    B1: {
        minTotalSpeakingSeconds: 120,
        minTotalWords: 180,
        minSessions: 3,
        minDaysActive: 2,
        maxMidSentencePauseSec: 2.0,
        requiredConfidenceBand: "Medium",
        maxCrutchWordRatePerMin: 5,
        lexicalCeilingAllowed: true,
        minPracticeTypes: 2,
        description: "Can maintain flow across ideas and connect sentences"
    },
    B2: {
        minTotalSpeakingSeconds: 240,
        minTotalWords: 300,
        minSessions: 3,
        minDaysActive: 2,
        maxMidSentencePauseSec: 1.2,
        requiredConfidenceBand: "High",
        maxCrutchWordRatePerMin: 2,
        lexicalCeilingAllowed: false,
        minPracticeTypes: 2,
        description: "Thinking in English, not translating. Precise vocabulary."
    },
    C1: {
        minTotalSpeakingSeconds: 360,
        minTotalWords: 450,
        minSessions: 4,
        minDaysActive: 3,
        maxMidSentencePauseSec: 0.8,
        requiredConfidenceBand: "High",
        lexicalCeilingAllowed: false,
        minPracticeTypes: 2,
        description: "Manages abstract complexity fluently with sophisticated vocabulary"
    },
    C2: {
        minTotalSpeakingSeconds: 600,
        minTotalWords: 700,
        minSessions: 5,
        minDaysActive: 4,
        maxMidSentencePauseSec: 0.5,
        requiredConfidenceBand: "High",
        lexicalCeilingAllowed: false,
        minPracticeTypes: 2,
        description: "Near-native automaticity with nuance and cultural fluency"
    }
};

/**
 * Get the next CEFR level in progression
 */
export function getNextCEFRLevel(current: CEFRLevel): CEFRLevel | null {
    const progression: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const idx = progression.indexOf(current);
    return idx < progression.length - 1 ? progression[idx + 1] : null;
}

/**
 * Get the previous CEFR level
 */
export function getPreviousCEFRLevel(current: CEFRLevel): CEFRLevel | null {
    const progression: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const idx = progression.indexOf(current);
    return idx > 0 ? progression[idx - 1] : null;
}

/**
 * Human-readable labels for each CEFR level
 */
export const CEFR_LEVEL_LABELS: Record<CEFRLevel, { name: string; title: string }> = {
    A1: { name: "Beginner", title: "The Explorer" },
    A2: { name: "Elementary", title: "The Builder" },
    B1: { name: "Intermediate", title: "The Connector" },
    B2: { name: "Upper-Intermediate", title: "The Thinker" },
    C1: { name: "Advanced", title: "The Strategist" },
    C2: { name: "Proficient", title: "The Master" }
};

/**
 * Gate failure codes with human-readable explanations
 */
export const GATE_FAILURE_EXPLANATIONS: Record<string, { title: string; description: string }> = {
    INSUFFICIENT_SPEECH_TIME: {
        title: "More Speaking Time Needed",
        description: "You haven't spoken enough yet. Keep practicing to build up your speaking time."
    },
    INSUFFICIENT_WORD_COUNT: {
        title: "More Words Needed",
        description: "Your total word count is below the threshold. Speak more in each session."
    },
    INSUFFICIENT_SESSIONS: {
        title: "More Sessions Needed",
        description: "Complete more practice sessions to demonstrate consistency."
    },
    INSUFFICIENT_DAYS: {
        title: "More Active Days Needed",
        description: "Practice on more separate days to show sustained effort."
    },
    PAUSE_TOO_LONG: {
        title: "Mid-Sentence Pauses Too Long",
        description: "You're pausing too much while speaking. Practice responding without long hesitations."
    },
    CONFIDENCE_TOO_LOW: {
        title: "Higher Confidence Needed",
        description: "Your speech patterns show hesitation. Work on speaking more automatically."
    },
    LEXICAL_CEILING: {
        title: "Vocabulary Ceiling",
        description: "You're relying on basic vocabulary. Use more precise, varied words to advance."
    },
    INSUFFICIENT_PRACTICE_DIVERSITY: {
        title: "Practice Diversity Needed",
        description: "Try different practice types (AI Tutor, Live Practice, Human Tutor) to advance."
    },
    CRUTCH_WORDS: {
        title: "Too Many Filler Words",
        description: "Reduce your use of 'um', 'uh', 'like' to speak more fluently."
    },
    NON_ENGLISH_DETECTED: {
        title: "English Only",
        description: "Non-English speech was detected. Stay in English to progress."
    }
};

/**
 * AI behavior configuration per level
 */
export const AI_LEVEL_BEHAVIOR: Record<CEFRLevel, {
    paceDescription: string;
    promptStyle: string;
    pauseTolerance: number;
    focusAreas: string[];
}> = {
    A1: {
        paceDescription: "Very slow and patient",
        promptStyle: "Simple yes/no questions, sentence scaffolding",
        pauseTolerance: 5.0,
        focusAreas: ["Basic vocabulary", "Simple present tense", "Pronunciation"]
    },
    A2: {
        paceDescription: "Slow with encouragement",
        promptStyle: "Simple story prompts, gentle follow-ups",
        pauseTolerance: 4.0,
        focusAreas: ["Past tense", "Connecting sentences", "Daily vocabulary"]
    },
    B1: {
        paceDescription: "Moderate with gentle interruptions",
        promptStyle: "Opinion questions, story narration",
        pauseTolerance: 3.0,
        focusAreas: ["Connectors (however, therefore)", "Abstract concepts", "Flow maintenance"]
    },
    B2: {
        paceDescription: "Faster, expects quick responses",
        promptStyle: "Abstract why/how questions, debate prompts",
        pauseTolerance: 2.0,
        focusAreas: ["Precise vocabulary", "Complex structures", "Argumentation"]
    },
    C1: {
        paceDescription: "Professional examiner tone",
        promptStyle: "Logical challenges, nuance probing",
        pauseTolerance: 1.5,
        focusAreas: ["Nuance", "Irony", "Sophisticated vocabulary"]
    },
    C2: {
        paceDescription: "Native-level expectations",
        promptStyle: "Debate, cultural references, wordplay",
        pauseTolerance: 1.0,
        focusAreas: ["Cultural fluency", "Idioms", "Near-native automaticity"]
    }
};
