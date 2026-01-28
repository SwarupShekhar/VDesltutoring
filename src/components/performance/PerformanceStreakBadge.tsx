'use client';

import { motion } from 'framer-motion';

interface PerformanceStreakBadgeProps {
    count: number;
    system: string;
    improving: boolean;
}

const SYSTEM_LABELS: Record<string, string> = {
    cognitiveReflex: 'Cognitive Reflex',
    speechRhythm: 'Speech Rhythm',
    languageMaturity: 'Language Maturity',
    socialPresence: 'Social Presence',
    pressureStability: 'Pressure Stability'
};

export function PerformanceStreakBadge({ count, system, improving }: PerformanceStreakBadgeProps) {
    if (!improving || count < 3) {
        return null;
    }

    const systemLabel = SYSTEM_LABELS[system] || system;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl shadow-sm mb-6"
        >
            <div className="flex items-center gap-3">
                {/* Fire emoji animation */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-4xl"
                >
                    🔥
                </motion.div>

                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                            {count}-Session Streak
                        </h3>
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                            Improving!
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        <span className="font-semibold">{systemLabel}</span> is getting better across your last {count} sessions.
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="hidden sm:flex flex-col items-center gap-1">
                    {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ width: 0 }}
                            animate={{ width: 40 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            className="h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
