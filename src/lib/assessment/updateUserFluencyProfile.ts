
import { prisma } from "@/lib/prisma";

export type FluencyProfileUpdate = {
  userId: string;
  cefrLevel: string;
  fluencyScore: number;
  confidence: number;
  confidenceBand?: string;
  confidenceExplanation?: string;
  pauseRatio: number;
  avgPauseMs?: number;
  midSentencePauseRatio?: number;
  pauseVariance?: number;
  speechRateVariance?: number;
  recoveryScore?: number;
  wordCount: number;
  lexicalBlockers?: any; // Json
  sourceSessionId?: string;
  sourceType: "ai_tutor" | "live_practice";
};

/**
 * Single Source of Truth for Updating User Fluency Profile.
 * 
 * Rules:
 * 1. Only updates if wordCount >= 10 (relaxed for testing).
 * 2. Can be called by AI Tutor or Live Practice.
 * 3. Always UPSERTS (creates if missing, updates if present).
 */
export async function updateUserFluencyProfile({
  userId,
  cefrLevel,
  fluencyScore,
  confidence,
  confidenceBand,
  confidenceExplanation,
  pauseRatio,
  avgPauseMs,
  midSentencePauseRatio,
  pauseVariance,
  speechRateVariance,
  recoveryScore,
  wordCount,
  lexicalBlockers,
  sourceSessionId,
  sourceType,
}: FluencyProfileUpdate) {

  // 1. Validation Gate
  // Minimum 10 words (relaxed from 25) to count as a valid assessment for easier testing
  if (wordCount < 10) {
    console.log(`[FluencyProfile] Skipping update for user ${userId}: Insufficient data (${wordCount} words).`);
    return;
  }

  // 1.5 ID Resolution
  // ai-tutor sends Clerk ID (starts with "user_"), live-practice sends internal UUID.
  // We must normalize to internal UUID for the dashboard to read it correctly.
  let targetUserId = userId;
  if (userId.startsWith('user_')) {
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });
    if (user) {
      targetUserId = user.id;
      console.log(`[FluencyProfile] Resolved Clerk ID ${userId} to Internal UUID ${targetUserId}`);
    } else {
      console.warn(`[FluencyProfile] Warning: Could not resolve Clerk ID ${userId} to internal user.`);
    }
  }

  console.log(`[FluencyProfile] Updating profile for ${targetUserId} from ${sourceType} (Session: ${sourceSessionId})`);
  console.log(`[FluencyProfile] Original CEFR: ${cefrLevel}, Score: ${fluencyScore}`);

  // 1.7 Reliability Gate Enforcement (Global single source of truth)
  // We enforce hard limits on high levels to ensure credibility, regardless of the source.
  // Note: we don't have exact duration here, but we use wordCount as a reliable proxy.
  let finalCefrLevel = cefrLevel;
  let capped = false;

  // Step-down logic:
  // C2 requires ~300 words
  if (finalCefrLevel === "C2" && wordCount < 300) {
    finalCefrLevel = "C1";
    capped = true;
  }
  // C1 requires ~200 words
  if (finalCefrLevel === "C1" && wordCount < 200) {
    finalCefrLevel = "B2";
    capped = true;
  }
  // B2 requires ~100 words
  if (finalCefrLevel === "B2" && wordCount < 100) {
    finalCefrLevel = "B1";
    capped = true;
  }

  if (capped) {
    console.log(`[FluencyProfile] Reliability Cap applied (WordCount): ${cefrLevel} -> ${finalCefrLevel} (Words: ${wordCount})`);
  }

  // 1.8 Confidence Gate Enforcement (Audio-First Control)
  // CORE RULE: You cannot be C1/C2 with "Low" or "Medium" confidence. 
  // High levels require High Control.
  if (confidenceBand === "Low") {
    if (["B2", "C1", "C2"].includes(finalCefrLevel)) {
      console.log(`[FluencyProfile] Confidence Gate (Low): ${finalCefrLevel} -> B1`);
      finalCefrLevel = "B1";
      capped = true;
    }
  } else if (confidenceBand === "Medium") {
    if (["C1", "C2"].includes(finalCefrLevel)) {
      console.log(`[FluencyProfile] Confidence Gate (Medium): ${finalCefrLevel} -> B2`);
      finalCefrLevel = "B2";
      capped = true;
    }
  }

  // Ensure blockers tracks the cap status if not already present
  const finalLexicalBlockers = {
    ...(lexicalBlockers || {}),
    level_capped: capped || !!lexicalBlockers?.level_capped,
    preliminary_level: capped ? cefrLevel : (lexicalBlockers?.preliminary_level || null)
  };
  // 1.9 Persistent Blocker Logging (Audit Trail)
  // We save lexical triggers to live_micro_fixes so they show up in history/tutor dashboards
  if (lexicalBlockers && lexicalBlockers.category) {
    console.log(`[FluencyProfile] Logging persistent blocker: ${lexicalBlockers.category}`);
    try {
      await prisma.live_micro_fixes.create({
        data: {
          user_id: targetUserId,
          session_id: sourceSessionId || "ai-tutor-audit",
          category: lexicalBlockers.category,
          detected_words: lexicalBlockers.detectedWords || [],
          upgrades: lexicalBlockers.upgrades || [],
          explanation: lexicalBlockers.explanation || "Limited vocabulary range detected.",
          target_level: lexicalBlockers.targetLevel || "B1",
          current_limit: lexicalBlockers.currentLimit || "A2",
        }
      });
    } catch (logErr) {
      console.error("[FluencyProfile] Blocker logging failed:", logErr);
    }
  }

  try {
    const result = await (prisma as any).user_fluency_profile.upsert({
      where: { user_id: targetUserId },
      update: {
        cefr_level: finalCefrLevel,
        fluency_score: fluencyScore,
        confidence: confidence,
        confidence_band: confidenceBand,
        confidence_explanation: confidenceExplanation,
        pause_ratio: pauseRatio,
        avg_pause_ms: avgPauseMs,
        mid_sentence_pause_ratio: midSentencePauseRatio,
        pause_variance: pauseVariance,
        speech_rate_variance: speechRateVariance,
        recovery_score: recoveryScore,
        word_count: wordCount,
        lexical_blockers: finalLexicalBlockers,
        source_session_id: sourceSessionId,
        source_type: sourceType,
        // last_updated is handled by @updatedAt automatically
      },
      create: {
        user_id: targetUserId,
        cefr_level: finalCefrLevel,
        fluency_score: fluencyScore,
        confidence: confidence,
        confidence_band: confidenceBand,
        confidence_explanation: confidenceExplanation,
        pause_ratio: pauseRatio,
        avg_pause_ms: avgPauseMs,
        mid_sentence_pause_ratio: midSentencePauseRatio,
        pause_variance: pauseVariance,
        speech_rate_variance: speechRateVariance,
        recovery_score: recoveryScore,
        word_count: wordCount,
        lexical_blockers: finalLexicalBlockers,
        source_session_id: sourceSessionId,
        source_type: sourceType,
      },
    });

    console.log(`[FluencyProfile] Success: ${result.user_id} is now ${result.cefr_level}`);
  } catch (err) {
    console.error(`[FluencyProfile] Failed to update profile for ${userId}:`, err);
    // Non-blocking error - we don't want to crash the session, but we should log it.
  }
}
