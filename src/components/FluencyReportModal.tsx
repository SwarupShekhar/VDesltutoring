import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X, CheckCircle, AlertTriangle, BookOpen, Sparkles, MessageCircle, Zap, Globe, Quote } from "lucide-react"

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

const IDENTITY_THEMES: Record<string, {
    color: string;
    bg: string;
    border: string;
    icon: any;
    accent: string;
    description: string;
}> = {
    "The Thoughtful Speaker": {
        color: "text-blue-600 dark:text-blue-400",
        bg: "from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20",
        border: "border-blue-100 dark:border-blue-500/20",
        icon: MessageCircle,
        accent: "bg-blue-500",
        description: "You take care with your words, building a foundation of clarity."
    },
    "The Flow Builder": {
        color: "text-green-600 dark:text-green-400",
        bg: "from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20",
        border: "border-green-100 dark:border-green-500/20",
        icon: Sparkles,
        accent: "bg-green-500",
        description: "You're connecting ideas with increasing smoothnes and rhythm."
    },
    "The Rapid Thinker": {
        color: "text-amber-600 dark:text-amber-400",
        bg: "from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20",
        border: "border-amber-100 dark:border-amber-500/20",
        icon: Zap,
        accent: "bg-amber-500",
        description: "Your velocity is impressive; now we're just polishing the landing."
    },
    "The Translator": {
        color: "text-purple-600 dark:text-purple-400",
        bg: "from-purple-50/50 to-fuchsia-50/50 dark:from-purple-900/20 dark:to-fuchsia-900/20",
        border: "border-purple-100 dark:border-purple-500/20",
        icon: Globe,
        accent: "bg-purple-500",
        description: "You're bridging two worlds. Let's make the bridge even shorter."
    },
    "The Storyteller": {
        color: "text-rose-600 dark:text-rose-400",
        bg: "from-rose-50/50 to-pink-50/50 dark:from-rose-900/20 dark:to-pink-900/20",
        border: "border-rose-100 dark:border-rose-500/20",
        icon: Quote,
        accent: "bg-rose-500",
        description: "You bring character to your speech. Your voice is becoming a tool of expression."
    },
    "The Explorer": {
        color: "text-slate-600 dark:text-slate-400",
        bg: "from-slate-50/50 to-gray-50/50 dark:from-slate-800/20 dark:to-gray-800/20",
        border: "border-slate-100 dark:border-slate-500/20",
        icon: BookOpen,
        accent: "bg-slate-500",
        description: "Every journey begins with discovery. You're mapping your voice."
    }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
}

export function FluencyReportModal({ report, isOpen, onClose, isLoading }: FluencyReportModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md transition-all duration-500">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-6 md:p-12 text-slate-900 dark:text-white relative transition-colors duration-300 scrollbar-hide"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all text-slate-500 dark:text-white hover:rotate-90"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-4xl font-serif font-bold mb-3 tracking-tight text-slate-900 dark:text-white">Session Reflection</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl">A curated look at your English speaking patterns and path to fluency.</p>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-xl font-serif text-blue-600 dark:text-blue-400 animate-pulse tracking-wide">Gathering insights...</p>
                            </div>
                        ) : report && report.insights ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-12"
                            >
                                {/* Identity Feature */}
                                {report.identity && (() => {
                                    const theme = IDENTITY_THEMES[report.identity.archetype] || IDENTITY_THEMES["The Explorer"];
                                    const Icon = theme.icon;
                                    return (
                                        <motion.div variants={itemVariants} className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} p-8 md:p-10 rounded-[2rem] border ${theme.border} group transition-all duration-500`}>
                                            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                                <div className={`p-5 rounded-2xl ${theme.accent} bg-opacity-20 backdrop-blur-sm`}>
                                                    <Icon size={40} className={theme.color} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 justify-center md:justify-start">
                                                        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.color}`}>Speaking Identity</span>
                                                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                                                        <span className="text-xs font-medium text-slate-400">Personalized Archetype</span>
                                                    </div>
                                                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4 leading-tight">{report.identity.archetype}</h3>
                                                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-light">{report.identity.description}</p>
                                                    <div className="mt-4 text-sm font-medium opacity-60 italic">- {theme.description}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* Insights Grid */}
                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InsightCard label="Flow & Pace" text={report.insights.fluency} color="border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5" themeColor="text-green-600 dark:text-green-400" />
                                    <InsightCard label="Structure" text={report.insights.grammar} color="border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5" themeColor="text-blue-600 dark:text-blue-400" />
                                    <InsightCard label="Word Choice" text={report.insights.vocabulary} color="border-purple-200 dark:border-purple-500/20 bg-purple-50/30 dark:bg-purple-500/5" themeColor="text-purple-600 dark:text-purple-400" />
                                </motion.div>

                                {/* Patterns Loop */}
                                {report.patterns && (
                                    <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] p-8 md:p-10 border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                            <BookOpen size={200} />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <BookOpen className="text-blue-500 dark:text-blue-400" size={24} />
                                            </div>
                                            Your Speaking Patterns
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {report.patterns.map((item, i) => (
                                                <li key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                                    <div className="mt-1.5 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shrink-0" />
                                                    <span className="text-lg font-light text-slate-700 dark:text-slate-200 leading-snug">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                {/* Refinements Section */}
                                {report.refinements && report.refinements.length > 0 && (
                                    <motion.div variants={itemVariants} className="space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                <CheckCircle size={24} />
                                            </div>
                                            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                                                Natural Refinements
                                            </h3>
                                        </div>
                                        <div className="grid gap-6">
                                            {report.refinements.map((c, i) => (
                                                <div key={i} className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                                        <div className="flex-1">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Typically said</div>
                                                            <div className="text-lg text-slate-500 dark:text-slate-400 line-through decoration-rose-500/30 decoration-2 font-light">
                                                                "{c.original}"
                                                            </div>
                                                        </div>
                                                        <div className="hidden md:block text-slate-300 dark:text-slate-800 self-end mb-1">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">More natural flow</div>
                                                            <div className="text-xl text-emerald-700 dark:text-emerald-400 font-medium">
                                                                "{c.better}"
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 font-light flex gap-3">
                                                        <span className="text-emerald-500/50">💡</span>
                                                        <p className="italic">{c.explanation}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ACTION BANNER */}
                                {report.next_step && (
                                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-10 md:p-14 rounded-[2.5rem] shadow-2xl mt-8 text-center md:text-left">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 justify-between">
                                            <div className="max-w-xl">
                                                <h4 className="text-sm font-bold uppercase tracking-[0.3em] opacity-50 mb-4">Your Next Focus</h4>
                                                <p className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
                                                    {report.next_step}
                                                </p>
                                            </div>
                                            <Link
                                                href="/ai-tutor"
                                                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl hover:bg-blue-50 dark:hover:bg-slate-800 text-center no-underline"
                                            >
                                                Start Practice
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen size={40} className="opacity-20" />
                                </div>
                                <p className="text-2xl font-serif font-bold mb-2">No results yet</p>
                                <p className="text-lg font-light">Share more thoughts in our next session so I can discover your patterns.</p>
                                <button onClick={onClose} className="mt-8 text-blue-500 font-medium hover:underline">Return to Home</button>
                            </div>
                        )
                        }
                    </motion.div >
                </div >
            )}
        </AnimatePresence>
    )
}

function InsightCard({ label, text, color, themeColor }: { label: string; text: string; color: string; themeColor: string }) {
    return (
        <div className={`p-8 rounded-[1.5rem] border ${color} flex flex-col h-full backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${themeColor.replace('text', 'bg')} opacity-50`} />
            <span className={`text-xs uppercase tracking-[0.15em] font-bold mb-4 ${themeColor} opacity-80`}>{label}</span>
            <p className="text-lg font-light leading-relaxed text-slate-800 dark:text-slate-200">{text}</p>
        </div>
    )
}
