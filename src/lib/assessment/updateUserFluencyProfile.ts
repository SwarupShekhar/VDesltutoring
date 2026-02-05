
import { prisma } from "@/lib/prisma";

export const CEFR_MODEL_VERSION = "v2.0";

type ProfileUpdateData = {
  fluency_score: number;
  word_count: number;
  speaking_time_seconds: number;
  session_type: string;
  // Optional overrides for rich audits
  cefr_level?: string;
  confidence?: number;
  confidence_band?: string | null;
  confidence_explanation?: string | null;
  pause_ratio?: number;
  avg_pause_ms?: number;
  mid_sentence_pause_ratio?: number;
  pause_variance?: number;
  recovery_score?: number;
  lexical_blockers?: any;
  source_session_id?: string;
}

/**
 * Updates or creates the user's centralized fluency profile based on new session data.
 * This is the SINGLE SOURCE OF TRUTH for the dashboard.
 */
export async function updateUserFluencyProfile(
  userId: string,
  data: ProfileUpdateData
) {
  try {
    console.log(`[FluencyProfile] Updating profile for user ${userId} with score ${data.fluency_score}`);

    const currentProfile = await prisma.user_fluency_profile.findUnique({
      where: { user_id: userId }
    });

    // Use aggregated_metrics for session tracking since session_count isn't in schema
    const currentMetrics = (currentProfile?.aggregated_metrics as any) || {};
    const currentSessions = (currentMetrics.sessionCount || 0) + 1;
    const currentWords = (currentProfile?.word_count || 0) + data.word_count;

    // Weighted Rolling Average for Stability
    const weight = currentSessions < 5 ? 0.5 : 0.3;
    const oldScore = currentProfile?.fluency_score || data.fluency_score;
    const newScore = Math.round((oldScore * (1 - weight)) + (data.fluency_score * weight));

    // Map Score to CEFR Level (Default logic if explicit level not provided)
    let cefrLevel = data.cefr_level || 'A1';
    if (!data.cefr_level) {
      if (newScore >= 90) cefrLevel = 'C2';
      else if (newScore >= 80) cefrLevel = 'C1';
      else if (newScore >= 65) cefrLevel = 'B2';
      else if (newScore >= 45) cefrLevel = 'B1';
      else if (newScore >= 25) cefrLevel = 'A2';
    }

    await prisma.user_fluency_profile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        fluency_score: data.fluency_score, // Initial score is exact
        cefr_level: cefrLevel,
        confidence: data.confidence || 0.8,
        confidence_band: data.confidence_band || (data.fluency_score > 50 ? 'Medium' : 'Low'),
        confidence_explanation: data.confidence_explanation || 'Initial assessment.',
        word_count: data.word_count,
        pause_ratio: data.pause_ratio || 0.1,
        source_type: data.session_type,
        source_session_id: data.source_session_id,
        cefr_model_version: CEFR_MODEL_VERSION,
        lexical_blockers: data.lexical_blockers,
        aggregated_metrics: {
          totalSeconds: data.speaking_time_seconds,
          sessionCount: 1
        },
        // Optional Fields
        avg_pause_ms: data.avg_pause_ms,
        mid_sentence_pause_ratio: data.mid_sentence_pause_ratio,
        pause_variance: data.pause_variance,
        recovery_score: data.recovery_score,
      },
      update: {
        fluency_score: newScore,
        cefr_level: cefrLevel,
        word_count: currentWords,
        source_type: data.session_type,
        source_session_id: data.source_session_id,
        lexical_blockers: data.lexical_blockers,
        // Update explicit metrics if provided, else keep existing or default (could add weighting logic here too)
        confidence: data.confidence, // Update with latest
        confidence_band: data.confidence_band,
        confidence_explanation: data.confidence_explanation,
        pause_ratio: data.pause_ratio,
        avg_pause_ms: data.avg_pause_ms,
        mid_sentence_pause_ratio: data.mid_sentence_pause_ratio,
        pause_variance: data.pause_variance,
        recovery_score: data.recovery_score,

        aggregated_metrics: {
          ...currentMetrics,
          totalSeconds: (currentMetrics.totalSeconds || 0) + data.speaking_time_seconds,
          sessionCount: currentSessions
        }
      }
    });

    console.log(`[FluencyProfile] Updated: Score ${oldScore} -> ${newScore} | Level: ${cefrLevel}`);

    // If this was the first session, unlock the account from "Unassessed" state
    if (currentSessions === 1) {
      await prisma.users.update({
        where: { id: userId },
        data: { is_active: true } // Ensure active
      });
    }

  } catch (error) {
    console.error(`[FluencyProfile] Failed to update profile:`, error);
    // Do not throw, we don't want to break the API response just because stats failed
  }
}
