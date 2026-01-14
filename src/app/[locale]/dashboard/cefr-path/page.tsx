"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Target, TrendingUp, AlertCircle, Lock, CheckCircle2, Trophy, Sparkles } from "lucide-react"
import { getCEFRIdentity } from "@/lib/cefr-helpers"
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers"

interface CEFRPathData {
    assessed?: boolean
    currentLevel: CEFRLevel
    targetLevel: CEFRLevel
    persona: string
    progress: number
    gates: {
        thinking: number
        expression: number
        fluency: number
    }
    blockers: Array<{
        type: string
        overused: string[]
        needed: string[]
        reason: string
    }>
    nextActions: Array<{
        type: "LIVE_PRACTICE" | "BOOK_COACH" | "ATTEMPT_TRIAL"
        label: string
        recommended?: boolean
        locked?: boolean
    }>
}

export default function CEFRPathPage() {
    const [data, setData] = useState<CEFRPathData | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchPath() {
            try {
                const response = await fetch("/api/user/cefr-path")
                if (!response.ok) throw new Error("Failed to fetch CEFR path")
                const result = await response.json()

                if (result.assessed === false) {
                    router.push("/ai-tutor")
                    return
                }

                setData(result)
            } catch (error) {
                console.error("Error fetching CEFR path:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPath()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your path...</p>
                </motion.div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400">Failed to load CEFR path</p>
                </div>
            </div>
        )
    }

    const progressPercent = Math.round(data.progress * 100)
    const currentIdentity = getCEFRIdentity(data.currentLevel)
    const targetIdentity = getCEFRIdentity(data.targetLevel)
    const isC2 = data.currentLevel === "C2"

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, ${currentIdentity.color}40, transparent)` }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, ${targetIdentity.color}40, transparent)` }}
                />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-b border-white/10 bg-slate-900/30 backdrop-blur-xl relative z-10"
            >
                <div className="max-w-5xl mx-auto px-8 py-6">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold">Your Path to Next Level</h1>
                    <p className="text-slate-400 mt-2">
                        {isC2 ? "You've reached the pinnacle" : `Track your progress from ${data.currentLevel} to ${data.targetLevel}`}
                    </p>
                </div>
            </motion.header>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="max-w-5xl mx-auto px-8 py-12 space-y-12 relative z-10"
            >
                {/* C2 Achievement Banner */}
                {isC2 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`bg-gradient-to-br ${currentIdentity.bgGradient} border-2 ${currentIdentity.borderColor} rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl bg-opacity-80`}
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-3xl"
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Trophy className="w-12 h-12" style={{ color: currentIdentity.color }} />
                                </motion.div>
                                <div>
                                    <h2 className="text-3xl font-bold">You are now:</h2>
                                    <p className="text-2xl font-bold" style={{ color: currentIdentity.color }}>
                                        C2 — {currentIdentity.title}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <p className="text-lg text-slate-700 dark:text-slate-300">{currentIdentity.promise}</p>
                                <div>
                                    <p className="font-semibold mb-2">You can:</p>
                                    <ul className="space-y-2">
                                        {currentIdentity.capabilities.map((cap, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle2 className="w-5 h-5" style={{ color: currentIdentity.color }} />
                                                <span>{cap}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {currentIdentity.achievement && (
                                <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4 border border-amber-300/30 dark:border-amber-700/30 backdrop-blur-sm">
                                    <p className="text-center font-bold" style={{ color: currentIdentity.color }}>
                                        {currentIdentity.achievement}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Level Path Visual */}
                {!isC2 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={`bg-gradient-to-br ${currentIdentity.bgGradient} border-2 ${currentIdentity.borderColor} rounded-2xl p-8 backdrop-blur-xl bg-opacity-80 shadow-2xl`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: [
                                            `0 0 20px ${currentIdentity.color}40`,
                                            `0 0 40px ${currentIdentity.color}60`,
                                            `0 0 20px ${currentIdentity.color}40`,
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentIdentity.gradient} flex items-center justify-center text-2xl font-bold mb-2`}
                                >
                                    {data.currentLevel}
                                </motion.div>
                                <p className="text-sm font-semibold" style={{ color: currentIdentity.color }}>
                                    {currentIdentity.title}
                                </p>
                            </motion.div>

                            <div className="flex-1 mx-8">
                                <div className="relative">
                                    <div className="h-3 bg-white/30 dark:bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${currentIdentity.gradient}`}
                                        />
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="absolute -top-10 left-1/2 -translate-x-1/2"
                                    >
                                        <span className="text-3xl font-bold" style={{ color: currentIdentity.color }}>
                                            {progressPercent}%
                                        </span>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center"
                            >
                                <div
                                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold mb-2 backdrop-blur-sm"
                                    style={{ borderColor: targetIdentity.color }}
                                >
                                    {data.targetLevel}
                                </div>
                                <p className="text-sm font-semibold" style={{ color: targetIdentity.color }}>
                                    {targetIdentity.title}
                                </p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center"
                        >
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {currentIdentity.promise} → {targetIdentity.promise}
                            </p>
                        </motion.div>
                    </motion.section>
                )}

                {/* Identity & Goal */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <motion.div
                            animate={{
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Target className="w-8 h-8" style={{ color: currentIdentity.color }} />
                        </motion.div>
                        <h2 className="text-2xl font-bold">Your Journey</h2>
                    </div>
                    <div className="space-y-3">
                        <p className="text-lg">
                            <span className="font-bold" style={{ color: currentIdentity.color }}>
                                {data.currentLevel} — {currentIdentity.title}
                            </span>
                        </p>
                        <p className="text-slate-400">{currentIdentity.description}</p>
                        {!isC2 && (
                            <p className="text-slate-400">
                                Your goal: <span className="font-semibold" style={{ color: targetIdentity.color }}>
                                    {data.targetLevel} {targetIdentity.title}
                                </span> — {targetIdentity.promise}
                            </p>
                        )}
                    </div>
                </motion.section>

                {/* CEFR Gates */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                        <h2 className="text-2xl font-bold">CEFR Gates</h2>
                    </div>
                    <div className="space-y-6">
                        <GateMeter label="Thinking" description="Abstract reasoning ability" value={data.gates.thinking} delay={0} />
                        <GateMeter label="Expression" description="Vocabulary sophistication" value={data.gates.expression} delay={0.1} />
                        <GateMeter label="Fluency" description="Speaking confidence" value={data.gates.fluency} delay={0.2} />
                    </div>
                </motion.section>

                {/* Blockers */}
                {data.blockers.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <AlertCircle className="w-8 h-8 text-amber-400" />
                            <h2 className="text-2xl font-bold">What's Blocking You</h2>
                        </div>
                        <div className="space-y-6">
                            {data.blockers.map((blocker, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
                                >
                                    <h3 className="font-bold text-lg mb-3">{blocker.type} Limitation</h3>
                                    <p className="text-slate-300 text-sm mb-4">{blocker.reason}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 mb-2">Overusing:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {blocker.overused.map((word, idx) => (
                                                    <motion.span
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-md border border-red-500/30 backdrop-blur-sm"
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 mb-2">Need to use:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {blocker.needed.map((word, idx) => (
                                                    <motion.span
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-md border border-green-500/30 backdrop-blur-sm"
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Next Actions */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
                >
                    <h2 className="text-2xl font-bold mb-6">Recommended Next Steps</h2>
                    <div className="grid gap-4">
                        {data.nextActions.map((action, index) => (
                            <ActionButton key={index} action={action} delay={index * 0.1} />
                        ))}
                    </div>
                </motion.section>
            </motion.main>
        </div>
    )
}

function GateMeter({ label, description, value, delay }: { label: string; description: string; value: number; delay: number }) {
    const percent = Math.round(value * 100)
    const status = value >= 0.8 ? "excellent" : value >= 0.5 ? "good" : "needs-work"

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{percent}%</span>
                    {status === "excellent" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {status === "needs-work" && <AlertCircle className="w-5 h-5 text-amber-400" />}
                </div>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                    className={`h-full ${status === "excellent"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : status === "good"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        }`}
                />
            </div>
        </motion.div>
    )
}

function ActionButton({ action, delay }: { action: CEFRPathData["nextActions"][0]; delay: number }) {
    const router = useRouter()

    const handleClick = () => {
        if (action.locked) return

        switch (action.type) {
            case "LIVE_PRACTICE":
                router.push("/live-practice")
                break
            case "BOOK_COACH":
                router.push("/booking")
                break
            case "ATTEMPT_TRIAL":
                router.push("/ai-tutor?mode=challenge")
                break
        }
    }

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: action.locked ? 1 : 1.02 }}
            whileTap={{ scale: action.locked ? 1 : 0.98 }}
            onClick={handleClick}
            disabled={action.locked}
            className={`
        relative px-6 py-4 rounded-xl border-2 text-left transition-all
        ${action.recommended && !action.locked
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25"
                    : action.locked
                        ? "bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-50"
                        : "bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm"
                }
      `}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg">{action.label}</p>
                    {action.recommended && !action.locked && (
                        <motion.p
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-sm text-blue-200 mt-1"
                        >
                            ✨ Recommended for you
                        </motion.p>
                    )}
                    {action.locked && (
                        <p className="text-sm text-slate-400 mt-1">Unlock by reaching 80% progress</p>
                    )}
                </div>
                {action.locked && <Lock className="w-6 h-6 text-slate-500" />}
            </div>
        </motion.button>
    )
}
