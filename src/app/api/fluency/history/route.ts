import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import {
    computeEnglivoScore,
    calculateEnglivoDimensions,
    calculateEnglivoScore,
    getIdentityLevel,
    extractMetricsFromDeepgram
} from "@/lib/fluencyScore"
import type { EnglivoScoreWithMetadata } from "@/types/englivoTypes"

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

        // Latest AI identity (keep for backward compatibility)
        const lastSession = await prisma.ai_chat_sessions.findFirst({
            where: { user_id: user.id },
            orderBy: { started_at: "desc" }
        })

        let legacyIdentity = null
        if (lastSession?.feedback_summary) {
            try {
                const report = JSON.parse(lastSession.feedback_summary)
                legacyIdentity = report.identity || null
            } catch (e) {
                console.error("Failed to parse feedback_summary", e)
            }
        }

        // All fluency snapshots (limit to 100 for performance)
        const snapshots = await prisma.fluency_snapshots.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" },
            take: 100
        })

        // Pattern totals (legacy)
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

        // Timeline (daily) with Englivo metrics
        const timelineMap = new Map<string, {
            date: string
            hesitation: number
            fillers: number
            wpmSum: number
            count: number
            wordCountTotal: number
            restartCount: number
            silenceSum: number
        }>()

        snapshots.forEach((s) => {
            const day = s.created_at.toISOString().slice(0, 10)
            if (!timelineMap.has(day)) {
                timelineMap.set(day, {
                    date: day,
                    hesitation: 0,
                    fillers: 0,
                    wpmSum: 0,
                    count: 0,
                    wordCountTotal: 0,
                    restartCount: 0,
                    silenceSum: 0
                })
            }

            const d = timelineMap.get(day)!
            d.hesitation += s.hesitation
            d.fillers += s.fillers
            d.wpmSum += s.wpm || 0
            d.count += 1
            d.wordCountTotal += s.word_count || 0
            // Approximate restart and silence from existing data
            d.restartCount += Math.floor(s.hesitation / 2) // Rough approximation
            d.silenceSum += s.hesitation * 0.3 // Rough approximation
        })

        const timeline = Array.from(timelineMap.values()).map(d => {
            const avgWpm = d.count > 0 ? Math.round(d.wpmSum / d.count) : 0
            const pauseRatio = d.count > 0 ? (d.hesitation / (d.count * 5)) : 0
            const fillerRate = d.wordCountTotal > 0 ? (d.fillers / d.wordCountTotal) : 0
            const restartRate = d.wordCountTotal > 0 ? (d.restartCount / d.wordCountTotal) : 0
            const silenceRatio = d.count > 0 ? (d.silenceSum / (d.count * 5)) : 0

            // Calculate Englivo dimensions
            const dimensions = calculateEnglivoDimensions({
                pauseRatio,
                fillerRate,
                restartRate,
                silenceRatio,
                wpm: avgWpm,
                speechSpeed: 0, // Not used in Englivo
                wordCount: d.wordCountTotal
            })

            const englivoScore = calculateEnglivoScore(dimensions)
            const identity = getIdentityLevel(englivoScore)

            return {
                date: d.date,
                // Legacy fields
                hesitation: d.hesitation,
                fillers: d.fillers,
                wpm: avgWpm,
                wordCount: d.wordCountTotal,
                pauseRatio: Math.round(pauseRatio * 100),
                fillerRate: Math.round(fillerRate * 100),
                // Englivo fields
                englivoScore,
                identity,
                dimensions
            }
        })

        // Recent speaking moments
        const recent = snapshots.slice(-5).map((s) => ({
            time: s.created_at.toLocaleTimeString(),
            hesitation: s.hesitation,
            fillers: s.fillers,
            wpm: s.wpm || 0
        }))

        // --- Calculate Yesterday vs Today with Englivo Schema ---
        const today = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

        const todayData = timelineMap.get(today)
        const yesterdayData = timelineMap.get(yesterday)

        const calculateDayMetrics = (data: typeof todayData): EnglivoScoreWithMetadata | null => {
            if (!data || data.count === 0) return null

            const avgWpm = Math.round(data.wpmSum / data.count)
            const pauseRatio = data.hesitation / (data.count * 5)
            const fillerRate = data.wordCountTotal > 0 ? (data.fillers / data.wordCountTotal) : 0
            const restartRate = data.wordCountTotal > 0 ? (data.restartCount / data.wordCountTotal) : 0
            const silenceRatio = data.silenceSum / (data.count * 5)

            const dimensions = calculateEnglivoDimensions({
                pauseRatio,
                fillerRate,
                restartRate,
                silenceRatio,
                wpm: avgWpm,
                speechSpeed: 0,
                wordCount: data.wordCountTotal
            })

            const englivoScore = calculateEnglivoScore(dimensions)
            const identity = getIdentityLevel(englivoScore)

            return {
                englivoScore,
                identity,
                raw: {
                    pauseRatio: Number(pauseRatio.toFixed(3)),
                    fillerRate: Number(fillerRate.toFixed(3)),
                    restartRate: Number(restartRate.toFixed(3)),
                    silenceRatio: Number(silenceRatio.toFixed(3)),
                    wpm: avgWpm
                },
                dimensions,
                turns: data.count,
                wordCount: data.wordCountTotal
            }
        }

        const todayMetrics = calculateDayMetrics(todayData)
        const yesterdayMetrics = calculateDayMetrics(yesterdayData)

        // Calculate deltas (positive = improvement for score, negative = improvement for ratios)
        const deltas = todayMetrics && yesterdayMetrics ? {
            score: todayMetrics.englivoScore - yesterdayMetrics.englivoScore,
            pauseRatio: Number((yesterdayMetrics.raw.pauseRatio - todayMetrics.raw.pauseRatio).toFixed(3)),
            fillerRate: Number((yesterdayMetrics.raw.fillerRate - todayMetrics.raw.fillerRate).toFixed(3)),
            restartRate: Number((yesterdayMetrics.raw.restartRate - todayMetrics.raw.restartRate).toFixed(3)),
            wpm: todayMetrics.raw.wpm - yesterdayMetrics.raw.wpm,
            // Dimension deltas
            flow: todayMetrics.dimensions.flow - yesterdayMetrics.dimensions.flow,
            confidence: todayMetrics.dimensions.confidence - yesterdayMetrics.dimensions.confidence,
            clarity: todayMetrics.dimensions.clarity - yesterdayMetrics.dimensions.clarity,
            speed: todayMetrics.dimensions.speed - yesterdayMetrics.dimensions.speed,
            stability: todayMetrics.dimensions.stability - yesterdayMetrics.dimensions.stability
        } : null

        return NextResponse.json({
            // Legacy fields for backward compatibility
            identity: legacyIdentity,
            patterns,
            timeline,
            recent,
            // NEW: Englivo metrics
            metrics: {
                today: todayMetrics,
                yesterday: yesterdayMetrics,
                deltas,
                hasEnoughData: timeline.length >= 2
            }
        })
    } catch (e) {
        console.error("Fluency history failed", e)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
