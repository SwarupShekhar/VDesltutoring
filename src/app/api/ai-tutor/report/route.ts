import { NextResponse } from "next/server"
import { generateDrills } from "@/lib/fluencyTrainer"
import { geminiService } from "@/lib/gemini-service"

const REPORT_PROMPT = `
You are a STRICT CEFR AUDITOR for English proficiency.
Your Goal: Assign a CEFR level (A1-C2) based on a "Failing Gate" system.
Assume the user is C2, then disqualify them downwards based on missing skills.

---
THE GATES (Check sequentially):

1. **C2 Gate (Mastery)**
   - Requirement: Nuance, cultural references, irony, complex metaphors.
   - Fail Condition: Speech is logical but literal. No double meanings or stylistic flair.
   - Result if Fail: Drop to C1.

2. **C1 Gate (Precision)**
   - Requirement: Precise vocabulary ("exacerbate" vs "make worse"), diverse sentence structures.
   - Fail Condition: Searching for words, using generic descriptors ("good", "bad", "big"), simple sentence structure.
   - Result if Fail: Drop to B2.

3. **B2 Gate (Abstraction)**
   - Requirement: Can explain *why*, compare ideas, and handle abstract topics (e.g., "Justice", "Future").
   - Fail Condition: Can only talk about concrete things (events, daily life). Struggling to justify opinions.
   - Result if Fail: Drop to B1.

4. **B1 Gate (Narration)**
   - Requirement: Can tell a coherent story with "Beginning -> Middle -> End". Describes feelings/experiences.
   - Fail Condition: Disjointed sentences. No logical flow between thoughts.
   - Result if Fail: Drop to A2.

5. **A2 Gate (Connection)**
   - Requirement: Determine if they can connect 2-3 sentences about routine/likes/dislikes.
   - Fail Condition: One-word answers or isolated simple sentences.
   - Result if Fail: Drop to A1.

6. **A1 Gate (Survival)**
   - Requirement: Basic intro, present tense.
   - Fail Condition: Unintelligible or cannot form a sentence.
   - Result if Fail: Pre-A1.

---
OUTPUT JSON:
{
  "cefr_analysis": {
    "level": "B1",
    "failed_gate": "B2",
    "reason": "Passed B1 narration but failed B2 abstraction. Could not explain 'why' clearly."
  },
  "identity": { "archetype": "", "description": "Clinical description of their main struggle." },
  "insights": { "fluency": "Critique.", "grammar": "Critique.", "vocabulary": "Critique." },
  "patterns": ["List 3 specific bad habits"],
  "refinements": [
    { "original": "", "better": "", "explanation": "" }
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
