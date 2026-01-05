"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Users, Activity, BarChart3 } from 'lucide-react'

export function HealthOverview() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/learning-health')
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading) return <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
    if (!data) return null

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Learning Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Today</p>
                                <h3 className="text-2xl font-bold mt-1">{data.activeToday}</h3>
                            </div>
                            <Users className="w-4 h-4 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Fluency Δ (7d)</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <h3 className={`text-2xl font-bold ${data.avgFluencyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {data.avgFluencyChange > 0 ? '+' : ''}{data.avgFluencyChange}
                                    </h3>
                                    {data.avgFluencyChange >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">CEFR Δ (7d)</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <h3 className={`text-2xl font-bold ${data.avgCefrChange >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                        {data.avgCefrChange > 0 ? '+' : ''}{data.avgCefrChange}
                                    </h3>
                                    <BarChart3 className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50">
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Improving</p>
                            <h3 className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                                {data.improvingPercent}%
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50">
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Declining</p>
                            <h3 className="text-2xl font-bold mt-1 text-red-700 dark:text-red-300">
                                {data.decliningPercent}%
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
