"use client"

import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown } from 'lucide-react'

interface WeaknessListProps {
    weaknesses: string[]
    className?: string
    maxItems?: number
}

/**
 * WeaknessList - What holds you back
 * 
 * Shows the user's main speaking weaknesses in a clear,
 * actionable format. Not to discourage, but to focus.
 */
export function WeaknessList({
    weaknesses,
    className = "",
    maxItems = 4
}: WeaknessListProps) {
    const displayItems = weaknesses.slice(0, maxItems)

    if (weaknesses.length === 0) {
        return (
            <div className={`p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 ${className}`}>
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <TrendingDown className="w-5 h-5 rotate-180" />
                    </div>
                    <div>
                        <h3 className="font-semibold">No major weaknesses detected</h3>
                        <p className="text-sm opacity-80">Keep up the excellent work!</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`p-6 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    What holds you back
                </h3>
            </div>

            <ul className="space-y-3">
                {displayItems.map((weakness, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                    >
                        <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {weakness}
                        </span>
                    </motion.li>
                ))}
            </ul>

            {weaknesses.length > maxItems && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    +{weaknesses.length - maxItems} more areas to improve
                </p>
            )}
        </div>
    )
}

/**
 * StrengthsList - What you do well
 * 
 * Shows the user's speaking strengths to balance the weaknesses.
 */
export function StrengthsList({
    strengths,
    className = "",
    maxItems = 3
}: {
    strengths: string[]
    className?: string
    maxItems?: number
}) {
    const displayItems = strengths.slice(0, maxItems)

    if (strengths.length === 0) return null

    return (
        <div className={`p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 rotate-180" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    Your strengths
                </h3>
            </div>

            <ul className="space-y-3">
                {displayItems.map((strength, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                    >
                        <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {strength}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </div>
    )
}
