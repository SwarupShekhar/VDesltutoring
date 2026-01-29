
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { P2PCoachingFeedback } from "@/components/performance/P2PCoachingFeedback";
import { ConversationViewer } from "@/components/performance/ConversationViewer";
import type { CoachingFeedback } from "@/lib/performance-engine";

interface ReportData {
    fluencyScore: number;
    confidenceScore: number;
    weaknesses: string[];
    drillPlan: Array<{
        weakness: string;
        exercise: string;
        difficulty: string;
    }>;
    coachingFeedback?: CoachingFeedback;
    performanceAnalytics?: any;
    transcriptFull?: { conversation: any[] };
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

    // Fallback if coaching feedback is not yet generated
    // This handles old sessions or sessions processed before the coaching engine was live
    const showLegacyReport = !data.coachingFeedback;

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            {showLegacyReport ? "Session Report" : "Performance Coaching"}
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

                {showLegacyReport ? (
                    // Legacy Layout
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
                        <div className="text-4xl font-bold mb-4 text-white">{Math.round(data.fluencyScore)}</div>
                        <p className="text-zinc-400">Fluency Score</p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-zinc-800 p-4 rounded-xl">
                                <div className="text-xl font-bold text-indigo-400">{data.metrics.wordCount}</div>
                                <div className="text-xs text-zinc-500">Words Spoken</div>
                            </div>
                            <div className="bg-zinc-800 p-4 rounded-xl">
                                <div className="text-xl font-bold text-rose-400">{data.metrics.grammarErrors}</div>
                                <div className="text-xs text-zinc-500">Grammar Alerts</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // NEW Coaching UI
                    <div className="space-y-12">
                        <P2PCoachingFeedback
                            coachingFeedback={data.coachingFeedback!}
                            primaryLimiter={data.performanceAnalytics?.primaryLimiter || { system: 'Unknown', label: 'Analysis Pending' }}
                            corrections={[]} // TODO: Pass real corrections if available in API
                        />

                        {data.transcriptFull && (
                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span>💬</span> Conversation Replay
                                </h3>
                                <ConversationViewer conversation={data.transcriptFull.conversation} />
                            </div>
                        )}
                    </div>
                )}

                {/* Action Button */}
                {!showLegacyReport && (
                    <button
                        onClick={() => router.push('/live-practice')}
                        className="w-full py-4 bg-white text-black hover:bg-zinc-200 font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Start Next Practice
                    </button>
                )}
            </div>
        </div>
    );
}
