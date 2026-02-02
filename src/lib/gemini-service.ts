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
You are a STRICT CEFR AUDITOR for English proficiency.
Your Goal: Assign a CEFR level (A1-C2) based on a "Failing Gate" system.
Assume the user is C2, then disqualify them downwards based on missing skills.

---
THE GATES (Check sequentially):

1. **C2 Gate (Mastery)**
   - Requirement: Nuance, irony, cultural references, complex metaphors.
   - Fail Condition: Speech is logical but literal. No double meanings.
   - Result if Fail: Drop to C1.

2. **C1 Gate (Precision)**
   - Requirement: Precise vocabulary ("exacerbate" vs "make worse"), varied sentence structures.
   - Fail Condition: Searching for words, using generic descriptors ("good", "bad"), simple structures.
   - Result if Fail: Drop to B2.

3. **B2 Gate (Abstraction)**
   - Requirement: Can explain *why*, compare ideas, and handle abstract topics (e.g., "Justice").
   - Fail Condition: Can only talk about concrete events. Struggling to justify opinions.
   - Result if Fail: Drop to B1.

4. **B1 Gate (Narration)**
   - Requirement: Can tell a coherent story with "Beginning -> Middle -> End".
   - Fail Condition: Disjointed sentences. No logical flow.
   - Result if Fail: Drop to A2.

5. **A2 Gate (Connection)**
   - Requirement: Can connect 2-3 sentences about routine/likes/dislikes.
   - Fail Condition: One-word answers or isolated simple sentences.
   - Result if Fail: Drop to A1.

6. **A1 Gate (Survival)**
   - Requirement: Basic intro, present tense.
   - Fail Condition: Unintelligible.

---
ARCHETYPES (Choose the ONE that most accurately captures the student's current "voice"):

**Advanced / Mastery (C1-C2):**
- "The Precision Architect": Uses sophisticated, technical, or nuanced vocabulary with structural perfection.
- "The Cultural Diplomat": Comfortable with idioms, irony, and cultural subtext; sounds like a native professional.
- "The Sophisticated Storyteller": Uses complex narrative arcs and evocative language to describe experiences.
- "The Nuanced Debater": Excels at hedging, argumentation, and exploring abstract shades of gray.

**Intermediate / Functional (B1-B2):**
- "The Practical Communicator": Clear and effective for daily life, but avoids complex abstract topics.
- "The Narrative Explorer": Good at telling stories but occasionally searches for the "exact" right word.
- "The Logic Builder": Connectors are strong ("However", "Therefore"), but rhythm can feel slightly mechanical.
- "The Developing Analyst": Can explain "what" very well, but starts to "hunt" for words when explaining "why."
- "The Brave Risk-Taker": Uses advanced words but makes grammatical "honest mistakes" while pushing boundaries.

**Beginner / Foundational (A1-A2):**
- "The Cautious Builder": speaks in short, correct, but isolated sentences; very careful to avoid errors.
- "The Enthusiastic Survivalist": High energy and lots of attempts, but low grammatical accuracy and simple vocabulary.
- "The Pattern Learner": Heavily reliant on memorized phrases and routine sentence structures.

**Behavioral / Cross-Level Traits (Apply to any level if dominant):**
- "The Literal Translator": Clearly thinking in their native language first; sentence structure feels slightly foreign.
- "The Rapid Rambler": Speaks quickly and fluently but sacrifices precision and grammar for speed.
- "The Thoughtful Perfectionist": Long pauses while "auditing" their own speech; high accuracy but low flow.
- "The Filler-Fluent": Uses "um", "ah", "like" as a bridge to maintain a continuous stream of sound.
- "The Minimalist": Extremely brief; provides the minimum information required to answer the question.

---
Assessment Criteria:
1. Identity: Choose the archetype that fits BEST and write a 1-sentence description that cites WHY.
2. Insights: 1 short sentence each for Fluency (rhythm/pauses), Grammar (tense/structure), and Vocabulary (range/repetition).
3. Patterns: List 3 specific speaking habits observed.
4. Refinements: 5 corrections of their actual speech (focus on grammar/natural phrasing).
5. Next Step: One actionable CEFR-aligned goal.
6. CEFR Analysis: Provide a level (A1-C2) and a deep reason explaining WHICH gate they passed or failed.
   - IMPORTANT: If AUDIO BEHAVIOR METADATA is provided, prioritize it over text accuracy. B2+ levels REQUIRE High or Medium confidence. If confidence is Low, do not assign above B1 regardless of vocabulary.

Output JSON exactly like this:
{
  "identity": {
    "archetype": "The Flow Builder",
    "description": "You are starting to link sentences together well."
  },
  "insights": {
    "fluency": "Your pacing is steady, though you pause often to think.",
    "grammar": "You generally use past tense correctly.",
    "vocabulary": "Good use of basic nouns, try adding more adjectives."
  },
  "patterns": [
    "Frequent use of 'uh' as a filler.",
    "Strong sentence openers.",
    "Tendency to drop articles (a/the)."
  ],
  "refinements": [
    { "original": "I go store.", "better": "I went to the store.", "explanation": "Use past tense for completed actions." }
  ],
  "next_step": "Practice using transition words like 'however' and 'therefore'.",
  "cefr_analysis": {
    "level": "B1",
    "reason": "Passed B1 narration but failed B2 abstraction. Could not explain 'why' clearly."
  }
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
     * Drop-in replacement for OpenAIService.generateChatResponse
     * Allows dynamic system prompts for Honest Coaching with History.
     */
    async generateChatResponse(systemPrompt: string, userMessage: string, history: Array<{ role: string, content?: string, parts?: any[] }> = []): Promise<string> {
        if (!userMessage || userMessage.trim().length === 0) {
            return "I didn't quite catch that.";
        }

        // Format history into a script format, handling both 'content' and 'parts'
        const historyText = history.map(msg => {
            const roleLabel = msg.role === 'user' ? 'User' : 'Tutor';
            let content = msg.content || "";

            // If the client sends 'parts' (standard AI SDK format), extract the text
            if (!content && Array.isArray(msg.parts)) {
                content = msg.parts.map(p => typeof p === 'string' ? p : (p.text || "")).join(" ");
            }

            return `${roleLabel}: ${content}`;
        }).join('\n');

        // Combine system prompt, history, and user message
        const fullPrompt = `${systemPrompt}\n\nPREVIOUS CONVERSATION:\n${historyText}\n\nUser: ${userMessage}\nTutor:`;
        return this.executeWithFallback(fullPrompt, false);
    }

    /**
     * Generates a structured JSON report.
     */
    async generateReport(transcript: string, audioMetadata?: { band: string, explanation: string }): Promise<any> {
        if (!transcript || transcript.length < 10) {
            return {
                identity: { archetype: "The Explorer", description: "Not enough speech to analyze yet." },
                insights: {
                    fluency: "Keep speaking to get analysis.",
                    grammar: "Keep speaking to get analysis.",
                    vocabulary: "Keep speaking to get analysis."
                },
                patterns: ["Try to speak in full sentences."],
                refinements: [],
                next_step: "Speak a bit more in the next session!"
            };
        }

        const audioInfo = audioMetadata
            ? `\n\nAUDIO BEHAVIOR METADATA:\n- Confidence Band: ${audioMetadata.band}\n- Observation: ${audioMetadata.explanation}`
            : "";

        const fullPrompt = `${REPORT_PROMPT}\n\nTRANSCRIPT:\n${transcript}${audioInfo}`;
        const jsonStr = await this.executeWithFallback(fullPrompt, true);

        try {
            // Clean markdown code blocks if present
            const cleanJson = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
            const report = JSON.parse(cleanJson);

            // Safety Fallback: Ensure cefr_analysis.level exists
            if (!report.cefr_analysis) {
                report.cefr_analysis = { level: "A1", reason: "Default level assigned due to missing analysis.", confidence_score: 50 };
            } else if (!report.cefr_analysis.level) {
                report.cefr_analysis.level = "A1";
            }

            return report;
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
