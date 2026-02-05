import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateDrills } from "@/lib/fluencyTrainer"
import { geminiService } from "@/lib/gemini-service"
import { detectLexicalCeiling } from "@/lib/fluency-engine"
import { updateUserFluencyProfile } from "@/lib/assessment/updateUserFluencyProfile"
import { analyzeAudioConfidence } from "@/lib/speech/audioConfidenceAnalyzer"
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers"




export async function POST(req: Request) {
  console.log("[API/Report] Received request. Processing..."); // DEBUG
  try {
    const { userId } = await auth()
    const { transcript, duration, sessionId, words: wordTimingData } = await req.json()
    console.log(`[API/Report] User: ${userId}, Duration: ${duration}, TranscriptLen: ${transcript?.length}`); // DEBUG

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
      console.log(`[API/Report] Failed Word Count Gate: ${wordCount} < 10`); // DEBUG
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

    // -------- Audio-First Confidence Analysis ----------
    const audioAnalysis = analyzeAudioConfidence(wordTimingData || [], duration || 0)
    const confidenceScore = audioAnalysis.score
    const confidenceBand = audioAnalysis.band
    const confidenceExplanation = audioAnalysis.explanation
    const audioMetrics = audioAnalysis.metrics

    const report = await geminiService.generateReport(studentText, {
      band: confidenceBand,
      explanation: confidenceExplanation
    })

    let lexicalCeiling = null; // Store for profile update

    // -------- Lexical Ceiling Check (CEFR Gate Enforcement) ----------
    // If user is attempting to level up, check for vocabulary limitations
    if (report.cefr_analysis?.level) {
      const assignedLevel = report.cefr_analysis.level as CEFRLevel

      // --- Reliability Gate Enforcement ---
      // We enforce hard limits on high levels to ensure credibility.
      const durationVal = duration || 0;
      const wordCountVal = wordCount || 0;
      let targetLevel = assignedLevel;
      let reliabilityReason = "";

      // Step-down logic: Check gates sequentially to allow multiple level drops
      if (targetLevel === "C2" && durationVal < 180 && wordCountVal < 300) {
        targetLevel = "C1";
        reliabilityReason += "C2 requires 3m/300 words. ";
      }

      if (targetLevel === "C1" && durationVal < 120 && wordCountVal < 200) {
        targetLevel = "B2";
        reliabilityReason += "C1 requires 2m/200 words. ";
      }

      if (targetLevel === "B2" && durationVal < 60 && wordCountVal < 100) {
        targetLevel = "B1";
        reliabilityReason += "B2 requires 1m/100 words. ";
      }

      if (targetLevel !== assignedLevel) {
        console.log(`[Reliability Gate] Capping ${assignedLevel} to ${targetLevel} due to insufficient data.`);
        reliabilityReason = reliabilityReason.trim() + ` (Got: ${durationVal}s, ${wordCountVal} words).`;

        // Save the original intent for transparency
        report.cefr_analysis.preliminary_level = assignedLevel;
        report.cefr_analysis.level_capped = true;

        // Apply the cap
        report.cefr_analysis.level = targetLevel;
        report.cefr_analysis.failed_gate = assignedLevel;
        report.cefr_analysis.reason = `${reliabilityReason} ${report.cefr_analysis.reason}`;
      }

      // Check if they're stuck at a lexical ceiling for the (potentially capped) level
      lexicalCeiling = detectLexicalCeiling(studentText, report.cefr_analysis.level as CEFRLevel)

      if (lexicalCeiling) {
        // Fail the gate due to vocabulary limitations
        console.log(`[CEFR Gate] Lexical ceiling detected: ${lexicalCeiling.category} (${lexicalCeiling.detectedWords.join(', ')})`)

        const currentAssigned = report.cefr_analysis.level;

        // Override the level assignment
        report.cefr_analysis.level = lexicalCeiling.currentLimit
        report.cefr_analysis.failed_gate = currentAssigned
        report.cefr_analysis.reason = `Failed ${currentAssigned} gate due to ${lexicalCeiling.category.toLowerCase()} limitations. ${lexicalCeiling.explanation} Detected overuse of: ${lexicalCeiling.detectedWords.join(', ')}. Try using: ${lexicalCeiling.upgrades.slice(0, 3).join(', ')}.`

        // Add to patterns
        if (!report.patterns) report.patterns = []
        report.patterns.unshift(`Over-reliance on basic ${lexicalCeiling.category.toLowerCase()}: ${lexicalCeiling.detectedWords.join(', ')}`)

        // Add to refinements
        if (!report.refinements) report.refinements = []
        report.refinements.unshift({
          original: lexicalCeiling.detectedWords[0],
          better: lexicalCeiling.upgrades[0],
          explanation: `To reach ${currentAssigned}, use more sophisticated ${lexicalCeiling.category.toLowerCase()}.`
        })
      }
    }

    // -------- Fluency drills ----------
    const drills = generateDrills(report.patterns || [])

    // -------- SINGLE SOURCE OF TRUTH UPDATE ----------
    console.log(`[API/Report] About to check update condition. userId: ${userId}, cefrLevel: ${report.cefr_analysis?.level}`);

    if (userId && report.cefr_analysis?.level) {
      console.log(`[API/Report] Condition passed! Proceeding with profile update...`);

      // Audio-First Metrics
      const confidence = confidenceScore
      const pauseRatio = audioMetrics.midSentencePauseRatio

      const fluencyScore = Math.min(100, Math.max(0,
        (wordCount / (duration / 60)) * 0.5 - (audioMetrics.midSentencePauseRatio * 100)
      ));

      // Construct lexical blockers object if present
      let blockers: any = null;
      if (lexicalCeiling || report.cefr_analysis.level_capped) {
        blockers = {
          category: lexicalCeiling?.category || "Reliability",
          detectedWords: lexicalCeiling?.detectedWords || [],
          upgrades: lexicalCeiling?.upgrades || [],
          explanation: lexicalCeiling?.explanation || report.cefr_analysis.reason || "More data needed for higher assessment.",
          targetLevel: lexicalCeiling?.targetLevel || report.cefr_analysis.failed_gate || report.cefr_analysis.level || "B1",
          currentLimit: lexicalCeiling?.currentLimit || report.cefr_analysis.level || "A2",
          frequency: lexicalCeiling?.detectedWords.length || 0,
          level_capped: report.cefr_analysis.level_capped,
          preliminary_level: report.cefr_analysis.preliminary_level
        };
      }

      console.log(`[API/Report] Calling updateProfile for ${userId} with Level ${report.cefr_analysis.level}`); // DEBUG

      try {
        await updateUserFluencyProfile(userId, {
          cefr_level: report.cefr_analysis.level,
          fluency_score: Math.round(fluencyScore),
          confidence: Math.round(confidence),
          confidence_band: confidenceBand,
          confidence_explanation: confidenceExplanation,
          pause_ratio: pauseRatio,
          avg_pause_ms: audioMetrics.avgPauseMs,
          mid_sentence_pause_ratio: audioMetrics.midSentencePauseRatio,
          pause_variance: audioMetrics.pauseVariance,
          recovery_score: audioMetrics.recoveryScore,
          word_count: wordCount,
          speaking_time_seconds: duration,
          lexical_blockers: blockers,
          source_session_id: sessionId || "ai-tutor-session",
          session_type: "AI_TUTOR",
        });
        console.log(`[API/Report] updateUserFluencyProfile completed successfully!`);
      } catch (updateError) {
        console.error(`[API/Report] updateUserFluencyProfile FAILED:`, updateError);
      }
    } else {
      console.warn(`[API/Report] Skipping profile update. userId: ${userId}, cefrLevel: ${report.cefr_analysis?.level}`);
    }

    return NextResponse.json({
      ...report,
      drills,
      metrics,
      audioAnalysis: {
        score: confidenceScore,
        band: confidenceBand,
        explanation: confidenceExplanation,
        metrics: audioMetrics
      }
    })

  } catch (error: any) {
    console.error("Fluency report failed:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
