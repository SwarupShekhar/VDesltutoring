import { motion } from "framer-motion"
import { X, CheckCircle, AlertTriangle, BookOpen } from "lucide-react"

interface Report {
    identity?: {
        archetype: string
        description: string
    }
    insights: {
        fluency: string
        grammar: string
        vocabulary: string
    }
    patterns: string[]
    refinements: Array<{ original: string; better: string; explanation: string }>
    next_step?: string
}

interface FluencyReportModalProps {
    report: Report | null
    isOpen: boolean
    onClose: () => void
    isLoading: boolean
}

export function FluencyReportModal({ report, isOpen, onClose, isLoading }: FluencyReportModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 text-slate-900 dark:text-white relative transition-colors duration-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-3xl font-serif font-bold mb-2 text-slate-900 dark:text-white">Session Reflection</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-8">Here are some observations about your speaking style.</p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-600 dark:text-blue-300 animate-pulse">Gathering insights...</p>
                    </div>
                ) : report && report.insights ? (
                    <div className="space-y-8">
                        {/* Identity Badge */}
                        {report.identity && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-2 block">Your Speaking Identity</span>
                                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">{report.identity.archetype}</h3>
                                <p className="text-slate-700 dark:text-slate-300">{report.identity.description}</p>
                            </div>
                        )}
                        {/* Insights (formerly Scores) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InsightCard label="Flow & Pace" text={report.insights.fluency} color="border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-900/10" />
                            <InsightCard label="Structure" text={report.insights.grammar} color="border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10" />
                            <InsightCard label="Word Choice" text={report.insights.vocabulary} color="border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10" />
                        </div>

                        {/* Patterns (formerly Feedback) */}
                        {report.patterns && (
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-8 border border-slate-100 dark:border-white/5">
                                <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <BookOpen className="text-blue-500 dark:text-blue-400" size={24} />
                                    Your Speaking Patterns
                                </h3>
                                <ul className="space-y-4">
                                    {report.patterns.map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-lg font-light text-slate-700 dark:text-gray-200">
                                            <span className="mt-2 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Refinements (formerly Corrections) */}
                        {report.refinements && report.refinements.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-serif font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <CheckCircle className="text-green-500 dark:text-green-400" size={24} />
                                    Natural Refinements
                                </h3>
                                <div className="grid gap-4">
                                    {report.refinements.map((c, i) => (
                                        <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                            <div className="mb-3 text-slate-500 dark:text-gray-400 line-through decoration-red-400/50 text-base">
                                                {c.original}
                                            </div>
                                            <div className="flex items-center gap-3 text-green-700 dark:text-green-400 font-medium text-lg mb-2">
                                                <span>→</span> {c.better}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-gray-500 italic mt-2 ml-6 border-l-2 border-slate-200 dark:border-white/10 pl-3">
                                                {c.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NEXT STEP CHALLENGE (New) */}
                        {report.next_step && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 p-8 rounded-3xl shadow-xl mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Your Next Mission</h3>
                                <p className="text-2xl font-serif font-bold mb-6 leading-tight">
                                    {report.next_step}
                                </p>
                                <button onClick={onClose} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-3 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg">
                                    Ready for one more?
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-gray-400">
                        <p>No reflection data available yet.</p>
                        <p className="text-sm mt-2">Share more thoughts so I can discover your patterns.</p>
                    </div>
                )
                }
            </motion.div >
        </div >
    )
}

function InsightCard({ label, text, color }: { label: string; text: string; color: string }) {
    return (
        <div className={`p-6 rounded-2xl border ${color} flex flex-col h-full`}>
            <span className="text-xs uppercase tracking-widest font-bold opacity-60 mb-3">{label}</span>
            <p className="text-base font-medium leading-relaxed opacity-90">{text}</p>
        </div>
    )
}
