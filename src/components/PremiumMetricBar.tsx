'use client';

import { motion } from 'framer-motion';

export const METRIC_COLORS = {
    pauses: ["#f97316", "#fbbf24"], // Orange -> Amber
    fillers: ["#fb7185", "#f472b6"], // Pink -> Rose
    fluency: ["#34d399", "#2dd4bf"]  // Emerald -> Teal
};

export interface MetricItem {
    id: string;
    label: string;
    before: number;
    after: number;
    unit: string;
    microcopy?: string;
    trend: 'up' | 'down';
}

interface PremiumMetricBarProps {
    item: MetricItem;
    activeTab?: 'week1' | 'week12'; // Keep optional for compat or rigid for consistency
    forceState?: 'before' | 'after'; // Allow forcing a state
    showDelta?: boolean;
    customColors?: string[];
}

export function PremiumMetricBar({
    item,
    activeTab,
    forceState,
    showDelta = true,
    customColors
}: PremiumMetricBarProps) {
    // Determine state
    let isImproved = false;
    if (forceState) {
        isImproved = forceState === 'after';
    } else if (activeTab) {
        isImproved = activeTab === 'week12';
    }

    const currentValue = isImproved ? item.after : item.before;

    // Determine colors
    const colors = customColors || METRIC_COLORS[item.id as keyof typeof METRIC_COLORS] || METRIC_COLORS.fluency;

    // Calculate Delta
    const delta = Math.abs(item.after - item.before);
    const deltaSign = item.trend === 'down' ? '▼' : '▲';
    const isGoodChange = (item.trend === 'down' && item.after < item.before) || (item.trend === 'up' && item.after > item.before);
    const deltaColor = isGoodChange ? "text-emerald-500" : "text-amber-500";

    return (
        <div className="space-y-2">
            {/* Header: Label + Delta */}
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                </span>

                {/* DELTA CHIP - Appearance animated */}
                {showDelta && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={isImproved ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                        transition={{ duration: 0.4 }}
                        className={`text-xs font-bold ${deltaColor} flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm`}
                    >
                        <span>{deltaSign}</span>
                        <span>{delta}{item.unit.replace('/100', '')}</span>
                    </motion.div>
                )}
            </div>

            {/* The Bar Track */}
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {/* The Active Bar */}
                <motion.div
                    className="h-full rounded-full relative"
                    style={{
                        background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
                    }}
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${currentValue}%`,
                        boxShadow: isImproved ? `0px 0px 12px ${colors[0]}60` : "none", // Glow only on improvement
                        opacity: [1, 0.96, 1] // Breathing effect
                    }}
                    transition={{
                        width: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }, // Apple-style spring
                        boxShadow: { duration: 0.5 },
                        opacity: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                    }}
                >
                    {/* Shimmer effect overlay */}
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                    />
                </motion.div>
            </div>

            {/* Footer: Values + Microcopy */}
            <div className="flex justify-between items-start text-xs">
                <div className="flex gap-3 font-mono text-slate-400">
                    {/* Always show Before */}
                    <span>
                        Before {item.before}{item.unit}
                    </span>

                    {/* Animate After visibility */}
                    <motion.span
                        animate={{ opacity: isImproved ? 1 : 0.3, color: isImproved ? colors[1] : 'currentColor' }}
                        className="font-bold transition-colors"
                    >
                        After {item.after}{item.unit}
                    </motion.span>
                </div>

                {item.microcopy && (
                    <motion.span
                        key={String(isImproved)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isImproved ? 1 : 0 }}
                        className="text-slate-500 italic max-w-[140px] text-right"
                    >
                        {item.microcopy}
                    </motion.span>
                )}
            </div>
        </div>
    );
}
