import type { CEFRLevel } from "./cefr-lexical-triggers";

export const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Visual Identity System
export const CEFR_IDENTITY = {
    A1: {
        title: "The Survivor",
        color: "#94A3B8", // Soft Gray
        gradient: "from-slate-400 to-slate-500",
        bgGradient: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
        borderColor: "border-slate-300 dark:border-slate-700",
        textColor: "text-slate-700 dark:text-slate-300",
        promise: "I can get by",
        description: "You're learning to survive and explore. Every word matters.",
        capabilities: [
            "Introduce yourself",
            "Ask basic questions",
            "Handle simple situations"
        ],
        achievement: undefined
    },
    A2: {
        title: "The Explorer",
        color: "#38BDF8", // Sky Blue
        gradient: "from-sky-400 to-sky-500",
        bgGradient: "from-sky-50 to-blue-100 dark:from-sky-900 dark:to-blue-900",
        borderColor: "border-sky-300 dark:border-sky-700",
        textColor: "text-sky-700 dark:text-sky-300",
        promise: "I can travel",
        description: "You're learning to survive and explore. Every word matters.",
        capabilities: [
            "Describe experiences",
            "Express simple opinions",
            "Navigate travel situations"
        ],
        achievement: undefined
    },
    B1: {
        title: "The Connector",
        color: "#10B981", // Green
        gradient: "from-green-400 to-emerald-500",
        bgGradient: "from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900",
        borderColor: "border-green-300 dark:border-green-700",
        textColor: "text-green-700 dark:text-green-300",
        promise: "I can socialize",
        description: "You are becoming someone who can think and speak in English.",
        capabilities: [
            "Tell stories",
            "Explain your reasoning",
            "Handle social situations"
        ],
        achievement: undefined
    },
    B2: {
        title: "The Thinker",
        color: "#6366F1", // Indigo
        gradient: "from-indigo-400 to-indigo-600",
        bgGradient: "from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800",
        borderColor: "border-indigo-300 dark:border-indigo-700",
        textColor: "text-indigo-700 dark:text-indigo-300",
        promise: "I can work in English",
        description: "You are becoming someone who can think and speak in English.",
        capabilities: [
            "Debate ideas",
            "Handle complex topics",
            "Work professionally"
        ],
        achievement: undefined
    },
    C1: {
        title: "The Strategist",
        color: "#A855F7", // Purple
        gradient: "from-purple-400 to-purple-600",
        bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
        borderColor: "border-purple-300 dark:border-purple-700",
        textColor: "text-purple-700 dark:text-purple-300",
        promise: "I can persuade & lead",
        description: "You are mastering nuance and persuasion.",
        capabilities: [
            "Analyze nuanced arguments",
            "Persuade effectively",
            "Lead discussions"
        ],
        achievement: undefined
    },
    C2: {
        title: "The Diplomat",
        color: "#F59E0B", // Gold
        gradient: "from-amber-400 to-yellow-500",
        bgGradient: "from-amber-50 to-yellow-100 dark:from-amber-900 dark:to-yellow-900",
        borderColor: "border-amber-300 dark:border-amber-700",
        textColor: "text-amber-700 dark:text-amber-300",
        promise: "I am near-native",
        description: "You are mastering nuance and persuasion.",
        capabilities: [
            "Express subtle emotions",
            "Persuade and negotiate",
            "Explain abstract ideas"
        ],
        achievement: "Only 3% of Englivo users reach this level."
    }
} as const;

export const CEFR_PERSONAS: Record<CEFRLevel, string> = {
    A1: "The Survivor",
    A2: "The Explorer",
    B1: "The Connector",
    B2: "The Thinker",
    C1: "The Strategist",
    C2: "The Diplomat"
};

export const CEFR_GOALS: Record<CEFRLevel, string> = {
    A1: "Survive basic interactions",
    A2: "Travel and explore confidently",
    B1: "Connect and socialize naturally",
    B2: "Think and work in English",
    C1: "Persuade and lead with precision",
    C2: "Master all aspects of English"
};

/**
 * Get the next CEFR level
 */
export function nextCEFR(currentLevel: CEFRLevel): CEFRLevel | null {
    const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === CEFR_LEVELS.length - 1) {
        return null; // Already at max level or invalid level
    }
    return CEFR_LEVELS[currentIndex + 1];
}

/**
 * Get the previous CEFR level
 */
export function previousCEFR(currentLevel: CEFRLevel): CEFRLevel | null {
    const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
    if (currentIndex <= 0) {
        return null; // Already at min level or invalid level
    }
    return CEFR_LEVELS[currentIndex - 1];
}

/**
 * Get persona name for a CEFR level
 */
export function getCEFRPersona(level: CEFRLevel): string {
    return CEFR_PERSONAS[level] || "Learner";
}

/**
 * Get goal description for a CEFR level
 */
export function getCEFRGoal(level: CEFRLevel): string {
    return CEFR_GOALS[level] || "Continue learning";
}

/**
 * Get full identity for a CEFR level
 */
export function getCEFRIdentity(level: CEFRLevel) {
    return CEFR_IDENTITY[level];
}

/**
 * Check if a level is valid
 */
export function isValidCEFRLevel(level: string): level is CEFRLevel {
    return CEFR_LEVELS.includes(level as CEFRLevel);
}

/**
 * Get level index (0-5)
 */
export function getCEFRIndex(level: CEFRLevel): number {
    return CEFR_LEVELS.indexOf(level);
}
