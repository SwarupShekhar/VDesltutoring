"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Loader2, MessageSquare, Users, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PerformanceIntelligenceDashboard } from "@/components/performance/PerformanceIntelligenceDashboard"
import { PerformanceStreakBadge } from "@/components/performance/PerformanceStreakBadge"
import { HistoricalTrendingChart } from "@/components/performance/HistoricalTrendingChart"
import { CustomDrillPanel } from "@/components/performance/CustomDrillPanel"
import { P2PCoachingFeedback } from "@/components/performance/P2PCoachingFeedback"
import { ConversationViewer } from "@/components/performance/ConversationViewer"
import type { PerformanceAnalytics, CoachingFeedback } from "@/lib/performance-engine"

type AISession = {
    id: string
    type: 'ai_tutor'
    date: Date
    duration: number
    cefrLevel?: string
    archetype?: string
    insights?: any
    patterns?: string[]
    transcript: Array<{ role: string; content: string; timestamp: Date }>
}

type LiveSession = {
    id: string
    type: 'live_practice'
    date: Date
    duration: number
    fluencyScore: number
    confidenceScore: number
    weaknesses: string[]
    drillPlan: any[]
    aiFeedback?: any
    performanceAnalytics?: PerformanceAnalytics | null
    coachingFeedback?: CoachingFeedback | null
    transcriptFull?: { conversation: any[] } | null
    transcript: Array<{ text: string; timestamp: Date }>
}

type Session = AISession | LiveSession

export default function HistoryPage() {
    const [history, setHistory] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'ai_tutor' | 'live_practice'>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Phase 3: Performance history data
    const [performanceHistory, setPerformanceHistory] = useState<any>(null)
    const [historyLoading, setHistoryLoading] = useState(true)

    useEffect(() => {
        // Fetch session history
        fetch('/api/history')
            .then(res => res.json())
            .then(data => {
                setHistory(data.history || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load history:', err)
                setLoading(false)
            })

        // Fetch performance trending data
        fetch('/api/performance/history?limit=10')
            .then(res => res.json())
            .then(data => {
                setPerformanceHistory(data)
                setHistoryLoading(false)
            })
            .catch(err => {
                console.error('Failed to load performance history:', err)
                setHistoryLoading(false)
            })
    }, [])

    const filteredHistory = filter === 'all'
        ? history
        : history.filter(s => s.type === filter)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conversation History</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Review your past AI Tutor sessions and Live Practice conversations</p>
            </div>

            {/* Phase 3: Performance Streak Badge */}
            {!historyLoading && performanceHistory?.streak?.improving && (
                <PerformanceStreakBadge
                    count={performanceHistory.streak.count}
                    system={performanceHistory.streak.system}
                    improving={performanceHistory.streak.improving}
                />
            )}

            {/* Filters */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All ({history.length})
                </Button>
                <Button
                    variant={filter === 'ai_tutor' ? 'primary' : 'outline'}
                    onClick={() => setFilter('ai_tutor')}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Tutor ({history.filter(s => s.type === 'ai_tutor').length})
                </Button>
                <Button
                    variant={filter === 'live_practice' ? 'primary' : 'outline'}
                    onClick={() => setFilter('live_practice')}
                >
                    <Users className="w-4 h-4 mr-2" />
                    Live Practice ({history.filter(s => s.type === 'live_practice').length})
                </Button>
            </div>

            {/* Phase 3: Historical Trending Chart */}
            {!historyLoading && performanceHistory?.sessions && performanceHistory.sessions.length > 0 && (
                <HistoricalTrendingChart
                    sessions={performanceHistory.sessions}
                    highlightedSystem={performanceHistory.sessions[performanceHistory.sessions.length - 1]?.primaryLimiter?.system}
                />
            )}

            {/* Session List */}
            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">No conversations yet. Start your first session!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map(session => (
                        <Card key={session.id} className="overflow-hidden">
                            <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {session.type === 'ai_tutor' ? (
                                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Users className="w-5 h-5 text-green-600" />
                                            )}
                                            <CardTitle className="text-lg">
                                                {session.type === 'ai_tutor' ? 'AI Tutor Session' : 'Live Practice'}
                                            </CardTitle>
                                            {session.type === 'ai_tutor' && session.cefrLevel && (
                                                <Badge>{session.cefrLevel}</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span>{new Date(session.date).toLocaleDateString()}</span>
                                            <span>{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                            {session.type === 'ai_tutor' && session.archetype && (
                                                <span className="italic">{session.archetype}</span>
                                            )}
                                            {session.type === 'live_practice' && (
                                                <span>Fluency: {session.fluencyScore}/100</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        {expandedId === session.id ? <ChevronUp /> : <ChevronDown />}
                                    </Button>
                                </div>
                            </CardHeader>

                            <AnimatePresence>
                                {expandedId === session.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CardContent className="border-t pt-4">
                                            {session.type === 'ai_tutor' ? (
                                                <div className="space-y-4">
                                                    {session.patterns && session.patterns.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2">Key Patterns</h4>
                                                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                                                {session.patterns.map((p, i) => <li key={i}>{p}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Transcript</h4>
                                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                                            {session.transcript.map((msg, i) => (
                                                                <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                                                    <span className="font-semibold text-xs uppercase">{msg.role}:</span>
                                                                    <p className="text-sm mt-1">{msg.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {session.coachingFeedback ? (
                                                        <div className="space-y-8">
                                                            <P2PCoachingFeedback
                                                                coachingFeedback={session.coachingFeedback}
                                                                primaryLimiter={session.performanceAnalytics?.primaryLimiter || { system: 'Unknown', label: 'Analysis Pending', score: 0, insight: '' }}
                                                                corrections={[]}
                                                            />
                                                            {session.transcriptFull && (
                                                                <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                                                                        <span>💬</span> Conversation Replay
                                                                    </h3>
                                                                    <ConversationViewer conversation={session.transcriptFull.conversation} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Fluency Score</p>
                                                                    <p className="text-2xl font-bold">{session.fluencyScore}/100</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                                                                    <p className="text-2xl font-bold">{session.confidenceScore}/100</p>
                                                                </div>
                                                            </div>
                                                            {session.weaknesses.length > 0 && (
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Areas to Improve</h4>
                                                                    <div className="flex gap-2 flex-wrap">
                                                                        {session.weaknesses.map((w, i) => (
                                                                            <Badge key={i} variant="outline">{w}</Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* AI Feedback / Refinements Section */}
                                                            {session.aiFeedback?.refinements && session.aiFeedback.refinements.length > 0 && (
                                                                <div className="mt-6 mb-6">
                                                                    <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                                                                        <span className="text-xl">🛠️</span> Top 5 Corrections
                                                                    </h4>
                                                                    <div className="grid gap-3">
                                                                        {session.aiFeedback.refinements.map((ref: any, idx: number) => (
                                                                            <div key={idx} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-lg text-sm">
                                                                                <div className="flex gap-2 mb-1">
                                                                                    <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0">You said:</span>
                                                                                    <span className="text-red-600 dark:text-red-400 line-through decoration-red-400/50">{ref.original}</span>
                                                                                </div>
                                                                                <div className="flex gap-2 mb-1">
                                                                                    <span className="text-slate-500 dark:text-slate-400 w-16 shrink-0">Better:</span>
                                                                                    <span className="text-green-600 dark:text-green-400 font-semibold">{ref.better}</span>
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    <span className="text-slate-400 dark:text-slate-500 w-16 shrink-0 text-xs">Why:</span>
                                                                                    <span className="text-slate-600 dark:text-slate-300 italic text-xs">{ref.explanation}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Performance Intelligence Dashboard */}
                                                            {session.performanceAnalytics && (
                                                                <div className="mb-6">
                                                                    <h4 className="font-semibold mb-4 text-xl text-slate-900 dark:text-white flex items-center gap-2">
                                                                        <span className="text-2xl">🧠</span> Performance Intelligence Analysis
                                                                    </h4>
                                                                    <PerformanceIntelligenceDashboard
                                                                        analytics={session.performanceAnalytics}
                                                                    />
                                                                </div>
                                                            )}

                                                            {session.transcript.length > 0 && (
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Transcript & Analysis</h4>
                                                                    <div className="space-y-1 max-h-96 overflow-y-auto">
                                                                        {session.transcript.map((msg, i) => {
                                                                            // Simple highlight logic: if msg.text contains any 'original' mistake, highlight it
                                                                            // Note: This is a loose match (includes substr). For robust matching we'd need exact offsets.
                                                                            let content = <span className="text-slate-700 dark:text-slate-300">{msg.text}</span>;

                                                                            if (session.aiFeedback?.refinements) {
                                                                                const mistakes = session.aiFeedback.refinements
                                                                                    .filter((r: any) => msg.text.toLowerCase().includes(r.original.toLowerCase()));

                                                                                if (mistakes.length > 0) {
                                                                                    // Render with highlight
                                                                                    // For now, just marking the whole line as containing an error for visibility
                                                                                    content = (
                                                                                        <span>
                                                                                            {msg.text}
                                                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                                                Error detected
                                                                                            </span>
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                            }

                                                                            return (
                                                                                <div key={i} className="text-sm p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-1 border-l-2 border-transparent hover:border-blue-300 transition-colors">
                                                                                    <p>{content}</p>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
