import { motion } from "framer-motion"
import { X, CheckCircle, AlertTriangle, BookOpen } from "lucide-react"

interface Report {
    scores: {
        fluency: number
        grammar: number
        vocabulary: number
    }
    feedback: string[]
    corrections: Array<{ original: string; correction: string; explanation: string }>
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 text-slate-900 dark:text-white relative transition-colors duration-300"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-3xl font-serif font-bold mb-2 text-slate-900 dark:text-white">Session Report</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-8">Here is how you performed in this session.</p>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-600 dark:text-blue-300 animate-pulse">Analyzing your fluency...</p>
                    </div>
                ) : report && report.scores ? (
                    <div className="space-y-8">
                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-4">
                            <ScoreCard label="Fluency" score={report.scores.fluency} color="text-green-600 dark:text-green-400" />
                            <ScoreCard label="Grammar" score={report.scores.grammar} color="text-blue-600 dark:text-blue-400" />
                            <ScoreCard label="Vocabulary" score={report.scores.vocabulary} color="text-purple-600 dark:text-purple-400" />
                        </div>

                        {/* Feedback */}
                        {report.feedback && (
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-transparent">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
                                    Key Feedback
                                </h3>
                                <ul className="space-y-2">
                                    {report.feedback.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-gray-300">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Corrections */}
                        {report.corrections && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <AlertTriangle className="text-yellow-500 dark:text-yellow-400" size={20} />
                                    Corrections
                                </h3>
                                {report.corrections.map((c, i) => (
                                    <div key={i} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-300 mb-1 line-through text-sm opacity-70">
                                            <X size={14} /> {c.original}
                                        </div>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mb-2">
                                            <CheckCircle size={14} /> {c.correction}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-gray-500 flex items-center gap-1">
                                            <BookOpen size={12} /> {c.explanation}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-red-500 dark:text-red-400">
                        <p>No report data available.</p>
                        <p className="text-sm text-slate-500 dark:text-gray-500 mt-2">Try speaking more during the session.</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
            <span className={`text-3xl font-bold ${color}`}>{score}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-500 mt-1">{label}</span>
        </div>
    )
}
