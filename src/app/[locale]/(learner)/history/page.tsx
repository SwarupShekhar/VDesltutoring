"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Loader2, MessageSquare, Users, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    transcript: Array<{ text: string; timestamp: Date }>
}

type Session = AISession | LiveSession

export default function HistoryPage() {
    const [history, setHistory] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'ai_tutor' | 'live_practice'>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

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
                                                    {session.transcript.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2">Transcript</h4>
                                                            <div className="space-y-1 max-h-96 overflow-y-auto">
                                                                {session.transcript.map((msg, i) => (
                                                                    <p key={i} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">{msg.text}</p>
                                                                ))}
                                                            </div>
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
