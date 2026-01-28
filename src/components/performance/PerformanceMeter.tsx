"use client"

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PerformanceMeterProps {
    score: number; // 0-100
    label: string;
    icon: string;
    insight?: string;
    subMetrics?: Array<{ label: string; value: string | number }>;
    size?: 'sm' | 'md' | 'lg';
    sparklineData?: number[];
}

/**
 * Circular performance meter with smooth animations
 */
export function PerformanceMeter({
    score,
    label,
    icon,
    insight,
    subMetrics,
    size = 'lg',
    sparklineData
}: PerformanceMeterProps) {
    const sizeConfig = {
        sm: { radius: 40, strokeWidth: 6, fontSize: 'text-xl', padding: 'p-4' },
        md: { radius: 60, strokeWidth: 8, fontSize: 'text-2xl', padding: 'p-5' },
        lg: { radius: 80, strokeWidth: 10, fontSize: 'text-4xl', padding: 'p-6' }
    };

    const config = sizeConfig[size];
    const circumference = 2 * Math.PI * config.radius;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    const color = useMemo(() => {
        if (score >= 80) return 'stroke-emerald-500';
        if (score >= 60) return 'stroke-blue-500';
        if (score >= 40) return 'stroke-amber-500';
        return 'stroke-red-500';
    }, [score]);

    const bgColor = useMemo(() => {
        if (score >= 80) return 'bg-emerald-500/5';
        if (score >= 60) return 'bg-blue-500/5';
        if (score >= 40) return 'bg-amber-500/5';
        return 'bg-red-500/5';
    }, [score]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`${config.padding} rounded-2xl ${bgColor} border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{icon}</span>
                <h3 className="font-semibold text-slate-900 dark:text-white">{label}</h3>
            </div>

            {/* Meter */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative">
                    <svg
                        width={config.radius * 2 + 20}
                        height={config.radius * 2 + 20}
                        className="transform -rotate-90"
                    >
                        {/* Background circle */}
                        <circle
                            cx={config.radius + 10}
                            cy={config.radius + 10}
                            r={config.radius}
                            stroke="currentColor"
                            strokeWidth={config.strokeWidth}
                            fill="none"
                            className="text-slate-200 dark:text-slate-700"
                        />

                        {/* Progress circle */}
                        <motion.circle
                            cx={config.radius + 10}
                            cy={config.radius + 10}
                            r={config.radius}
                            stroke="currentColor"
                            strokeWidth={config.strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            className={color}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                            style={{
                                strokeDasharray: circumference,
                                filter: 'drop-shadow(0 0 8px currentColor)'
                            }}
                        />
                    </svg>

                    {/* Score display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="text-center"
                        >
                            <div className={`${config.fontSize} font-bold text-slate-900 dark:text-white`}>
                                {score}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                / 100
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Sparkline (optional) */}
                {sparklineData && sparklineData.length > 0 && (
                    <div className="mt-2 w-32 h-6">
                        <svg width="100%" height="100%" viewBox="0 0 100 24">
                            <motion.polyline
                                points={sparklineData.map((val, idx) =>
                                    `${(idx / (sparklineData.length - 1)) * 100},${24 - (val / 100) * 20}`
                                ).join(' ')}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={color}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.8 }}
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Sub-metrics */}
            {subMetrics && subMetrics.length > 0 && (
                <div className="space-y-1 mb-3">
                    {subMetrics.map((metric, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.1 }}
                            className="flex justify-between text-sm"
                        >
                            <span className="text-slate-600 dark:text-slate-400">{metric.label}:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{metric.value}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Insight */}
            {insight && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-sm text-slate-600 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700 pt-3"
                >
                    "{insight}"
                </motion.p>
            )}
        </motion.div>
    );
}
