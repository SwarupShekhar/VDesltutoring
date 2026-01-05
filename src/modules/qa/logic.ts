import { QATurnSnapshot } from './types'
import { computeEnglivoScoreWithCefr, FluencyMetrics } from '@/engines/fluency/fluencyScore'
import { computeSkillScores } from '@/engines/cefr/cefrEngine'
import { selectEnglivoLesson, getLessonReason } from '@/engines/coaching/englivoLessons'
import { generateTutorPrompt } from '@/modules/aiTutor/logic'

// Mock database fetch
async function fetchTurnFromDB(turnId: string) {
    // Simulator of what we might find in a DB for a turn
    return {
        id: turnId,
        transcript: turnId === 'turn-1' ? "I think uh I want go to office tomorrow" : "Well, honestly I prefer coffee because it wakes me up.",
        metrics: {
            pauseRatio: turnId === 'turn-1' ? 0.21 : 0.05,
            fillerRate: turnId === 'turn-1' ? 0.12 : 0.02,
            restartRate: 0.08,
            wpm: turnId === 'turn-1' ? 110 : 145,
            silenceRatio: 0.15,
            wordCount: turnId === 'turn-1' ? 9 : 12,
            speechSpeed: 0.5
        },
        ai: {
            systemPrompt: "You are a helpful tutor...",
            rawResponse: "{\"response\": \"Great start!\", \"corrections\": []}",
            finalResponse: "Great start! Try saying 'I want to go'."
        },
        timestamp: new Date().toISOString()
    }
}

export async function getQASnapshot(turnId: string): Promise<QATurnSnapshot> {
    const turn = await fetchTurnFromDB(turnId)

    // 1. Re-run Fluency Engine to verify numbers
    const fluencyMetrics: FluencyMetrics = {
        pauseRatio: turn.metrics.pauseRatio,
        fillerRate: turn.metrics.fillerRate,
        restartRate: turn.metrics.restartRate,
        wpm: turn.metrics.wpm,
        silenceRatio: turn.metrics.silenceRatio,
        wordCount: turn.metrics.wordCount,
        speechSpeed: turn.metrics.speechSpeed
    }

    const fluencyResult = computeEnglivoScoreWithCefr(fluencyMetrics)

    // 2. Re-run CEFR Engine
    const cefrResult = computeSkillScores({
        fluency: fluencyResult.englivoScore / 100, // Normalize to 0-1
        pronunciation: 0.7,
        grammar: 0.6,
        vocabulary: 0.5
    }, 10)

    // 3. Re-run Coaching Engine
    const lessonKey = selectEnglivoLesson(fluencyResult.dimensions, fluencyResult.raw)
    const reason = lessonKey ? getLessonReason(lessonKey, fluencyResult.raw) : "No lesson trigger met"

    return {
        turnId: turn.id,
        transcript: turn.transcript,
        deepgram: {
            pauseRatio: turn.metrics.pauseRatio,
            fillerRate: turn.metrics.fillerRate,
            restartRate: turn.metrics.restartRate,
            wpm: turn.metrics.wpm,
            silenceRatio: turn.metrics.silenceRatio
        },
        fluency: {
            score: fluencyResult.englivoScore,
            stars: Math.round(fluencyResult.englivoScore / 20),
            patterns: typeof fluencyResult.identity === 'string' ? fluencyResult.identity.split(' ') : ['General']
        },
        cefr: {
            level: cefrResult.overall.cefr,
            breakdown: {
                fluency: cefrResult.fluency.score,
                pronunciation: cefrResult.pronunciation.score,
                grammar: cefrResult.grammar.score,
                vocabulary: cefrResult.vocabulary.score,
                coherence: 0
            }
        },
        coaching: {
            selectedLesson: lessonKey || "None",
            lessonReason: reason || ""
        },
        ai: {
            systemPrompt: turn.ai.systemPrompt,
            rawResponse: turn.ai.rawResponse,
            finalResponse: turn.ai.finalResponse
        },
        timestamp: turn.timestamp
    }
}

export async function getRecentQATurns(): Promise<QATurnSnapshot[]> {
    const turn1 = await getQASnapshot('turn-1')
    const turn2 = await getQASnapshot('turn-2')
    return [turn1, turn2]
}
