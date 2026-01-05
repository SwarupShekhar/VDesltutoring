/**
 * Fluency Check Module
 * 
 * Handles fluency check flow (first win experience).
 */

// Types
export interface FluencyCheckResult {
    baseline: {
        score: number
        pauseRatio: number
    }
    afterDrill: {
        score: number
        pauseRatio: number
    }
    improvement: {
        pauseRatio: number
        message: string
    }
}

export interface FluencyCheckSession {
    userId: string
    startedAt: Date
    baselineRecorded: boolean
    drillCompleted: boolean
    afterDrillRecorded: boolean
}
