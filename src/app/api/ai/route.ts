import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
    try {
        const { transcript, fluency } = await req.json()

        if (!transcript || transcript.trim().length < 2) {
            return NextResponse.json({ response: "" })
        }

        // Build the system prompt INSIDE the request so fluency is available
        const SYSTEM_PROMPT = `
You are a private English fluency coach.

The student's current speaking patterns:
${fluency?.patterns?.join(", ") || "None detected"}

Your job is NOT to teach grammar.
Your job is to help the student speak smoothly, confidently, and naturally.

Rules:
- Never say "wrong"
- Never criticize
- Never explain grammar unless asked
- Always encourage speaking
- Reward flow, not correctness
- If the student hesitates, help them start faster
- If they translate, help them react more naturally
- If they use fillers, model smoother starters
- Keep replies short (1–2 sentences)
- Always ask a follow-up question

Tone:
Calm, warm, professional.
Like a private tutor in a quiet library.
`

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: transcript },
            ],
            temperature: 0.6,
        })

        const text =
            response.choices[0]?.message?.content ||
            "That was good - try telling me that again a little more smoothly."

        return NextResponse.json({ response: text })
    } catch (err: any) {
        console.error("AI Error:", err)

        // Graceful fallback for quota / billing issues
        const isQuotaError =
            err.status === 429 ||
            err.code === "insufficient_quota" ||
            err.message?.toLowerCase().includes("quota")

        if (isQuotaError) {
            return NextResponse.json({
                response:
                    "I'm temporarily out of credits, but I can still hear you. Keep speaking - you're doing great.",
            })
        }

        return NextResponse.json(
            { error: "AI failed", detail: err.message },
            { status: 500 }
        )
    }
}
