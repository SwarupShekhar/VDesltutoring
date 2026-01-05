"use client"

import { useMemo } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts'
import { motion } from 'framer-motion'
import type { CEFRProfile, Skill } from '@/lib/cefrEngine'
import { SKILL_LABELS } from '@/lib/cefrEngine'

interface SkillRadarProps {
    profile: CEFRProfile
    size?: 'sm' | 'md' | 'lg'
    showLegend?: boolean
    className?: string
}

/**
 * SkillRadar - Shows all 4 skills in a radar chart
 * 
 * The visual "shape" of your English ability.
 */
export function SkillRadar({
    profile,
    size = 'md',
    showLegend = true,
    className = ""
}: SkillRadarProps) {
    const chartData = useMemo(() => [
        {
            skill: SKILL_LABELS.fluency.name,
            value: profile.fluency.score,
            fullMark: 100,
            icon: SKILL_LABELS.fluency.icon
        },
        {
            skill: SKILL_LABELS.pronunciation.name,
            value: profile.pronunciation.score,
            fullMark: 100,
            icon: SKILL_LABELS.pronunciation.icon
        },
        {
            skill: SKILL_LABELS.grammar.name,
            value: profile.grammar.score,
            fullMark: 100,
            icon: SKILL_LABELS.grammar.icon
        },
        {
            skill: SKILL_LABELS.vocabulary.name,
            value: profile.vocabulary.score,
            fullMark: 100,
            icon: SKILL_LABELS.vocabulary.icon
        }
    ], [profile])

    // Determine color based on overall score
    const fillColor = useMemo(() => {
        const score = profile.overall.score
        if (score >= 70) return '#10b981' // emerald
        if (score >= 55) return '#3b82f6' // blue
        if (score >= 35) return '#f59e0b' // amber
        return '#ef4444' // red
    }, [profile.overall.score])

    const heights = {
        sm: 200,
        md: 300,
        lg: 400
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative ${className}`}
        >
            <ResponsiveContainer width="100%" height={heights[size]}>
                <RadarChart data={chartData} cx="50%" cy="50%">
                    <PolarGrid
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                    />
                    <PolarAngleAxis
                        dataKey="skill"
                        tick={{
                            fill: 'currentColor',
                            fontSize: size === 'sm' ? 10 : 12,
                            fontWeight: 600
                        }}
                        className="text-slate-700 dark:text-slate-300"
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{
                            fill: 'currentColor',
                            fontSize: 9
                        }}
                        className="text-slate-400 dark:text-slate-600"
                        tickCount={5}
                    />
                    <Radar
                        name="Skills"
                        dataKey="value"
                        stroke={fillColor}
                        fill={fillColor}
                        fillOpacity={0.3}
                        strokeWidth={2.5}
                        dot={{
                            r: 5,
                            fill: fillColor,
                            strokeWidth: 2,
                            stroke: 'white'
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontSize: '0.875rem'
                        }}
                        formatter={(value: number | undefined) => value !== undefined ? [`${value}/100`, 'Score'] : ['N/A', 'Score']}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Overall Score Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div
                    className="text-4xl font-black"
                    style={{ color: fillColor }}
                >
                    {profile.overall.cefr}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {profile.overall.score}/100
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {chartData.map((item) => {
                        const isWeakest = SKILL_LABELS[profile.weakest as Skill].name === item.skill
                        const isStrongest = SKILL_LABELS[profile.strongest as Skill].name === item.skill

                        return (
                            <div
                                key={item.skill}
                                className={`
                                    flex items-center gap-2 p-2 rounded-lg
                                    ${isWeakest ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''}
                                    ${isStrongest ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : ''}
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {item.skill}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {item.value}/100
                                        {isWeakest && <span className="text-red-500 ml-1">(Focus)</span>}
                                        {isStrongest && <span className="text-emerald-500 ml-1">(Best)</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </motion.div>
    )
}
