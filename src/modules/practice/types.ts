/**
 * Practice Module - Types
 */

export interface PracticeTurn {
    id: string
    type: PracticeTurnType
    situation: string
    difficulty: number
    prompt: string
    choices?: string[]
    audioUrl?: string
}

export type PracticeTurnType =
    | 'LISTEN_REACT'
    | 'QUICK_RESPONSE'
    | 'OPINION'
    | 'FINISH_THOUGHT'
    | 'PICK_SPEAK'
    | 'STORYTELLING'
    | 'EXPLANATION'
    | 'ROLEPLAY'
    | 'DEBATE'
    | 'LISTEN_TYPE'
    | 'COMPLETE_SENTENCE'

export type ComplexityLevel = 'simple' | 'moderate' | 'complex'

export interface PracticeItem extends PracticeTurn {
    complexity: ComplexityLevel
}

export interface DifficultySettings {
    level: string
    prepTime: number
    promptSpeed: string
    complexity: ComplexityLevel
}

export interface PracticeSession {
    turns: PracticeItem[]
    startedAt: Date
    completedAt?: Date
    fluencyScore?: number
}
