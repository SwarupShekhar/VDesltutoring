
import { prisma } from "@/lib/prisma";

export type FluencyProfileUpdate = {
  userId: string;
  cefrLevel: string;
  fluencyScore: number;
  confidence: number;
  pauseRatio: number;
  wordCount: number;
  lexicalBlockers?: any; // Json
  sourceSessionId?: string;
  sourceType: "ai_tutor" | "live_practice";
};

/**
 * Single Source of Truth for Updating User Fluency Profile.
 * 
 * Rules:
 * 1. Only updates if wordCount >= 25 (prevent noise).
 * 2. Can be called by AI Tutor or Live Practice.
 * 3. Always UPSERTS (creates if missing, updates if present).
 */
export async function updateUserFluencyProfile({
  userId,
  cefrLevel,
  fluencyScore,
  confidence,
  pauseRatio,
  wordCount,
  lexicalBlockers,
  sourceSessionId,
  sourceType,
}: FluencyProfileUpdate) {

  // 1. Validation Gate
  // Minimum 25 words to count as a valid assessment
  if (wordCount < 25) {
    console.log(`[FluencyProfile] Skipping update for user ${userId}: Insufficient data (${wordCount} words).`);
    return;
  }

  console.log(`[FluencyProfile] Updating profile for ${userId} from ${sourceType} (Session: ${sourceSessionId})`);
  console.log(`[FluencyProfile] CEFR: ${cefrLevel}, Score: ${fluencyScore}`);

  // 2. Database Upsert
  try {
    const result = await (prisma as any).user_fluency_profile.upsert({
      where: { user_id: userId },
      update: {
        cefr_level: cefrLevel,
        fluency_score: fluencyScore,
        confidence: confidence,
        pause_ratio: pauseRatio,
        word_count: wordCount,
        lexical_blockers: lexicalBlockers,
        source_session_id: sourceSessionId,
        source_type: sourceType,
        // last_updated is handled by @updatedAt automatically
      },
      create: {
        user_id: userId,
        cefr_level: cefrLevel,
        fluency_score: fluencyScore,
        confidence: confidence,
        pause_ratio: pauseRatio,
        word_count: wordCount,
        lexical_blockers: lexicalBlockers,
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
