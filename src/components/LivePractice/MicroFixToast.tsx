"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, AlertCircle } from "lucide-react"

interface MicroFix {
    id: string
    category: string
    detectedWords: string[]
    upgrades: string[]
    explanation: string
    targetLevel: string
    currentLimit: string
    createdAt: Date
}

interface MicroFixToastProps {
    sessionId: string
    onDismiss?: () => void
}

export function MicroFixToast({ sessionId, onDismiss }: MicroFixToastProps) {
    const [microFix, setMicroFix] = useState<MicroFix | null>(null)
    const [dismissed, setDismissed] = useState(false)
    const [lastSeenId, setLastSeenId] = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) return

        // Poll for new micro-fixes every 10 seconds
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/live-practice/${sessionId}/micro-fix`)
                const data = await response.json()

                if (data.microFix && data.microFix.id !== lastSeenId) {
                    setMicroFix(data.microFix)
                    setDismissed(false)
                    setLastSeenId(data.microFix.id)
                }
            } catch (error) {
                console.error("Error fetching micro-fix:", error)
            }
        }, 10000) // Poll every 10 seconds

        return () => clearInterval(interval)
    }, [sessionId, lastSeenId])

    const handleDismiss = () => {
        setDismissed(true)
        onDismiss?.()
    }

    if (!microFix || dismissed) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-6 right-6 z-50 max-w-md"
            >
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200 dark:border-amber-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold text-sm">Vocabulary Ceiling Detected</span>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                {microFix.category} Limitation
                            </span>
                        </div>

                        {/* Explanation */}
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {microFix.explanation}
                        </p>

                        {/* Detected Words */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                You're overusing:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {microFix.detectedWords.slice(0, 5).map((word, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-md font-medium"
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Upgrades */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Try using instead:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {microFix.upgrades.slice(0, 5).map((word, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md font-medium"
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Level Info */}
                        <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Current:</span> {microFix.currentLimit} →{" "}
                                <span className="font-semibold">Target:</span> {microFix.targetLevel}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
