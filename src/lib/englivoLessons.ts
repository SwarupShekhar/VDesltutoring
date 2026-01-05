/**
 * Englivo Micro-Lessons
 * 
 * Dimension-focused lessons that trigger based on specific behavioral patterns.
 */

import { EnglivoMicroLesson, EnglivoDimensions } from '@/types/englivoTypes'

/**
 * All available Englivo micro-lessons mapped to dimensions.
 */
export const ENGLIVO_LESSONS: Record<string, EnglivoMicroLesson> = {
    // FLOW DIMENSION (pauseRatio)
    START_FASTER: {
        focus: 'flow',
        metric: 'pauseRatio',
        value: 0.15,
        lesson: {
            title: 'Start Faster',
            instruction: 'Answer immediately. Do not pause before speaking.',
            drillPrompt: 'What did you eat today?'
        }
    },
    KEEP_MOMENTUM: {
        focus: 'flow',
        metric: 'pauseRatio',
        value: 0.20,
        lesson: {
            title: 'Keep Momentum',
            instruction: 'Connect your thoughts without long pauses between sentences.',
            drillPrompt: 'Describe your morning routine without stopping.'
        }
    },

    // CONFIDENCE DIMENSION (restartRate)
    TRUST_FIRST_THOUGHT: {
        focus: 'confidence',
        metric: 'restartRate',
        value: 0.10,
        lesson: {
            title: 'Trust Your First Thought',
            instruction: 'Commit to your sentence. Do not restart or correct yourself mid-sentence.',
            drillPrompt: 'Tell me about your favorite hobby.'
        }
    },
    COMMIT_TO_SENTENCES: {
        focus: 'confidence',
        metric: 'restartRate',
        value: 0.15,
        lesson: {
            title: 'Commit to Sentences',
            instruction: 'Finish every sentence you start. No backtracking.',
            drillPrompt: 'What are your plans for this weekend?'
        }
    },

    // CLARITY DIMENSION (fillerRate)
    ELIMINATE_FILLERS: {
        focus: 'clarity',
        metric: 'fillerRate',
        value: 0.08,
        lesson: {
            title: 'Eliminate Fillers',
            instruction: 'Replace "um", "uh", "like" with silent pauses.',
            drillPrompt: 'Explain how to make your favorite food.'
        }
    },
    PAUSE_SILENTLY: {
        focus: 'clarity',
        metric: 'fillerRate',
        value: 0.12,
        lesson: {
            title: 'Pause Silently',
            instruction: 'When you need to think, pause silently instead of saying filler words.',
            drillPrompt: 'Describe a place you want to visit.'
        }
    },

    // SPEED DIMENSION (wpm)
    PICK_UP_PACE: {
        focus: 'speed',
        metric: 'wpm',
        value: 90,
        lesson: {
            title: 'Pick Up Pace',
            instruction: 'Speak faster. Try to match natural conversation speed.',
            drillPrompt: 'Tell me about your day in 30 seconds.'
        }
    },
    FIND_RHYTHM: {
        focus: 'speed',
        metric: 'wpm',
        value: 100,
        lesson: {
            title: 'Find Your Rhythm',
            instruction: 'Maintain a steady, comfortable pace throughout your answer.',
            drillPrompt: 'What do you like about your job or studies?'
        }
    },
    SLOW_DOWN: {
        focus: 'speed',
        metric: 'wpm',
        value: 180,
        lesson: {
            title: 'Slow Down',
            instruction: 'You\'re speaking too fast. Take a breath and slow your pace.',
            drillPrompt: 'Describe your hometown calmly and clearly.'
        }
    },

    // STABILITY DIMENSION (silenceRatio)
    AVOID_FREEZES: {
        focus: 'stability',
        metric: 'silenceRatio',
        value: 0.15,
        lesson: {
            title: 'Avoid Freezes',
            instruction: 'Keep speaking. Do not freeze for long periods.',
            drillPrompt: 'Talk about your favorite movie without stopping.'
        }
    },
    MAINTAIN_FLOW: {
        focus: 'stability',
        metric: 'silenceRatio',
        value: 0.20,
        lesson: {
            title: 'Maintain Flow',
            instruction: 'Keep the words flowing. If you need to think, keep talking while you think.',
            drillPrompt: 'What did you learn recently?'
        }
    }
}

/**
 * Select the most appropriate micro-lesson based on dimension scores.
 * Returns the lesson key that should be focused on.
 */
export function selectEnglivoLesson(
    dimensions: EnglivoDimensions,
    rawMetrics: { pauseRatio: number; restartRate: number; fillerRate: number; wpm: number; silenceRatio: number }
): string | null {
    // Priority order: Flow > Confidence > Clarity > Speed > Stability

    // Check Flow (pauseRatio)
    if (rawMetrics.pauseRatio > 0.20) return 'KEEP_MOMENTUM'
    if (rawMetrics.pauseRatio > 0.15) return 'START_FASTER'

    // Check Confidence (restartRate)
    if (rawMetrics.restartRate > 0.15) return 'COMMIT_TO_SENTENCES'
    if (rawMetrics.restartRate > 0.10) return 'TRUST_FIRST_THOUGHT'

    // Check Clarity (fillerRate)
    if (rawMetrics.fillerRate > 0.12) return 'PAUSE_SILENTLY'
    if (rawMetrics.fillerRate > 0.08) return 'ELIMINATE_FILLERS'

    // Check Speed (wpm)
    if (rawMetrics.wpm < 90) return 'PICK_UP_PACE'
    if (rawMetrics.wpm < 100) return 'FIND_RHYTHM'
    if (rawMetrics.wpm > 180) return 'SLOW_DOWN'

    // Check Stability (silenceRatio)
    if (rawMetrics.silenceRatio > 0.20) return 'MAINTAIN_FLOW'
    if (rawMetrics.silenceRatio > 0.15) return 'AVOID_FREEZES'

    // No specific lesson needed - all dimensions are good
    return null
}

/**
 * Get the lesson object for a given lesson key.
 */
export function getEnglivoLesson(lessonKey: string): EnglivoMicroLesson | null {
    return ENGLIVO_LESSONS[lessonKey] || null
}

/**
 * Get a human-readable explanation of why this lesson was selected.
 */
export function getLessonReason(lessonKey: string, rawMetrics: any): string {
    const reasons: Record<string, string> = {
        START_FASTER: `Your pauses are at ${Math.round(rawMetrics.pauseRatio * 100)}%. Let's reduce hesitation.`,
        KEEP_MOMENTUM: `Your pauses are at ${Math.round(rawMetrics.pauseRatio * 100)}%. Let's maintain flow.`,
        TRUST_FIRST_THOUGHT: `You're restarting ${Math.round(rawMetrics.restartRate * 100)}% of sentences. Let's build confidence.`,
        COMMIT_TO_SENTENCES: `You're restarting ${Math.round(rawMetrics.restartRate * 100)}% of sentences. Let's commit more.`,
        ELIMINATE_FILLERS: `Fillers are ${Math.round(rawMetrics.fillerRate * 100)}% of your words. Let's clean that up.`,
        PAUSE_SILENTLY: `Fillers are ${Math.round(rawMetrics.fillerRate * 100)}% of your words. Let's pause instead.`,
        PICK_UP_PACE: `Your speed is ${rawMetrics.wpm} WPM. Let's increase the pace.`,
        FIND_RHYTHM: `Your speed is ${rawMetrics.wpm} WPM. Let's find your natural rhythm.`,
        SLOW_DOWN: `Your speed is ${rawMetrics.wpm} WPM. Let's slow down for clarity.`,
        AVOID_FREEZES: `You're silent ${Math.round(rawMetrics.silenceRatio * 100)}% of the time. Let's keep talking.`,
        MAINTAIN_FLOW: `You're silent ${Math.round(rawMetrics.silenceRatio * 100)}% of the time. Let's maintain flow.`
    }

    return reasons[lessonKey] || 'Let\'s work on improving your fluency.'
}
