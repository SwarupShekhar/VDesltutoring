import { getAnalyticsSummary } from '@/modules/analytics'
import { TrendingUp, TrendingDown, Clock, Award } from 'lucide-react'

// Explicitly import type for safety matching the map callbacks
import type { AnalyticsSummary } from '@/modules/analytics'

export default async function AnalyticsPage() {
    const data = await getAnalyticsSummary()

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Analytics</h1>
                <p className="text-slate-500">High-level metrics on coaching effectiveness and user progression.</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Avg Pause Reduction"
                    value={`${(data.avgPauseReduction * 100).toFixed(0)}%`}
                    icon={<TrendingDown className="w-5 h-5 text-emerald-500" />}
                    trend="Improvement per session"
                />
                <StatCard
                    label="Avg Time to Level Up"
                    value={`${data.cefrProgression.timeToLevelUpAvg} days`}
                    icon={<Clock className="w-5 h-5 text-blue-500" />}
                    trend="Across all levels"
                />
                <StatCard
                    label="Drills Completed"
                    value="1,240"
                    icon={<Award className="w-5 h-5 text-amber-500" />}
                    trend="+12% this week"
                />
                <StatCard
                    label="Active Learners"
                    value="842"
                    icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
                    trend="+5% this week"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* CEFR Funnel */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">CEFR Progression Funnel</h3>
                    <div className="space-y-4">
                        <FunnelBar label="A1 to A2" count={data.cefrProgression.a1_to_a2} total={300} color="bg-red-500" />
                        <FunnelBar label="A2 to B1" count={data.cefrProgression.a2_to_b1} total={300} color="bg-orange-500" />
                        <FunnelBar label="B1 to B2" count={data.cefrProgression.b1_to_b2} total={300} color="bg-yellow-500" />
                        <FunnelBar label="B2 to C1" count={data.cefrProgression.b2_to_c1} total={300} color="bg-green-500" />
                    </div>
                </div>

                {/* Drill Effectiveness */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Drill Effectiveness</h3>
                    <div className="space-y-4">
                        {data.drillEffectiveness.map((drill: { drillType: string; improvementRate: number }) => (
                            <div key={drill.drillType} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{drill.drillType}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Impact:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{drill.improvementRate}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversion vs Fluency Table for Investors */}
            <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Fluency vs. Conversion</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 tracking-wider">
                                <th className="pb-3 pl-2">Initial Fluency Score</th>
                                <th className="pb-3 text-right pr-2">Premium Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.conversionVsFluency.map((row: { fluencyBin: string; conversionRate: number }) => (
                                <tr key={row.fluencyBin}>
                                    <td className="py-3 pl-2 font-medium text-slate-700 dark:text-slate-300">{row.fluencyBin}</td>
                                    <td className="py-3 text-right pr-2 font-mono text-slate-600 dark:text-slate-400">{(row.conversionRate * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{trend}</div>
        </div>
    )
}

function FunnelBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const width = Math.max(5, (count / 150) * 100) // Scaling for demo visual
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-slate-500">{count} learners</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }}></div>
                </div>
            </div>
        </div>
    )
}
