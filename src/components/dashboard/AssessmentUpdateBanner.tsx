"use client"

import { motion } from "framer-motion"
import { Sparkles, Info, ArrowRight } from "lucide-react"

interface AssessmentUpdateBannerProps {
    currentVersion: string;
    profileVersion?: string;
    onUpdate?: () => void;
}

/**
 * AssessmentUpdateBanner - Notifies users when the CEFR logic has been updated
 */
export function AssessmentUpdateBanner({
    currentVersion,
    profileVersion,
    onUpdate
}: AssessmentUpdateBannerProps) {
    // Only show if there's a version mismatch and we have a previous version
    if (!profileVersion || profileVersion === currentVersion) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 overflow-hidden"
        >
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-blue-900/40 border border-indigo-200/50 dark:border-indigo-500/20 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Assessment Rules Updated
                            <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
                                {currentVersion}
                            </span>
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            We've refined our fluency engine for better accuracy. Your current level was based on <span className="font-mono text-xs">{profileVersion}</span>.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onUpdate}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm whitespace-nowrap active:scale-95"
                >
                    Refresh Assessment
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
