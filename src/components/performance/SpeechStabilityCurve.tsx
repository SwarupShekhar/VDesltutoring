"use client"

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SpeechStabilityCurveProps {
    data: Array<{ time: number; wpm: number; label?: string }>;
}

/**
 * Time-series graph showing WPM variance and speech stability
 */
export function SpeechStabilityCurve({ data }: SpeechStabilityCurveProps) {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Insufficient data for stability curve
            </div>
        );
    }

    // Calculate zones
    const wpmValues = data.map(d => d.wpm);
    const avgWpm = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    const maxWpm = Math.max(...wpmValues);
    const minWpm = Math.min(...wpmValues);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {data.time}s: {data.wpm} WPM
                    </p>
                    {data.label && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {data.label}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
        >
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Speech Rhythm Under Load
                </h3>
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Stable zones</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Drop zones</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Spike zones</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    {/* Grid */}
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        opacity={0.3}
                    />

                    {/* Axes */}
                    <XAxis
                        dataKey="time"
                        stroke="currentColor"
                        className="text-slate-600 dark:text-slate-400"
                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-slate-600 dark:text-slate-400"
                        label={{ value: 'WPM', angle: -90, position: 'insideLeft' }}
                        domain={[0, 'auto']}
                    />

                    {/* Target WPM reference line */}
                    <ReferenceLine
                        y={130}
                        stroke="#3b82f6"
                        strokeDasharray="5 5"
                        label={{ value: 'Target (130)', position: 'right', fill: '#3b82f6' }}
                    />

                    {/* Average WPM reference line */}
                    <ReferenceLine
                        y={avgWpm}
                        stroke="#64748b"
                        strokeDasharray="3 3"
                        label={{ value: `Avg (${Math.round(avgWpm)})`, position: 'right', fill: '#64748b' }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Main line */}
                    <Line
                        type="monotone"
                        dataKey="wpm"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            const wpm = payload.wpm;

                            // Color based on stability
                            let fill = '#10b981'; // emerald - stable
                            if (wpm < avgWpm - 20) fill = '#f59e0b'; // amber - drop
                            if (wpm > avgWpm + 30) fill = '#ef4444'; // red - spike

                            return (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={payload.label ? 6 : 4}
                                    fill={fill}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            );
                        }}
                        activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Summary stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(avgWpm)}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Avg WPM</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{maxWpm}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Peak</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{minWpm}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Lowest</div>
                </div>
            </div>
        </motion.div>
    );
}
