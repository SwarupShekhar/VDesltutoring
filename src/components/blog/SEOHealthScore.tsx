'use client'

import { CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react'

interface SEOHealthScoreProps {
    score: number
    checks: {
        id: string
        label: string
        status: 'success' | 'warning' | 'error'
        message: string
        value?: any
    }[]
}

export function SEOHealthScore({ score, checks }: SEOHealthScoreProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                    <Zap size={16} fill="currentColor" /> SEO HEALTH SCORE
                </div>
                <div className="text-2xl font-black text-rose-500">
                    {score}<span className="text-xs text-slate-600">/100</span>
                </div>
            </div>

            <div className="space-y-2">
                {checks.map(check => (
                    <div key={check.id} className="flex gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded-2xl">
                        <div className={`mt-0.5 ${
                            check.status === 'success' ? 'text-emerald-500' : 
                            check.status === 'warning' ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                            {check.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-200">{check.label}</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{check.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
