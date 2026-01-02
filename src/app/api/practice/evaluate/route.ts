import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { transcript, fluency, turn } = body

    if (!transcript || transcript.length < 5) {
        return NextResponse.json({
            success: false,
            feedback: "Try saying a little more so I can hear your speaking style.",
            confidence: 0.2,
            stars: 0
        })
    }

    let confidence = 0.5
    let feedback = "Nice — keep going."

    const hesitation = fluency?.HESITATION || 0
    const fillers = fluency?.FILLER_OVERUSE || 0

    // 1️⃣ Hesitation hurts flow
    if (hesitation > 3) {
        confidence -= 0.15
        feedback = "Try starting your answer a little faster — you already know what to say."
    }

    // 2️⃣ Filler overuse
    if (fillers > 5) {
        confidence -= 0.15
        feedback = "Pause instead of using fillers. That will sound more confident."
    }

    // 3️⃣ Did they actually respond to the prompt?
    if (turn?.prompt) {
        const keywords = turn.prompt
            .toLowerCase()
            .split(" ")
            .filter((w: string) => w.length > 3)

        const hitCount = keywords.filter((k: string) =>
            transcript.toLowerCase().includes(k)
        ).length

        if (hitCount > 0) {
            confidence += 0.25
            feedback = "Good — you answered directly. That builds real speaking ability."
        }
    }

    // Clamp to 0–1
    confidence = Math.max(0, Math.min(1, confidence))

    const stars =
        confidence > 0.8 ? 3 :
            confidence > 0.6 ? 2 :
                confidence > 0.4 ? 1 : 0

    return NextResponse.json({
        success: true,
        confidence,
        stars,
        feedback
    })
}
