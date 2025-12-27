import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing in .env")
            return
        }
        console.log("✅ GEMINI_API_KEY found (length: " + apiKey.length + ")")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const result = await model.generateContent("Hello, are you working?")
        const response = await result.response
        const text = response.text()
        console.log("✅ Gemini Response:", text)
    } catch (error) {
        console.error("❌ Gemini Test Failed:", error)
    }
}

testGemini()
