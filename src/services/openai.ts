import OpenAI from "openai";

export class OpenAIService {
    private client: OpenAI | undefined;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    private getClient(): OpenAI {
        if (!this.client) {
            if (process.env.OPENAI_API_KEY) {
                this.client = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                });
            } else {
                throw new Error("OPENAI_API_KEY is missing. Please add it to your .env file.");
            }
        }
        return this.client;
    }

    /**
     * Generates a conversational response (Fast)
     * Uses gpt-4o for a balance of speed and intelligence.
     */
    async generateChatResponse(systemPrompt: string, userMessage: string): Promise<string> {
        try {
            const completion = await this.getClient().chat.completions.create({
                model: "gpt-4o", // Fast, smart, consistent
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7, // Slight creativity for conversation, but controlled
                max_tokens: 150, // Keep it snappy
            });

            return completion.choices[0]?.message?.content || "I didn't quite catch that. Could you say it again?";
        } catch (error) {
            console.error("OpenAI Chat Error:", error);
            throw error;
        }
    }

    /**
     * Generates a structured JSON report (Deep Analysis)
     * Uses gpt-4o for maximum reasoning capability.
     */
    async generateJsonReport(systemPrompt: string, transcript: string): Promise<any> {
        try {
            const completion = await this.getClient().chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `TRANSCRIPT:\n${transcript}` }
                ],
                response_format: { type: "json_object" }, // Enforce JSON
                temperature: 0.4, // More deterministic for grading
            });

            const content = completion.choices[0]?.message?.content || "{}";
            return JSON.parse(content);
        } catch (error) {
            console.error("OpenAI Report Error:", error);
            throw new Error("Failed to generate report");
        }
    }
}

export const openaiService = new OpenAIService();
