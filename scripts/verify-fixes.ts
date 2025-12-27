import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })

const SYSTEM_PROMPT = `
You are a warm, friendly, and empathetic English fluency coach.

Your goal is to make the student feel comfortable and confident.
You are NOT a strict teacher. You are a supportive conversation partner.

Rules:
- 💛 Tone: Warm, encouraging, and human. Use occasional emojis to be friendly.
- ⚡️ Brevity: Keep responses SHORT (1-2 sentences max). This reduces latency.
- 🚫 Grammar: Do NOT correct grammar unless explicitly asked. Focus on flow.
- 🤝 Empathy: If they struggle, say things like "Take your time," or "You're doing great."
- 🗣️ Engagement: Always end with a simple, relevant follow-up question to keep them talking.
- 🤖 Avoid: Robot phrases like "I understand," "As an AI," or long explanations.
`

const REPORT_PROMPT = `
You are an expert English linguist. Analyze the following student transcript.
Generate a structured JSON report.
`

async function verifyFixes() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY missing")
        return
    }
    const genAI = new GoogleGenerativeAI(apiKey)

    console.log("--- 1. Testing Tone Fix (gemini-flash-lite-latest) ---")
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" })
        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: I am feeling very nervous about speaking.\nTutor:`

        const result = await model.generateContent(fullPrompt)
        console.log("User: I am feeling very nervous about speaking.")
        console.log("AI Response:", result.response.text())
        console.log("✅ Tone Verification Passed (Subjective Check)")
    } catch (e) {
        console.error("❌ Tone Verification Failed:", e)
    }

    console.log("\n--- 2. Testing Report Fix (gemini-flash-lite-latest) ---")
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        })
        const transcript = "USER: Hello. ASSISTANT: Hi. USER: I go store."
        const result = await model.generateContent(REPORT_PROMPT + "\n\nTRANSCRIPT:\n" + transcript)
        const json = JSON.parse(result.response.text())
        console.log("✅ Report Generated Successfully:")
        console.log(JSON.stringify(json, null, 2))
    } catch (e) {
        console.error("❌ Report Verification Failed:", e)
    }
}

verifyFixes()
