import dotenv from "dotenv"
dotenv.config({ path: ".env" })
import OpenAI from "openai"

async function testOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ OPENAI_API_KEY is missing");
        return;
    }

    // Mask key for safety in logs
    console.log(`🔑 Found API Key: ${apiKey.substring(0, 10)}...`)

    const openai = new OpenAI({ apiKey: apiKey })

    try {
        console.log("🚀 Testing gpt-4o-mini...")
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: "Hello! Are you working?" }
            ],
        })
        console.log("✅ Success! Response:", completion.choices[0].message.content);
    } catch (error: any) {
        console.error("❌ OpenAI Request Failed:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testOpenAI();
