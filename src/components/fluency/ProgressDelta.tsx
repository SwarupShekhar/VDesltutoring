"use client"

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ProgressData } from './types'

interface ProgressDeltaProps {
    progress: ProgressData
    className?: string
}

/**
 * ProgressDelta - Yesterday vs Today
 * 
 * Shows the user's progress since yesterday with clear
 * visual indicators for improvement or regression.
 */
export function ProgressDelta({ progress, className = "" }: ProgressDeltaProps) {
    const { deltas } = progress

    return (
        <div className={`p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 ${className}`}>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Progress since yesterday
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricDelta
                    label="Pauses"
                    value={deltas.pauseRatio}
                    format="percent"
                    reverse
                />
                <MetricDelta
                    label="Fillers"
                    value={deltas.fillerRate}
                    format="percent"
                    reverse
                />
                <MetricDelta
                    label="Restarts"
                    value={deltas.restartRate}
                    format="percent"
                    reverse
                />
                <MetricDelta
                    label="Speed"
                    value={deltas.wpm}
                    format="wpm"
                />
            </div>

            {/* Overall fluency change */}
            {deltas.fluencyScore !== undefined && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Overall Fluency
                        </span>
                        <MetricDelta
                            label=""
                            value={deltas.fluencyScore}
                            format="score"
                            inline
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

interface MetricDeltaProps {
    label: string
    value: number
    format: 'percent' | 'wpm' | 'score'
    reverse?: boolean  // true = negative value is good (e.g., pauses)
    inline?: boolean
}

/**
 * MetricDelta - Individual metric change indicator
 */
function MetricDelta({ label, value, format, reverse = false, inline = false }: MetricDeltaProps) {
    // Determine if this is an improvement
    const isImprovement = reverse ? value < 0 : value > 0
    const isNeutral = Math.abs(value) < 0.01

    // Format the value
    let displayValue: string
    let suffix: string = ''

    switch (format) {
        case 'percent':
            displayValue = Math.abs(Math.round(value * 100)).toString()
            suffix = '%'
            break
        case 'wpm':
            displayValue = Math.abs(Math.round(value)).toString()
            suffix = ' WPM'
            break
        case 'score':
            displayValue = Math.abs(Math.round(value * 100)).toString()
            suffix = ' pts'
            break
        default:
            displayValue = Math.abs(value).toFixed(1)
    }

    // Determine colors and icon
    let colorClass: string
    let Icon: typeof TrendingUp

    if (isNeutral) {
        colorClass = 'text-slate-500 dark:text-slate-400'
        Icon = Minus
    } else if (isImprovement) {
        colorClass = 'text-emerald-600 dark:text-emerald-400'
        Icon = TrendingUp
    } else {
        colorClass = 'text-red-600 dark:text-red-400'
        Icon = TrendingDown
    }

    if (inline) {
        return (
            <div className={`flex items-center gap-1.5 ${colorClass}`}>
                <Icon className="w-4 h-4" />
                <span className="font-semibold">
                    {isNeutral ? '–' : (isImprovement ? '+' : '-')}{displayValue}{suffix}
                </span>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className={`flex items-center gap-1 ${colorClass}`}>
                <Icon className="w-4 h-4" />
                <span className="text-lg font-bold">
                    {isNeutral ? '–' : (reverse ? (value < 0 ? '-' : '+') : (value > 0 ? '+' : '-'))}
                    {displayValue}
                </span>
                <span className="text-xs">{suffix}</span>
            </div>
            {label && (
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {label}
                </span>
            )}
        </div>
    )
}

/**
 * ProgressDeltaCompact - Simplified horizontal version
 */
export function ProgressDeltaCompact({ progress, className = "" }: ProgressDeltaProps) {
    const { deltas } = progress

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 ${className}`}>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                vs yesterday:
            </span>
            <div className="flex items-center gap-3">
                <MetricDelta label="Pauses" value={deltas.pauseRatio} format="percent" reverse inline />
                <MetricDelta label="Speed" value={deltas.wpm} format="wpm" inline />
            </div>
        </div>
    )
}
