import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `
You are a private English fluency coach.

Your job is NOT to teach grammar.
Your job is to help the student speak smoothly, confidently, and naturally.

Rules:
- Never say "wrong".
- Never criticize.
- Never explain grammar unless asked.
- Always encourage the student to keep talking.
- Praise effort and flow, not accuracy.
- If the student hesitates, restarts, or uses fillers (uh, um, well, I mean), gently model a smoother version.
- Always respond like a calm, supportive human tutor.
- Keep replies short and conversational.
- Always ask a follow-up question to keep them speaking.

Your tone is:
Warm, patient, intelligent, human.
Like a private tutor in a quiet library.

You are currently having a natural spoken conversation.
`

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json()

        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
        })

        // Prepend system prompt manually to ensure stability
        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${transcript}\nTutor:`

        const result = await model.generateContent(fullPrompt)
        const response = result.response.text()

        return NextResponse.json({ response })
    } catch (error) {
        console.error("Gemini API Error:", error)
        return NextResponse.json(
            { response: "I'm having trouble connecting right now. Could you say that again?" },
            { status: 500 }
        )
    }
}
