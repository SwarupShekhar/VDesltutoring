export interface QATurnSnapshot {
    turnId: string
    transcript: string

    deepgram: {
        pauseRatio: number
        fillerRate: number
        restartRate: number
        wpm: number
        silenceRatio: number
    }

    fluency: {
        score: number
        stars: number
        patterns: string[]
    }

    cefr: {
        level: string
        breakdown: {
            fluency: number
            pronunciation: number
            grammar: number
            vocabulary: number
            coherence: number
        }
    }

    coaching: {
        selectedLesson: string
        lessonReason: string
    }

    ai: {
        systemPrompt: string
        rawResponse: string
        finalResponse: string
    }

    timestamp: string
}
