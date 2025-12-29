import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

const FILLER_WORDS = [
    "um",
    "uh",
    "well",
    "like",
    "you know",
    "i mean",
    "sort of",
    "kind of",
    "actually",
    "basically"
]

const MAX_WPM_THRESHOLD = 150
const MIN_WPM_THRESHOLD = 100

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.users.findUnique({
            where: { clerkId: clerkId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await req.json()
        const { transcript, duration = 1, deepgram } = body

        if (!transcript || typeof transcript !== "string") {
            return NextResponse.json({ error: "Invalid transcript" }, { status: 400 })
        }

        const text = transcript.toLowerCase()
        const words = deepgram?.results?.channels?.[0]?.alternatives?.[0]?.words || []

        // ------------------------------------------------------------------
        // Fluency Pattern Buckets
        // ------------------------------------------------------------------

        const PATTERNS = {
            HESITATION: 0,
            FILLER_OVERUSE: 0,
            PRONUNCIATION: 0,
            GRAMMAR_SCAFFOLD: 0,
            TRANSLATION_THINKING: 0
        }

        // ------------------------------------------------------------------
        // 1️⃣ Hesitation (silence between words)
        // ------------------------------------------------------------------

        for (let i = 1; i < words.length; i++) {
            const gap = words[i].start - words[i - 1].end
            if (gap > 1.2) PATTERNS.HESITATION += 1
            if (gap > 2.0) PATTERNS.HESITATION += 2
        }

        // ------------------------------------------------------------------
        // 2️⃣ Filler detection
        // ------------------------------------------------------------------

        let fillerCount = 0
        const foundFillers: string[] = []

        for (const filler of FILLER_WORDS) {
            const matches = text.match(new RegExp(`\\b${filler}\\b`, "g"))
            if (matches) {
                fillerCount += matches.length
                foundFillers.push(filler)
            }
        }

        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
        const fillerRate = wordCount > 0 ? fillerCount / wordCount : 0

        if (fillerRate > 0.08) PATTERNS.FILLER_OVERUSE += Math.round(fillerRate * 100)

        // ------------------------------------------------------------------
        // 3️⃣ Pronunciation confidence (Deepgram)
        // ------------------------------------------------------------------

        for (const w of words) {
            if (w.confidence !== undefined && w.confidence < 0.7) {
                PATTERNS.PRONUNCIATION += 1
            }
        }

        // ------------------------------------------------------------------
        // 4️⃣ Grammar + Translation thinking (Gemini-style correction)
        // ------------------------------------------------------------------

        const correction = await getCorrectedSentence(transcript)

        if (correction && correction.toLowerCase() !== transcript.toLowerCase()) {
            const userTokens = transcript.split(" ")
            const correctedTokens = correction.split(" ")

            let missingScaffold = 0
            let wordOrderChanges = 0

            for (const word of ["a", "an", "the", "to", "is", "are", "was", "were"]) {
                if (!userTokens.includes(word) && correctedTokens.includes(word)) {
                    missingScaffold += 1
                }
            }

            for (let i = 0; i < Math.min(userTokens.length, correctedTokens.length); i++) {
                if (userTokens[i] !== correctedTokens[i]) wordOrderChanges += 1
            }

            PATTERNS.GRAMMAR_SCAFFOLD += missingScaffold
            PATTERNS.TRANSLATION_THINKING += wordOrderChanges
        }

        // ------------------------------------------------------------------
        // 5️⃣ Speaking speed
        // ------------------------------------------------------------------

        const wpm = Math.round((wordCount / duration) * 60)

        // ------------------------------------------------------------------
        // 6️⃣ Rank Fluency Blockers
        // ------------------------------------------------------------------

        const rankedPatterns = Object.entries(PATTERNS)
            .sort((a, b) => b[1] - a[1])
            .map(p => p[0])
            .slice(0, 5)

        // ------------------------------------------------------------------
        // 7️⃣ Coaching cue (human-friendly)
        // ------------------------------------------------------------------

        let suggestion = null
        let type: "neutral" | "pacing" | "filler" | "fluency" = "neutral"

        if (PATTERNS.HESITATION > 3) {
            suggestion = "Try starting sentences faster — your ideas are ready."
            type = "fluency"
        } else if (PATTERNS.FILLER_OVERUSE > 5) {
            suggestion = "Silence is okay. Let your thought arrive before speaking."
            type = "filler"
        } else if (wpm > MAX_WPM_THRESHOLD) {
            suggestion = "Slow down slightly so your message lands clearly."
            type = "pacing"
        } else if (wpm < MIN_WPM_THRESHOLD && wordCount > 4) {
            suggestion = "You can speak a little more fluidly."
            type = "pacing"
        }

        // ------------------------------------------------------------------
        // 8️⃣ Save Snapshot
        // ------------------------------------------------------------------

        await prisma.fluency_snapshots.create({
            data: {
                user_id: user.id, // ✅ Correct UUID
                hesitation: PATTERNS.HESITATION,
                fillers: fillerCount,
                pronunciation: PATTERNS.PRONUNCIATION,
                grammar_scaffold: PATTERNS.GRAMMAR_SCAFFOLD,
                translation_thinking: PATTERNS.TRANSLATION_THINKING
            }
        })

        // ------------------------------------------------------------------
        // Final response
        // ------------------------------------------------------------------

        return NextResponse.json({
            success: true,
            transcript,
            corrected: correction,
            patterns: rankedPatterns, // Top-level for easy consumption by AI API
            analysis: {
                wpm,
                fillers: foundFillers,
                fillerRate,
                patterns: rankedPatterns,
                patternScores: PATTERNS,
                suggestion,
                type
            }
        })

    } catch (err) {
        console.error("Fluency analyze failed", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// ------------------------------------------------------------------
// Gemini-style sentence corrector (safe minimal)
// ------------------------------------------------------------------

async function getCorrectedSentence(text: string): Promise<string> {
    try {
        const res = await fetch("http://localhost:3000/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                transcript: `Rewrite this sentence in natural correct English: ${text}`
            })
        })

        if (!res.ok) return text

        const json = await res.json()
        return json.response || text
    } catch {
        return text
    }
}
