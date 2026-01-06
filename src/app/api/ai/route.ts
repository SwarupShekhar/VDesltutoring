import { NextResponse } from "next/server"
import { geminiService } from "@/lib/gemini-service"
import { selectEnglivoLesson, getEnglivoLesson, getLessonReason } from "@/lib/englivoLessons"
import {
    computeEnglivoScore,
    getWeakestDimension,
    getStrongestDimension,
    getDimensionCoachingMessage
} from "@/lib/fluencyScore"
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { transcript, fluency, metrics, firstName: reqName } = await req.json()
        const { userId: clerkId } = await auth()

        // Fetch User Context / Memory
        let coachMemory: any = null
        let firstName = reqName || "Student"

        if (clerkId) {
            try {
                const user = await prisma.users.findUnique({
                    where: { clerkId },
                    select: { full_name: true, coach_memory: true } as any
                })
                if (user) {
                    firstName = (user as any).full_name?.split(' ')[0] || firstName
                    coachMemory = (user as any).coach_memory
                }
            } catch (e) {
                console.warn("Failed to fetch user memory", e)
            }
        }

        if (!transcript || transcript.trim().length < 2) {
            return NextResponse.json({ response: "" })
        }

        // Compute Englivo score from metrics
        const englivoData = metrics ? computeEnglivoScore(metrics) : null

        if (!englivoData) {
            // Fallback if no metrics available
            return NextResponse.json({
                response: "I didn't catch that clearly. Could you try again?"
            })
        }

        const { englivoScore, identity, dimensions, raw } = englivoData

        // Find weakest and strongest dimensions
        const weakest = getWeakestDimension(dimensions)
        const strongest = getStrongestDimension(dimensions)

        // Determine active Micro-Lesson based on Englivo dimensions
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

        // Focus on weakest dimension
        if (dimensions[weakest] < 60) {
            const message = getDimensionCoachingMessage(weakest, dimensions[weakest])
            specificRules.push(`- WEAKEST DIMENSION: ${weakest.toUpperCase()} (${dimensions[weakest]}/100). ${message}`)
        }

        // Acknowledge strongest dimension
        if (dimensions[strongest] > 75) {
            specificRules.push(`- STRENGTH: ${firstName}'s ${strongest} is excellent (${dimensions[strongest]}/100). Acknowledge this!`)
        }

        // Add specific Micro-Lesson instruction to coaching rules
        if (activeLesson && lessonReason) {
            specificRules.unshift(`PRIORITY FOCUS: ${activeLesson.lesson.title}. ${lessonReason} Remind them: "${activeLesson.lesson.instruction}"`)
        }

        // Generate Memory Context
        let memoryContext = ""
        if (coachMemory) {
            const { focusSkill, lastWeakness, lastSessionSummary } = coachMemory as any
            if (lastWeakness || focusSkill) {
                memoryContext = `
PAST SESSION MEMORY (Crucial for Continuity):
- Focus Skill: ${focusSkill || 'General Fluency'}
- Last Weakness: ${lastWeakness || 'None'}
- History: ${lastSessionSummary || 'None'}

CONTINUITY INSTRUCTION:
You MUST reference this memory in your first response to show you remember them. 
Example: "Welcome back ${firstName}. Last time we worked on ${lastWeakness}. Let's see if we can improve that today."
`
            }
        }

        const SYSTEM_PROMPT = `
You are Englivo — a friendly English speaking coach who genuinely cares about helping students.
The student's name is: ${firstName}

You are NOT a grammar teacher or a strict examiner. You are a supportive speaking partner.
Your job: Help ${firstName} feel confident, speak smoothly, and enjoy the conversation.

${memoryContext}

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
1. **Be Warm & Personal**: Use ${firstName}'s name naturally once per response with genuine warmth.
2. **Encourage First**: Start with something positive before any correction.
3. **Keep it Light**: Max 1-2 sentences. Sound like a friendly conversation, not a lecture.
4. **Ask Engaging Questions**: Make them want to keep talking.
5. **Use Dimension Language**: Reference Flow, Confidence, Clarity, Speed, or Stability - NOT grammar or vocabulary.

SPECIFIC GUIDANCE (use gently):
${specificRules.join('\n')}

DIMENSION-BASED FEEDBACK EXAMPLES:
- Low Flow: "Hey ${firstName}, your flow is breaking a bit. Try starting your next sentence faster!"
- Low Confidence: "${firstName}, I notice you're restarting sentences. Trust your first thought!"
- Low Clarity: "Your clarity could improve, ${firstName}. Pause silently instead of using 'um'."
- Low Speed: "${firstName}, let's pick up the pace a bit. You've got this!"
- Low Stability: "Keep the words flowing, ${firstName}. Don't freeze between thoughts!"

NEVER say: "wrong", "incorrect", "grammar error", "you failed", "CEFR", "A2", "B1", "beginner"
INSTEAD say: "let's try", "how about", "you could say", "great start", "your flow", "your confidence"

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

GOAL: Make ${firstName} feel excited, supported, and eager to speak more. Focus on behavioral fluency (how they speak), not academic English.
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
            errorMessage = `System Error: ${err.message}`
        }

        return NextResponse.json({ response: errorMessage })
    }
}
