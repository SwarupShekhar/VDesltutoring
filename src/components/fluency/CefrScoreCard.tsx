"use client"

import { motion } from 'framer-motion'
import type { CefrScore } from './types'
import { CEFR_COLORS, CEFR_LABELS } from './types'

interface CefrScoreCardProps {
    cefr: CefrScore
    className?: string
    showProgress?: boolean
    nextLevelPoints?: number
}

/**
 * CefrScoreCard - The emotional hook
 * 
 * Displays the CEFR level prominently with score and description.
 * This is what makes the user feel their level is real and meaningful.
 */
export function CefrScoreCard({
    cefr,
    className = "",
    showProgress = false,
    nextLevelPoints
}: CefrScoreCardProps) {
    const colors = CEFR_COLORS[cefr.level]
    const label = cefr.label || CEFR_LABELS[cefr.level]

    // Calculate progress within current level
    const levelRanges: Record<CefrScore['level'], { min: number; max: number }> = {
        "A1": { min: 0, max: 24 },
        "A2": { min: 25, max: 39 },
        "B1": { min: 40, max: 54 },
        "B2": { min: 55, max: 69 },
        "C1": { min: 70, max: 84 },
        "C2": { min: 85, max: 100 }
    }

    const range = levelRanges[cefr.level]
    const progressInLevel = ((cefr.score - range.min) / (range.max - range.min)) * 100

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${className}`}
        >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Level Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wide mb-4">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    CEFR Level
                </div>

                {/* Big Level Display */}
                <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-7xl font-black tracking-tight">
                        {cefr.level}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold opacity-90">
                            {cefr.score}
                        </span>
                        <span className="text-sm opacity-70">/100</span>
                    </div>
                </div>

                {/* Label */}
                <p className="text-xl font-medium opacity-90 mb-4">
                    "{label}"
                </p>

                {/* Progress bar within level */}
                {showProgress && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs opacity-80 mb-1">
                            <span>{range.min}</span>
                            <span>{range.max}</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progressInLevel, 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            />
                        </div>
                        {nextLevelPoints !== undefined && nextLevelPoints > 0 && (
                            <p className="mt-2 text-sm opacity-80">
                                {nextLevelPoints} points to next level
                            </p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

/**
 * CefrScoreCardCompact - Smaller version for tight spaces
 */
export function CefrScoreCardCompact({ cefr, className = "" }: { cefr: CefrScore; className?: string }) {
    const colors = CEFR_COLORS[cefr.level]

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${colors.gradient} text-white ${className}`}>
            <span className="text-3xl font-black">{cefr.level}</span>
            <div>
                <div className="text-lg font-bold">{cefr.score}/100</div>
                <div className="text-xs opacity-80">{CEFR_LABELS[cefr.level]}</div>
            </div>
        </div>
    )
}
