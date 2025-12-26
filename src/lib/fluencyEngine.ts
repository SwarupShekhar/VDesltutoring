import sentencesData from "@/data/fluencySentences.json"

export type FluencyChunk = {
    id: string
    text: string
    originalIndex: number
}

export type FluencyTask = {
    sentenceId: string
    originalSentence: string
    chunks: FluencyChunk[]
    shuffledChunks: FluencyChunk[]
    difficulty: "easy" | "medium" | "hard"
}

/**
 * Breaks a sentence into natural speaking chunks.
 */
export function chunkSentence(text: string): string[] {
    return text
        .replace(/([,.;])/g, "$1|")
        .replace(/\b(but|and|because|so|when|if|while|that)\b/gi, "|$1")
        .split("|")
        .map(s => s.trim())
        .filter(Boolean)
}

/**
 * Fisher-Yates shuffle.
 */
function shuffle<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

/**
 * Converts chunk count to difficulty band.
 */
function getDifficulty(chunkCount: number): "easy" | "medium" | "hard" {
    if (chunkCount <= 5) return "easy"
    if (chunkCount <= 7) return "medium"
    return "hard"
}

/**
 * Creates a full fluency task from the sentence bank.
 */
export function generateFluencyTask(): FluencyTask {
    const pool = sentencesData.sentences
    const sentence = pool[Math.floor(Math.random() * pool.length)]

    const rawChunks = chunkSentence(sentence.text)

    const chunks: FluencyChunk[] = rawChunks.map((text, i) => ({
        id: `${sentence.id}-${i}`,
        text,
        originalIndex: i
    }))

    return {
        sentenceId: sentence.id,
        originalSentence: sentence.text,
        chunks,
        shuffledChunks: shuffle(chunks),
        difficulty: getDifficulty(chunks.length)
    }
}

/**
 * Scores how fluently a user reconstructed the sentence.
 */
export function scoreAttempt(
    chunks: FluencyChunk[],
    userOrder: FluencyChunk[],
    timeMs: number
) {
    let correct = 0

    userOrder.forEach((chunk, index) => {
        if (chunk.originalIndex === index) correct++
    })

    const accuracy = correct / chunks.length

    // Ideal completion: 1.2s per chunk, min 5s
    const targetTime = Math.max(5000, chunks.length * 1200)
    const timeScore = Math.min(1, targetTime / timeMs)

    const fluencyScore = accuracy * 0.7 + timeScore * 0.3

    return {
        accuracy,
        timeMs,
        fluencyScore
    }
}

/**
 * Maps numeric score to human-readable fluency profile.
 */
export function getFluencyProfile(score: number) {
    if (score < 0.4) return "Silent Translator"
    if (score < 0.7) return "Careful Architect"
    return "Natural Speaker"
}
