'use client';

import { motion } from 'framer-motion';
import type { CoachingFeedback } from '@/lib/performance-engine';
import type { PrimaryLimiter } from '@/lib/performance-engine';

interface P2PCoachingFeedbackProps {
    coachingFeedback: CoachingFeedback;
    primaryLimiter: PrimaryLimiter;
    corrections: any[];
}

/**
 * P2P Live Practice Coaching Feedback UI
 * 8-Section Visual Hierarchy: INSIGHT → CAUSE → FIX → DETAILS
 */
export function P2PCoachingFeedback({
    coachingFeedback,
    primaryLimiter,
    corrections
}: P2PCoachingFeedbackProps) {
    const {
        performanceSummary,
        performanceImpact,
        patternInsight,
        hesitationSignals,
        nextBreakthrough,
        performanceMoments
    } = coachingFeedback;

    return (
        <div className="space-y-6">
            {/* SECTION 1: How You Came Across (Hero Card) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                            How You Came Across
                        </h3>
                        <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                            {performanceSummary}
                        </p>
                    </div>
                </div>

                {/* Primary Limiter Callout */}
                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 dark:border-red-500 rounded-r-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🔴</span>
                        <div>
                            <div className="font-bold text-red-900 dark:text-red-100">
                                Primary Limiter: {primaryLimiter.label}
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {primaryLimiter.insight}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SECTION 2: Next Breakthrough (Action Layer) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎯</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
                            Next Speaking Breakthrough
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Target:</span>
                                <p className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                                    {nextBreakthrough.target}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action:</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                                    {nextBreakthrough.action}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SECTION 3: Performance Impact (Table) */}
            {performanceImpact.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                            Performance Impact
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                        Area
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                        What Happened
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                        Effect
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceImpact.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                                            {row.area}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                            {row.whatHappened}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 italic">
                                            {row.effect}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* SECTION 4: Repeating Pattern */}
            {patternInsight && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🔁</span>
                        <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                Repeating Pattern Detected
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                {patternInsight}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* SECTION 5: Performance Moments */}
            {(performanceMoments.strongest || performanceMoments.drop) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-xl"
                >
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-3">
                        Key Performance Moments
                    </h4>
                    <div className="space-y-2">
                        {performanceMoments.strongest && (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <span className="text-lg">✨</span>
                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                    Strongest moment at {performanceMoments.strongest}
                                </p>
                            </div>
                        )}
                        {performanceMoments.drop && (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                <span className="text-lg">⚠️</span>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    Confidence dip at {performanceMoments.drop}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* SECTION 6: Hesitation Signals */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-5 rounded-xl"
            >
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-4">
                    Hesitation Signals
                </h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {hesitationSignals.longPauses}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Long pauses
                        </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {hesitationSignals.restarts}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Restarts
                        </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {hesitationSignals.fillers}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Fillers
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SECTION 7: Corrections (Lower Priority) */}
            {corrections && corrections.length > 0 && (
                <details className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <summary className="cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors font-semibold text-slate-700 dark:text-slate-300">
                        Examples of the pattern ({corrections.length} corrections)
                    </summary>
                    <div className="p-4 pt-0 space-y-3">
                        {corrections.slice(0, 5).map((correction, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <div className="text-sm">
                                    <span className="text-red-600 dark:text-red-400 line-through">
                                        {correction.original}
                                    </span>
                                    {' → '}
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                        {correction.correction}
                                    </span>
                                </div>
                                {correction.explanation && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        {correction.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                        {corrections.length > 5 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                +{corrections.length - 5} more corrections
                            </p>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
}
