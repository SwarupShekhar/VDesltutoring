'use client';

import { motion } from 'framer-motion';
import { Headphones, Mic, Moon } from 'lucide-react';

const icons = {
    Absorb: Headphones,
    Reflect: Mic,
    Consolidate: Moon,
};

export function DailyRoutine({ dict }: { dict: any }) {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-20">
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
                        {dict.headline}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {dict.subtext}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
                    {dict.steps.map((step: any, idx: number) => {
                        // Cast key to keyof typeof icons to fix TS index error, or fallback
                        // Assuming titles match keys "Absorb", "Reflect", "Consolidate".
                        // Use idx to map to icon if title varies?
                        // Let's use ordered icons array for safety.
                        const Icon = [Headphones, Mic, Moon][idx];

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.2 }}
                                className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-lg transition-shadow relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-6xl font-serif font-bold text-slate-900 dark:text-white">
                                        0{idx + 1}
                                    </span>
                                </div>

                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                                    <Icon size={24} />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {step.title}
                                </h3>

                                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                    {step.time}
                                </div>

                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
