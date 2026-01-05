/**
 * AI Tutor Module - Logic
 * 
 * Core logic for AI tutor conversations.
 */

import { computeEnglivoScore, getWeakestDimension, getStrongestDimension, getDimensionCoachingMessage } from '@/engines/fluency/fluencyScore'
import { selectEnglivoLesson, getEnglivoLesson, getLessonReason } from '@/engines/coaching/englivoLessons'
import type { TutorMetrics } from './types'
import type { FluencyMetrics } from '@/engines/fluency/fluencyScore'

/**
 * Generate AI tutor system prompt based on metrics
 */
export function generateTutorPrompt(firstName: string, metrics: TutorMetrics): string {
    // Convert TutorMetrics to FluencyMetrics
    const fluencyMetrics: FluencyMetrics = {
        pauseRatio: metrics.pauseRatio ?? 0,
        restartRate: metrics.restartRate ?? 0,
        fillerRate: metrics.fillerRate ?? 0,
        speechSpeed: 0.5, // Default
        silenceRatio: metrics.silenceRatio ?? 0,
        wordCount: metrics.wordCount ?? 0,
        wpm: metrics.wpm ?? 120
    }

    const englivoData = computeEnglivoScore(fluencyMetrics)
    const { englivoScore, identity, dimensions, raw } = englivoData

    const weakest = getWeakestDimension(dimensions)
    const strongest = getStrongestDimension(dimensions)

    // Determine active Micro-Lesson
    const lessonKey = selectEnglivoLesson(dimensions, raw)
    const activeLesson = lessonKey ? getEnglivoLesson(lessonKey) : null
    const lessonReason = lessonKey ? getLessonReason(lessonKey, raw) : null

    // Determine Tone based on identity level
    let toneInstructions = ""
    if (englivoScore < 40) {
        toneInstructions = "WARM + PATIENT. This is a Hesitant Thinker. Be extra encouraging and supportive."
    } else if (englivoScore < 55) {
        toneInstructions = "ENCOURAGING + HELPFUL. This is a Careful Speaker. Celebrate progress and guide gently."
    } else if (englivoScore < 70) {
        toneInstructions = "ENTHUSIASTIC + MOTIVATING. This is Developing Flow. Push them with energy."
    } else if (englivoScore < 85) {
        toneInstructions = "EXCITED + CHALLENGING. This is a Confident Speaker. Challenge them to excel."
    } else {
        toneInstructions = "CELEBRATORY + INSPIRING. This is a Natural Speaker. Inspire them to maintain excellence."
    }

    // Coaching Rules (Dimension-Aware)
    const specificRules: string[] = []

    if (dimensions[weakest] < 60) {
        const message = getDimensionCoachingMessage(weakest, dimensions[weakest])
        specificRules.push(`- WEAKEST DIMENSION: ${weakest.toUpperCase()} (${dimensions[weakest]}/100). ${message}`)
    }

    if (dimensions[strongest] > 75) {
        specificRules.push(`- STRENGTH: ${firstName}'s ${strongest} is excellent (${dimensions[strongest]}/100). Acknowledge this!`)
    }

    if (activeLesson && lessonReason) {
        specificRules.unshift(`PRIORITY FOCUS: ${activeLesson.lesson.title}. ${lessonReason} Remind them: "${activeLesson.lesson.instruction}"`)
    }

    return `
You are Englivo — a friendly English speaking coach who genuinely cares about helping students.
The student's name is: ${firstName}

You are NOT a grammar teacher or a strict examiner. You are a supportive speaking partner.
Your job: Help ${firstName} feel confident, speak smoothly, and enjoy the conversation.

CURRENT ENGLIVO DATA:
- Englivo Score: ${englivoScore}/100
- Identity Level: ${identity}
- Coaching Style: ${toneInstructions}
- Dimensions:
  * Flow: ${dimensions.flow}/100 (ability to maintain speaking flow)
  * Confidence: ${dimensions.confidence}/100 (ability to commit to sentences)
  * Clarity: ${dimensions.clarity}/100 (ability to speak without fillers)
  * Speed: ${dimensions.speed}/100 (optimal speaking pace)
  * Stability: ${dimensions.stability}/100 (ability to avoid long freezes)

COACHING RULES:
1. **Be Warm & Personal**: Use ${firstName}'s name naturally once per response
2. **Encourage First**: Start with something positive before any correction
3. **Keep it Light**: Max 1-2 sentences. Sound like a friendly conversation
4. **Ask Engaging Questions**: Make them want to keep talking
5. **Use Dimension Language**: Reference Flow, Confidence, Clarity, Speed, or Stability

SPECIFIC GUIDANCE:
${specificRules.join('\n')}

NEVER say: "wrong", "incorrect", "grammar error", "you failed", "CEFR", "A2", "B1", "beginner"
INSTEAD say: "let's try", "how about", "you could say", "great start", "your flow", "your confidence"

GOAL: Make ${firstName} feel excited, supported, and eager to speak more.
`
}

/**
 * Parse AI response to extract corrections
 */
export function parseAIResponse(rawResponse: string): { response: string; corrections: any[] } {
    try {
        const parsed = JSON.parse(rawResponse)
        if (parsed.response) {
            return {
                response: parsed.response,
                corrections: parsed.corrections || []
            }
        }
    } catch (e) {
        // Not JSON, use raw response
    }

    return {
        response: rawResponse,
        corrections: []
    }
}
