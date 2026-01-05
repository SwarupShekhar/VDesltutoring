/**
 * Dashboard Module - Types
 * 
 * View models and data structures for the dashboard.
 */

import type { CEFRLevel, Skill, SkillScore, CEFRProfile } from '@/engines/cefr'

/**
 * Main dashboard view model
 * This is what the UI reads - one object with everything.
 */
export interface DashboardViewModel {
    // User info
    userId: string
    firstName: string

    // Overall level
    cefrLevel: CEFRLevel
    overallScore: number

    // Individual skills
    fluency: SkillScore
    pronunciation: SkillScore
    grammar: SkillScore
    vocabulary: SkillScore

    // Changes
    deltas: DashboardDeltas

    // Insights
    weakest: Skill
    strongest: Skill
    weaknesses: string[]
    focus: DashboardFocus

    // Metadata
    speakingTime: number
    lastActive: Date | null
    hasEnoughData: boolean
}

export interface DashboardDeltas {
    overall: number
    fluency: number
    pronunciation: number
    grammar: number
    vocabulary: number
    pauseRatio: number
    fillerRate: number
    restartRate: number
    wpm: number
}

export interface DashboardFocus {
    skill: Skill
    title: string
    instruction: string
    drillPrompt: string
}

export interface DashboardHistory {
    today: CEFRProfile | null
    yesterday: CEFRProfile | null
    timeline: DashboardTimelinePoint[]
}

export interface DashboardTimelinePoint {
    date: string
    score: number
    cefrLevel: CEFRLevel
}

/**
 * Raw data from database (before processing)
 */
export interface RawFluencySnapshot {
    id: string
    userId: string
    avgPauseSum: number
    avgWordCount: number
    avgFillerCount: number
    totalTurnCount: number
    createdAt: Date
}
