import { NextResponse } from 'next/server';
import OpenAI from "openai"

const REPORT_PROMPT = `
You are a warm, supportive English fluency coach. Analyze the student transcript.
Generate a structured JSON reflection.

Rules:
- NEVER use words like "Score", "Grade", "Test", "Mistake", "Wrong", "Error", "Bad".
- Use words like "Pattern", "Insight", "Observation", "Refinement", "Style".
- Tone: Encouraging, specific, psychological safety.
- Instead of scoring, describe the *behavior* or *habit*.
- Assign a "Speaking Identity" based on their style.

Identity Options:
1. "The Thoughtful Speaker" (Pauses often, values accuracy over speed)
2. "The Flow Builder" (Good rhythm, occasional grammar slips)
3. "The Rapid Thinker" (Fast ideas, sometimes stumbles on words)
4. "The Translator" (Hesitates as if translating from native language)
5. "The Storyteller" (Engaging narrative, focuses on message over form)

Output JSON format:
{
  "identity": {
    "archetype": "The Thoughtful Speaker",
    "description": "You value accuracy. You tend to pause to find the perfect word before speaking."
  },
  "insights": {
    "fluency": "Description of their speaking pace and flow (1 sentence).",
    "grammar": "Description of their structural choices (1 sentence).",
    "vocabulary": "Description of their word variety and precision (1 sentence)."
  },
  "patterns": [
    "You tend to [behavior]...",
    "Your speaking style is [adjective]...",
    "I noticed you [pattern]..."
  ],
  "refinements": [
    { "original": "Student phrase", "better": "Smoother version", "explanation": "Why this flow is more natural." }
  ]
}
`

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY")
      return NextResponse.json(
        { error: "Server configuration error: Missing API Key" },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    const { transcript } = await req.json()

    if (!transcript || transcript.length < 50) {
      return NextResponse.json({
        identity: {
          archetype: "The Explorer",
          description: "You are just starting to explore your voice. Keep speaking to reveal your true style."
        },
        insights: {
          fluency: "Keep speaking! I need a bit more to hear your style.",
          grammar: "I'm listening for your sentence structures.",
          vocabulary: "I'm ready to learn new words with you."
        },
        patterns: ["I'm listening to find your unique speaking patterns.", "Tell me more so I can give you a reflection."],
        refinements: []
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REPORT_PROMPT },
        { role: "user", content: `TRANSCRIPT:\n${transcript}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error("No content from OpenAI")

    const report = JSON.parse(content)

    return NextResponse.json(report)
  } catch (error) {
    console.error("Report generation failed:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
