/**
 * AI Tutor Module - Types
 */

export interface TutorResponse {
    response: string
    corrections: Correction[]
}

export interface Correction {
    original: string
    corrected: string
    type: 'grammar' | 'vocabulary' | 'fluency'
}

export interface TutorInput {
    transcript: string
    fluency?: number
    metrics?: TutorMetrics
    firstName?: string
}

export interface TutorMetrics {
    fluencyScore?: number
    pauseRatio?: number
    fillerRate?: number
    restartRate?: number
    silenceRatio?: number
    wpm?: number
    wordCount?: number
}

export interface TutorSession {
    id: string
    userId: string
    messages: TutorMessage[]
    startedAt: Date
    endedAt?: Date
}

export interface TutorMessage {
    role: 'user' | 'tutor'
    content: string
    timestamp: Date
    metrics?: TutorMetrics
}
