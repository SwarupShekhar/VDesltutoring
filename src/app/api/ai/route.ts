import { NextResponse } from "next/server"
import { geminiService } from "@/lib/gemini-service"
import { pickMicroLesson, getMicroLesson } from "@/lib/microLessonSelector"

export async function POST(req: Request) {
    try {
        const { transcript, fluency, metrics, firstName = "Student" } = await req.json()

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

        // Determine Tone
        let toneInstructions = ""
        if (fluencyScore < 0.45) {
            toneInstructions = "WARM + PATIENT. Be extra encouraging and supportive."
        } else if (fluencyScore < 0.65) {
            toneInstructions = "ENTHUSIASTIC + HELPFUL. Celebrate progress and guide gently."
        } else {
            toneInstructions = "EXCITED + CHALLENGING. Push them with energy and positivity."
        }

        // Coaching Rules (Neuro-Bonding)
        const specificRules: string[] = []
        if (pauseRatio > 0.15) specificRules.push(`- PAUSES are noticeable (${Math.round(pauseRatio * 100)}%). Gently encourage ${firstName} to keep the flow going.`)
        if (fillerRate > 0.08) specificRules.push(`- FILLERS are present (${Math.round(fillerRate * 100)}%). Help them find smoother transitions.`)
        if (restartRate > 0.10) specificRules.push(`- RESTARTS happen (${Math.round(restartRate * 100)}%). Remind them to trust their instincts.`)

        // Add specific Micro-Lesson instruction to coaching rules
        if (activeLesson) {
            specificRules.unshift(`PRIORITY FOCUS: ${activeLesson.title}. Remind them: "${activeLesson.drill}"`)
        }

        const SYSTEM_PROMPT = `
You are Englivo — a friendly English speaking coach who genuinely cares about helping students.
The student's name is: ${firstName}

You are NOT a grammar teacher or a strict examiner. You are a supportive speaking partner.
Your job: Help ${firstName} feel confident, speak smoothly, and enjoy the conversation.

CURRENT DATA:
- Fluency Score: ${fluencyScore.toFixed(2)}
- Coaching Style: ${toneInstructions}

COACHING RULES:
1. **Be Warm & Personal**: Use ${firstName}'s name naturally once per response with genuine warmth (e.g., "That's great, ${firstName}!" or "${firstName}, I love your energy!")
2. **Encourage First**: Start with something positive before any correction
3. **Keep it Light**: Max 1-2 sentences. Sound like a friendly conversation, not a lecture
4. **Ask Engaging Questions**: Make them want to keep talking

SPECIFIC GUIDANCE (use gently):
${specificRules.join('\n')}

TONE EXAMPLES:
- Low fluency: "Hey ${firstName}, you're doing great! Let's slow down and take it one thought at a time. What happened next?"
- Medium fluency: "Nice, ${firstName}! I can feel your confidence growing. Tell me more about that!"
- High fluency: "Wow ${firstName}, you're on fire! Let's push it even further—describe it in more detail!"

NEVER say: "wrong", "incorrect", "grammar error", "you failed"
INSTEAD say: "let's try", "how about", "you could say", "great start"

ERROR CORRECTION:
If ${firstName} makes grammar, vocabulary, or fluency errors, note them mentally but DON'T lecture.
Instead, model the correct form naturally in your response.

Return your response in this JSON format:
{
  "response": "your warm, conversational reply here",
  "corrections": [
    { "original": "exact error phrase from their speech", "corrected": "the correct version", "type": "grammar|vocabulary|fluency" }
  ]
}

If there are no errors, return an empty corrections array.

GOAL: Make ${firstName} feel excited, supported, and eager to speak more.
`
        const rawResponse = await geminiService.generateChatResponse(SYSTEM_PROMPT, transcript)

        // Try to parse as JSON first (for corrections), fallback to plain text
        let response = rawResponse
        let corrections = []

        try {
            const parsed = JSON.parse(rawResponse)
            if (parsed.response) {
                response = parsed.response
                corrections = parsed.corrections || []
            }
        } catch (e) {
            // Not JSON, use raw response as-is
            console.log("AI returned plain text (no corrections)")
        }

        return NextResponse.json({ response, corrections })
    } catch (err: any) {
        console.error("AI Error:", err)

        let errorMessage = "Connection unstable. Keep speaking."

        // Expose specific configuration errors to the user (via voice)
        if (err.message && (err.message.includes("API_KEY") || err.message.includes("missing"))) {
            errorMessage = "System Error: The Gemini API Key is missing. Please check your settings."
        } else if (err.message) {
            // For other errors, log them but maybe keep the response somewhat vague or helpful
            // actually for now, let's speak the error if it helps debugging
            errorMessage = `System Error: ${err.message}`
        }

        return NextResponse.json({ response: errorMessage })
    }
}
