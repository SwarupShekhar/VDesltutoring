import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { PracticeTurn } from "@/lib/practice"
import { getDifficultySettings, DifficultySettings } from "@/lib/adaptiveDifficulty"

import { PRACTICE_QUESTIONS } from "@/lib/practice-questions"

const PRACTICE_LIBRARY = PRACTICE_QUESTIONS

export async function GET(request: Request) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get fluency score from query params (sent from client-side localStorage)
    const { searchParams } = new URL(request.url)
    const fluencyScoreParam = searchParams.get('fluencyScore')
    const fluencyScore = fluencyScoreParam ? parseFloat(fluencyScoreParam) : 0.5

    // Get mode from query params
    const mode = searchParams.get('mode') || 'auto'

    // Get excluded IDs (repetition prevention)
    const excludeIdsParam = searchParams.get('excludeIds');
    const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : [];

    // Get difficulty settings based on fluency score
    const settings: DifficultySettings = getDifficultySettings(fluencyScore)

    // Select pool based on mode
    let pool = PRACTICE_LIBRARY

    if (mode === "speed") {
        pool = PRACTICE_LIBRARY.filter(p => p.type === "QUICK_RESPONSE")
    } else if (mode === "pronunciation") {
        pool = PRACTICE_LIBRARY.filter(p => p.type === "LISTEN_REACT")
    } else if (mode === "grammar") {
        pool = PRACTICE_LIBRARY.filter(p => p.type === "FINISH_THOUGHT" || p.type === "COMPLETE_SENTENCE")
    } else if (mode === "vocabulary") {
        pool = PRACTICE_LIBRARY.filter(p => p.type === "PICK_SPEAK")
    } else if (mode === "auto") {
        pool = PRACTICE_LIBRARY.filter(p => p.complexity === settings.complexity)
    }

    // Filter out seen questions
    if (excludeIds.length > 0) {
        const freshPool = pool.filter(p => !excludeIds.includes(p.id));
        // Only apply filter if we still have questions left
        if (freshPool.length > 0) {
            pool = freshPool;
        } else {
            // Reset: If we've seen everything in this specific pool, ignore exclusions to allow repeating instead of crashing/empty
            console.log(`[PracticeAPI] Pool exhausted for mode ${mode}. Resetting exclusions.`);
        }
    }

    // Fallback if requested mode pool is empty
    if (pool.length === 0) {
        pool = PRACTICE_LIBRARY.filter(p => p.complexity === settings.complexity)
    }

    // Pick random turn from appropriate pool
    const turn = pool[Math.floor(Math.random() * pool.length)]

    return NextResponse.json({
        ...turn,
        // Include difficulty metadata for UI
        difficultySettings: {
            level: settings.level,
            prepTime: settings.prepTime,
            promptSpeed: settings.promptSpeed
        }
    })
}
