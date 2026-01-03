import { NextResponse } from "next/server"
import { openaiService } from "@/lib/openai-service"
import { pickMicroLesson, getMicroLesson } from "@/lib/microLessonSelector"

export async function POST(req: Request) {
    try {
        const { transcript, fluency, metrics } = await req.json()

        if (!transcript || transcript.trim().length < 2) {
            return NextResponse.json({ response: "" })
        }

        // Extract fluency data for honest coaching
        const fluencyScore = metrics?.fluencyScore ?? 0.5
        const pauseRatio = metrics?.pauseRatio ?? 0
        const fillerRate = metrics?.fillerRate ?? 0
        const restartRate = metrics?.restartRate ?? 0
        const wordCount = metrics?.wordCount ?? 0

        // Determine active Micro-Lesson
        const lessonType = pickMicroLesson({ pauseRatio, fillerRate, restartRate, wordCount })
        const activeLesson = getMicroLesson(lessonType)

        // Determine coaching tone based on actual performance
        const toneLabel = fluencyScore < 0.45 ? 'CRITICAL' : fluencyScore < 0.6 ? 'STRICT' : 'DIRECT'

        // Build dynamic, honest coaching rules
        const coachingRules: string[] = []

        if (fluencyScore < 0.50) {
            coachingRules.push('- Be STRICT. They are struggling. Do NOT sugarcoat.')
            coachingRules.push('- Focus purely on fixing the flow. No small talk.')
        }

        if (pauseRatio > 0.12) {
            coachingRules.push(`- PAUSES are critical (${Math.round(pauseRatio * 100)}%). Tell them to "Keep going" or "Don't stop".`)
        }

        if (fillerRate > 0.05) {
            coachingRules.push(`- FILLERS are excessive (${Math.round(fillerRate * 100)}%). Tell them to stop saying "uh/um/like".`)
        }

        if (restartRate > 0.1) {
            coachingRules.push(`- RESTARTS are confusing (${Math.round(restartRate * 100)}%). Tell them to "Trust their first thought".`)
        }

        // Add specific Micro-Lesson instruction to coaching rules
        if (activeLesson) {
            coachingRules.unshift(`PRIORITY FOCUS: ${activeLesson.title}. Remind them: "${activeLesson.drill}"`)
        }

        // Build the system prompt with real data
        const SYSTEM_PROMPT = `
You are a HIGH-PERFORMANCE ENGLISH COACH. You are NOT a friend. You are here to get results.

CURRENT METRICS:
- Consistency: ${fluencyScore.toFixed(2)} (${toneLabel})
- Pause Rate: ${Math.round(pauseRatio * 100)}% (Target: <10%)
- Filler Rate: ${Math.round(fillerRate * 100)}% (Target: <5%)

${activeLesson ? `DRILL IN PROGRESS: ${activeLesson.title}` : ''}

INSTRUCTIONS:
1. **Be Concise**: 1 sentence limit usually. 2 max.
2. **Be Critical**: If metric targets are missed, call it out immediately.
   - Bad: "You're doing okay, but try to speak faster."
   - Good: "Too many pauses. Speed up."
   - Good: "Stop saying 'uh'. Just breathe."
3. **No Fluff**: Never say "Great job", "I understand", "That's interesting".
4. **Action-Oriented**: Give a direct command or a challenge question.

${coachingRules.length > 0 ? `CRITICAL ISSUES TO FLAGG:\n${coachingRules.join('\n')}` : '- Flow is decent. Push for more complex vocabulary.'}

Your goal: Force them to speak fluently through pressure and direct comparison to the standard.
`

        const text = await openaiService.generateChatResponse(SYSTEM_PROMPT, transcript)

        return NextResponse.json({ response: text })
    } catch (err: any) {
        console.error("AI Error:", err)
        // Fallback
        const text = "Connection unstable. Keep speaking."
        return NextResponse.json({ response: text })
    }
}
