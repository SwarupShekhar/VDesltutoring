"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, ArrowRight, AlertCircle, Sparkles, Lock, PlayCircle } from "lucide-react"
import { getCEFRIdentity } from "@/lib/cefr-helpers"
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers"

interface CEFRPathSummary {
    assessed: boolean
    currentLevel?: CEFRLevel
    targetLevel?: CEFRLevel
    progress?: number
    primaryBlocker?: string | null
    message?: string
}

export function CEFRPathCard() {
    const [data, setData] = useState<CEFRPathSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchSummary() {
            try {
                const response = await fetch("/api/user/cefr-path")
                if (!response.ok) throw new Error("Failed to fetch")

                const result = await response.json()

                if (result.assessed === false) {
                    setData({ assessed: false, message: result.message })
                } else {
                    setData({
                        assessed: true,
                        currentLevel: result.currentLevel,
                        targetLevel: result.targetLevel,
                        progress: result.progress,
                        primaryBlocker: result.blockers[0]?.type || null
                    })
                }
            } catch (error) {
                console.error("Error fetching CEFR path:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSummary()
    }, [])

    if (loading) {
        return (
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    if (!data) return null

    // Unassessed state - encourage first assessment
    if (!data.assessed) {
        return (
            <div
                onClick={() => router.push("/ai-tutor")}
                className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-white/20 backdrop-blur-md p-6 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Discover Your Level</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Unlock your personalized path
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 text-sm text-slate-600 dark:text-slate-300">
                    <PlayCircle className="w-4 h-4 text-indigo-500" />
                    <span>Take a 2-minute diagnostic conversation</span>
                </div>
            </div>
        )
    }

    // Assessed state - show progress with premium visual identity
    const progressPercent = Math.round((data.progress || 0) * 100)
    const currentIdentity = getCEFRIdentity(data.currentLevel!)
    const targetIdentity = getCEFRIdentity(data.targetLevel!)

    return (
        <div
            onClick={() => router.push("/dashboard/cefr-path")}
            className={`relative overflow-hidden bg-gradient-to-br ${currentIdentity.bgGradient} rounded-2xl border ${currentIdentity.borderColor} p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group`}
        >
            {/* Background glow effect */}
            <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ background: currentIdentity.color }}
            ></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentIdentity.gradient} flex items-center justify-center shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300`}
                        >
                            <span className="text-xl font-bold text-white tracking-widest">{data.currentLevel}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your Path</h3>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm border border-white/10" style={{ color: currentIdentity.color }}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <p className="text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span style={{ color: currentIdentity.color }}>{currentIdentity.title}</span>
                                <ArrowRight className="w-3 h-3 opacity-50" />
                                <span className="opacity-70">{data.targetLevel} {targetIdentity.title}</span>
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 dark:group-hover:bg-black/20 transition-all">
                        <ArrowRight className={`w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:translate-x-0.5 transition-transform`} />
                    </div>
                </div>

                {/* Premium Progress Bar */}
                <div className="mb-4">
                    <div className="h-2.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <div
                            className={`h-full bg-gradient-to-r ${currentIdentity.gradient} shadow-[0_0_10px_rgba(0,0,0,0.1)] relative`}
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Primary Blocker or Achievement */}
                {data.primaryBlocker ? (
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/10 backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                            Blocker: <span className="font-semibold text-amber-700 dark:text-amber-400">{data.primaryBlocker}</span>
                        </span>
                    </div>
                ) : progressPercent >= 80 && (
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/20 dark:bg-slate-800/30 border border-white/10 backdrop-blur-sm" style={{ color: targetIdentity.color }}>
                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">Ready for {data.targetLevel} trial!</span>
                    </div>
                )}
            </div>
        </div>
    )
}
