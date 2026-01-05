"use client"

import { motion } from 'framer-motion'
import { Target, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { FocusItem } from './types'

interface FocusCardProps {
    focus: FocusItem
    className?: string
    showAction?: boolean
    actionHref?: string
    onAction?: () => void
}

/**
 * FocusCard - Today's Focus
 * 
 * Shows the user's primary focus area with clear instruction
 * and an actionable practice button.
 */
export function FocusCard({
    focus,
    className = "",
    showAction = true,
    actionHref = "/practice",
    onAction
}: FocusCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 ${className}`}
        >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Today's Focus
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {focus.title}
                </h3>

                {/* Instruction */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {focus.instruction}
                </p>

                {/* Drill prompt if available */}
                {focus.drillPrompt && (
                    <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-emerald-200 dark:border-emerald-800/30 mb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Try this:
                        </p>
                        <p className="text-slate-800 dark:text-white font-medium italic">
                            "{focus.drillPrompt}"
                        </p>
                    </div>
                )}

                {/* Action button */}
                {showAction && (
                    onAction ? (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                        >
                            <Zap className="w-4 h-4" />
                            Practice this now
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link
                            href={actionHref}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                        >
                            <Zap className="w-4 h-4" />
                            Practice this now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )
                )}
            </div>
        </motion.div>
    )
}

/**
 * FocusCardCompact - Smaller version for sidebars
 */
export function FocusCardCompact({
    focus,
    className = "",
    actionHref = "/practice"
}: {
    focus: FocusItem
    className?: string
    actionHref?: string
}) {
    return (
        <div className={`p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {focus.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {focus.instruction}
                    </p>
                </div>
            </div>
            <Link
                href={actionHref}
                className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
                <Zap className="w-3 h-3" />
                Practice
            </Link>
        </div>
    )
}
