"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { getSkillProgress } from "@/lib/skillProgress"
import { ArrowUp, ArrowDown, Sparkles } from "lucide-react"

interface FluencyHistory {
    metrics: {
        today: any
        yesterday: any
        deltas: any
        hasEnoughData: boolean
    }
}

export function DailyInsightCard() {
    const [history, setHistory] = useState<FluencyHistory | null>(null)
    const [insight, setInsight] = useState<{ text: string, type: 'positive' | 'neutral' | 'negative' } | null>(null)

    useEffect(() => {
        // Fetch fluency metrics history
        fetch('/api/fluency/history')
            .then(res => res.json())
            .then(data => {
                setHistory(data)
                generateInsight(data)
            })
            .catch(err => console.error("Failed to load insights", err))
    }, [])

    function generateInsight(data: FluencyHistory) {
        if (!data || !data.metrics || !data.metrics.hasEnoughData) {
            setInsight({ text: "Complete more sessions to unlock daily insights.", type: "neutral" })
            return
        }

        const { deltas } = data.metrics

        if (!deltas) {
            setInsight({ text: "Keep practicing daily to see your improvement trends.", type: "neutral" })
            return
        }

        // Check local progress for context
        // We look for key skills: "Speaking Flow" (pauses, restarts) and "Clear Speech" (fillers)
        const flowSkill = getSkillProgress("Speaking Flow")
        const clearSpeechSkill = getSkillProgress("Clear Speech")

        // Priority 1: Improvement + Drill Context
        if (deltas.pauseRatio && deltas.pauseRatio < -0.05 && flowSkill.drillsCompleted > 0) {
            setInsight({
                text: `Your pauses dropped ${Math.abs(Math.round(deltas.pauseRatio * 100))}% because you completed ${flowSkill.drillsCompleted} Speaking Flow drills.`,
                type: "positive"
            })
            return
        }

        if (deltas.fillerRate && deltas.fillerRate < -0.02 && clearSpeechSkill.drillsCompleted > 0) {
            setInsight({
                text: `Your fillers decreased by ${Math.abs(Math.round(deltas.fillerRate * 100))}% thanks to your focus on Clear Speech.`,
                type: "positive"
            })
            return
        }

        // Priority 2: Regression + Suggestions (Future Focus)
        if (deltas.pauseRatio && deltas.pauseRatio > 0.05) {
            setInsight({
                text: `Your pauses increased today. Tomorrow we'll focus on "Start Faster" drills to fix this.`,
                type: "negative"
            })
            return
        }

        // Priority 3: General positive trend
        if (deltas.fluencyScore && deltas.fluencyScore > 0.05) {
            setInsight({
                text: "Your overall fluency is trending up! Your rhythm is becoming more natural.",
                type: "positive"
            })
            return
        }

        setInsight({ text: "Maintain your rhythm. Consistent practice is building your fluency score.", type: "neutral" })
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
