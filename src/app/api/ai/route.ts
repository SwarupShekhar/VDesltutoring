import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

const SYSTEM_PROMPT = `
You are a private English fluency coach.

Your job is NOT to teach grammar.
Your job is to help the student speak smoothly, confidently, and naturally.

Rules:
- Never say "wrong"
- Never criticize
- Never explain grammar unless asked
- Always encourage speaking
- Reward flow, not correctness
- Gently model smoother versions
- Keep replies short (1–2 sentences)
- Always ask a follow-up question

Tone:
Calm, warm, professional.
Like a private tutor in a quiet library.
`

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json()

        if (!transcript || transcript.trim().length < 2) {
            return NextResponse.json({ response: "" })
        }

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
        })

        const text = response.choices[0]?.message?.content || "Tell me more."

        return NextResponse.json({ response: text })
    } catch (err: any) {
        console.error("AI Error:", err)

        // Fallback: If OpenAI fails (likely 429 quota), return a Mock response to allow Dev/UI testing
        const isQuotaError = err.status === 429 || err.code === 'insufficient_quota' || err.message?.includes('quota');

        if (isQuotaError) {
            return NextResponse.json({
                response: "I'm currently out of credits, but I can still hear you! This is a mock response to help you test the app interface. Good job speaking!"
            })
        }

        return NextResponse.json(
            { error: "AI failed", detail: err.message },
            { status: 500 }
        )
    }
}
