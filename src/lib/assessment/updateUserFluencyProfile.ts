import { prisma } from "../prisma";
import {
  CEFRLevel,
  aggregateUserSpeechMetrics,
  evaluateCEFRPromotion,
  cacheAggregatedMetrics
} from "../cefr";

import { CEFR_MODEL_VERSION } from "./constants";
export { CEFR_MODEL_VERSION };

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
 * 4. Stamps every assessment with CEFR_MODEL_VERSION.
 * 5. Logs decision trail (Assessment Audit).
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

  // 0. Initialize Audit Trail
  const auditTrail: any = {
    version: CEFR_MODEL_VERSION,
    timestamp: new Date().toISOString(),
    inputs: {
      rawCefr: cefrLevel,
      rawScore: fluencyScore,
      wordCount,
      audioMetrics: {
        confidence,
        confidenceBand,
        pauseRatio,
        avgPauseMs,
        midSentencePauseRatio,
        pauseVariance,
        recoveryScore
      }
    },
    gates: [],
    finalDecision: {}
  };

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

  // --- 2. NEW BEHAVIOR-BASED CEFR PROMOTION ---
  // We aggregate metrics across ALL sessions (including this one if persisted)
  // and use the single authority Promotion Engine.

  const metrics = await aggregateUserSpeechMetrics(targetUserId);

  // Update metrics with current session if not yet persisted or to ensure freshness
  // (We'll use the provided WordCount/FluencyScore etc. to supplement the aggregated view)
  metrics.totalWords += wordCount;
  metrics.totalSeconds += (avgPauseMs || 0) > 0 ? (wordCount * 1.5) : 0; // rough estimate if no duration provided

  const currentProfile = await (prisma as any).user_fluency_profile.findUnique({
    where: { user_id: targetUserId }
  });

  const currentLevel = (currentProfile?.cefr_level as CEFRLevel) || "A1";
  const promotion = evaluateCEFRPromotion(currentLevel, metrics);

  let finalCefrLevel = currentLevel;
  if (promotion.eligible && promotion.nextLevel) {
    console.log(`[FluencyProfile] PROMOTION: ${currentLevel} -> ${promotion.nextLevel}`);
    finalCefrLevel = promotion.nextLevel;
  }

  // 1.8.8 Final Decision
  auditTrail.finalDecision = {
    level: finalCefrLevel,
    score: fluencyScore,
    isCapped: !promotion.eligible,
    promotionResult: promotion
  };

  // Ensure blockers tracks the cap status
  const finalLexicalBlockers = {
    ...(lexicalBlockers || {}),
    level_capped: !promotion.eligible,
    gate_failures: promotion.failures,
    preliminary_level: cefrLevel
  };

  // Cache metrics and gate failures
  await cacheAggregatedMetrics(targetUserId, metrics);

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
        cefr_model_version: CEFR_MODEL_VERSION,
        assessment_audit: auditTrail,

        // New Promotion Fields
        gate_failures: promotion.failures as any,
        aggregated_metrics: metrics as any,
        last_aggregation: new Date(),
        unique_practice_types: metrics.practiceTypes,
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
        cefr_model_version: CEFR_MODEL_VERSION,
        assessment_audit: auditTrail,

        // New Promotion Fields
        gate_failures: promotion.failures as any,
        aggregated_metrics: metrics as any,
        last_aggregation: new Date(),
        unique_practice_types: metrics.practiceTypes,
      },
    });

    console.log(`[FluencyProfile] Success: ${result.user_id} is now ${result.cefr_level}`);
  } catch (err) {
    console.error(`[FluencyProfile] Failed to update profile for ${userId}:`, err);
    // Non-blocking error - we don't want to crash the session, but we should log it.
  }
}
