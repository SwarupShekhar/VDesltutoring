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
import { detectLexicalCeiling } from "@/lib/fluency-engine"
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers"
import { AI_LEVEL_BEHAVIOR, getNextCEFRLevel, CEFR_LEVEL_LABELS } from "@/lib/cefr"


export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { transcript, firstName: reqName } = body
        // Handle both direct metrics (new) and nested fluency.metrics (old)
        const metrics = body.metrics || body.fluency?.metrics
        const { userId: clerkId } = await auth()

        // Fetch User Context / Memory
        let coachMemory: any = null
        let firstName = reqName || "Student"
        let currentCEFRLevel: CEFRLevel = "A1"
        let fluencyProfile: any = null

        if (clerkId) {
            try {
                const user = await prisma.users.findUnique({
                    where: { clerkId },
                    include: { user_fluency_profile: true }
                })
                if (user) {
                    firstName = (user as any).full_name?.split(' ')[0] || firstName
                    coachMemory = (user as any).coach_memory
                    fluencyProfile = (user as any).user_fluency_profile
                    if (fluencyProfile?.cefr_level) {
                        currentCEFRLevel = fluencyProfile.cefr_level as CEFRLevel
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch user memory", e)
            }
        }

        // Get level-adaptive behavior configuration
        const levelBehavior = AI_LEVEL_BEHAVIOR[currentCEFRLevel]
        const nextCEFRTarget = getNextCEFRLevel(currentCEFRLevel) || currentCEFRLevel
        const levelLabel = CEFR_LEVEL_LABELS[currentCEFRLevel]

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

        // Check for lexical ceilings (vocabulary limitations)
        const lexicalTargetLevel: CEFRLevel = (body.targetLevel as CEFRLevel) || "B1"
        const lexicalCeiling = detectLexicalCeiling(transcript, lexicalTargetLevel)

        if (lexicalCeiling) {
            specificRules.unshift(`LEXICAL CEILING DETECTED: ${firstName} is overusing basic ${lexicalCeiling.category.toLowerCase()}: ${lexicalCeiling.detectedWords.slice(0, 3).join(', ')}. ${lexicalCeiling.explanation} Gently suggest alternatives like: ${lexicalCeiling.upgrades.slice(0, 3).join(', ')}.`)
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

        // Select System Prompt based on Mode
        const { systemPromptType, targetLevel: bodyTargetLevel } = body
        let SYSTEM_PROMPT = ""

        // Only inject memory if this is the START of the conversation (no history)
        const isFirstTurn = !body.history || body.history.length === 0;
        const memoryPrompt = isFirstTurn ? memoryContext : "";

        if (systemPromptType === 'TRIAL') {
            SYSTEM_PROMPT = `
You are THE EXAMINER. You are a strict, neutral, professional CEFR Assessor.
The student (${firstName}) is attempting to pass the ${bodyTargetLevel || 'B2'} LEVEL GATE.

Your Role:
- DO NOT act like a teacher or helper.
- DO NOT correct errors.
- DO NOT be overly warm. Be professional and detached (like an IELTS/Cambridge examiner).
- Your goal is to STRESS TEST their English.

EXAM PROTOCOL:
1. Round 1: Ask an open-ended personal question (e.g., "Describe a memorable event").
2. Round 2: Ask for an opinion on a controversial or abstract topic (e.g., "Do you think technology improves happiness?").
3. Round 3: Challenge their opinion or ask for clarification (e.g., "But isn't that contradictory? Explain why.").

CURRENT STATE:
- Level to Prove: ${bodyTargetLevel || nextCEFRTarget}
- Current Englivo Score: ${englivoScore}/100

YOUR RESPONSE RULES:
- **EXTREMELY CONCISE**: Maximum 1-2 short sentences.
- If they give a short answer, probe deeper ("Can you elaborate?", "Why do you think that?").
- If they struggle, move to the next question impassively.
- NEVER break character. You are a test administrator.

Return your response in this JSON format:
{
  "response": "Your examiner question here.",
  "corrections": []
}
`
        } else {
            // STANDARD TUTOR PROMPT WITH LEVEL-ADAPTIVE BEHAVIOR
            SYSTEM_PROMPT = `
You are Englivo — a friendly English speaking coach who genuinely cares about helping students.
The student's name is: ${firstName}

You are NOT a grammar teacher or a strict examiner. You are a supportive speaking partner.
Your job: Help ${firstName} feel confident, speak smoothly, and enjoy the conversation.

${memoryPrompt}

CURRENT STUDENT LEVEL:
- CEFR Level: ${currentCEFRLevel} (${levelLabel.name} - "${levelLabel.title}")
- Target Level: ${nextCEFRTarget}
- Your Pace: ${levelBehavior.paceDescription}
- Prompt Style: ${levelBehavior.promptStyle}
- Pause Tolerance: ${levelBehavior.pauseTolerance} seconds
- Focus Areas: ${levelBehavior.focusAreas.join(', ')}

LEVEL-ADAPTIVE BEHAVIOR:
${currentCEFRLevel === 'A1' || currentCEFRLevel === 'A2' ? `
- Be VERY patient. Allow up to ${levelBehavior.pauseTolerance}s pauses without rushing.
- Use simple vocabulary and short sentences.
- Scaffold their responses: "You could start with..."
- Celebrate small wins enthusiastically.
` : ''}
${currentCEFRLevel === 'B1' || currentCEFRLevel === 'B2' ? `
- Push for more complex responses: "Can you explain why?"
- Gently interrupt long pauses to maintain momentum.
- Introduce connectors: "How about using 'however' or 'therefore'?"
- If they use basic vocabulary, model more precise alternatives.
` : ''}
${currentCEFRLevel === 'C1' || currentCEFRLevel === 'C2' ? `
- Act as a peer, not a teacher. Challenge their ideas.
- Expect quick, articulate responses.
- Probe for nuance: "But isn't there another perspective?"
- If they pause too long, it's a sign they're not ready for promotion.
- Do NOT reward incomplete fluency with encouragement.
` : ''}

Your job is to test readiness for ${nextCEFRTarget}.
If the user pauses mid-sentence or relies on basic vocabulary, probe deeper instead of encouraging.
Do NOT reward incomplete fluency.

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
1. **Be Warm & Personal**: Use ${firstName}'s name naturally (but NOT in every single response).
2. **Encourage First**: Start with something positive before any correction.
3. **STRICTLY CONCISE**: Max 1 sentence (2 if absolutely necessary). Keep it conversational and snappy.
4. **Ask Engaging Questions**: Make them want to keep talking.
5. **Use Dimension Language**: Reference Flow, Confidence, Clarity, Speed, or Stability - NOT grammar or vocabulary.

SPECIFIC GUIDANCE (use gently):
${specificRules.join('\n')}

INSTRUCTIONS:
- NEVER say "wrong", "incorrect", "grammar error", "you failed", "CEFR", "A2", "B1", "beginner"
- INSTEAD say: "let's try", "how about", "you could say", "great start", "your flow", "your confidence"
- MODEL corrections naturally in your reply.
- Use emojis occasionally to be friendly.
- **DO NOT** repeat "Welcome back" or past memory if you have already said it.

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
        }

        // Pass history to Gemini Service
        const history = body.history || []
        const rawResponse = await geminiService.generateChatResponse(SYSTEM_PROMPT, transcript, history)

        // Try to parse as JSON first (for corrections), fallback to plain text
        let response = rawResponse
        let corrections = []

        try {
            // Clean markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
            const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson)
            if (parsed.response) {

                // Also clean any potential markdown in the inner response text
                response = parsed.response.replace(/```/g, "")
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
