"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { CheckCircle, AlertCircle, Clock, Mic, BarChart2, Zap } from "lucide-react"
import type { FluencyMetrics } from "@/lib/fluencyScore"
import type { MicroLesson } from "@/lib/microLessons"

interface PracticeFeedbackProps {
    score: number
    feedback: string
    metrics: FluencyMetrics
    microLesson: MicroLesson | null
    onNext: () => void
    onDrill: () => void
    hideMetrics?: boolean
}

export function PracticeFeedback({ score, feedback, metrics, microLesson, onNext, onDrill, hideMetrics = false }: PracticeFeedbackProps) {

    // Helper for circular progress
    const CircleProgress = ({ value, color, label }: { value: number, color: string, label: string }) => {
        const radius = 30
        const circumference = 2 * Math.PI * radius
        const offset = circumference - (value / 100) * circumference

        return (
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-full h-full">
                        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle
                            cx="40" cy="40" r={radius}
                            stroke="currentColor" strokeWidth="6" fill="transparent"
                            className={color}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-lg font-bold text-slate-700 dark:text-slate-200">{Math.round(value)}%</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            </div>
        )
    }

    // Helper for Bar Metric
    const MetricBar = ({ label, value, target, isBadIfHigh = false, unit }: { label: string, value: number, target: number, isBadIfHigh?: boolean, unit: string }) => {
        // Calculate "Goodness": 100% means perfect.
        // If isBadIfHigh (like Pauses): Value 0 -> 100% good. Value > Target -> 0% good.
        // If !isBadIfHigh (Speed): Value > Target -> 100% good. Value 0 -> 0% good.

        // Simple logic for UI visualization
        // Pauses: Target is e.g. 10%. If actual is 5% (better), bar is full green. If 20% (worse), bar is yellow/red.
        // Let's just show the ACTUAL value relative to a "Map".

        let percentage = 0
        let color = "bg-blue-500"

        if (isBadIfHigh) {
            // E.g. Pauses. Target 0.10. Max sensible 0.30.
            // If value 0.05 -> Great (Green).
            // If value 0.20 -> Poor (Orange).
            const max = target * 3
            percentage = Math.min(100, (value / max) * 100)
            if (value <= target) color = "bg-green-500"
            else if (value <= target * 1.5) color = "bg-yellow-500"
            else color = "bg-orange-500"
        } else {
            // E.g. Speed. Target 120. Max 200.
            const max = target * 1.5
            percentage = Math.min(100, (value / max) * 100)
            if (value >= target) color = "bg-green-500"
            else if (value >= target * 0.7) color = "bg-yellow-500"
            else color = "bg-orange-500"
        }

        return (
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>{label}</span>
                    <span>{isBadIfHigh ? (value * 100).toFixed(0) + '%' : value.toFixed(0) + ' ' + unit}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto space-y-6"
        >
            {/* 1. Main Score Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <BarChart2 className="w-32 h-32 text-blue-500" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Circle Score */}
                    <div className="flex-shrink-0">
                        <CircleProgress
                            value={score * 100}
                            color={score > 0.75 ? "text-green-500" : score > 0.5 ? "text-blue-500" : "text-orange-500"}
                            label={hideMetrics ? "Score" : "Fluency"}
                        />
                    </div>

                    {/* Feedback Text */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                            {score > 0.75 ? "Impressive!" : score > 0.5 ? "Good Progress" : "Keep Practicing"}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            {feedback}
                        </p>
                    </div>
                </div>

                {/* Metrics Grid - Hide if hideMetrics is true */}
                {!hideMetrics && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <MetricBar
                            label="Pace"
                            value={metrics.speechSpeed}
                            target={130}
                            unit="wpm"
                            isBadIfHigh={false}
                        />
                        <MetricBar
                            label="Pauses"
                            value={metrics.pauseRatio}
                            target={0.15}
                            unit=""
                            isBadIfHigh={true}
                        />
                        <MetricBar
                            label="Clarity (Fillers)"
                            value={metrics.fillerRate}
                            target={0.05}
                            unit=""
                            isBadIfHigh={true}
                        />
                    </div>
                )}
            </div>

            {/* 2. Micro Lesson / Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {microLesson ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm uppercase tracking-wider">
                                <Zap className="w-4 h-4" /> Recommended Drill
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{microLesson.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">"{microLesson.drill}"</p>
                        </div>
                        <Button onClick={onDrill} size="sm" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Start Drill
                        </Button>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center space-y-2 opacity-60">
                        <CheckCircle className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No specific drills needed right now.</p>
                    </div>
                )}

                {/* Next Button */}
                <div onClick={onNext} className="group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-center items-center text-center space-y-1 relative overflow-hidden">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Next Challenge
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-blue-500/70">Tap to continue</span>
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

        </motion.div>
    )
}
