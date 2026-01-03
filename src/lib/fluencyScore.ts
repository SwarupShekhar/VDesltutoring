/**
 * Fluency Scoring Engine
 * 
 * A data-driven scoring system that computes fluency from actual speech metrics.
 * This replaces motivational-only feedback with measurable performance data.
 */

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
