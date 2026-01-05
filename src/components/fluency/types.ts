/**
 * Fluency Reveal Component System - Type Definitions
 * 
 * Shared interfaces for the Englivo fluency visualization system.
 * This is the heart of Englivo's credibility.
 */

export interface FluencyMetrics {
    pauseRatio: number      // % of time spent in pauses
    fillerRate: number      // % of filler words
    restartRate: number     // % of sentence restarts
    wpm: number             // Words per minute
    silenceRatio: number    // % of time in silence
    fluencyScore: number    // Overall fluency score (0-1)
}

export interface CefrScore {
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
    label: string           // Human-readable description
    score: number           // 0-100
}

export interface RadarData {
    flow: number            // 0-100
    clarity: number         // 0-100
    confidence: number      // 0-100
    speed: number           // 0-100
    stability?: number      // 0-100 (optional for 4-point radar)
}

export interface FocusItem {
    title: string
    instruction: string
    drillPrompt?: string
}

export interface ProgressData {
    today: FluencyMetrics
    yesterday: FluencyMetrics
    deltas: {
        pauseRatio: number      // Negative = improvement
        fillerRate: number      // Negative = improvement
        restartRate: number     // Negative = improvement
        wpm: number             // Positive = improvement
        fluencyScore: number    // Positive = improvement
    }
}

export interface FluencyProfile {
    metrics: FluencyMetrics
    radar: RadarData
    cefr: CefrScore
    identity: {
        name: string            // e.g., "Developing Flow"
        description: string     // e.g., "Can speak, still breaks rhythm"
    }
    weaknesses: string[]
    strengths: string[]
    focus: FocusItem
    progress?: ProgressData
}

/**
 * CEFR level descriptions for display
 */
export const CEFR_LABELS: Record<CefrScore['level'], string> = {
    "A1": "I can barely speak",
    "A2": "I can survive",
    "B1": "I can talk, but it's effort",
    "B2": "I'm fluent",
    "C1": "I think in English",
    "C2": "I perform professionally"
}

/**
 * CEFR level colors for styling
 */
export const CEFR_COLORS: Record<CefrScore['level'], { bg: string; text: string; gradient: string }> = {
    "A1": {
        bg: "bg-red-500",
        text: "text-red-600",
        gradient: "from-red-500 to-rose-600"
    },
    "A2": {
        bg: "bg-orange-500",
        text: "text-orange-600",
        gradient: "from-orange-500 to-amber-600"
    },
    "B1": {
        bg: "bg-yellow-500",
        text: "text-yellow-600",
        gradient: "from-yellow-500 to-amber-500"
    },
    "B2": {
        bg: "bg-blue-500",
        text: "text-blue-600",
        gradient: "from-blue-500 to-indigo-600"
    },
    "C1": {
        bg: "bg-purple-500",
        text: "text-purple-600",
        gradient: "from-purple-500 to-violet-600"
    },
    "C2": {
        bg: "bg-emerald-500",
        text: "text-emerald-600",
        gradient: "from-emerald-500 to-teal-600"
    }
}
