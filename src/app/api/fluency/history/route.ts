import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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

        // Latest AI identity
        const lastSession = await prisma.ai_chat_sessions.findFirst({
            where: { user_id: user.id },
            orderBy: { started_at: "desc" }
        })

        let identity = null
        if (lastSession?.feedback_summary) {
            try {
                const report = JSON.parse(lastSession.feedback_summary)
                identity = report.identity || null
            } catch (e) {
                console.error("Failed to parse feedback_summary", e)
            }
        }

        // All fluency snapshots
        const snapshots = await prisma.fluency_snapshots.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" }
        })

        // Pattern totals
        const patternTotals = {
            HESITATION: 0,
            FILLER_OVERUSE: 0,
            PRONUNCIATION: 0,
            GRAMMAR_SCAFFOLD: 0,
            TRANSLATION_THINKING: 0
        }

        snapshots.forEach((s) => {
            patternTotals.HESITATION += s.hesitation
            patternTotals.FILLER_OVERUSE += s.fillers
            patternTotals.PRONUNCIATION += s.pronunciation
            patternTotals.GRAMMAR_SCAFFOLD += s.grammar_scaffold
            patternTotals.TRANSLATION_THINKING += s.translation_thinking
        })

        const patterns = Object.entries(patternTotals)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score)

        // Timeline (daily)
        const timelineMap = new Map<string, { date: string; hesitation: number; fillers: number }>()

        snapshots.forEach((s) => {
            const day = s.created_at.toISOString().slice(0, 10)
            if (!timelineMap.has(day)) {
                timelineMap.set(day, {
                    date: day,
                    hesitation: 0,
                    fillers: 0
                })
            }

            const d = timelineMap.get(day)!
            d.hesitation += s.hesitation
            d.fillers += s.fillers
        })

        const timeline = Array.from(timelineMap.values())

        // Recent speaking moments
        const recent = snapshots.slice(-5).map((s) => ({
            time: s.created_at.toLocaleTimeString(),
            hesitation: s.hesitation,
            fillers: s.fillers,
            wpm: 0 // WPM is not tracked in snapshots anymore
        }))

        return NextResponse.json({
            identity,
            patterns,
            timeline,
            recent
        })
    } catch (e) {
        console.error("Fluency history failed", e)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
