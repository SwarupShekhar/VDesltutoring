/**
 * Dashboard Module - Logic
 * 
 * Aggregates and processes data for the dashboard.
 */

import { computeSkillScores, getSkillDrill, getSkillWeakness, type CEFRProfile, type Skill, type SkillMetrics } from '@/engines/cefr'
import type { DashboardViewModel, DashboardDeltas, DashboardFocus } from './types'

/**
 * Build dashboard view model from raw data
 */
export function buildDashboardViewModel(
    userId: string,
    firstName: string,
    metrics: SkillMetrics,
    yesterdayMetrics: SkillMetrics | null,
    speakingTime: number
): DashboardViewModel {
    const profile = computeSkillScores(metrics, speakingTime)
    const yesterdayProfile = yesterdayMetrics
        ? computeSkillScores(yesterdayMetrics, 0)
        : null

    // Calculate deltas
    const deltas = calculateDeltas(profile, yesterdayProfile)

    // Get focus area
    const focus = getFocusArea(profile.weakest)

    // Generate weakness descriptions
    const weaknesses = [
        getSkillWeakness(profile.weakest, profile[profile.weakest].score)
    ]

    return {
        userId,
        firstName,
        cefrLevel: profile.overall.cefr,
        overallScore: profile.overall.score,
        fluency: profile.fluency,
        pronunciation: profile.pronunciation,
        grammar: profile.grammar,
        vocabulary: profile.vocabulary,
        deltas,
        weakest: profile.weakest,
        strongest: profile.strongest,
        weaknesses,
        focus,
        speakingTime,
        lastActive: new Date(),
        hasEnoughData: speakingTime >= 30
    }
}

/**
 * Calculate deltas between today and yesterday
 */
function calculateDeltas(
    today: CEFRProfile,
    yesterday: CEFRProfile | null
): DashboardDeltas {
    if (!yesterday) {
        return {
            overall: 0,
            fluency: 0,
            pronunciation: 0,
            grammar: 0,
            vocabulary: 0,
            pauseRatio: 0,
            fillerRate: 0,
            restartRate: 0,
            wpm: 0
        }
    }

    return {
        overall: today.overall.score - yesterday.overall.score,
        fluency: today.fluency.score - yesterday.fluency.score,
        pronunciation: today.pronunciation.score - yesterday.pronunciation.score,
        grammar: today.grammar.score - yesterday.grammar.score,
        vocabulary: today.vocabulary.score - yesterday.vocabulary.score,
        pauseRatio: 0, // Would need raw metrics
        fillerRate: 0,
        restartRate: 0,
        wpm: 0
    }
}

/**
 * Get focus area based on weakest skill
 */
function getFocusArea(weakest: Skill): DashboardFocus {
    const drill = getSkillDrill(weakest)

    return {
        skill: weakest,
        title: drill.title,
        instruction: drill.instruction,
        drillPrompt: drill.prompt
    }
}

/**
 * Convert raw fluency snapshots to skill metrics
 */
export function snapshotsToMetrics(
    avgPauseSum: number,
    avgWordCount: number,
    avgFillerCount: number,
    totalTurnCount: number
): SkillMetrics {
    // Approximate calculations
    const avgDuration = totalTurnCount > 0 ? (avgWordCount / 2.5) : 0 // Estimate seconds
    const pauseRatio = avgDuration > 0 ? avgPauseSum / avgDuration : 0
    const fillerRate = avgWordCount > 0 ? avgFillerCount / avgWordCount : 0
    const wpm = avgDuration > 0 ? (avgWordCount / avgDuration) * 60 : 120

    // Convert to 0-1 scores
    const fluency = Math.max(0, Math.min(1, 1 - pauseRatio / 0.35))
    const pronunciation = 0.7 // Default - would come from Deepgram
    const grammar = Math.max(0, Math.min(1, 1 - fillerRate * 2)) // Approximate
    const vocabulary = 0.6 // Default - would need unique word analysis

    return {
        fluency,
        pronunciation,
        grammar,
        vocabulary
    }
}

/**
 * Check if user has level up
 */
export function checkLevelUp(
    today: CEFRProfile,
    yesterday: CEFRProfile | null
): { leveledUp: boolean; from?: string; to?: string } {
    if (!yesterday) {
        return { leveledUp: false }
    }

    if (today.overall.cefr !== yesterday.overall.cefr) {
        const todayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(today.overall.cefr)
        const yesterdayIdx = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(yesterday.overall.cefr)

        if (todayIdx > yesterdayIdx) {
            return {
                leveledUp: true,
                from: yesterday.overall.cefr,
                to: today.overall.cefr
            }
        }
    }

    return { leveledUp: false }
}
