import { EnglivoScore, EnglivoDimensions } from '@/types/englivoTypes'
import { getWeakestDimension, getCefrAnalysis } from './fluencyScore'

/**
 * Generate a one-sentence diagnosis based on the user's lowest skill.
 * "Your English is A1 because pauses and fillers are blocking your fluency."
 */
export function getDiagnosis(scoreData: EnglivoScore): string {
    const level = scoreData.cefr?.level || 'A1'
    const weakest = getWeakestDimension(scoreData.dimensions)

    switch (weakest) {
        case 'flow':
            return `Your English is ${level} because pauses and fillers are blocking your fluency.`
        case 'confidence':
            return `Your English is ${level} because hesitation prevents you from finishing ideas.`
        case 'clarity':
            return `Your English is ${level} because unclear sounds make you hard to understand.`
        case 'speed':
            return `Your English is ${level} because slow processing holds back your true potential.`
        case 'stability':
            return `Your English is ${level} because inconsistent pacing breaks your communication.`
        default:
            return `Your English is ${level} because needed improvements in ${weakest}.`
    }
}

/**
 * Generate a "Why you are at this level" explanation.
 * "You understand words, but hesitation prevents real-time speaking."
 */
export function getReasoning(scoreData: EnglivoScore): string {
    const weakest = getWeakestDimension(scoreData.dimensions)

    switch (weakest) {
        case 'flow':
            return "Your brain is translating before responding."
        case 'confidence':
            return "You lose structure when you speak in longer sentences."
        case 'clarity':
            return "Your filler words distract from your message."
        case 'speed':
            return "You are thinking faster than you are speaking."
        case 'stability':
            return "Your speech rhythm is uneven, causing listener fatigue."
        default:
            return "You understand the words, but the delivery needs polish."
    }
}

/**
 * Generate a progress prediction.
 * "At your current pace, you can reach A2 in ~10 days."
 */
export function getProgressPrediction(scoreData: EnglivoScore): string {
    // Current score
    const currentScore = scoreData.cefr?.score || 0
    const currentLevel = scoreData.cefr?.level || 'A1'

    // Get analysis to find points needed for next level
    const analysis = getCefrAnalysis(currentLevel, currentScore)

    // If no next level (C2), return congratulations
    if (!analysis.nextLevel) {
        return "You clearly define fluency. Keep maintaining your skills!"
    }

    const pointsNeeded = analysis.pointsToNext || 0

    // Assume average daily gain of 1.5 points (can be tweaked or parameterized)
    const avgDailyGain = 1.5
    const days = Math.ceil(pointsNeeded / avgDailyGain)

    return `At your current pace, you can reach ${analysis.nextLevel} in ~${days} days.`
}
