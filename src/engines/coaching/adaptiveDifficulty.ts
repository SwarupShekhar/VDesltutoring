/**
 * Adaptive Difficulty System
 * 
 * Adjusts practice difficulty based on user's fluency performance.
 * High performers get faster prompts and less prep time.
 * Struggling users get simpler prompts and more thinking time.
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface DifficultySettings {
    prepTime: number           // Seconds allowed to think before speaking
    promptSpeed: 'slow' | 'normal' | 'fast'
    complexity: 'simple' | 'moderate' | 'complex'
    level: DifficultyLevel
}

/**
 * Determine difficulty settings based on fluency score.
 * 
 * @param fluencyScore - User's current fluency score (0-1)
 * @returns DifficultySettings object
 */
export function getDifficultySettings(fluencyScore: number): DifficultySettings {
    if (fluencyScore > 0.7) {
        // High performer - challenge them
        return {
            prepTime: 2,
            promptSpeed: 'fast',
            complexity: 'complex',
            level: 'hard'
        }
    }

    if (fluencyScore < 0.4) {
        // Struggling - give more support
        return {
            prepTime: 5,
            promptSpeed: 'slow',
            complexity: 'simple',
            level: 'easy'
        }
    }

    // Default - moderate difficulty
    return {
        prepTime: 3,
        promptSpeed: 'normal',
        complexity: 'moderate',
        level: 'medium'
    }
}

/**
 * Get prompt complexity filter for database/prompt selection.
 */
export function getComplexityFilter(settings: DifficultySettings): {
    maxWords: number
    minWords: number
    preferredTypes: string[]
} {
    switch (settings.complexity) {
        case 'simple':
            return {
                maxWords: 8,
                minWords: 3,
                preferredTypes: ['quick_response', 'opinion']
            }
        case 'complex':
            return {
                maxWords: 20,
                minWords: 10,
                preferredTypes: ['storytelling', 'debate', 'explanation']
            }
        default: // moderate
            return {
                maxWords: 15,
                minWords: 5,
                preferredTypes: ['situational', 'opinion', 'quick_response']
            }
    }
}

/**
 * Get user message for difficulty change notification.
 */
export function getDifficultyMessage(
    previousLevel: DifficultyLevel | null,
    currentLevel: DifficultyLevel
): string | null {
    if (!previousLevel || previousLevel === currentLevel) {
        return null
    }

    const levelRank = { easy: 1, medium: 2, hard: 3 }
    const improved = levelRank[currentLevel] > levelRank[previousLevel]

    if (improved) {
        return `Great progress! I'm increasing the challenge for you.`
    } else {
        return `Let's slow down a bit and focus on the basics.`
    }
}

/**
 * Calculate adaptive timeout based on difficulty and prompt length.
 */
export function getAdaptiveTimeout(
    settings: DifficultySettings,
    promptWordCount: number
): number {
    // Base time: 1 second per word for thinking
    const baseTime = promptWordCount * 1000

    // Add prep time bonus based on difficulty
    const prepBonus = settings.prepTime * 1000

    // Apply speed modifier
    const speedModifier =
        settings.promptSpeed === 'slow' ? 1.5 :
            settings.promptSpeed === 'fast' ? 0.7 :
                1.0

    return Math.round((baseTime + prepBonus) * speedModifier)
}
