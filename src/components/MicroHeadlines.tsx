'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Compass, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export function MicroHeadlines({ locale }: { locale: string }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-20 bg-background relative z-10">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* 1) Section Title Block */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-3xl md:text-5xl mb-6 text-foreground"
                    >
                        From Knowing English → Thinking in English
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-3xl mx-auto"
                    >
                        A clear path from translation, to reflex, to confident professional speaking — measured with CEFR signals, not grammar tests.
                    </motion.p>
                </div>

                {/* 2) Three Micro-Headlines (Cards) */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left"
                >
                    {/* Card A — The Problem */}
                    <motion.div variants={item} className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:border-indigo-500/30 transition-colors flex flex-col h-full">
                        <div className="w-12 h-12 mb-6 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                            <Brain size={24} />
                        </div>
                        <h3 className="font-semibold text-xl mb-3 text-foreground">You Don’t Need More Grammar</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                            You already “know” English. The gap is speed — your brain is translating instead of responding.
                        </p>
                        <Link href={`/${locale}/blog/stop-translating-in-head`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline mt-auto">
                            Why this happens <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </motion.div>

                    {/* Card B — The Path */}
                    <motion.div variants={item} className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:border-indigo-500/30 transition-colors flex flex-col h-full">
                        <div className="w-12 h-12 mb-6 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                            <Compass size={24} />
                        </div>
                        <h3 className="font-semibold text-xl mb-3 text-foreground">CEFR Is About Processing, Not Vocabulary</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                            B2 isn’t harder words. It’s natural pauses, structured ideas, and thinking without detours.
                        </p>
                        <Link href={`/${locale}/fluency-guide`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline mt-auto">
                            See the roadmap <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </motion.div>

                    {/* Card C — The Practice */}
                    <motion.div variants={item} className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:border-indigo-500/30 transition-colors flex flex-col h-full">
                        <div className="w-12 h-12 mb-6 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                            <Mic size={24} />
                        </div>
                        <h3 className="font-semibold text-xl mb-3 text-foreground">Fluency Is Conditioned, Not Studied</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                            Live interaction, micro-feedback, and chunk training build what textbooks cannot: reflex.
                        </p>
                        <div className="flex flex-col gap-2 mt-auto">
                            <Link href="/ai-tutor" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline">
                                <span className="mr-2">👉</span> Try AI Tutor
                            </Link>
                            <Link href={`/${locale}/live-practice`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline">
                                <span className="mr-2">👉</span> Talk to a partner
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>

                {/* 3) Trust Line */}
                <div className="text-center mb-12">
                    <p className="inline-block px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium border border-border">
                        Used by professionals to move from “I know what to say” → “I can say it now.”
                    </p>
                </div>

                {/* Optional: Tiny Conversion Bar */}
                <div className="flex justify-center">
                    <Link href="/ai-tutor" className="group flex items-center gap-2 text-sm text-foreground hover:text-indigo-600 transition-colors">
                        <span className="text-muted-foreground">Not sure where you stand?</span>
                        <span className="font-semibold underline decoration-indigo-500/30 group-hover:decoration-indigo-500">Get your CEFR speaking snapshot in 2 minutes</span>
                        <ArrowRight size={16} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </section>
    );
}
