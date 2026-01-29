"use client"

import { motion } from 'framer-motion';
import { PerformanceMeter } from './PerformanceMeter';
import { SpeechStabilityCurve } from './SpeechStabilityCurve';
import { CustomDrillPanel } from './CustomDrillPanel';
import { P2PCoachingFeedback } from './P2PCoachingFeedback';
import type { PerformanceAnalytics, CoachingFeedback } from '@/lib/performance-engine';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface PerformanceIntelligenceDashboardProps {
    analytics: PerformanceAnalytics;
    userId?: string; // Optional for Phase 3 drill generation
}

/**
 * Main Performance Intelligence Dashboard
 * 
 * Displays professional speaking performance analytics with:
 * - Human-language diagnosis
 * - 4 core performance systems
 * - Speech stability curve
 * - Pressure stability analysis
 * - Filler intelligence breakdown
 * - Coach insights
 */
export function PerformanceIntelligenceDashboard({ analytics, userId }: PerformanceIntelligenceDashboardProps) {
    const {
        cognitiveReflex,
        speechRhythm,
        languageMaturity,
        socialPresence,
        pressureStability,
        fillerIntelligence,
        performanceDiagnosis,
        coachInsights,
        primaryLimiter,
        nextFocus,
        performanceMoments
    } = analytics;

    const normalizedCoachingFeedback: CoachingFeedback = {
        performanceSummary: performanceDiagnosis,
        performanceImpact: [],
        patternInsight: null,
        hesitationSignals: {
            longPauses: analytics.cognitiveReflex.longPauseCount,
            restarts: Math.round(analytics.speechRhythm.wpmVariance / 10),
            fillers: Math.round(analytics.cognitiveReflex.struggleFillerRate)
        },
        nextBreakthrough: {
            target: nextFocus.target,
            action: nextFocus.action
        },
        performanceMoments: {
            strongest: performanceMoments.bestMoment,
            drop: performanceMoments.confidenceDrop
        }
    };

    return (
        <div className="space-y-8">
            {/* ============================================================
                PHASE 2: COACHING INTELLIGENCE LAYERS
                Position ABOVE detailed analytics for UX hierarchy
            ============================================================ */}

            <P2PCoachingFeedback
                coachingFeedback={normalizedCoachingFeedback}
                primaryLimiter={primaryLimiter}
                corrections={[]}
            />

            {/* Custom Drills (Phase 3) */}
            {userId && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <CustomDrillPanel
                        primaryLimiter={primaryLimiter}
                        userId={userId}
                    />
                </motion.div>
            )}


            {/* 2. CORE PERFORMANCE SYSTEMS (4 Meters) */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Core Performance Systems
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cognitive Reflex */}
                    <PerformanceMeter
                        score={cognitiveReflex.score}
                        label="Cognitive Reflex"
                        icon="⚡"
                        insight={cognitiveReflex.insight}
                        subMetrics={[
                            { label: 'Avg Response Delay', value: `${cognitiveReflex.avgTimeToFirstWord}s` },
                            { label: 'Struggle Fillers', value: `${cognitiveReflex.struggleFillerRate}/min` }
                        ]}
                    />

                    {/* Speech Rhythm Control */}
                    <PerformanceMeter
                        score={speechRhythm.score}
                        label="Speech Rhythm Control"
                        icon="🎼"
                        insight={speechRhythm.insight}
                        subMetrics={[
                            { label: 'WPM Variance', value: Math.round(speechRhythm.wpmVariance) },
                            { label: 'Stability Index', value: `${speechRhythm.stabilityIndex}/100` }
                        ]}
                        sparklineData={speechRhythm.rhythmCurve.slice(0, 10).map(d => d.wpm)}
                    />

                    {/* Language Maturity */}
                    <PerformanceMeter
                        score={languageMaturity.score}
                        label="Language Maturity"
                        icon="📚"
                        insight={languageMaturity.insight}
                        subMetrics={[
                            { label: 'Lexical Level', value: languageMaturity.cefrLevel },
                            { label: 'Verb Sophistication', value: `${languageMaturity.verbSophistication}/100` },
                            { label: 'Connector Complexity', value: `${languageMaturity.connectorComplexity}/100` }
                        ]}
                    />

                    {/* Social Presence */}
                    <PerformanceMeter
                        score={socialPresence.score}
                        label="Social Presence"
                        icon="🎭"
                        insight={socialPresence.insight}
                        subMetrics={[
                            { label: 'Talk Ratio', value: `${Math.round(socialPresence.talkTimeRatio * 100)}%` },
                            { label: 'Silence Surrender', value: socialPresence.silenceSurrenderCount }
                        ]}
                    />
                </div>
            </div>

            {/* 3. SPEECH STABILITY CURVE */}
            <SpeechStabilityCurve data={speechRhythm.rhythmCurve} />

            {/* 4. PRESSURE STABILITY INDEX */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
            >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Pressure Stability Index
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Overall Score */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                        <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                            {pressureStability.score}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Stability Score
                        </div>
                    </div>

                    {/* Right: Skill Degradation */}
                    <div className="space-y-3">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Performance Under Pressure
                        </div>

                        {/* Reflex */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">Reflex</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    -{pressureStability.degradationBySkill.reflex}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pressureStability.degradationBySkill.reflex}%` }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="h-full bg-red-500"
                                />
                            </div>
                        </div>

                        {/* Grammar */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">Grammar</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    -{pressureStability.degradationBySkill.grammar}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pressureStability.degradationBySkill.grammar}%` }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                        </div>

                        {/* Rhythm */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">Rhythm</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    -{pressureStability.degradationBySkill.rhythm}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pressureStability.degradationBySkill.rhythm}%` }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="h-full bg-orange-500"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-3">
                            "{pressureStability.insight}"
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 5. FILLER INTELLIGENCE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
            >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Filler Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Struggle Signals */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                Struggle Signals
                            </h4>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                                {fillerIntelligence.totalStruggle} total
                            </span>
                        </div>
                        <div className="space-y-2">
                            {fillerIntelligence.struggleSignals.map((sig, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded bg-red-50 dark:bg-red-900/10">
                                    <span className="text-sm text-slate-900 dark:text-white">"{sig.word}"</span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{sig.count}×</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discourse Markers */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-5 h-5 text-blue-500" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                Discourse Markers
                            </h4>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {fillerIntelligence.totalDiscourse} total
                            </span>
                        </div>
                        <div className="space-y-2">
                            {fillerIntelligence.discourseMarkers.map((marker, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded bg-blue-50 dark:bg-blue-900/10">
                                    <span className="text-sm text-slate-900 dark:text-white">"{marker.word}"</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{marker.count}×</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    "{fillerIntelligence.insight}"
                </p>
            </motion.div>

            {/* 6. COACH INSIGHTS */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Coach Insights
                    </h3>
                </div>
                <div className="space-y-3">
                    {coachInsights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className="flex gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div >
    );
}
