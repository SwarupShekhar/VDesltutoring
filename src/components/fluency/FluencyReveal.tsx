"use client"

import { motion } from 'framer-motion'
import { FluencyRadar } from './FluencyRadar'
import { CefrScoreCard } from './CefrScoreCard'
import { WeaknessList, StrengthsList } from './WeaknessList'
import { FocusCard } from './FocusCard'
import { ProgressDelta } from './ProgressDelta'
import type { FluencyProfile } from './types'

interface FluencyRevealProps {
    profile: FluencyProfile
    className?: string
    showProgress?: boolean
    onPractice?: () => void
}

/**
 * FluencyReveal - Main Container Component
 * 
 * This is the heart of Englivo's credibility.
 * Shows: identity, weaknesses, focus, and proof — in one screen.
 * 
 * No other ESL app provides this level of insight.
 */
export function FluencyReveal({
    profile,
    className = "",
    showProgress = true,
    onPractice
}: FluencyRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`space-y-8 ${className}`}
        >
            {/* Identity Header */}
            <div className="text-center">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2"
                >
                    {profile.identity.name}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-slate-600 dark:text-slate-400"
                >
                    {profile.identity.description}
                </motion.p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                {/* Left Column - Radar + CEFR */}
                <div className="space-y-6">
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
                            Your Speaking Shape
                        </h3>
                        <FluencyRadar radar={profile.radar} size="lg" />
                    </motion.div>

                    {/* CEFR Score Card */}
                    <CefrScoreCard cefr={profile.cefr} showProgress />
                </div>

                {/* Right Column - Insights */}
                <div className="space-y-6">
                    {/* Focus Card (Priority) */}
                    <FocusCard
                        focus={profile.focus}
                        onAction={onPractice}
                    />

                    {/* Weaknesses */}
                    <WeaknessList weaknesses={profile.weaknesses} />

                    {/* Strengths (if any) */}
                    {profile.strengths && profile.strengths.length > 0 && (
                        <StrengthsList strengths={profile.strengths} />
                    )}
                </div>
            </div>

            {/* Progress Section (Full Width) */}
            {showProgress && profile.progress && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <ProgressDelta progress={profile.progress} />
                </motion.div>
            )}
        </motion.div>
    )
}

/**
 * FluencyRevealCompact - Condensed version for sidebars or summaries
 */
export function FluencyRevealCompact({
    profile,
    className = ""
}: {
    profile: FluencyProfile
    className?: string
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* CEFR + Identity */}
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {profile.cefr.level}
                    </div>
                    <div className="text-xs text-slate-500">{profile.cefr.score}/100</div>
                </div>
                <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                        {profile.identity.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {profile.identity.description}
                    </div>
                </div>
            </div>

            {/* Mini Radar */}
            <FluencyRadar radar={profile.radar} size="sm" />

            {/* Focus */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                    Focus: {profile.focus.title}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                    {profile.focus.instruction}
                </div>
            </div>
        </div>
    )
}

export default FluencyReveal
