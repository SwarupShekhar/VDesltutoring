"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wallet, Flame, Calendar, ShieldAlert } from 'lucide-react'

export function RevenueHealth() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/revenue-health')
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading) return <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-500" />
                    Revenue & Retention
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                <th className="pb-3 pr-4 font-semibold">Student</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Credits</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Burn Rate</th>
                                <th className="pb-3 pr-4 font-semibold text-center">Days Left</th>
                                <th className="pb-3 font-semibold">Risk Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                                        {row.student}
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            {row.credits}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-1">
                                            <Flame className="w-3 h-3 text-orange-500" />
                                            {row.burnRate}/day
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-semibold">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {row.daysLeft}
                                        </div>
                                    </td>
                                    <td className="py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit
                                            ${row.risk.includes('🔴') ? 'bg-red-100 text-red-700' :
                                                row.risk.includes('🟡') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'}`}
                                        >
                                            {row.risk.includes('🔴') || row.risk.includes('🟡') ? <ShieldAlert className="w-3 h-3" /> : null}
                                            {row.risk}
                                        </span>
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
