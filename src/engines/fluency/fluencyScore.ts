/**
 * Fluency Scoring Engine
 * 
 * A data-driven scoring system that computes fluency from actual speech metrics.
 * This replaces motivational-only feedback with measurable performance data.
 */

import {
    EnglivoScore,
    EnglivoDimensions,
    EnglivoRawMetrics,
    EnglivoIdentity,
    CefrLevel,
    ENGLIVO_IDENTITY_LEVELS
} from '@/types/englivoTypes'

export interface FluencyMetrics {
    pauseRatio: number      // Long pauses (>1.2s) / total duration
    restartRate: number     // False starts or corrections / total utterances  
    fillerRate: number      // Filler words / total words
    speechSpeed: number     // Normalized 0-1 (100-150 WPM = optimal)
    silenceRatio: number    // Total silence / total duration
    wordCount: number       // Total words spoken
    wpm: number             // Raw Words Per Minute
}

export interface DeepgramWord {
    word: string
    start: number
    end: number
    confidence?: number
}

// Filler words that indicate hesitation
const FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean',
    'sort of', 'kind of', 'actually', 'basically', 'well'
]

// Patterns that indicate restarts/corrections
const RESTART_PATTERNS = [
    /\b(\w+)\s+\1\b/gi,           // Repeated words: "I I went"
    /\b(the|a|an)\s+(the|a|an)\b/gi, // Article stutters
    /\bno\s+wait\b/gi,
    /\bi\s+mean\b/gi,
    /\bsorry\b/gi
]

/**
 * Compute a fluency score from 0 to 1 based on weighted metrics.
 * 
 * Weights:
 * - 30% Pause control (less hesitation = higher score)
 * - 25% Restart avoidance (fewer corrections = higher score)
 * - 20% Filler control (fewer fillers = higher score)
 * - 15% Speech speed (optimal pace = higher score)
 * - 10% Silence ratio (less dead air = higher score)
 */
export function computeFluencyScore(metrics: FluencyMetrics): number {
    const score =
        0.30 * (1 - Math.min(1, metrics.pauseRatio)) +
        0.25 * (1 - Math.min(1, metrics.restartRate)) +
        0.20 * (1 - Math.min(1, metrics.fillerRate)) +
        0.15 * metrics.speechSpeed +
        0.10 * (1 - Math.min(1, metrics.silenceRatio))

    let finalScore = Number(score.toFixed(3))

    // Penalty for very short answers (checking for ignorance/skipping)
    if (metrics.wordCount > 0 && metrics.wordCount < 12) {
        finalScore = Math.min(finalScore, 0.45) // Max 2 stars (Developing)
    }

    return Math.max(0, Math.min(1, finalScore))
}

/**
 * Extract fluency metrics from Deepgram transcription result.
 * 
 * @param dgResult - Full Deepgram response object
 * @param duration - Total audio duration in seconds
 * @returns FluencyMetrics object for scoring
 */
export function extractMetricsFromDeepgram(
    dgResult: any,
    duration: number
): FluencyMetrics {
    const words: DeepgramWord[] =
        dgResult?.results?.channels?.[0]?.alternatives?.[0]?.words || []
    const transcript: string =
        dgResult?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    const textLower = transcript.toLowerCase()
    const wordCount = words.length

    // Default values for empty/short transcripts
    if (wordCount < 3 || duration < 1) {
        return {
            pauseRatio: 1,
            restartRate: 0,
            fillerRate: 0,
            speechSpeed: 0,
            silenceRatio: 1,
            wordCount: 0,
            wpm: 0
        }
    }

    // --- 1. Calculate Pause Ratio ---
    // Count gaps > 1.2 seconds between consecutive words
    let longPauseCount = 0
    let totalPauseTime = 0

    for (let i = 1; i < words.length; i++) {
        const gap = words[i].start - words[i - 1].end
        if (gap > 0.8) {
            longPauseCount++
            totalPauseTime += gap
        }
    }

    const pauseRatio = duration > 0 ? totalPauseTime / duration : 0

    // --- 2. Calculate Restart Rate ---
    // Detect repeated words and correction patterns
    let restartCount = 0

    for (const pattern of RESTART_PATTERNS) {
        const matches = textLower.match(pattern)
        if (matches) {
            restartCount += matches.length
        }
    }

    // Also check for consecutive identical words
    for (let i = 1; i < words.length; i++) {
        if (words[i].word.toLowerCase() === words[i - 1].word.toLowerCase()) {
            restartCount++
        }
    }

    const restartRate = wordCount > 0 ? restartCount / wordCount : 0

    // --- 3. Calculate Filler Rate ---
    let fillerCount = 0

    for (const filler of FILLER_WORDS) {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi')
        const matches = textLower.match(regex)
        if (matches) {
            fillerCount += matches.length
        }
    }

    const fillerRate = wordCount > 0 ? fillerCount / wordCount : 0

    // --- 4. Calculate Speech Speed (normalized) ---
    // Optimal range: 100-150 WPM for non-native speakers
    const wpm = (wordCount / duration) * 60

    let speechSpeed: number
    if (wpm >= 100 && wpm <= 150) {
        speechSpeed = 1.0 // Optimal
    } else if (wpm < 100) {
        speechSpeed = Math.max(0, wpm / 100) // Penalize slow speech
    } else {
        speechSpeed = Math.max(0, 1 - (wpm - 150) / 100) // Penalize too fast
    }

    // --- 5. Calculate Silence Ratio ---
    // Total time not speaking vs total duration
    let speakingTime = 0
    for (const word of words) {
        speakingTime += (word.end - word.start)
    }

    const silenceRatio = duration > 0 ? 1 - (speakingTime / duration) : 1

    return {
        pauseRatio: Number(pauseRatio.toFixed(3)),
        restartRate: Number(restartRate.toFixed(3)),
        fillerRate: Number(fillerRate.toFixed(3)),
        speechSpeed: Number(speechSpeed.toFixed(3)),
        silenceRatio: Number(silenceRatio.toFixed(3)),
        wordCount: wordCount,
        wpm: Math.round(wpm)
    }
}

/**
 * Map fluency score to star rating.
 * 
 * - 3 stars: fluencyScore >= 0.6 (Good fluency)
 * - 2 stars: fluencyScore >= 0.45 (Developing)
 * - 1 star: fluencyScore < 0.45 (Needs work)
 */
export function scoreToStars(fluencyScore: number): 1 | 2 | 3 {
    if (fluencyScore >= 0.75) return 3
    if (fluencyScore >= 0.55) return 2
    return 1
}

/**
 * Get coaching tone based on fluency score.
 */
export function getCoachingTone(fluencyScore: number): 'firm' | 'encouraging' | 'praising' {
    if (fluencyScore < 0.45) return 'firm'
    if (fluencyScore < 0.6) return 'encouraging'
    return 'praising'
}

/**
 * Generate specific coaching points based on metrics.
 */
export function getCoachingPoints(metrics: FluencyMetrics): string[] {
    const points: string[] = []

    if (metrics.pauseRatio > 0.15) {
        points.push('Your pauses are breaking your flow. Try starting sentences faster.')
    }

    if (metrics.fillerRate > 0.08) {
        points.push('Your filler words are lowering your fluency. Pause silently instead.')
    }

    if (metrics.restartRate > 0.1) {
        points.push("You're restarting sentences too often. Trust your first thought.")
    }

    if (metrics.speechSpeed < 0.5) {
        points.push('Your pace is slow. Try to keep your momentum going.')
    }

    if (metrics.speechSpeed > 0.9 && metrics.silenceRatio < 0.3) {
        points.push('Great flow! Your speaking rhythm is natural.')
    }

    return points
}

// ============================================================================
// ENGLIVO SCORING SYSTEM
// Official implementation of the Englivo Speaking Score specification
// ============================================================================

/**
 * Normalize WPM to a 0-1 score based on human comfortable speech ranges.
 * 
 * Human comfortable speech is:
 * - < 90 WPM: Too slow (0.2)
 * - 90-120 WPM: Slow but acceptable (0.4)
 * - 120-150 WPM: Good pace (0.7)
 * - 150-180 WPM: Optimal (1.0)
 * - > 180 WPM: Too fast, slight drop (0.9)
 */
export function normalizeWPM(wpm: number): number {
    if (wpm < 90) return 0.2
    if (wpm < 120) return 0.4
    if (wpm < 150) return 0.7
    if (wpm < 180) return 1.0
    return 0.9 // Too fast = slight penalty
}

/**
 * Calculate Flow dimension (0-100).
 * Flow = ability to maintain speaking flow without long pauses.
 */
export function calculateFlow(pauseRatio: number): number {
    const flow = 1 - Math.min(1, pauseRatio)
    return Math.round(flow * 100)
}

/**
 * Calculate Confidence dimension (0-100).
 * Confidence = ability to commit to sentences without restarting.
 */
export function calculateConfidence(restartRate: number): number {
    const confidence = 1 - Math.min(1, restartRate)
    return Math.round(confidence * 100)
}

/**
 * Calculate Clarity dimension (0-100).
 * Clarity = ability to speak without filler words.
 */
export function calculateClarity(fillerRate: number): number {
    const clarity = 1 - Math.min(1, fillerRate)
    return Math.round(clarity * 100)
}

/**
 * Calculate Speed dimension (0-100).
 * Speed = optimal speaking pace based on WPM normalization.
 */
export function calculateSpeed(wpm: number): number {
    const speed = normalizeWPM(wpm)
    return Math.round(speed * 100)
}

/**
 * Calculate Stability dimension (0-100).
 * Stability = ability to avoid long freezes/silences.
 */
export function calculateStability(silenceRatio: number): number {
    const stability = 1 - Math.min(1, silenceRatio)
    return Math.round(stability * 100)
}

/**
 * Calculate all five Englivo dimensions from raw metrics.
 */
export function calculateEnglivoDimensions(metrics: FluencyMetrics): EnglivoDimensions {
    return {
        flow: calculateFlow(metrics.pauseRatio),
        confidence: calculateConfidence(metrics.restartRate),
        clarity: calculateClarity(metrics.fillerRate),
        speed: calculateSpeed(metrics.wpm),
        stability: calculateStability(metrics.silenceRatio)
    }
}

/**
 * Calculate the overall Englivo score (0-100) from dimensions.
 * 
 * Weighted formula:
 * - 30% Flow
 * - 25% Confidence
 * - 20% Clarity
 * - 15% Speed
 * - 10% Stability
 */
export function calculateEnglivoScore(dimensions: EnglivoDimensions): number {
    const score =
        0.30 * dimensions.flow +
        0.25 * dimensions.confidence +
        0.20 * dimensions.clarity +
        0.15 * dimensions.speed +
        0.10 * dimensions.stability

    return Math.round(score)
}

/**
 * Map an Englivo score (0-100) to an identity level.
 */
export function getIdentityLevel(score: number): EnglivoIdentity {
    for (const level of ENGLIVO_IDENTITY_LEVELS) {
        if (score >= level.min && score <= level.max) {
            return level.name
        }
    }
    // Fallback (should never happen)
    return "Hesitant Thinker"
}

/**
 * Find the weakest dimension from the five dimensions.
 */
export function getWeakestDimension(dimensions: EnglivoDimensions): keyof EnglivoDimensions {
    const entries = Object.entries(dimensions) as [keyof EnglivoDimensions, number][]
    const sorted = entries.sort((a, b) => a[1] - b[1])
    return sorted[0][0]
}

/**
 * Find the strongest dimension from the five dimensions.
 */
export function getStrongestDimension(dimensions: EnglivoDimensions): keyof EnglivoDimensions {
    const entries = Object.entries(dimensions) as [keyof EnglivoDimensions, number][]
    const sorted = entries.sort((a, b) => b[1] - a[1])
    return sorted[0][0]
}

/**
 * Compute the complete Englivo score object from FluencyMetrics.
 * This is the main function that should be used throughout the app.
 */
export function computeEnglivoScore(metrics: FluencyMetrics): EnglivoScore {
    const dimensions = calculateEnglivoDimensions(metrics)
    const englivoScore = calculateEnglivoScore(dimensions)
    const identity = getIdentityLevel(englivoScore)

    const raw: EnglivoRawMetrics = {
        pauseRatio: metrics.pauseRatio,
        fillerRate: metrics.fillerRate,
        restartRate: metrics.restartRate,
        silenceRatio: metrics.silenceRatio,
        wpm: metrics.wpm
    }

    return {
        englivoScore,
        identity,
        raw,
        dimensions
    }
}

/**
 * Get dimension-specific coaching message.
 */
export function getDimensionCoachingMessage(
    dimension: keyof EnglivoDimensions,
    score: number
): string {
    const messages: Record<keyof EnglivoDimensions, { low: string; medium: string; high: string }> = {
        flow: {
            low: "Your flow is breaking. Try starting sentences faster without pausing.",
            medium: "Your flow is developing. Keep the momentum going between thoughts.",
            high: "Your flow is strong! You're maintaining natural rhythm."
        },
        confidence: {
            low: "Your confidence needs work. Trust your first thought instead of restarting.",
            medium: "Your confidence is growing. Commit to your sentences more often.",
            high: "Your confidence is excellent! You speak with conviction."
        },
        clarity: {
            low: "Your clarity is affected by fillers. Pause silently instead of using 'um' or 'uh'.",
            medium: "Your clarity is improving. Reduce filler words for smoother speech.",
            high: "Your clarity is outstanding! Your speech is clean and direct."
        },
        speed: {
            low: "Your speed is too slow. Try to pick up the pace naturally.",
            medium: "Your speed is good. Find your optimal rhythm.",
            high: "Your speed is perfect! You're speaking at a natural, comfortable pace."
        },
        stability: {
            low: "Your stability needs attention. Avoid long freezes between words.",
            medium: "Your stability is developing. Keep the speech flowing without long pauses.",
            high: "Your stability is great! You maintain consistent speech flow."
        }
    }

    const thresholds = messages[dimension]
    if (score < 50) return thresholds.low
    if (score < 75) return thresholds.medium
    return thresholds.high
}

// ============================================================================
// CEFR MAPPING SYSTEM
// Converts behavioral fluency into legitimate CEFR levels
// ============================================================================

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

/**
 * Compute CEFR score and level from raw fluency metrics.
 * 
 * This is NOT fake gamification. This is behavioral linguistics.
 * CEFR measures functional speaking ability under pressure, which is exactly
 * what our fluency engine captures through hesitation, flow, speed, fillers, and restarts.
 * 
 * @param metrics - Raw fluency metrics from speech analysis
 * @returns CEFR level, score (0-100), and raw fluency score (0-1)
 */
export function computeCefr(metrics: FluencyMetrics): {
    level: CefrLevel
    score: number
    fluency: number
} {
    // Normalize raw metrics into 0-1 quality signals
    const pauseScore = clamp(1 - metrics.pauseRatio / 0.35, 0, 1)
    const fillerScore = clamp(1 - metrics.fillerRate / 0.15, 0, 1)
    const restartScore = clamp(1 - metrics.restartRate / 0.20, 0, 1)
    const speedScore = clamp((metrics.wpm - 70) / 70, 0, 1)  // 70-140 WPM sweet spot
    const flowScore = clamp(1 - metrics.silenceRatio / 0.25, 0, 1)

    // Compute weighted fluency score (0-1)
    const fluency =
        0.30 * pauseScore +
        0.25 * restartScore +
        0.20 * fillerScore +
        0.15 * speedScore +
        0.10 * flowScore

    // Amplify mid-range to make improvement feel real
    // Early progress is slower (realistic), B-level feels earned
    const score = Math.round(Math.pow(fluency, 1.3) * 100)

    // Map to CEFR level (psychologically calibrated thresholds)
    let level: CefrLevel
    if (score < 25) level = "A1"
    else if (score < 40) level = "A2"
    else if (score < 55) level = "B1"
    else if (score < 70) level = "B2"
    else if (score < 85) level = "C1"
    else level = "C2"

    return { level, score, fluency }
}

/**
 * Get human-readable description for a CEFR level.
 */
export function getCefrDescription(level: CefrLevel): string {
    const descriptions: Record<CefrLevel, string> = {
        "A1": "I can barely speak",
        "A2": "I can survive",
        "B1": "I can talk, but it's effort",
        "B2": "I'm fluent",
        "C1": "I think in English",
        "C2": "I perform professionally"
    }
    return descriptions[level]
}

/**
 * Get CEFR score range for a given level.
 */
export function getCefrRange(level: CefrLevel): { min: number; max: number } {
    const ranges: Record<CefrLevel, { min: number; max: number }> = {
        "A1": { min: 0, max: 24 },
        "A2": { min: 25, max: 39 },
        "B1": { min: 40, max: 54 },
        "B2": { min: 55, max: 69 },
        "C1": { min: 70, max: 84 },
        "C2": { min: 85, max: 100 }
    }
    return ranges[level]
}

/**
 * Enhanced Englivo score computation with CEFR mapping.
 * This is the main function that should be used throughout the app.
 */
export function computeEnglivoScoreWithCefr(metrics: FluencyMetrics): EnglivoScore {
    // Compute Englivo dimensions and score
    const dimensions = calculateEnglivoDimensions(metrics)
    const englivoScore = calculateEnglivoScore(dimensions)
    const identity = getIdentityLevel(englivoScore)
    
    // Compute CEFR mapping
    const cefr = computeCefr(metrics)
    
    const raw: EnglivoRawMetrics = {
        pauseRatio: metrics.pauseRatio,
        fillerRate: metrics.fillerRate,
        restartRate: metrics.restartRate,
        silenceRatio: metrics.silenceRatio,
        wpm: metrics.wpm
    }
    
    return {
        englivoScore,
        identity,
        raw,
        dimensions,
        cefr: {
            level: cefr.level,
            score: cefr.score
        }
    }
}

/**
 * Get detailed CEFR analysis with recommendations.
 */
export function getCefrAnalysis(level: CefrLevel, score: number): {
    level: CefrLevel
    score: number
    description: string
    range: { min: number; max: number }
    nextLevel: CefrLevel | null
    pointsToNext: number | null
} {
    const description = getCefrDescription(level)
    const range = getCefrRange(level)
    
    // Determine next level and points needed
    let nextLevel: CefrLevel | null = null
    let pointsToNext: number | null = null
    
    if (level === "A1") { nextLevel = "A2"; pointsToNext = 25 - score }
    else if (level === "A2") { nextLevel = "B1"; pointsToNext = 40 - score }
    else if (level === "B1") { nextLevel = "B2"; pointsToNext = 55 - score }
    else if (level === "B2") { nextLevel = "C1"; pointsToNext = 70 - score }
    else if (level === "C1") { nextLevel = "C2"; pointsToNext = 85 - score }
    
    return {
        level,
        score,
        description,
        range,
        nextLevel,
        pointsToNext
    }
}
