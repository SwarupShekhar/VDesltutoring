import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = [
    "gemini-flash-lite-latest", // Primary (Stable & Fast)
    "gemini-flash-latest", // Secondary (Stable)
    "gemini-2.0-flash-lite-preview-02-05", // Backup (New features, but lower quota)
];

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

Example Interaction:
Student: "I... uh... go store yesterday."
Tutor: "Oh, you went to the store? Nice! What did you buy there? 🛒"

You are currently having a live voice conversation. Keep it natural and snappy.
`;

const REPORT_PROMPT = `
You are an expert English linguist. Analyze the following student transcript.
Generate a structured JSON report.

Assessment Criteria:
1. Fluency Score (0-100)
2. Grammar Score (0-100)
3. Vocabulary Score (0-100)
4. Key Feedback (3 bullet points)
5. Corrections: Identify 3 grammatical mistakes (if any). Format: "You said: [x] => Better: [y]"

Output JSON exactly like this:
{
  "scores": {
    "fluency": 85,
    "grammar": 78,
    "vocabulary": 80
  },
  "feedback": [
    "Good use of past tense.",
    "Try to speak more confidently.",
    "Watch out for subject-verb agreement."
  ],
  "corrections": [
    { "original": "I go to store yesterday.", "correction": "I went to the store yesterday.", "explanation": "Use past tense." }
  ]
}
`;

export class GeminiService {
    // Removed private properties to ensure stateless/lazy access to env vars

    constructor() {
        // No-op: API Key is checked at call time
    }

    private getClient(): GoogleGenerativeAI {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing in environment variables.");
            throw new Error("GEMINI_API_KEY is missing");
        }
        return new GoogleGenerativeAI(apiKey);
    }

    /**
     * Generates a conversational response.
     * Retries with different models and handles rate limits.
     */
    async generateResponse(transcript: string): Promise<string> {
        if (!transcript || transcript.trim().length === 0) {
            return "I didn't quite catch that. Could you say it again?";
        }

        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${transcript}\nTutor:`;
        return this.executeWithFallback(fullPrompt, false);
    }

    /**
     * Generates a structured JSON report.
     */
    async generateReport(transcript: string): Promise<any> {
        if (!transcript || transcript.length < 50) {
            return {
                scores: { fluency: 0, grammar: 0, vocabulary: 0 },
                feedback: ["Not enough data to generate a report.", "Try speaking more next time!"],
                corrections: []
            };
        }

        const fullPrompt = `${REPORT_PROMPT}\n\nTRANSCRIPT:\n${transcript}`;
        const jsonStr = await this.executeWithFallback(fullPrompt, true);

        try {
            // Clean markdown code blocks if present
            const cleanJson = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Report JSON:", e);
            throw new Error("Invalid JSON response from AI");
        }
    }

    /**
     * Generic method for raw text generation
     */
    async generateRawText(prompt: string): Promise<string> {
        return this.executeWithFallback(prompt, false);
    }

    /**
     * Generic method for raw JSON generation
     */
    async generateRawJson(prompt: string): Promise<any> {
        const jsonStr = await this.executeWithFallback(prompt, true);
        try {
            const cleanJson = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Raw JSON:", e);
            throw new Error("Invalid JSON response from AI");
        }
    }

    /**
     * Core execution logic with Model Fallback & Retry
     */
    private async executeWithFallback(prompt: string, jsonMode: boolean): Promise<string> {
        let lastError: any = null;

        for (const modelName of MODELS) {
            try {
                // console.log(`🤖 Attempting with model: ${modelName}`);
                const result = await this.callModel(modelName, prompt, jsonMode);
                return result; // Success!
            } catch (error: any) {
                console.warn(`⚠️ Model ${modelName} failed:`, error.message);
                lastError = error;

                // Stop only for client errors (400-499) BUT allow 429 (Rate Limit), 404 (Not Found), and 403 (Forbidden) to continue.
                const isRecoverable = error.status === 429 || error.status === 404 || error.status === 403 || error.status >= 500;

                if (!isRecoverable) {
                    throw error;
                }

                // Continue to next model...
            }
        }

        console.error("❌ All models failed.");
        throw lastError;
    }

    /**
     * Single model call with internal Exponential Backoff for Rate Limits
     */
    private async callModel(modelName: string, prompt: string, jsonMode: boolean): Promise<string> {
        const client = this.getClient(); // Lazy load
        const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
        });

        let retries = 0;
        const maxRetries = 2; // Per model retries

        while (true) {
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                return response.text();
            } catch (error: any) {
                if ((error.status === 429 || error.status === 503) && retries < maxRetries) {
                    const waitTime = Math.pow(2, retries) * 1000;
                    console.log(`⏳ Rate limit/Busy on ${modelName}. Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries++;
                } else {
                    throw error;
                }
            }
        }
    }
}

export const geminiService = new GeminiService();
