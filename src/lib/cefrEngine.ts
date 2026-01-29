/**
 * CEFR Skill Engine
 * 
 * Converts raw speech metrics into CEFR-mapped skill scores.
 * This is the legitimacy layer that makes Englivo a real assessment system.
 * 
 * Thresholds mirror CEFR progression curves used in Cambridge & IELTS research.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Skill = "fluency" | "pronunciation" | "grammar" | "vocabulary"

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

/**
 * Raw skill metrics from speech analysis (0-1 scale)
 */
export interface SkillMetrics {
    fluency: number        // from fluencyScore.ts (0–1)
    pronunciation: number  // from Deepgram phoneme confidence (0–1)
    grammar: number        // from AI error rate per 100 words (0–1)
    vocabulary: number     // from unique words / total words (0–1)
}

/**
 * Individual skill score with CEFR mapping
 */
export interface SkillScore {
    score: number         // 0-100
    cefr: CEFRLevel       // CEFR level
    percentile: number    // 0-100 (for comparison)
    label: string         // Human-readable description
    nextLevel: CEFRLevel | null
    pointsToNext: number  // Points needed to reach next level
}

/**
 * Complete CEFR profile for a learner
 */
export interface CEFRProfile {
    fluency: SkillScore
    pronunciation: SkillScore
    grammar: SkillScore
    vocabulary: SkillScore
    overall: {
        score: number
        cefr: CEFRLevel
        label: string
    }
    weakest: Skill
    strongest: Skill
    speakingTime: number  // Total speaking time in seconds
    isPreliminary?: boolean // True if assessment is based on limited data
    confidenceBand?: string // "Low" | "Medium" | "High"
    confidenceExplanation?: string
}

// ============================================================================
// CEFR LEVEL CONFIGURATION
// ============================================================================

export const CEFR_THRESHOLDS: Record<CEFRLevel, { min: number; max: number; label: string }> = {
    "A1": { min: 0, max: 19, label: "Beginner" },
    "A2": { min: 20, max: 34, label: "Elementary" },
    "B1": { min: 35, max: 54, label: "Intermediate" },
    "B2": { min: 55, max: 69, label: "Upper-Intermediate" },
    "C1": { min: 70, max: 84, label: "Advanced" },
    "C2": { min: 85, max: 100, label: "Proficient" }
}

export const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
    "A1": "Can understand and use familiar everyday expressions",
    "A2": "Can communicate in simple, routine tasks",
    "B1": "Can deal with most situations likely to arise",
    "B2": "Can interact with a degree of fluency and spontaneity",
    "C1": "Can express ideas fluently and spontaneously",
    "C2": "Can express with precision, using subtle shades of meaning"
}

export const SKILL_LABELS: Record<Skill, { name: string; icon: string; description: string }> = {
    fluency: {
        name: "Fluency",
        icon: "🎯",
        description: "How smoothly you speak without pauses or hesitation"
    },
    pronunciation: {
        name: "Pronunciation",
        icon: "🗣️",
        description: "How clearly and accurately you pronounce words"
    },
    grammar: {
        name: "Grammar",
        icon: "📝",
        description: "How correctly you construct sentences"
    },
    vocabulary: {
        name: "Vocabulary",
        icon: "📚",
        description: "How varied and appropriate your word choices are"
    }
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Convert a 0-100 score to CEFR level.
 * Thresholds based on Cambridge & IELTS research.
 */
export function scoreToCEFR(score: number): CEFRLevel {
    if (score < 20) return "A1"
    if (score < 35) return "A2"
    if (score < 55) return "B1"
    if (score < 70) return "B2"
    if (score < 85) return "C1"
    return "C2"
}

/**
 * Get the next CEFR level (or null if at C2)
 */
export function getNextLevel(current: CEFRLevel): CEFRLevel | null {
    const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]
    const idx = levels.indexOf(current)
    return idx < levels.length - 1 ? levels[idx + 1] : null
}

/**
 * Calculate points needed to reach the next level
 */
export function getPointsToNextLevel(score: number, currentLevel: CEFRLevel): number {
    const nextLevel = getNextLevel(currentLevel)
    if (!nextLevel) return 0

    const threshold = CEFR_THRESHOLDS[nextLevel].min
    return Math.max(0, threshold - score)
}

/**
 * Create a complete SkillScore from a raw 0-100 score
 */
export function createSkillScore(score: number): SkillScore {
    const cefr = scoreToCEFR(score)
    const nextLevel = getNextLevel(cefr)

    return {
        score: Math.round(score),
        cefr,
        percentile: Math.round(score),
        label: CEFR_THRESHOLDS[cefr].label,
        nextLevel,
        pointsToNext: getPointsToNextLevel(score, cefr)
    }
}

/**
 * Convert raw skill metrics (0-1) to CEFR profile.
 * This is the main function that powers the dashboard.
 */
export function computeSkillScores(
    m: SkillMetrics,
    speakingTime: number = 0,
    confidenceBand?: string,
    confidenceExplanation?: string
): CEFRProfile {
    // CALIBRATION: Use non-linear power curve to prevent grade inflation.
    // Raw 0.9 (90%) -> 0.9^1.5 = 0.85 (85 score = C2 threshold)
    // Raw 0.8 (80%) -> 0.8^1.5 = 0.71 (71 score = C1 threshold)
    // Raw 0.7 (70%) -> 0.7^1.5 = 0.58 (58 score = B2 threshold)
    const calibrate = (v: number) => {
        const raw = Math.max(0, Math.min(1, v));
        return Math.round(Math.pow(raw, 1.5) * 100);
    };

    const fluencyScore = calibrate(m.fluency)
    const pronunciationScore = calibrate(m.pronunciation)
    const grammarScore = calibrate(m.grammar)
    const vocabularyScore = calibrate(m.vocabulary)

    // Weighted average for overall score
    // Fluency is most important for speaking, followed by pronunciation
    const overallRaw =
        fluencyScore * 0.35 +
        pronunciationScore * 0.25 +
        grammarScore * 0.20 +
        vocabularyScore * 0.20

    const overallScore = Math.round(overallRaw)

    // Find weakest and strongest
    const scores = {
        fluency: fluencyScore,
        pronunciation: pronunciationScore,
        grammar: grammarScore,
        vocabulary: vocabularyScore
    }

    const sortedSkills = (Object.entries(scores) as [Skill, number][])
        .sort((a, b) => a[1] - b[1])

    const weakest = sortedSkills[0][0]
    const strongest = sortedSkills[sortedSkills.length - 1][0]

    return {
        fluency: createSkillScore(fluencyScore),
        pronunciation: createSkillScore(pronunciationScore),
        grammar: createSkillScore(grammarScore),
        vocabulary: createSkillScore(vocabularyScore),
        overall: {
            score: overallScore,
            cefr: scoreToCEFR(overallScore),
            label: CEFR_THRESHOLDS[scoreToCEFR(overallScore)].label
        },
        weakest,
        strongest,
        speakingTime,
        confidenceBand,
        confidenceExplanation
    }
}

// ============================================================================
// DRILL SYSTEM
// ============================================================================

export interface SkillDrill {
    skill: Skill
    title: string
    instruction: string
    prompt: string
    duration: string
}

/**
 * Get a drill for a specific skill
 */
export function getSkillDrill(skill: Skill): SkillDrill {
    const drills: Record<Skill, SkillDrill> = {
        fluency: {
            skill: "fluency",
            title: "Speed Response",
            instruction: "Start speaking immediately without pausing. Say the first thing that comes to mind.",
            prompt: "Describe your morning routine without stopping.",
            duration: "30 seconds"
        },
        pronunciation: {
            skill: "pronunciation",
            title: "Sound Practice",
            instruction: "Repeat these sounds clearly and slowly. Focus on each syllable.",
            prompt: "The thick thief thought about throwing three things.",
            duration: "20 seconds"
        },
        grammar: {
            skill: "grammar",
            title: "Sentence Builder",
            instruction: "Fix this sentence pattern. Pay attention to verb tenses and word order.",
            prompt: "Yesterday I go to store and buy three apple for my friend.",
            duration: "45 seconds"
        },
        vocabulary: {
            skill: "vocabulary",
            title: "Word Expansion",
            instruction: "Use 3 new words in the next answer. Push beyond your comfort zone.",
            prompt: "Describe a memorable meal using descriptive adjectives.",
            duration: "60 seconds"
        }
    }

    return drills[skill]
}

/**
 * Get weakness description for a skill based on score
 */
export function getSkillWeakness(skill: Skill, score: number): string {
    const weaknesses: Record<Skill, { low: string; medium: string; high: string }> = {
        fluency: {
            low: "You pause too frequently when speaking. Your brain is translating before responding.",
            medium: "You have moments of good flow, but still hesitate at transition points.",
            high: "Minor pauses occasionally. Focus on maintaining momentum throughout longer responses."
        },
        pronunciation: {
            low: "Many sounds are unclear or mispronounced. Focus on individual word clarity.",
            medium: "Some sounds need work, especially consonant clusters and word endings.",
            high: "Mostly clear speech. Work on subtle sound distinctions and stress patterns."
        },
        grammar: {
            low: "Frequent errors in basic sentence structure. Focus on subject-verb agreement.",
            medium: "Good basic grammar, but complex sentences have errors. Work on tense consistency.",
            high: "Minor errors in advanced structures. Focus on conditional and subjunctive forms."
        },
        vocabulary: {
            low: "Very limited word variety. You repeat the same words frequently.",
            medium: "Adequate vocabulary, but could use more precise or varied words.",
            high: "Good range. Challenge yourself with idioms and domain-specific vocabulary."
        }
    }

    const category = score < 40 ? "low" : score < 70 ? "medium" : "high"
    return weaknesses[skill][category]
}

/**
 * Get improvement suggestion for moving to next level
 */
export function getImprovementSuggestion(skill: Skill, currentScore: number): string {
    const currentLevel = scoreToCEFR(currentScore)
    const nextLevel = getNextLevel(currentLevel)
    const pointsNeeded = getPointsToNextLevel(currentScore, currentLevel)

    if (!nextLevel) {
        return "You've reached the highest level! Maintain your excellence through regular practice."
    }

    const suggestions: Record<Skill, string> = {
        fluency: `Improve ${pointsNeeded}% to reach ${nextLevel}. Focus on reducing pauses between sentences.`,
        pronunciation: `Improve ${pointsNeeded}% to reach ${nextLevel}. Practice difficult sounds daily.`,
        grammar: `Improve ${pointsNeeded}% to reach ${nextLevel}. Review complex sentence patterns.`,
        vocabulary: `Improve ${pointsNeeded}% to reach ${nextLevel}. Learn 5 new words per day.`
    }

    return suggestions[skill]
}

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

/**
 * Calculate metrics change between two profiles
 */
export function calculateProfileDelta(
    today: CEFRProfile,
    yesterday: CEFRProfile
): Record<Skill | 'overall', number> {
    return {
        fluency: today.fluency.score - yesterday.fluency.score,
        pronunciation: today.pronunciation.score - yesterday.pronunciation.score,
        grammar: today.grammar.score - yesterday.grammar.score,
        vocabulary: today.vocabulary.score - yesterday.vocabulary.score,
        overall: today.overall.score - yesterday.overall.score
    }
}

/**
 * Generate summary text for a CEFR profile
 */
export function generateProfileSummary(profile: CEFRProfile): string {
    const { overall, weakest, strongest, speakingTime } = profile

    const timeText = speakingTime > 0
        ? `Based on ${Math.round(speakingTime)} seconds of speaking.`
        : ""

    return `English Level: ${overall.cefr} (${overall.score}/100). ` +
        `${overall.label}. ` +
        `Strongest skill: ${SKILL_LABELS[strongest].name}. ` +
        `Focus area: ${SKILL_LABELS[weakest].name}. ` +
        timeText
}

/**
 * Check if user has leveled up in any skill
 */
export function checkLevelUp(
    today: CEFRProfile,
    yesterday: CEFRProfile
): { skill: Skill | 'overall'; from: CEFRLevel; to: CEFRLevel } | null {
    // Check overall first
    if (today.overall.cefr !== yesterday.overall.cefr) {
        const todayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(today.overall.cefr)
        const yesterdayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(yesterday.overall.cefr)
        if (todayIdx > yesterdayIdx) {
            return { skill: 'overall', from: yesterday.overall.cefr, to: today.overall.cefr }
        }
    }

    // Check individual skills
    const skills: Skill[] = ['fluency', 'pronunciation', 'grammar', 'vocabulary']
    for (const skill of skills) {
        if (today[skill].cefr !== yesterday[skill].cefr) {
            const todayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(today[skill].cefr)
            const yesterdayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(yesterday[skill].cefr)
            if (todayIdx > yesterdayIdx) {
                return { skill, from: yesterday[skill].cefr, to: today[skill].cefr }
            }
        }
    }

    return null
}
