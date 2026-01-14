import { NextResponse } from "next/server"
import { generateDrills } from "@/lib/fluencyTrainer"
import { geminiService } from "@/lib/gemini-service"

const REPORT_PROMPT = `
You are a STERN, ANALYTICAL English fluency auditor. Analyze the student transcript.

Rules:
- DO NOT be "nice". Be accurate.
- Use words like "Gap", "Inefficiency", "Latency", "Repetition".
- Tone: Clinical, Professional, Objective.
- Your job is to find the FLAWS so they can be fixed.

Identity options (Assign based on flaws):
1. The Hesitant Speaker (High pauses/restarts)
2. The Repeater (High redundancy)
3. The Searcher (Low vocabulary, high fillers)
4. The Connector (Good logic, poor grammar)
5. The Flow Master (Rare - only if perfect)

Output valid JSON:
{
  "identity": { "archetype": "", "description": "Clinical description of their main struggle." },
  "insights": { "fluency": "Critique of speed and gaps.", "grammar": "Critique of structure.", "vocabulary": "Critique of word choice." },
  "patterns": ["List 3 specific bad habits found in the text"],
  "refinements": [
    { "original": "", "better": "", "explanation": "Why the original was weak." }
  ],
  "next_step": "One hard drill to fix the main flaw."
}
`

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    // Filter out AI speech to check if STUDENT actually spoke
    const studentText = transcript
      ?.split("\n")
      .filter((line: string) => !line.toUpperCase().startsWith("ASSISTANT:"))
      .map((line: string) => line.replace(/^USER: /i, "")) // Strip prefix if present
      .join(" ")
      .trim() || ""

    console.log("Report API received transcript length:", transcript?.length)
    console.log("Filtered student text length:", studentText.length)
    console.log("Filtered student text preview:", studentText.substring(0, 50))

    // -------- Metrics (Text Analysis) ----------
    const words = studentText.split(/\s+/)
    const wordCount = words.length

    const fillerRegex = /\b(um|uh|like|you know|i mean|sort of|kind of)\b/gi
    const fillers = studentText.match(fillerRegex) || []
    const fillerCount = fillers.length

    const uniqueWordCount = new Set(studentText.split(/\s+/).filter((w: string) => w.length > 0)).size

    const metrics = {
      wordCount,
      fillerCount,
      fillerPercentage: wordCount ? Math.round((fillerCount / wordCount) * 100) : 0,
      uniqueWords: uniqueWordCount
    }

    // 50 words is roughly 30-45 seconds of speaking.
    // User requested 3-5 mins, but 50 words is a good "minimum viable" threshold to avoid hallucinations.
    if (!studentText || wordCount < 50) {
      // Return "Insufficient Data" instead of a placeholder report
      return NextResponse.json({
        identity: {
          archetype: "The Warm-up",
          description: "Session too short for a full forensic audit. Speak more next time!"
        },
        insights: {
          fluency: "Keep talking! We need about 50 words to analyze your flow.",
          grammar: "Not enough data yet.",
          vocabulary: "Not enough data yet."
        },
        patterns: ["Short session detected."],
        refinements: [],
        next_step: "Try to have a conversation of at least 2-3 minutes.",
        drills: [],
        metrics
      })
    }

    const report = await geminiService.generateReport(studentText)

    // -------- Fluency drills ----------
    const drills = generateDrills(report.patterns || [])

    return NextResponse.json({
      ...report,
      drills,
      metrics
    })

  } catch (error: any) {
    console.error("Fluency report failed:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
