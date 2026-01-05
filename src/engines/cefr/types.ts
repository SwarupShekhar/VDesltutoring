/**
 * Englivo Speaking Score - Official Type Definitions
 * 
 * This file contains the canonical TypeScript types for the Englivo scoring system.
 * These types ensure consistency across the entire application.
 */

/**
 * Identity levels that replace CEFR classifications.
 * Based on behavioral fluency, not academic proficiency.
 */
export type EnglivoIdentity =
    | "Hesitant Thinker"      // < 40: Brain translates before speaking
    | "Careful Speaker"       // 40-55: Knows English, but pauses too much
    | "Developing Flow"       // 55-70: Can speak, still breaks rhythm
    | "Confident Speaker"     // 70-85: Natural and reliable
    | "Natural Speaker"       // > 85: English flows like native

/**
 * CEFR levels based on behavioral fluency.
 * These map to functional speaking ability under pressure.
 */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

/**
 * The five core dimensions of Englivo scoring.
 * Each dimension is scored 0-100.
 */
export interface EnglivoDimensions {
    flow: number        // 1 - pauseRatio (ability to maintain speaking flow)
    confidence: number  // 1 - restartRate (ability to commit to sentences)
    clarity: number     // 1 - fillerRate (ability to speak without fillers)
    speed: number       // normalizeWPM(wpm) (optimal speaking pace)
    stability: number   // 1 - silenceRatio (ability to avoid long freezes)
}

/**
 * Raw behavioral metrics from speech analysis.
 * These are the ground truth signals from Deepgram.
 */
export interface EnglivoRawMetrics {
    pauseRatio: number      // % of time spent in pauses
    fillerRate: number      // % of words that are fillers
    restartRate: number     // % of sentences restarted
    silenceRatio: number    // % of time in long freezes
    wpm: number             // raw words per minute
}

/**
 * Core Englivo score object returned after every speaking turn.
 */
export interface EnglivoScore {
    englivoScore: number              // Overall score 0-100
    identity: EnglivoIdentity         // Current identity level
    raw: EnglivoRawMetrics           // Raw metrics for transparency
    dimensions: EnglivoDimensions    // Five dimension scores
    cefr?: {                         // CEFR mapping (optional)
        level: CefrLevel             // CEFR level (A1-C2)
        score: number                // CEFR score (0-100)
    }
}

/**
 * Extended score with metadata for dashboard display.
 */
export interface EnglivoScoreWithMetadata extends EnglivoScore {
    turns?: number          // Number of speaking turns
    wordCount?: number      // Total words spoken
    timestamp?: Date        // When this score was recorded
}

/**
 * Dashboard payload structure for today vs yesterday comparison.
 */
export interface EnglivoDashboardPayload {
    today: EnglivoScoreWithMetadata | null
    yesterday: EnglivoScoreWithMetadata | null
    deltas: {
        score: number           // Change in overall score
        pauseRatio: number      // Change in pause ratio (negative = improvement)
        fillerRate: number      // Change in filler rate (negative = improvement)
        restartRate: number     // Change in restart rate (negative = improvement)
        wpm: number             // Change in WPM (positive = improvement)
        // Dimension deltas
        flow?: number
        confidence?: number
        clarity?: number
        speed?: number
        stability?: number
    } | null
    hasEnoughData: boolean      // Whether there's enough data for meaningful insights
}

/**
 * Fluency-check (first win) payload structure.
 */
export interface EnglivoFluencyCheckPayload {
    baseline: {
        score: number
        identity: EnglivoIdentity
        worstDimension: keyof EnglivoDimensions
        pauseRatio: number
    }
    afterDrill: {
        score: number
        identity: EnglivoIdentity
        pauseRatio: number
    }
    improvement: {
        pauseRatio: number      // Negative = improvement
        message: string         // Human-readable improvement message
    }
}

/**
 * AI Tutor input structure.
 */
export interface EnglivoAITutorInput {
    englivoScore: number
    identity: EnglivoIdentity
    dimensions: EnglivoDimensions
    weakest: keyof EnglivoDimensions
    strongest: keyof EnglivoDimensions
}

/**
 * Micro-lesson trigger schema.
 */
export interface EnglivoMicroLesson {
    focus: keyof EnglivoDimensions
    metric: keyof EnglivoRawMetrics
    value: number
    lesson: {
        title: string
        instruction: string
        drillPrompt: string
    }
}

/**
 * Identity level configuration.
 */
export interface EnglivoIdentityLevel {
    min: number
    max: number
    name: EnglivoIdentity
}

/**
 * Complete identity level mapping.
 */
export const ENGLIVO_IDENTITY_LEVELS: EnglivoIdentityLevel[] = [
    { min: 0, max: 39, name: "Hesitant Thinker" },
    { min: 40, max: 54, name: "Careful Speaker" },
    { min: 55, max: 69, name: "Developing Flow" },
    { min: 70, max: 84, name: "Confident Speaker" },
    { min: 85, max: 100, name: "Natural Speaker" }
]
