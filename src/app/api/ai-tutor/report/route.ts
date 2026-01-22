import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateDrills } from "@/lib/fluencyTrainer"
import { geminiService } from "@/lib/gemini-service"
import { detectLexicalCeiling } from "@/lib/fluency-engine"
import { updateUserFluencyProfile } from "@/lib/assessment/updateUserFluencyProfile"
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers"


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
    const { userId } = await auth()
    const { transcript, duration, sessionId } = await req.json()

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
    // 50 words is roughly 30-45 seconds of speaking.
    // User requested 3-5 mins, but we also enforce a hard time limit.


    // Check for 45-second minimum (previously 180)
    // We reduced this gate to allow authorized updates for shorter, valid sessions.
    if (duration && duration < 45) {
      return NextResponse.json({
        identity: {
          archetype: "Quick Practice",
          description: "Session under 45 seconds. Assessment requires a longer sample."
        },
        insights: {
          fluency: "Keep talking! reliable fluency tracking requires at least 45 seconds of continuous speech.",
          grammar: "Practice mode active.",
          vocabulary: "Practice mode active."
        },
        patterns: ["Session too short for full CEFR profiling."],
        refinements: [],
        next_step: "Try a longer session (45s+) to get your CEFR level.",
        drills: [],
        metrics
      })
    }

    if (!studentText || wordCount < 10) {
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

    let lexicalCeiling = null; // Store for profile update

    // -------- Lexical Ceiling Check (CEFR Gate Enforcement) ----------
    // If user is attempting to level up, check for vocabulary limitations
    if (report.cefr_analysis?.level) {
      const assignedLevel = report.cefr_analysis.level as CEFRLevel

      // Check if they're stuck at a lexical ceiling
      lexicalCeiling = detectLexicalCeiling(studentText, assignedLevel)

      if (lexicalCeiling) {
        // Fail the gate due to vocabulary limitations
        console.log(`[CEFR Gate] Lexical ceiling detected: ${lexicalCeiling.category} (${lexicalCeiling.detectedWords.join(', ')})`)

        // Override the level assignment
        report.cefr_analysis.level = lexicalCeiling.currentLimit
        report.cefr_analysis.failed_gate = assignedLevel
        report.cefr_analysis.reason = `Failed ${assignedLevel} gate due to ${lexicalCeiling.category.toLowerCase()} limitations. ${lexicalCeiling.explanation} Detected overuse of: ${lexicalCeiling.detectedWords.join(', ')}. Try using: ${lexicalCeiling.upgrades.slice(0, 3).join(', ')}.`

        // Add to patterns
        if (!report.patterns) report.patterns = []
        report.patterns.unshift(`Over-reliance on basic ${lexicalCeiling.category.toLowerCase()}: ${lexicalCeiling.detectedWords.join(', ')}`)

        // Add to refinements
        if (!report.refinements) report.refinements = []
        report.refinements.unshift({
          original: lexicalCeiling.detectedWords[0],
          better: lexicalCeiling.upgrades[0],
          explanation: `To reach ${assignedLevel}, use more sophisticated ${lexicalCeiling.category.toLowerCase()}.`
        })
      }
    }

    // -------- Fluency drills ----------
    const drills = generateDrills(report.patterns || [])

    // -------- SINGLE SOURCE OF TRUTH UPDATE ----------
    if (userId && report.cefr_analysis?.level) {
      // Calculate derived metrics for profile
      // Confidence is inversely related to filler percentage, simplified
      const confidence = Math.max(0, 100 - (metrics.fillerPercentage * 2));
      // Pause ratio (mocked for now, or derived if we had timeline data)
      const pauseRatio = 0.1; // Placeholder
      // Fluency score (mocked or derived from metrics)
      // A simple heuristic: High word count + low fillers = high fluency
      const fluencyScore = Math.min(100, Math.max(0, (wordCount / (duration / 60)) * 0.5 - (metrics.fillerPercentage * 2)));

      // Construct lexical blockers object if present
      let blockers = null;
      if (lexicalCeiling) {
        blockers = {
          category: lexicalCeiling.category,
          detectedWords: lexicalCeiling.detectedWords,
          upgrades: lexicalCeiling.upgrades,
          frequency: lexicalCeiling.detectedWords.length // simplified frequency
        };
      }

      await updateUserFluencyProfile({
        userId,
        cefrLevel: report.cefr_analysis.level,
        fluencyScore: Math.round(fluencyScore),
        confidence: Math.round(confidence),
        pauseRatio,
        wordCount,
        lexicalBlockers: blockers,
        sourceSessionId: sessionId || "ai-tutor-session", // Ensure we have an ID
        sourceType: "ai_tutor",
      });
    }

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
