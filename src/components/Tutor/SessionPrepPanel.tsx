"use client"

import { useEffect, useState } from "react"
import { Target, CheckCircle2, AlertTriangle } from "lucide-react"

interface TopBlocker {
    category: string
    frequency: number
    detectedWords: string[]
    upgrades: string[]
    explanation: string
    targetLevel: string
    currentLimit: string
}

interface SessionPrepData {
    student: {
        id: string
        name: string
        currentLevel: string
        targetLevel: string
    }
    topBlockers: TopBlocker[]
}

interface SessionPrepPanelProps {
    studentId: string
    onReady?: () => void
}

export function SessionPrepPanel({ studentId, onReady }: SessionPrepPanelProps) {
    const [data, setData] = useState<SessionPrepData | null>(null)
    const [loading, setLoading] = useState(true)
    const [checklist, setChecklist] = useState({
        reviewedLevel: false,
        reviewedBlockers: false,
        preparedExercises: false
    })

    useEffect(() => {
        async function fetchPrepData() {
            try {
                const response = await fetch(`/api/tutor/students/${studentId}/cefr-blockers`)
                if (!response.ok) throw new Error("Failed to fetch prep data")

                const result = await response.json()
                setData({
                    student: result.student,
                    topBlockers: result.topBlockers
                })
            } catch (err) {
                console.error("Error fetching session prep data:", err)
            } finally {
                setLoading(false)
            }
        }

        if (studentId) {
            fetchPrepData()
        }
    }, [studentId])

    const handleChecklistChange = (key: keyof typeof checklist) => {
        const newChecklist = { ...checklist, [key]: !checklist[key] }
        setChecklist(newChecklist)

        // Check if all items are checked
        if (Object.values(newChecklist).every(v => v)) {
            onReady?.()
        }
    }

    const allChecked = Object.values(checklist).every(v => v)

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">Unable to load session prep data</p>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Session Prep: {data.student.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Review key blockers before your session starts
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-blue-900 dark:text-blue-100">
                        {data.student.currentLevel} → {data.student.targetLevel}
                    </span>
                </div>
            </div>

            {/* Top Blockers */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Top 2 Blockers to Address
                </h3>

                {data.topBlockers.length === 0 ? (
                    <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <p className="text-green-800 dark:text-green-200 font-medium">
                            ✨ No blockers detected! Student is progressing well.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {data.topBlockers.map((blocker, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">
                                            {index + 1}. {blocker.category} Limitation
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Detected {blocker.frequency}x in last 14 days
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                                    {blocker.explanation}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                            Overusing:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {blocker.detectedWords.slice(0, 5).map((word, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded"
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                            Coach to use:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {blocker.upgrades.slice(0, 5).map((word, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Coaching Focus Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                    Coaching Focus Checklist
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={checklist.reviewedLevel}
                            onChange={() => handleChecklistChange("reviewedLevel")}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            Reviewed student's current level ({data.student.currentLevel}) and target ({data.student.targetLevel})
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={checklist.reviewedBlockers}
                            onChange={() => handleChecklistChange("reviewedBlockers")}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            Reviewed top {data.topBlockers.length} blocker{data.topBlockers.length !== 1 ? 's' : ''} and upgrade vocabulary
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={checklist.preparedExercises}
                            onChange={() => handleChecklistChange("preparedExercises")}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            Prepared exercises targeting identified weaknesses
                        </span>
                    </label>
                </div>

                {allChecked && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <p className="text-green-800 dark:text-green-200 font-medium">
                            Ready to start session!
                        </p>
                    </div>
                )}
            </div>

            {/* Read-Only Notice */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    📋 This data is read-only. CEFR levels are automatically assigned by the system based on student performance.
                </p>
            </div>
        </div>
    )
}
