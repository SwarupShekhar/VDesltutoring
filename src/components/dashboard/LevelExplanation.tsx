"use client"

import { motion } from "framer-motion"
import { XCircle, AlertTriangle, CheckCircle, Target, Lock, ArrowRight } from "lucide-react"
import { CEFRLevel } from "@/lib/cefr-lexical-triggers"

interface LevelExplanationProps {
    profile: any; // CEFRProfile
    audit: any;   // assessment_audit
    blockers: any;
}

export function LevelExplanation({ profile, audit, blockers }: LevelExplanationProps) {
    if (!profile) return null;

    const currentLevel = profile.overall.cefr as CEFRLevel;
    const nextLevel = getNextLevel(currentLevel);

    // Parse Audit Data
    const gates = audit?.gates || [];
    const inputs = audit?.inputs || {};
    const audioMetrics = inputs.audioMetrics || {};

    // 🔴 BLOCKERS (Hard Stops)
    const activeBlockers = [];

    // 1. Reliability Gates
    const reliabilityGate = gates.find((g: any) => g.type === "Reliability");
    if (reliabilityGate) {
        activeBlockers.push({
            title: "Insufficient Data",
            desc: `Your speech sample was too short (${inputs.wordCount} words) to verify a ${reliabilityGate.from} level. Speak longer to prove consistency.`
        });
    }

    // 2. Confidence Gates
    const confidenceGate = gates.find((g: any) => g.type === "Confidence");
    if (confidenceGate) {
        activeBlockers.push({
            title: "Confidence Mismatch",
            desc: `You have the vocabulary for ${confidenceGate.from}, but your hesitation pattern (Low Confidence) restricts you to ${confidenceGate.to}.`
        });
    }

    // 3. Lexical Gates
    if (blockers?.level_capped) {
        activeBlockers.push({
            title: "Vocabulary Ceiling",
            desc: blockers.explanation || "You are relying on basic words like 'good' or 'nice'. Use precise vocabulary to unlock higher levels."
        });
    }

    // 🟡 NEAR-MISSES (Almost Passed)
    const nearMisses = [];
    // If not capped, but score is high (e.g. > 70/100 for current level bracket)
    // Note: This relies on internal knowledge that levels shift at ~35, 50, 65, 80, 90
    // Simplified logic: If score is within 5 points of next level
    // A2(35), B1(50), B2(65), C1(80), C2(90)
    const thresholds = { "A1": 35, "A2": 50, "B1": 65, "B2": 80, "C1": 90 };
    const nextThreshold = thresholds[currentLevel as keyof typeof thresholds] || 100;

    if (!activeBlockers.length && profile.overall.score >= nextThreshold - 10) {
        nearMisses.push({
            title: "Fluency Score",
            desc: `You are ${nextThreshold - profile.overall.score} points away from ${nextLevel}. Keep practicing to bridge the gap.`
        });
    }

    // Check Audio Metrics for Near Misses
    if (audioMetrics.confidenceBand === "Medium" && ["B2", "C1"].includes(nextLevel)) {
        nearMisses.push({
            title: "Confidence Band",
            desc: "Your confidence is 'Medium'. You need 'High' confidence (automaticity) to unlock C1."
        });
    }

    // 🟢 STRENGTHS
    const strengths = [];
    if (audioMetrics.confidence > 60) strengths.push({ title: "High Confidence", desc: "You speak with authority and minimal hesitation." });
    if (audioMetrics.recoveryScore > 0.6) strengths.push({ title: "Strong Recovery", desc: "You handle mistakes smoothly without breaking flow." });
    if (inputs.wordCount > 200) strengths.push({ title: "Volume", desc: "You are comfortable holding the floor for long periods." });
    if ((profile?.vocabulary?.score || 0) > 75) strengths.push({ title: "Rich Vocabulary", desc: "You use a diverse range of words." });

    // Limit strengths to 2
    const displayStrengths = strengths.slice(0, 2);

    // 🎯 UNLOCK CONDITION
    const unlockConditions: Record<string, string> = {
        "A2": "Speak for at least 1 minute using simple descriptors other than 'good/bad'.",
        "B1": "Connect sentences with 'because' or 'so' and minimize silence.",
        "B2": "Maintain 'Medium' confidence and speak for >100 words without relying on translation pauses.",
        "C1": "Achieve 'High' confidence (automatic) and use precise nuance words (e.g. 'substantially').",
        "C2": "Demonstrate complete automaticity (no planning pauses) and sophisticated vocabulary.",
        "Mastery": "You have reached the highest measurable level!"
    };
    const unlockText = unlockConditions[nextLevel] || "Continue regular practice to build consistency.";

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
                            {activeBlockers.map((b, i) => (
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

function getNextLevel(current: string): string {
    const map: Record<string, string> = {
        "A1": "A2", "A2": "B1", "B1": "B2", "B2": "C1", "C1": "C2", "C2": "Mastery"
    };
    return map[current] || "Next Level";
}
