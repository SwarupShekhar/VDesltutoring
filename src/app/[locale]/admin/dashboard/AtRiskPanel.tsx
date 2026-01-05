"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertCircle, ArrowUpRight, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export function AtRiskPanel() {
    const [learners, setLearners] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { locale } = useParams()

    useEffect(() => {
        fetch('/api/admin/at-risk-learners')
            .then(res => res.json())
            .then(d => {
                setLearners(d)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading) return <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
    if (learners.length === 0) return null

    return (
        <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    Learners Needing Attention
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                <th className="pb-3 pr-4 font-semibold">Name</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Trend</th>
                                <th className="pb-3 pr-4 font-semibold text-center">CEFR</th>
                                <th className="pb-3 pr-4 font-semibold">Last Active</th>
                                <th className="pb-3 font-semibold">Issue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {learners.map((learner) => (
                                <tr key={learner.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 pr-4">
                                        <Link
                                            href={`/${locale}/admin/students/${learner.id}`}
                                            className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                                        >
                                            {learner.name}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${learner.fluencyTrend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {learner.fluencyTrend > 0 ? '+' : ''}{learner.fluencyTrend}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                                            {learner.cefr}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                                        {learner.lastActive ? (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(learner.lastActive), { addSuffix: true })}
                                            </div>
                                        ) : 'Never'}
                                    </td>
                                    <td className="py-3 text-red-600 dark:text-red-400 font-medium italic">
                                        {learner.issue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
