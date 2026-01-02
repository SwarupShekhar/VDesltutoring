'use client';

import { motion } from 'framer-motion';

export function IntermediatePlateau({ dict }: { dict: any }) {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
                        {dict.headline}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        {dict.subtext}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Path 1: The Trap (Translation Loop) */}
                    <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-red-100 dark:border-red-900/20">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 to-red-500/0" />

                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {dict.trap.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                            {dict.trap.desc}
                        </p>

                        {/* Visualization: Jagged Path */}
                        <div className="h-32 relative flex items-center justify-between px-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Thought</span>

                            <div className="flex-1 mx-4 relative h-full flex items-center">
                                {/* Base Line */}
                                <svg className="w-full h-20 overflow-visible" preserveAspectRatio="none">
                                    <path
                                        d="M0,40 Q20,10 40,40 T80,40 T120,40 T160,40"
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-red-200 dark:text-red-900/30"
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Animated Jagged Path */}
                                    <motion.path
                                        d="M0,40 L30,10 L60,70 L90,20 L120,60 L150,40 L180,50 L210,30 L240,40" // Approximate jagged line
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-red-500 opacity-50"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    {/* Monitor Nodes */}
                                    <motion.circle cx="60" cy="70" r="4" className="fill-red-500" initial={{ opacity: 0 }} whileInView={{ opacity: [0, 1, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
                                    <motion.circle cx="120" cy="60" r="4" className="fill-red-500" initial={{ opacity: 0 }} whileInView={{ opacity: [0, 1, 0] }} transition={{ duration: 2, delay: 1.0, repeat: Infinity }} />
                                </svg>
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Speech</span>
                        </div>
                    </div>

                    {/* Path 2: Englivo */}
                    <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-blue-100 dark:border-blue-900/20">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 to-blue-500/0" />

                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            {dict.flow.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                            {dict.flow.desc}
                        </p>

                        {/* Visualization: Smooth Flow */}
                        <div className="h-32 relative flex items-center justify-between px-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Thought</span>

                            <div className="flex-1 mx-4 relative h-full flex items-center">
                                {/* Flow Line */}
                                <div className="w-full h-[2px] bg-blue-100 dark:bg-blue-900/30 relative overflow-hidden rounded-full">
                                    <motion.div
                                        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-[1px]"
                                        animate={{ x: ["-100%", "300%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Speech</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
