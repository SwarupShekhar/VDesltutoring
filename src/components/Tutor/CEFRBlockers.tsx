"use client"

import { useEffect, useState } from "react"
import { AlertCircle, TrendingUp, Clock, Target } from "lucide-react"

interface Blocker {
    category: string
    frequency: number
    detectedWords: string[]
    upgrades: string[]
    explanation: string
    targetLevel: string
    currentLimit: string
    lastDetected: Date
}

interface CEFRBlockersProps {
    studentId: string
    className?: string
}

export function CEFRBlockers({ studentId, className = "" }: CEFRBlockersProps) {
    const [blockers, setBlockers] = useState<Blocker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [student, setStudent] = useState<any>(null)

    useEffect(() => {
        async function fetchBlockers() {
            try {
                const response = await fetch(`/api/tutor/students/${studentId}/cefr-blockers`)
                if (!response.ok) throw new Error("Failed to fetch blockers")

                const data = await response.json()
                setBlockers(data.blockers)
                setStudent(data.student)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        if (studentId) {
            fetchBlockers()
        }
    }, [studentId])

    if (loading) {
        return (
            <div className={`p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 ${className}`}>
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
        )
    }

    if (blockers.length === 0) {
        return (
            <div className={`p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 ${className}`}>
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">No Blockers Detected</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            {student?.name} is not showing any vocabulary ceilings in the last 14 days.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            What's Blocking Promotion
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {student?.name}'s vocabulary ceilings preventing {student?.currentLevel} → {student?.targetLevel} progression
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-medium">Last 14 days</span>
                    </div>
                </div>
            </div>

            {/* Blockers List */}
            <div className="space-y-4">
                {blockers.map((blocker, index) => (
                    <div
                        key={`${blocker.category}-${index}`}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow"
                    >
                        {/* Blocker Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {blocker.category} Limitation
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-medium">
                                            Detected {blocker.frequency}x
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {blocker.currentLimit} → {blocker.targetLevel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {index === 0 && (
                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                                    PRIMARY BLOCKER
                                </span>
                            )}
                        </div>

                        {/* Explanation */}
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {blocker.explanation}
                            </p>
                        </div>

                        {/* Overused Words */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                Overused Words
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {blocker.detectedWords.slice(0, 10).map((word, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md font-medium"
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Required Upgrades */}
                        <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                Required Upgrades
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {blocker.upgrades.slice(0, 10).map((word, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-md font-medium"
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
