'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PrimaryLimiter } from '@/lib/performance-engine';

interface CustomDrillPanelProps {
    primaryLimiter: PrimaryLimiter;
    userId: string;
}

interface DrillData {
    title: string;
    description: string;
    exercises: string[];
}

export function CustomDrillPanel({ primaryLimiter, userId }: CustomDrillPanelProps) {
    const [drill, setDrill] = useState<DrillData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateDrills = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/drills/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    limiterSystem: primaryLimiter.system,
                    limiterScore: primaryLimiter.score
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate drills');
            }

            const data = await response.json();
            setDrill(data.drill);
        } catch (err) {
            console.error('Drill generation error:', err);
            setError('Failed to generate drills. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            {!drill && (
                <button
                    onClick={handleGenerateDrills}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <span>🎯</span>
                            Generate Practice Drills
                        </>
                    )}
                </button>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <AnimatePresence>
                {drill && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 p-5 rounded-xl"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                    <span>🎯</span>
                                    {drill.title}
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    {drill.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setDrill(null)}
                                className="text-blue-400 hover:text-blue-600 transition-colors"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 mt-4">
                            {drill.exercises.map((exercise, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                                        {exercise}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                            <button
                                onClick={handleGenerateDrills}
                                disabled={loading}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                            >
                                🔄 Generate New Drills
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
