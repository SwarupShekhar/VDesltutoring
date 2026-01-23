"use client"

import { motion } from "framer-motion"
import { XCircle, AlertTriangle, CheckCircle, Target, Lock, ArrowRight } from "lucide-react"
import { CEFRLevel, GATE_FAILURE_EXPLANATIONS, CEFR_PROMOTION_GATES, getNextCEFRLevel } from "@/lib/cefr/cefrPromotionConfig"

interface LevelExplanationProps {
    profile: any; // CEFRProfile
    audit: any;   // assessment_audit
    blockers: any;
}

export function LevelExplanation({ profile, audit, blockers }: LevelExplanationProps) {
    if (!profile) return null;

    const currentLevel = profile.overall.cefr as CEFRLevel;
    const nextLevel = getNextCEFRLevel(currentLevel);

    // Parse Gate Failures
    const gateFailures = profile.gate_failures || [];
    const aggregatedMetrics = profile.aggregated_metrics || {};

    // 🔴 BLOCKERS (Hard Stops)
    const activeBlockers = gateFailures.map((code: string) => {
        const expl = GATE_FAILURE_EXPLANATIONS[code];
        return {
            title: expl?.title || code,
            desc: expl?.description || "You need to meet all behavioral requirements to advance."
        };
    });

    // 🟡 NEAR-MISSES (Almost Passed)
    const nearMisses = [];
    if (activeBlockers.length === 0 && nextLevel) {
        // If no hard blockers but they haven't moved up yet, it might be due to raw score or recent consistency
        if (profile.overall.score >= 70) {
            nearMisses.push({
                title: "Consistency",
                desc: "Your latest session was excellent. Maintain this level of performance in 1-2 more sessions to confirm your new level."
            });
        }
    }

    // 🟢 STRENGTHS
    const strengths = [];
    if (aggregatedMetrics.confidenceBand === "High") strengths.push({ title: "High Confidence", desc: "You speak with authority and minimal hesitation." });
    if (aggregatedMetrics.totalWords > 500) strengths.push({ title: "Volume", desc: "You are comfortable holding the floor for long periods." });
    if (aggregatedMetrics.avgMidSentencePause < 1.0) strengths.push({ title: "Steady Flow", desc: "You maintain a consistent speaking rhythm." });
    if (!gateFailures.includes("LEXICAL_CEILING") && (profile?.vocabulary?.score || 0) > 75) {
        strengths.push({ title: "Rich Vocabulary", desc: "You use a diverse range of words and avoid repetitive basic nouns." });
    }

    // Limit strengths to 3
    const displayStrengths = strengths.slice(0, 3);

    // 🎯 UNLOCK CONDITION
    let unlockText = "Continue regular practice to build consistency.";
    if (nextLevel && nextLevel !== "A1") {
        const gate = CEFR_PROMOTION_GATES[nextLevel as Exclude<CEFRLevel, "A1">];
        if (gate) {
            unlockText = gate.description;

            // Add specific requirements if we have failure specifics
            if (gateFailures.includes("INSUFFICIENT_SPEECH_TIME")) {
                const remaining = Math.max(0, gate.minTotalSpeakingSeconds - (aggregatedMetrics.totalSeconds || 0));
                unlockText = `Speak for ${Math.ceil(remaining / 60)} more minutes to meet the ${nextLevel} speech duration requirement.`;
            } else if (gateFailures.includes("CONFIDENCE_TOO_LOW")) {
                unlockText = `You need to achieve '${gate.requiredConfidenceBand}' confidence (automatic speaking) to unlock ${nextLevel}.`;
            }
        }
    } else if (currentLevel === "C2") {
        unlockText = "You have reached the highest measurable level! Consistency is now the goal.";
    }

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Why You’re Currently at {currentLevel}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 🔴 BLOCKERS */}
                {activeBlockers.length > 0 && (
                    <div className="md:col-span-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">
                            <XCircle className="w-4 h-4" />
                            Critical Blockers
                        </h4>
                        <div className="space-y-3">
                            {activeBlockers.map((b: any, i: number) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{b.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🟡 NEAR MISSES */}
                {nearMisses.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                            <AlertTriangle className="w-4 h-4" />
                            Almost These
                        </h4>
                        <div className="space-y-3">
                            {nearMisses.map((m, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-slate-900 dark:text-white text-xs">{m.title}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🟢 STRENGTHS */}
                {displayStrengths.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
                            <CheckCircle className="w-4 h-4" />
                            Your Strengths
                        </h4>
                        <div className="space-y-3">
                            {displayStrengths.map((s, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-slate-900 dark:text-white text-xs">{s.title}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🎯 UNLOCK */}
                <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-100 uppercase tracking-wider mb-2">
                        <Lock className="w-4 h-4" />
                        To Unlock {nextLevel}
                    </h4>
                    <p className="text-lg font-medium leading-relaxed">
                        {unlockText}
                    </p>
                </div>

            </div>
        </div>
    );
}

