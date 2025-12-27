import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing")
            return
        }

        console.log("Using API Key:", apiKey.substring(0, 5) + "...")

        // Direct fetch to list models to bypass SDK potential issues
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

        if (!response.ok) {
            console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error(text)
            return
        }

        const data = await response.json()
        console.log("✅ Available Models:")
        data.models.forEach((m: any) => {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`)
            }
        })

    } catch (error) {
        console.error("❌ List Models Failed:", error)
    }
}

listModels()
