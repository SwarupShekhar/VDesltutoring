import { NextResponse } from "next/server"
import { generateDrills } from "@/lib/fluencyTrainer"
import { geminiService } from "@/lib/gemini-service"

const REPORT_PROMPT = `
You are a warm, supportive English fluency coach. Analyze the student transcript.

Rules:
- NEVER use words like "Score", "Grade", "Test", "Mistake", "Wrong", "Error", "Bad".
- Use words like "Pattern", "Insight", "Observation", "Refinement", "Style".
- Tone: Encouraging, psychologically safe.
- Instead of judging, describe habits.
- Assign a "Speaking Identity".

Identity options:
1. The Thoughtful Speaker
2. The Flow Builder
3. The Rapid Thinker
4. The Translator
5. The Storyteller

Output valid JSON in this format:
{
  "identity": { "archetype": "", "description": "" },
  "insights": { "fluency": "", "grammar": "", "vocabulary": "" },
  "patterns": [],
  "refinements": [
    { "original": "", "better": "", "explanation": "" }
  ],
  "next_step": ""
}
`

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    // Filter out AI speech to check if STUDENT actually spoke
    const studentText = transcript
      ?.split("\n")
      .filter((line: string) => !line.startsWith("ASSISTANT:"))
      .join(" ")
      .trim() || ""

    const uniqueWordCount = new Set(studentText.split(/\s+/).filter((w: string) => w.length > 0)).size

    if (!studentText || studentText.length < 10 || uniqueWordCount < 3) {
      const empty = {
        identity: {
          archetype: "The Explorer",
          description: "You are just starting to reveal your speaking style."
        },
        insights: {
          fluency: "I need a bit more speech to hear your flow.",
          grammar: "I'm still learning your structure.",
          vocabulary: "Tell me more so I can hear your word choices."
        },
        patterns: [
          "You are beginning to open up.",
          "Your voice is just starting to emerge."
        ],
        refinements: [],
        next_step: "Keep speaking naturally. Tell me more about your day."
      }

      return NextResponse.json({
        ...empty,
        drills: generateDrills(empty.patterns),
        metrics: {
          wordCount: transcript?.split(" ").length || 0,
          fillerCount: 0,
          fillerPercentage: 0,
          uniqueWords: uniqueWordCount
        }
      })
    }

    // Prepare full prompt for Gemini
    const fullPrompt = `${REPORT_PROMPT}\n\nTRANSCRIPT:\n${transcript}`
    const report = await geminiService.generateRawJson(fullPrompt)

    // -------- Metrics (local, deterministic) ----------
    const words = transcript.trim().split(/\s+/)
    const wordCount = words.length

    const fillerRegex = /\b(um|uh|like|you know|i mean|sort of|kind of)\b/gi
    const fillers = transcript.match(fillerRegex) || []
    const fillerCount = fillers.length

    const uniqueWords = new Set(words.map((w: string) => w.toLowerCase())).size

    const metrics = {
      wordCount,
      fillerCount,
      fillerPercentage: wordCount ? Math.round((fillerCount / wordCount) * 100) : 0,
      uniqueWords
    }

    // -------- Fluency drills ----------
    const drills = generateDrills(report.patterns || [])

    return NextResponse.json({
      ...report,
      drills,
      metrics
    })

  } catch (error: any) {
    console.error("Fluency report failed:", error)

    // Safe fallback so UI never breaks
    return NextResponse.json({
      identity: {
        archetype: "The Speaker",
        description: "Your voice is developing."
      },
      insights: {
        fluency: "Keep speaking to reveal your style.",
        grammar: "Your structure is forming.",
        vocabulary: "Your word choices are growing."
      },
      patterns: ["Your fluency is still emerging."],
      refinements: [],
      next_step: "Keep talking - your fluency grows with use.",
      drills: [],
      metrics: { wordCount: 0, fillerCount: 0, fillerPercentage: 0, uniqueWords: 0 }
    })
  }
}
