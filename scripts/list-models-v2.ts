
import dotenv from "dotenv"
dotenv.config({ path: ".env" })

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
    console.error("API Key missing")
    process.exit(1)
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()
    console.log("Available Models:")
    if (data.models) {
        data.models.forEach((m: any) => {
            if (m.supportedGenerationMethods?.includes("generateContent")) {
                console.log(`- ${m.name}`)
            }
        })
    } else {
        console.log("No models found or error:", data)
    }
}

listModels()
