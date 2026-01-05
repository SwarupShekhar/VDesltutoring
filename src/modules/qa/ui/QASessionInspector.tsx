"use client"

import { useState } from 'react'
import { QATurnSnapshot } from '../types'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Clock, Star, AlertTriangle, MessageSquare, Brain, Activity, ChevronRight } from 'lucide-react'

interface QASessionInspectorProps {
    turns: QATurnSnapshot[] // Pre-fetched or passed in
}

export function QASessionInspector({ turns }: QASessionInspectorProps) {
    const [selectedTurnId, setSelectedTurnId] = useState<string>(turns[0]?.turnId)
    const selectedTurn = turns.find(t => t.turnId === selectedTurnId)

    if (!selectedTurn) return <div>No turns available</div>

    const radarData = [
        { subject: 'Fluency', A: selectedTurn.cefr.breakdown.fluency, fullMark: 100 },
        { subject: 'Pronunciation', A: selectedTurn.cefr.breakdown.pronunciation, fullMark: 100 },
        { subject: 'Grammar', A: selectedTurn.cefr.breakdown.grammar, fullMark: 100 },
        { subject: 'Vocabulary', A: selectedTurn.cefr.breakdown.vocabulary, fullMark: 100 },
        { subject: 'Coherence', A: selectedTurn.cefr.breakdown.coherence, fullMark: 100 },
    ]

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900">
            {/* Left Column: List */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-white dark:bg-slate-900">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100">Session Turns</h2>
                </div>
                <div>
                    {turns.map(turn => (
                        <button
                            key={turn.turnId}
                            onClick={() => setSelectedTurnId(turn.turnId)}
                            className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedTurnId === turn.turnId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-slate-500">
                                    {new Date(turn.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${turn.fluency.score > 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {turn.cefr.level}
                                </span>
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                                {turn.transcript}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> {turn.fluency.score}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500" /> {turn.fluency.stars}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Detail */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Section 1: Transcript */}
                    <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
                            <MessageSquare className="w-5 h-5 text-blue-500" /> Transcript
                        </h3>
                        <p className="text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                            "{selectedTurn.transcript}"
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 2: Fluency Engine */}
                        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
                                <Activity className="w-5 h-5 text-emerald-500" /> Fluency Engine
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <Stat label="Pause Ratio" value={`${(selectedTurn.deepgram.pauseRatio * 100).toFixed(1)}%`} />
                                <Stat label="Fillers" value={`${(selectedTurn.deepgram.fillerRate * 100).toFixed(1)}%`} />
                                <Stat label="Restarts" value={`${(selectedTurn.deepgram.restartRate * 100).toFixed(1)}%`} />
                                <Stat label="WPM" value={selectedTurn.deepgram.wpm.toFixed(0)} />
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Score</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedTurn.fluency.score.toFixed(2)} ({selectedTurn.fluency.stars}★)
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider">Detected Patterns</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTurn.fluency.patterns.map(p => (
                                            <span key={p} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: CEFR Engine */}
                        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
                                <Star className="w-5 h-5 text-purple-500" /> CEFR Engine
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar
                                            name="Skills"
                                            dataKey="A"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                    {selectedTurn.cefr.level}
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Section 4: Coaching Engine */}
                    <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
                            <Brain className="w-5 h-5 text-amber-500" /> Coaching Engine
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="text-sm text-slate-500 mb-1">Selected Micro-Lesson</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    "{selectedTurn.coaching.selectedLesson}"
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-slate-500 mb-1">Reason</div>
                                <div className="text-base text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                    {selectedTurn.coaching.lessonReason}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: AI Brain */}
                    <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
                            <Brain className="w-5 h-5 text-indigo-500" /> AI Brain
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System Prompt</div>
                                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap max-h-40">
                                    {selectedTurn.ai.systemPrompt}
                                </pre>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Raw Model Response</div>
                                    <pre className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 p-3 rounded-lg text-xs overflow-x-auto">
                                        {selectedTurn.ai.rawResponse}
                                    </pre>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Response</div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 p-3 rounded-lg text-sm">
                                        {selectedTurn.ai.finalResponse}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="font-mono font-medium text-slate-900 dark:text-slate-200">{value}</div>
        </div>
    )
}
