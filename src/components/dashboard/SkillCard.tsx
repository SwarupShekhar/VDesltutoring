"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Target, Zap } from 'lucide-react'
import type { Skill, SkillScore } from '@/lib/cefrEngine'
import {
    SKILL_LABELS,
    getSkillDrill,
    getSkillWeakness,
    getImprovementSuggestion
} from '@/lib/cefrEngine'
import { CEFRBadgeInline, CEFRProgressBar } from './CEFRBadge'

interface SkillCardProps {
    skill: Skill
    data: SkillScore
    isWeakest?: boolean
    isStrongest?: boolean
    showDrill?: boolean
    onPractice?: (skill: Skill | 'auto') => void
    className?: string
}

/**
 * SkillCard - Individual skill display with CEFR level
 * 
 * Shows:
 * - Circular score (0-100)
 * - CEFR level
 * - "Improve X% to reach next level"
 * - 1 weakness
 * - 1 drill button
 */
export function SkillCard({
    skill,
    data,
    isWeakest = false,
    isStrongest = false,
    showDrill = true,
    onPractice,
    className = ""
}: SkillCardProps) {
    const skillInfo = SKILL_LABELS[skill]
    const drill = getSkillDrill(skill)
    const weakness = getSkillWeakness(skill, data.score)
    const suggestion = getImprovementSuggestion(skill, data.score)

    // Determine color based on score
    const getColor = () => {
        if (data.score >= 70) return { ring: 'stroke-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
        if (data.score >= 55) return { ring: 'stroke-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
        if (data.score >= 35) return { ring: 'stroke-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
        return { ring: 'stroke-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
    }

    const color = getColor()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`
                relative p-6 rounded-2xl border
                ${isWeakest ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' : ''}
                ${isStrongest ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : ''}
                ${!isWeakest && !isStrongest ? 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700' : ''}
                ${className}
            `}
        >
            {/* Focus/Best Badge */}
            {isWeakest && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    Focus
                </div>
            )}
            {isStrongest && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    Best
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{skillInfo.icon}</span>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {skillInfo.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {skillInfo.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Circular Score + CEFR */}
            <div className="flex items-center gap-6 mb-4">
                {/* Circular Progress */}
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            className="stroke-slate-200 dark:stroke-slate-700"
                            strokeWidth="8"
                            fill="transparent"
                            r="32"
                            cx="40"
                            cy="40"
                        />
                        <motion.circle
                            className={color.ring}
                            strokeWidth="8"
                            fill="transparent"
                            r="32"
                            cx="40"
                            cy="40"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 201" }}
                            animate={{ strokeDasharray: `${(data.score / 100) * 201} 201` }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-bold ${color.text}`}>
                            {data.score}
                        </span>
                    </div>
                </div>

                {/* CEFR Badge + Progress */}
                <div className="flex-1">
                    <CEFRBadgeInline level={data.cefr} />
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {data.label}
                    </p>
                    {data.nextLevel && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {data.pointsToNext} points to {data.nextLevel}
                        </p>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <CEFRProgressBar level={data.cefr} score={data.score} className="mb-4" />

            {/* Weakness */}
            <div className={`p-3 rounded-lg ${color.bg} mb-4`}>
                <div className="flex items-start gap-2">
                    <Target className={`w-4 h-4 mt-0.5 ${color.text}`} />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {weakness}
                    </p>
                </div>
            </div>

            {/* Improvement Suggestion */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {suggestion}
            </p>

            {/* Drill Button */}
            {showDrill && (
                <button
                    onClick={() => onPractice?.(skill)}
                    className={`
                        w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                        font-semibold text-sm transition-all
                        ${isWeakest
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20'
                            : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900'}
                    `}
                >
                    <Zap className="w-4 h-4" />
                    {drill.title}
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    )
}

/**
 * SkillCardCompact - Smaller version for lists
 */
export function SkillCardCompact({
    skill,
    data,
    onClick,
    className = ""
}: {
    skill: Skill
    data: SkillScore
    onClick?: () => void
    className?: string
}) {
    const skillInfo = SKILL_LABELS[skill]

    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-4 p-4 rounded-xl
                bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700
                hover:border-slate-300 dark:hover:border-slate-600 transition-colors
                text-left ${className}
            `}
        >
            <span className="text-xl">{skillInfo.icon}</span>
            <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                    {skillInfo.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {data.score}/100
                </div>
            </div>
            <CEFRBadgeInline level={data.cefr} />
        </button>
    )
}
