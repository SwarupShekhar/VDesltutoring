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
import type { RadarData } from './types'

interface FluencyRadarProps {
    radar: RadarData
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

/**
 * FluencyRadar - Visual radar chart showing speaking shape
 * 
 * Displays Flow, Clarity, Confidence, Speed (and optionally Stability)
 * as a radar/spider chart to visualize the speaker's profile.
 */
export function FluencyRadar({ radar, className = "", size = 'md' }: FluencyRadarProps) {
    const chartData = useMemo(() => {
        const data = [
            { skill: 'Flow', value: radar.flow, fullMark: 100 },
            { skill: 'Clarity', value: radar.clarity, fullMark: 100 },
            { skill: 'Confidence', value: radar.confidence, fullMark: 100 },
            { skill: 'Speed', value: radar.speed, fullMark: 100 }
        ]

        // Add stability if provided
        if (radar.stability !== undefined) {
            data.push({ skill: 'Stability', value: radar.stability, fullMark: 100 })
        }

        return data
    }, [radar])

    // Calculate average score for color determination
    const averageScore = useMemo(() => {
        const sum = chartData.reduce((acc, item) => acc + item.value, 0)
        return Math.round(sum / chartData.length)
    }, [chartData])

    // Determine fill color based on average score
    const fillColor = useMemo(() => {
        if (averageScore >= 75) return '#10b981' // emerald-500
        if (averageScore >= 55) return '#3b82f6' // blue-500
        if (averageScore >= 40) return '#f59e0b' // amber-500
        return '#ef4444' // red-500
    }, [averageScore])

    // Size configurations
    const heights = {
        sm: 200,
        md: 280,
        lg: 360
    }

    return (
        <div className={`relative ${className}`}>
            <ResponsiveContainer width="100%" height={heights[size]}>
                <RadarChart data={chartData} cx="50%" cy="50%">
                    <PolarGrid
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        strokeOpacity={0.6}
                    />
                    <PolarAngleAxis
                        dataKey="skill"
                        tick={{
                            fill: 'currentColor',
                            fontSize: size === 'sm' ? 10 : 12,
                            fontWeight: 500
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
                        name="Fluency"
                        dataKey="value"
                        stroke={fillColor}
                        fill={fillColor}
                        fillOpacity={0.25}
                        strokeWidth={2.5}
                        dot={{
                            r: 4,
                            fill: fillColor,
                            strokeWidth: 0
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontSize: '0.875rem',
                            padding: '8px 12px'
                        }}
                        formatter={(value: number | undefined) => value !== undefined ? [`${value}/100`, ''] : ['N/A', '']}
                        labelStyle={{ fontWeight: 600 }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Average Score Badge */}
            <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${fillColor}20`, color: fillColor }}>
                Avg: {averageScore}
            </div>
        </div>
    )
}
