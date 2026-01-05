"use client"

import { useState } from 'react'
import { AdminSettings } from '../types'
import { Save, RefreshCw, Sliders } from 'lucide-react'

export function AdminControls() {
    // Mock initial state - in real app would fetch from API
    const [settings, setSettings] = useState<AdminSettings>({
        fluency: {
            strictness: 1.0,
            pauseTolerance: 0.15,
            fillerTolerance: 0.10
        },
        cefr: {
            a1_cutoff: 20,
            a2_cutoff: 35,
            b1_cutoff: 55,
            b2_cutoff: 70,
            c1_cutoff: 85,
            c2_cutoff: 95
        },
        coaching: {
            drillDifficultyOffset: 0,
            enableMicroLessons: true
        }
    })

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        // Mock save delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        alert("Settings updated! AI parameters adjusted without redeploy.")
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-500" />
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">AI Engine Parameters</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Syncing..." : "Update Engine"}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Fluency Engine */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        Fluency Engine
                    </h3>

                    <ControlGroup label="Scoring Strictness" value={settings.fluency.strictness.toFixed(1)}>
                        <input
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={settings.fluency.strictness}
                            onChange={e => setSettings({ ...settings, fluency: { ...settings.fluency, strictness: parseFloat(e.target.value) } })}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Forgiving</span>
                            <span>Standard</span>
                            <span>Strict</span>
                        </div>
                    </ControlGroup>

                    <ControlGroup label="Pause Tolerance" value={`${(settings.fluency.pauseTolerance * 100).toFixed(0)}%`}>
                        <input
                            type="range" min="0.05" max="0.30" step="0.01"
                            value={settings.fluency.pauseTolerance}
                            onChange={e => setSettings({ ...settings, fluency: { ...settings.fluency, pauseTolerance: parseFloat(e.target.value) } })}
                            className="w-full accent-emerald-500"
                        />
                    </ControlGroup>

                    <ControlGroup label="Filler Tolerance" value={`${(settings.fluency.fillerTolerance * 100).toFixed(0)}%`}>
                        <input
                            type="range" min="0.05" max="0.25" step="0.01"
                            value={settings.fluency.fillerTolerance}
                            onChange={e => setSettings({ ...settings, fluency: { ...settings.fluency, fillerTolerance: parseFloat(e.target.value) } })}
                            className="w-full accent-emerald-500"
                        />
                    </ControlGroup>
                </div>

                {/* CEFR Engine */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        CEFR Thresholds
                    </h3>

                    <div className="space-y-4">
                        {['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].map((level) => (
                            <div key={level} className="flex items-center justify-between">
                                <label className="text-sm font-medium uppercase text-slate-500 w-8">{level}</label>
                                <input
                                    type="number"
                                    value={(settings.cefr as any)[`${level}_cutoff`]}
                                    onChange={e => setSettings({ ...settings, cefr: { ...settings.cefr, [`${level}_cutoff`]: parseInt(e.target.value) } })}
                                    className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coaching Engine */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        Coaching & Drills
                    </h3>

                    <ControlGroup label="Drill Difficulty Bias" value={settings.coaching.drillDifficultyOffset > 0 ? `+${settings.coaching.drillDifficultyOffset}` : settings.coaching.drillDifficultyOffset.toString()}>
                        <input
                            type="range" min="-1" max="1" step="0.5"
                            value={settings.coaching.drillDifficultyOffset}
                            onChange={e => setSettings({ ...settings, coaching: { ...settings.coaching, drillDifficultyOffset: parseFloat(e.target.value) } })}
                            className="w-full accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Easier</span>
                            <span>Neutral</span>
                            <span>Harder</span>
                        </div>
                    </ControlGroup>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.coaching.enableMicroLessons}
                            onChange={e => setSettings({ ...settings, coaching: { ...settings.coaching, enableMicroLessons: e.target.checked } })}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Micro-Lesson triggers</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

function ControlGroup({ label, value, children }: { label: string, value: string, children: React.ReactNode }) {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{value}</span>
            </div>
            {children}
        </div>
    )
}
