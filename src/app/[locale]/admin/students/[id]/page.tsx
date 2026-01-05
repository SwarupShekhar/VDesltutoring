"use client"

import { useEffect, useState, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkillRadar } from '@/components/dashboard/SkillRadar'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    ArrowLeft,
    ShieldAlert,
    MessageSquare,
    History,
    Brain,
    Trophy
} from 'lucide-react'
import { format } from 'date-fns'

export default function StudentIntelligencePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const { id } = params
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch(`/api/admin/student/${id}/intelligence`)
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [id])

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
                <div className="lg:col-span-2 h-[400px] bg-slate-100 animate-pulse rounded-2xl" />
            </div>
        </div>
    )

    if (!data || data.error) return <div className="p-8 text-center text-red-500">Student not found or error loading data.</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{data.name}</h1>
                    <p className="text-slate-500">{data.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-2 
                        ${data.riskScore > 50 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        <ShieldAlert className="w-5 h-5" />
                        Risk Score: {data.riskScore}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: CEFR Radar */}
                <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-500" />
                            CEFR Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.cefrProfile ? (
                            <SkillRadar profile={data.cefrProfile} size="md" />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-400">
                                No CEFR data yet
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Fluency History */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-500" />
                            Fluency Progression
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {data.fluencyHistory?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.fluencyHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                        fontSize={12}
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        labelFormatter={(label) => format(new Date(label), 'PPP')}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="wpm"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981' }}
                                        name="Words Per Minute"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="fillers"
                                        stroke="#f43f5e"
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: '#f43f5e' }}
                                        name="Filler Rate"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Not enough data for history
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AI Observations */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            Recent AI Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.lastAIObservations?.map((obs: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2 font-medium">
                                        {format(new Date(obs.date), 'PPP p')}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-3">
                                        "{obs.summary}"
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Fluency</p>
                                            <p className="text-sm font-bold text-emerald-600">{obs.scores.fluency?.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Grammar</p>
                                            <p className="text-sm font-bold text-blue-600">{obs.scores.grammar?.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Vocab</p>
                                            <p className="text-sm font-bold text-purple-600">{obs.scores.vocabulary?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Practice Scores */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Recent Training Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentPracticeScores?.length > 0 ? (
                                data.recentPracticeScores.map((score: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Practice Session</p>
                                            <p className="text-xs text-slate-500">{format(new Date(score.date), 'PPP')}</p>
                                        </div>
                                        <div className="text-right max-w-[200px]">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{score.notes || 'No notes'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-slate-400">No practice sessions found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
