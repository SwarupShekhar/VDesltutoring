"use client"

import { useState } from 'react'
import { SessionManager } from './SessionManager'
import { StudentList } from './StudentList'
import { CreditAdjustmentForm } from './CreditAdjustmentForm'
import { HealthOverview } from './HealthOverview'
import { AtRiskPanel } from './AtRiskPanel'
import { TutorPerformance } from './TutorPerformance'
import { RevenueHealth } from './RevenueHealth'
import { LayoutDashboard, BrainCircuit, Users, Settings2 } from 'lucide-react'

export function DashboardTabs({
    students,
    unassignedSessions,
    scheduledSessions,
    pastSessions,
    locale
}: any) {
    const [activeTab, setActiveTab] = useState<'intelligence' | 'operations'>('intelligence')

    return (
        <div className="space-y-8">
            <HealthOverview />

            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('intelligence')}
                    className={`px-6 py-3 font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'intelligence'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    <BrainCircuit className="w-4 h-4" />
                    Learning Intelligence
                </button>
                <button
                    onClick={() => setActiveTab('operations')}
                    className={`px-6 py-3 font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'operations'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    <Settings2 className="w-4 h-4" />
                    Operations Center
                </button>
            </div>

            {activeTab === 'intelligence' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <AtRiskPanel />
                        <TutorPerformance />
                    </div>
                    <RevenueHealth />
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <section>
                        <SessionManager
                            unassigned={unassignedSessions}
                            upcoming={scheduledSessions}
                            past={pastSessions}
                            locale={locale}
                        />
                    </section>
                    <section>
                        <StudentList students={students} />
                    </section>
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CreditAdjustmentForm />
                    </section>
                </div>
            )}
        </div>
    )
}
