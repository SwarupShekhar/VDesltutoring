"use client"

import { motion } from 'framer-motion'
import { AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react'
import type { CEFRProfile, Skill } from '@/lib/cefrEngine'
import {
    SKILL_LABELS,
    getSkillWeakness,
    getSkillDrill,
    getImprovementSuggestion
} from '@/lib/cefrEngine'

interface WeaknessPanelProps {
    profile: CEFRProfile
    onPractice?: (skill: Skill | 'auto') => void
    className?: string
}

/**
 * WeaknessPanel - Shows focused weakness analysis
 * 
 * What went wrong, why it matters, a drill, and a "Try Now" button.
 */
export function WeaknessPanel({
    profile,
    onPractice,
    className = ""
}: WeaknessPanelProps) {
    const weakest = profile.weakest
    const weakestData = profile[weakest]
    const skillInfo = SKILL_LABELS[weakest]
    const weakness = getSkillWeakness(weakest, weakestData.score)
    const drill = getSkillDrill(weakest)
    const suggestion = getImprovementSuggestion(weakest, weakestData.score)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        Focus Area: {skillInfo.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Your lowest skill score: {weakestData.score}/100
                    </p>
                </div>
            </div>

            {/* What went wrong */}
            <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-2">
                    What went wrong
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                    {weakness}
                </p>
            </div>

            {/* Why it matters */}
            <div className="mb-4 p-3 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-amber-500" />
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
                            Why it matters
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {weakest === 'fluency' && "Fluency is 35% of your overall score. Improving it will significantly boost your CEFR level."}
                            {weakest === 'pronunciation' && "Clear pronunciation helps listeners understand you instantly. It's 25% of your overall score."}
                            {weakest === 'grammar' && "Correct grammar makes your speech sound professional and credible. It's 20% of your overall score."}
                            {weakest === 'vocabulary' && "Rich vocabulary demonstrates depth of knowledge and makes you more expressive. It's 20% of your overall score."}
                        </p>
                    </div>
                </div>
            </div>

            {/* The drill */}
            <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    {drill.title}
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                    {drill.instruction}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    "{drill.prompt}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Duration: {drill.duration}
                </p>
            </div>

            {/* Improvement suggestion */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {suggestion}
            </p>

            {/* Try Now button */}
            <button
                onClick={() => onPractice?.('auto')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
            >
                <Zap className="w-5 h-5" />
                Try Now
                <ArrowRight className="w-5 h-5" />
            </button>
        </motion.div>
    )
}

/**
 * WeaknessPanelCompact - Smaller version for sidebars
 */
export function WeaknessPanelCompact({
    profile,
    onPractice,
    className = ""
}: WeaknessPanelProps) {
    const weakest = profile.weakest
    const weakestData = profile[weakest]
    const skillInfo = SKILL_LABELS[weakest]
    const drill = getSkillDrill(weakest)

    return (
        <div className={`p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Focus: {skillInfo.name} ({weakestData.score}/100)
                </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                {drill.instruction}
            </p>
            <button
                onClick={() => onPractice?.('auto')}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
                <Zap className="w-3 h-3" />
                Try Now
            </button>
        </div>
    )
}
