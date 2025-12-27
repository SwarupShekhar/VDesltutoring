import dotenv from "dotenv"
dotenv.config({ path: ".env" })

import { geminiService } from "../src/lib/gemini-service"

async function verifyRobustness() {
    console.log("--- 1. Testing Chat Response (Service Layer) ---")
    try {
        const response = await geminiService.generateResponse("I am feeling very nervous about speaking.")
        console.log("User: I am feeling very nervous about speaking.")
        console.log("AI Response:", response)
        console.log("✅ Chat Response Success")
    } catch (e) {
        console.error("❌ Chat Response Failed:", e)
    }

    console.log("\n--- 2. Testing Report Generation (Service Layer) ---")
    try {
        const transcript = "USER: Hello. ASSISTANT: Hi. USER: I go store."
        const report = await geminiService.generateReport(transcript)
        console.log("✅ Report Generated Successfully:")
        console.log(JSON.stringify(report, null, 2))
    } catch (e) {
        console.error("❌ Report Generation Failed:", e)
    }

    console.log("\n--- 3. Testing Empty Input Safety ---")
    try {
        const emptyRes = await geminiService.generateResponse("")
        console.log("Empty Input Response:", emptyRes)
        if (emptyRes.includes("catch that")) {
            console.log("✅ Empty Input Handled Correctly")
        } else {
            console.error("❌ Unexpected Empty Input Response")
        }
    } catch (e) {
        console.error("❌ Empty Input Caused Error:", e)
    }
}

// Mocking fetch not needed as we use the real service which uses the real SDK
verifyRobustness()
