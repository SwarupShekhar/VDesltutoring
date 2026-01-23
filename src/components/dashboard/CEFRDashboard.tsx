"use client"

import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Award } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { SkillRadar } from './SkillRadar'
import { SkillCard } from './SkillCard'
import { CEFRBadge } from './CEFRBadge'
import { WeaknessPanel } from './WeaknessPanel'
import type { CEFRProfile, Skill } from '@/lib/cefrEngine'
import { SKILL_LABELS, generateProfileSummary } from '@/lib/cefrEngine'
import { LevelUpModal } from './LevelUpModal'
import { CEFR_MODEL_VERSION as CURRENT_VERSION } from "@/lib/assessment/updateUserFluencyProfile"
import { AssessmentUpdateBanner } from "./AssessmentUpdateBanner"
import { LevelExplanation } from "./LevelExplanation"

interface CEFRDashboardProps {
    profile: CEFRProfile
    onPractice?: (mode: Skill | 'auto') => void
    className?: string
    trialCooldown?: boolean
    timeUntilNextTrial?: number
    dict?: any
    delta?: {
        scoreChange: number;
        confidenceChange: 'improved' | 'declined' | 'stable';
        lastWordCount: number;
        improvementNote: string;
    } | null;
    cefrModelVersion?: string;
    assessmentAudit?: any;
    blockers?: any;
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
    className = "",
    trialCooldown = false,
    timeUntilNextTrial = 0,
    dict = {},
    delta = null,
    cefrModelVersion,
    assessmentAudit,
    blockers
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

    const [showCelebration, setShowCelebration] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const search = new URLSearchParams(window.location.search)
            if (search.get('celebrate') === 'true') {
                setShowCelebration(true)
                const newUrl = window.location.pathname
                window.history.replaceState({}, '', newUrl)
            }
        }
    }, [])

    return (
        <div className={`space-y-8 ${className}`}>
            {showCelebration && (
                <LevelUpModal
                    level={profile.overall.cefr}
                    onClose={() => setShowCelebration(false)}
                    dict={dict}
                />
            )}

            <AssessmentUpdateBanner
                currentVersion={CURRENT_VERSION}
                profileVersion={cefrModelVersion}
                onUpdate={() => router.push("/ai-tutor")}
            />

            <LevelExplanation
                profile={profile}
                audit={assessmentAudit}
                blockers={blockers}
            />

            {/* NEW: What's Changed Section */}
            {delta && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col md:flex-row items-center justify-between p-5 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-white/5 to-emerald-500/5 border border-indigo-500/10 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${delta.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            <TrendingUp className={`w-6 h-6 ${delta.scoreChange < 0 ? 'rotate-180' : ''}`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">What's changed since last session</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {delta.scoreChange > 0 ? `+${delta.scoreChange}` : delta.scoreChange} Fluency Points
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${delta.confidenceChange === 'improved' ? 'bg-emerald-500 text-white' : delta.confidenceChange === 'declined' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    Confidence {delta.confidenceChange}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm font-medium text-slate-600 dark:text-gray-400 italic">
                        "{delta.improvementNote}"
                    </div>
                </motion.div>
            )}

            {/* Hero Section: Overall Level */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Your English Level
                </h1>
                <div className="flex flex-col items-center justify-center mb-4 gap-2">
                    <CEFRBadge
                        level={profile.overall.cefr}
                        score={profile.overall.score}
                        size="xl"
                        showDescription
                    />
                    {profile.isPreliminary && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Preliminary Assessment
                        </div>
                    )}
                </div>
                {profile.speakingTime > 0 && (
                    <div className="flex flex-col items-center gap-3">
                        {/* Confidence Band Section */}
                        {profile.confidenceBand && (
                            <div className="flex flex-col items-center p-4 max-w-lg bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Speech Control:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${profile.confidenceBand === 'High' ? 'bg-emerald-500 text-white' :
                                        profile.confidenceBand === 'Medium' ? 'bg-blue-500 text-white' :
                                            'bg-amber-500 text-white'
                                        }`}>
                                        {profile.confidenceBand} Confidence
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 italic text-center">
                                    "{profile.confidenceExplanation}"
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                Based on {Math.round(profile.speakingTime)} seconds of speaking
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Challenge Gate: The Boss Fight Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex justify-center -mt-4 mb-8"
            >
                {/* Calculate next level safely */}
                {(() => {
                    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                    const currentIdx = levels.indexOf(profile.overall.cefr)
                    const nextLevel = levels[currentIdx + 1]

                    if (!nextLevel) return null // Already C2

                    const isCooldown = trialCooldown;
                    const hoursLeft = timeUntilNextTrial;

                    return (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => !isCooldown && router.push(`/ai-tutor?mode=challenge&targetLevel=${nextLevel}`)}
                                disabled={isCooldown}
                                className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 ${isCooldown
                                    ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                    : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white text-white dark:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span>{isCooldown ? (dict?.gamification?.nextTrialLocked || `Next Trial Locked`) : (dict?.gamification?.attemptTrial?.replace('{level}', nextLevel) || `Attempt ${nextLevel} Trial`)}</span>
                                    {isCooldown ? <Clock className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                                </span>
                                {/* Shiny effect (only when active) */}
                                {!isCooldown && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />}
                            </button>
                            {isCooldown && (
                                <span className="text-xs font-semibold text-slate-500 animate-pulse">
                                    {(dict?.gamification?.availableIn || 'Available in {hours} hours').replace('{hours}', hoursLeft)}
                                </span>
                            )}
                        </div>
                    )
                })()}
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
