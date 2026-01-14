export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface LexicalTrigger {
    targetLevel: CEFRLevel;      // Level user is attempting to reach
    currentLimit: CEFRLevel;    // Level they are stuck at
    category: "Vocabulary" | "Connectors" | "Nuance";
    triggers: string[];         // Lemma families (good, better, best)
    upgrades: string[];         // CEFR-correct replacements
    explanation: string;       // Used in CEFR audit + UI
}

export const LEXICAL_ENGINE_CONFIG = {
    REPETITION_THRESHOLD: 3,
    WINDOW_SECONDS: 45
};

export const CEFR_LEXICAL_TRIGGERS: LexicalTrigger[] = [
    {
        targetLevel: "B1",
        currentLimit: "A2",
        category: "Vocabulary",
        triggers: ["good", "better", "best", "bad", "worse", "worst", "nice", "big", "small", "very good", "very bad"],
        upgrades: ["pleasant", "unpleasant", "significant", "minor", "useful", "beneficial", "problematic", "considerable", "modest"],
        explanation: "To reach B1, speakers must describe instead of relying on basic adjectives. Use more specific vocabulary that conveys precise meaning."
    },
    {
        targetLevel: "B2",
        currentLimit: "B1",
        category: "Connectors",
        triggers: ["and", "but", "so", "then", "because", "and then", "but then"],
        upgrades: ["however", "therefore", "consequently", "in contrast", "moreover", "furthermore", "nevertheless", "as a result"],
        explanation: "B2 speakers connect ideas logically instead of chaining with 'and' or 'but'. Use discourse markers that show clear relationships between ideas."
    },
    {
        targetLevel: "C1",
        currentLimit: "B2",
        category: "Nuance",
        triggers: ["very", "really", "extremely", "i think", "i feel", "i believe", "maybe", "probably"],
        upgrades: ["substantially", "considerably", "arguably", "it appears that", "one could argue", "it seems likely that", "evidence suggests", "to some extent"],
        explanation: "C1 requires precision and hedging instead of emotional intensifiers. Use academic language that shows nuanced thinking and appropriate certainty levels."
    },
    {
        targetLevel: "C2",
        currentLimit: "C1",
        category: "Nuance",
        triggers: ["important", "interesting", "difficult", "easy", "complex"],
        upgrades: ["pivotal", "noteworthy", "intricate", "straightforward", "multifaceted", "compelling", "nuanced", "sophisticated"],
        explanation: "C2 speakers use sophisticated vocabulary that demonstrates deep understanding and subtle distinctions in meaning."
    }
];

/**
 * Get lexical trigger configuration for a specific target level
 */
export function getLexicalTrigger(targetLevel: CEFRLevel): LexicalTrigger | null {
    return CEFR_LEXICAL_TRIGGERS.find(t => t.targetLevel === targetLevel) || null;
}

/**
 * Get all triggers that apply to levels at or below the target
 */
export function getApplicableTriggers(targetLevel: CEFRLevel): LexicalTrigger[] {
    const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const targetIndex = levelOrder.indexOf(targetLevel);

    return CEFR_LEXICAL_TRIGGERS.filter(trigger => {
        const triggerIndex = levelOrder.indexOf(trigger.targetLevel);
        return triggerIndex <= targetIndex;
    });
}
