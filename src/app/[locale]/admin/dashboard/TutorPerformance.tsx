"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { GraduationCap, Users, Trophy, Percent } from 'lucide-react'

export function TutorPerformance() {
    const [tutors, setTutors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/tutor-performance')
            .then(res => res.json())
            .then(d => {
                setTutors(d)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading) return <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    Tutor Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                <th className="pb-3 pr-4 font-semibold">Tutor</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Students</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Avg Fluency Gain</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Avg CEFR Gain</th>
                                <th className="pb-3 font-semibold text-center">Retention</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tutors.map((tutor) => (
                                <tr key={tutor.tutor} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                                        {tutor.tutor}
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
                                            <Users className="w-3 h-3" />
                                            {tutor.students}
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tutor.avgFluencyGain >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {tutor.avgFluencyGain > 0 ? '+' : ''}{tutor.avgFluencyGain} pts
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tutor.avgCefrGain >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {tutor.avgCefrGain > 0 ? '+' : ''}{tutor.avgCefrGain} lvl pts
                                        </span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-900 dark:text-white">{tutor.retention}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all"
                                                    style={{ width: `${tutor.retention}%` }}
                                                />
                                            </div>
                                        </div>
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
