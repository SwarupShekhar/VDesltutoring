"use client"

import { motion } from 'framer-motion'
import type { CEFRLevel } from '@/lib/cefrEngine'
import { CEFR_THRESHOLDS, CEFR_DESCRIPTIONS } from '@/lib/cefrEngine'

interface CEFRBadgeProps {
    level: CEFRLevel
    score?: number
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    showDescription?: boolean
    animated?: boolean
    className?: string
}

const CEFR_COLORS: Record<CEFRLevel, { bg: string; text: string; border: string; gradient: string }> = {
    "A1": {
        bg: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-300 dark:border-red-700",
        gradient: "from-red-500 to-rose-600"
    },
    "A2": {
        bg: "bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-300 dark:border-orange-700",
        gradient: "from-orange-500 to-amber-600"
    },
    "B1": {
        bg: "bg-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-300 dark:border-yellow-700",
        gradient: "from-yellow-500 to-amber-500"
    },
    "B2": {
        bg: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-700",
        gradient: "from-blue-500 to-indigo-600"
    },
    "C1": {
        bg: "bg-purple-500",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
        gradient: "from-purple-500 to-violet-600"
    },
    "C2": {
        bg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-300 dark:border-emerald-700",
        gradient: "from-emerald-500 to-teal-600"
    }
}

/**
 * CEFRBadge - Displays CEFR level prominently
 */
export function CEFRBadge({
    level,
    score,
    size = 'md',
    showLabel = true,
    showDescription = false,
    animated = true,
    className = ""
}: CEFRBadgeProps) {
    const colors = CEFR_COLORS[level]
    const { label } = CEFR_THRESHOLDS[level]
    const description = CEFR_DESCRIPTIONS[level]

    const sizes = {
        sm: { badge: 'text-lg px-3 py-1', label: 'text-xs', score: 'text-sm' },
        md: { badge: 'text-2xl px-4 py-2', label: 'text-sm', score: 'text-base' },
        lg: { badge: 'text-4xl px-6 py-3', label: 'text-base', score: 'text-lg' },
        xl: { badge: 'text-6xl px-8 py-4', label: 'text-lg', score: 'text-xl' }
    }

    const Wrapper = animated ? motion.div : 'div'
    const animationProps = animated ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: "spring" as const, stiffness: 200, damping: 15 }
    } : {}

    return (
        <Wrapper
            {...animationProps}
            className={`inline-flex flex-col items-center ${className}`}
        >
            <div className={`
                font-black rounded-xl bg-gradient-to-br ${colors.gradient} text-white
                shadow-lg ${sizes[size].badge}
            `}>
                {level}
            </div>

            {score !== undefined && (
                <div className={`mt-2 font-semibold ${colors.text} ${sizes[size].score}`}>
                    {score}/100
                </div>
            )}

            {showLabel && (
                <div className={`mt-1 font-medium text-slate-600 dark:text-slate-400 ${sizes[size].label}`}>
                    {label}
                </div>
            )}

            {showDescription && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                    {description}
                </p>
            )}
        </Wrapper>
    )
}

/**
 * CEFRBadgeInline - Compact inline version
 */
export function CEFRBadgeInline({
    level,
    score,
    className = ""
}: {
    level: CEFRLevel
    score?: number
    className?: string
}) {
    const colors = CEFR_COLORS[level]

    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <span className={`px-2 py-0.5 rounded font-bold text-white text-sm ${colors.bg}`}>
                {level}
            </span>
            {score !== undefined && (
                <span className={`font-semibold ${colors.text}`}>
                    {score}/100
                </span>
            )}
        </span>
    )
}

/**
 * CEFRProgressBar - Shows progress within current level
 */
export function CEFRProgressBar({
    level,
    score,
    className = ""
}: {
    level: CEFRLevel
    score: number
    className?: string
}) {
    const colors = CEFR_COLORS[level]
    const { min, max } = CEFR_THRESHOLDS[level]
    const progress = ((score - min) / (max - min)) * 100

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${colors.bg} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                />
            </div>
        </div>
    )
}
