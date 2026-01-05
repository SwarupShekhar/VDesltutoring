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
import type { EnglivoDimensions } from '@/types/englivoTypes'

interface EnglivoRadarChartProps {
    dimensions: EnglivoDimensions
    className?: string
}

/**
 * Englivo Radar Chart Component
 * 
 * Displays the five Englivo dimensions in a radar/spider chart format.
 * This replaces traditional grammar/vocabulary charts with behavioral fluency metrics.
 */
export function EnglivoRadarChart({ dimensions, className = "" }: EnglivoRadarChartProps) {
    const chartData = useMemo(() => [
        {
            dimension: 'Flow',
            score: dimensions.flow,
            fullMark: 100
        },
        {
            dimension: 'Confidence',
            score: dimensions.confidence,
            fullMark: 100
        },
        {
            dimension: 'Clarity',
            score: dimensions.clarity,
            fullMark: 100
        },
        {
            dimension: 'Speed',
            score: dimensions.speed,
            fullMark: 100
        },
        {
            dimension: 'Stability',
            score: dimensions.stability,
            fullMark: 100
        }
    ], [dimensions])

    // Determine color based on average score
    const averageScore = useMemo(() => {
        return Math.round(
            (dimensions.flow + dimensions.confidence + dimensions.clarity +
                dimensions.speed + dimensions.stability) / 5
        )
    }, [dimensions])

    const getColor = (score: number) => {
        if (score >= 75) return '#10b981' // green-500
        if (score >= 60) return '#3b82f6' // blue-500
        if (score >= 40) return '#f59e0b' // amber-500
        return '#ef4444' // red-500
    }

    const fillColor = getColor(averageScore)

    return (
        <div className={`w-full ${className}`}>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                    <PolarGrid
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                    />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{
                            fill: 'currentColor',
                            className: 'text-slate-700 dark:text-slate-300 text-sm font-medium'
                        }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{
                            fill: 'currentColor',
                            className: 'text-slate-400 dark:text-slate-600 text-xs'
                        }}
                    />
                    <Radar
                        name="Englivo Score"
                        dataKey="score"
                        stroke={fillColor}
                        fill={fillColor}
                        fillOpacity={0.3}
                        strokeWidth={2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: 'white',
                            fontSize: '0.875rem'
                        }}
                        formatter={(value: number | undefined) => value !== undefined ? [`${value}/100`, 'Score'] : ['N/A', 'Score']}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Dimension Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {chartData.map((item) => {
                    const color = getColor(item.score)
                    return (
                        <div key={item.dimension} className="flex flex-col items-center">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2"
                                style={{ backgroundColor: color }}
                            >
                                {item.score}
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
                                {item.dimension}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Dimension Breakdown Component
 * Shows individual dimension scores with progress bars
 */
export function DimensionBreakdown({ dimensions }: { dimensions: EnglivoDimensions }) {
    const dimensionList = [
        { name: 'Flow', value: dimensions.flow, description: 'Maintaining speaking flow' },
        { name: 'Confidence', value: dimensions.confidence, description: 'Committing to sentences' },
        { name: 'Clarity', value: dimensions.clarity, description: 'Speaking without fillers' },
        { name: 'Speed', value: dimensions.speed, description: 'Optimal speaking pace' },
        { name: 'Stability', value: dimensions.stability, description: 'Avoiding long freezes' }
    ]

    const getColor = (score: number) => {
        if (score >= 75) return 'bg-green-500'
        if (score >= 60) return 'bg-blue-500'
        if (score >= 40) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <div className="space-y-4">
            {dimensionList.map((dim) => (
                <div key={dim.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {dim.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {dim.description}
                            </p>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {dim.value}/100
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getColor(dim.value)}`}
                            style={{ width: `${dim.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
