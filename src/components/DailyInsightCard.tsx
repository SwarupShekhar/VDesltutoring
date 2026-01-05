"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { getSkillProgress } from "@/lib/skillProgress"
import { ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import type { EnglivoDashboardPayload } from "@/types/englivoTypes"

export function DailyInsightCard() {
    const [history, setHistory] = useState<EnglivoDashboardPayload | null>(null)
    const [insight, setInsight] = useState<{ text: string, type: 'positive' | 'neutral' | 'negative' } | null>(null)

    useEffect(() => {
        // Fetch fluency metrics history
        fetch('/api/fluency/history')
            .then(res => res.json())
            .then(data => {
                if (data.metrics) {
                    setHistory(data.metrics)
                    generateInsight(data.metrics)
                }
            })
            .catch(err => console.error("Failed to load insights", err))
    }, [])

    function generateInsight(data: EnglivoDashboardPayload) {
        if (!data || !data.hasEnoughData) {
            setInsight({ text: "Complete more sessions to unlock daily insights.", type: "neutral" })
            return
        }

        const { today, yesterday, deltas } = data

        if (!today || !yesterday || !deltas) {
            setInsight({ text: "Keep practicing daily to see your improvement trends.", type: "neutral" })
            return
        }

        // Check local progress for context
        const flowSkill = getSkillProgress("Speaking Flow")
        const clearSpeechSkill = getSkillProgress("Clear Speech")

        // Priority 1: Identity Level Change
        if (today.identity !== yesterday.identity) {
            const improved = today.englivoScore > yesterday.englivoScore
            if (improved) {
                setInsight({
                    text: `You leveled up! You're now a ${today.identity} (from ${yesterday.identity}).`,
                    type: "positive"
                })
                return
            }
        }

        // Priority 2: Significant Dimension Improvement + Drill Context
        if (deltas.flow && deltas.flow > 10 && flowSkill.drillsCompleted > 0) {
            setInsight({
                text: `Your Flow improved by ${deltas.flow} points because you completed ${flowSkill.drillsCompleted} Speaking Flow drills!`,
                type: "positive"
            })
            return
        }

        if (deltas.clarity && deltas.clarity > 10 && clearSpeechSkill.drillsCompleted > 0) {
            setInsight({
                text: `Your Clarity jumped ${deltas.clarity} points thanks to your Clear Speech practice!`,
                type: "positive"
            })
            return
        }

        // Priority 3: Any significant dimension improvement
        const dimensionChanges = [
            { name: 'Flow', delta: deltas.flow },
            { name: 'Confidence', delta: deltas.confidence },
            { name: 'Clarity', delta: deltas.clarity },
            { name: 'Speed', delta: deltas.speed },
            { name: 'Stability', delta: deltas.stability }
        ].filter(d => d.delta !== undefined)

        const bestImprovement = dimensionChanges.reduce((best, current) =>
            (current.delta || 0) > (best.delta || 0) ? current : best
            , { name: '', delta: 0 })

        if (bestImprovement.delta && bestImprovement.delta > 8) {
            setInsight({
                text: `Your ${bestImprovement.name} improved by ${bestImprovement.delta} points today. Keep it up!`,
                type: "positive"
            })
            return
        }

        // Priority 4: Regression + Suggestions
        const worstRegression = dimensionChanges.reduce((worst, current) =>
            (current.delta || 0) < (worst.delta || 0) ? current : worst
            , { name: '', delta: 0 })

        if (worstRegression.delta && worstRegression.delta < -8) {
            setInsight({
                text: `Your ${worstRegression.name} dropped ${Math.abs(worstRegression.delta)} points. Let's focus on that tomorrow.`,
                type: "negative"
            })
            return
        }

        // Priority 5: Overall score improvement
        if (deltas.score > 5) {
            setInsight({
                text: `Your Englivo Score increased by ${deltas.score} points! You're becoming a more natural speaker.`,
                type: "positive"
            })
            return
        }

        // Default: Neutral encouragement
        setInsight({
            text: `You're a ${today.identity}. Maintain your rhythm with consistent practice.`,
            type: "neutral"
        })
    }

    if (!insight) return null

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
            <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-full ${insight.type === 'positive' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    insight.type === 'negative' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {insight.type === 'positive' ? <ArrowUp className="w-6 h-6" /> :
                        insight.type === 'negative' ? <ArrowDown className="w-6 h-6" /> :
                            <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Daily Insight
                    </h4>
                    <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                        {insight.text}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
