"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PerformanceStreakBadge } from "@/components/performance/PerformanceStreakBadge"
import { HistoricalTrendingChart } from "@/components/performance/HistoricalTrendingChart"

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

type Session = AISession

export default function HistoryPage() {
    const [history, setHistory] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const [performanceHistory, setPerformanceHistory] = useState<any>(null)
    const [historyLoading, setHistoryLoading] = useState(true)

    useEffect(() => {
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
                <p className="text-gray-600 dark:text-gray-400 mt-2">Review your past AI Tutor sessions</p>
            </div>

            {!historyLoading && performanceHistory?.streak?.improving && (
                <PerformanceStreakBadge
                    count={performanceHistory.streak.count}
                    system={performanceHistory.streak.system}
                    improving={performanceHistory.streak.improving}
                />
            )}

            {!historyLoading && performanceHistory?.sessions && performanceHistory.sessions.length > 0 && (
                <HistoricalTrendingChart
                    sessions={performanceHistory.sessions}
                    highlightedSystem={performanceHistory.sessions[performanceHistory.sessions.length - 1]?.primaryLimiter?.system}
                />
            )}

            {history.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">No conversations yet. Start your first session!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {history.map(session => (
                        <Card key={session.id} className="overflow-hidden">
                            <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                                            <CardTitle className="text-lg">AI Tutor Session</CardTitle>
                                            {session.cefrLevel && (
                                                <Badge>{session.cefrLevel}</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span>{new Date(session.date).toLocaleDateString()}</span>
                                            <span>{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                            {session.archetype && (
                                                <span className="italic">{session.archetype}</span>
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
