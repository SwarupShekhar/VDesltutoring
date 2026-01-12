
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2,
    ArrowRight,
    Zap,
    Mic,
    Clock,
    Brain,
    CheckCircle2,
    Target,
    BarChart3
} from "lucide-react";

interface ReportData {
    fluencyScore: number;
    confidenceScore: number;
    weaknesses: string[];
    drillPlan: Array<{
        weakness: string;
        exercise: string;
        difficulty: string;
    }>;
    metrics: {
        speakingTime: number;
        wordCount: number;
        fillers: number;
        speed: number;
        grammarErrors: number;
    };
    date: string;
}

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch(`/api/live-practice/report/${sessionId}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Report currently generating... please refresh in a moment.");
                    throw new Error("Failed to load report");
                }
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (sessionId) fetchReport();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-zinc-400 animate-pulse">Analyzing your conversation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Report Not Ready</h2>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push('/live-practice')}
                        className="block mt-4 text-sm text-zinc-500 hover:text-white mx-auto"
                    >
                        Back to Practicing
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Helper for Gauge Color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-rose-400";
    };

    const getScoreBorder = (score: number) => {
        if (score >= 80) return "border-emerald-500/20";
        if (score >= 60) return "border-amber-500/20";
        return "border-rose-500/20";
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Session Report
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {new Date(data.date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/live-practice')}
                        className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full transition-colors"
                    >
                        Back to Hub
                    </button>
                </header>

                {/* Hero Score Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        {/* Circular Gauge Placeholder (Pure CSS) */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-zinc-800"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className={`${getScoreColor(data.fluencyScore)} transition-all duration-1000 ease-out`}
                                    strokeWidth="8"
                                    strokeDasharray={264}
                                    strokeDashoffset={264 - (264 * data.fluencyScore) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-5xl font-bold ${getScoreColor(data.fluencyScore)}`}>{Math.round(data.fluencyScore)}</span>
                                <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-1">Fluency</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <h2 className="text-3xl font-bold">
                                {data.fluencyScore >= 80 ? "Excellent Work!" : data.fluencyScore >= 60 ? "Solid Progress" : "Keep Practicing"}
                            </h2>
                            <p className="text-zinc-400 leading-relaxed max-w-md">
                                {data.fluencyScore >= 80
                                    ? "You're speaking naturally and with confidence. Your flow is strong, and you handled the conversation like a pro."
                                    : data.fluencyScore >= 60
                                        ? "You're getting your message across clearly. Focus on reducing hesitation and smoothing out your sentence structures."
                                        : "You're building the foundation. Don't worry about speed—focus on finishing your thoughts and speaking clearly."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3 text-purple-400">
                            <Brain className="w-5 h-5" />
                            <span className="font-semibold text-sm">Confidence</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{Math.round(data.confidenceScore)}%</div>
                        <p className="text-xs text-zinc-500">Speaking Time Ratio</p>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3 text-blue-400">
                            <Mic className="w-5 h-5" />
                            <span className="font-semibold text-sm">Speed</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{Math.round(data.metrics.speed)} <span className="text-xs font-normal text-zinc-500">wpm</span></div>
                        <p className="text-xs text-zinc-500">Target: 130 wpm</p>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3 text-amber-400">
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold text-sm">Hesitation</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{data.metrics.fillers}</div>
                        <p className="text-xs text-zinc-500">Fillers used</p>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3 text-rose-400">
                            <Zap className="w-5 h-5" />
                            <span className="font-semibold text-sm">Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{data.metrics.grammarErrors}</div>
                        <p className="text-xs text-zinc-500">Grammar alerts</p>
                    </div>
                </div>

                {/* Weakness & Diagnosis */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-400" />
                            Diagnosis
                        </h3>
                        {data.weaknesses.length > 0 ? (
                            <div className="space-y-3">
                                {data.weaknesses.map((tag) => (
                                    <div key={tag} className="flex items-start gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-xl">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-white">{tag}</h4>
                                            <p className="text-sm text-zinc-400 mt-1">
                                                {tag === 'HESITATION' && "You're pausing frequently or using filler words. Try to slow down to think, then speak continuously."}
                                                {tag === 'SPEED' && "Your pace is either too fast or too slow. Aim for a conversational 130 words per minute."}
                                                {tag === 'GRAMMAR' && "Several grammar inconsistencies detected. Focus on verb tenses and sentence structure."}
                                                {tag === 'CONFIDENCE' && "You're speaking less than your partner. Take up more space in the conversation!"}
                                                {tag === 'PASSIVITY' && "You were very quiet. Engagement is key to fluency."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                                <p className="text-emerald-400 font-medium">No major weaknesses detected!</p>
                                <p className="text-emerald-500/60 text-sm mt-1">You're on fire. Keep maintaining this level.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Personalized Plan
                        </h3>
                        <div className="space-y-3">
                            {data.drillPlan.map((drill, idx) => (
                                <div key={idx} className="group p-4 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start gap-4 reltive z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                                    {drill.weakness}
                                                </span>
                                                <span className="text-xs text-zinc-500 uppercase tracking-wide">{drill.difficulty}</span>
                                            </div>
                                            <p className="text-zinc-200 font-medium text-sm leading-relaxed">
                                                "{drill.exercise}"
                                            </p>
                                        </div>
                                        <button className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20 group-hover:scale-105 transform duration-200">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push('/live-practice')}
                            className="w-full py-3 mt-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Start Next Practice
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
