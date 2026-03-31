
import { CEFR_LEXICAL_TRIGGERS, LEXICAL_ENGINE_CONFIG, CEFRLevel } from "./cefr-lexical-triggers";

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


