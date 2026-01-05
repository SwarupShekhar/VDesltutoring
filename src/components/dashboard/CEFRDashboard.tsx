"use client"

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Award } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { SkillRadar } from './SkillRadar'
import { SkillCard } from './SkillCard'
import { CEFRBadge } from './CEFRBadge'
import { WeaknessPanel } from './WeaknessPanel'
import type { CEFRProfile, Skill } from '@/lib/cefrEngine'
import { SKILL_LABELS, generateProfileSummary } from '@/lib/cefrEngine'

interface CEFRDashboardProps {
    profile: CEFRProfile
    onPractice?: (mode: Skill | 'auto') => void
    className?: string
}

/**
 * CEFRDashboard - Main dashboard component
 * 
 * Shows:
 * - Overall CEFR level with score
 * - Skill radar chart
 * - Individual skill cards
 * - Weakness panel with drill
 * 
 * "The only English app that proves improvement with data."
 */
export function CEFRDashboard({
    profile,
    onPractice,
    className = ""
}: CEFRDashboardProps) {
    const router = useRouter()
    const params = useParams()
    const locale = params.locale as string || 'en'

    const skills: Skill[] = ['fluency', 'pronunciation', 'grammar', 'vocabulary']

    const handlePractice = (mode: Skill | 'auto') => {
        if (onPractice) {
            onPractice(mode)
        } else {
            const modeMap: Record<string, string> = {
                fluency: 'speed',
                pronunciation: 'pronunciation',
                grammar: 'grammar',
                vocabulary: 'vocabulary',
                auto: 'auto'
            }
            router.push(`/${locale}/practice?mode=${modeMap[mode] || 'auto'}`)
        }
    }

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Hero Section: Overall Level */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Your English Level
                </h1>
                <div className="flex justify-center mb-4">
                    <CEFRBadge
                        level={profile.overall.cefr}
                        score={profile.overall.score}
                        size="xl"
                        showDescription
                    />
                </div>
                {profile.speakingTime > 0 && (
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                            Based on {Math.round(profile.speakingTime)} seconds of speaking
                        </span>
                    </div>
                )}
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Radar + Summary */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                    >
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Your Skill Shape
                        </h2>
                        <SkillRadar profile={profile} size="lg" />
                    </motion.div>

                    {/* Summary Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    Strongest
                                </span>
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {SKILL_LABELS[profile.strongest].name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {profile[profile.strongest].score}/100
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                    Focus Area
                                </span>
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {SKILL_LABELS[profile.weakest].name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {profile[profile.weakest].score}/100
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Weakness Panel */}
                <WeaknessPanel profile={profile} onPractice={handlePractice} />
            </div>

            {/* All Skills Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Skill Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <SkillCard
                                skill={skill}
                                data={profile[skill]}
                                isWeakest={skill === profile.weakest}
                                isStrongest={skill === profile.strongest}
                                onPractice={handlePractice}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * CEFRDashboardCompact - Condensed version
 */
export function CEFRDashboardCompact({
    profile,
    onPractice,
    className = ""
}: CEFRDashboardProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Overall Level */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <CEFRBadge level={profile.overall.cefr} score={profile.overall.score} size="md" />
                <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                        {profile.overall.label}
                    </div>
                    {profile.speakingTime > 0 && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Based on {Math.round(profile.speakingTime)}s of speaking
                        </div>
                    )}
                </div>
            </div>

            {/* Mini Radar */}
            <SkillRadar profile={profile} size="sm" showLegend={false} />

            {/* Weakness */}
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                    Focus: {SKILL_LABELS[profile.weakest].name}
                </div>
                <button
                    onClick={() => onPractice?.(profile.weakest)}
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                    Practice Now
                </button>
            </div>
        </div>
    )
}

export default CEFRDashboard
