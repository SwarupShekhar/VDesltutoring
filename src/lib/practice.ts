export type PracticeTurn = {
    id: string
    type: "LISTEN_REACT" | "PICK_SPEAK" | "FINISH_THOUGHT" | "QUICK_FIRE" | "ROLEPLAY" | "QUICK_RESPONSE" | "OPINION" | "DEBATE" | "STORYTELLING" | "EXPLANATION" | "LISTEN_TYPE" | "COMPLETE_SENTENCE"
    prompt: string
    audioUrl?: string
    choices?: string[]
    expectedIntent?: string
    situation: string
    difficulty: 1 | 2 | 3
}

export type PracticeResult = {
    turnId: string
    transcript: string
    patterns: string[]
    hesitation: number
    fillers: number
    relevance: "on" | "partial" | "off"
    smoothness: number
}
