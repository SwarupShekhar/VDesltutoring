'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export function SituationalGateway({ dict }: { dict: any }) {
    const { isSignedIn } = useUser();
    const params = useParams();
    const router = useRouter(); // Create router instance
    const locale = params?.locale || 'en';
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const activeCtaText = hoveredCategory
        ? dict.cards.find((s: any) => s.category === hoveredCategory)?.ctaText
        : dict.defaultCta;

    const handleCtaClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
            router.push(`/${locale}/${isSignedIn ? 'practice' : 'sign-up'}`);
        }, 1500); // 1.5s delay for the "ceremony"
    };

    return (
        <section className="py-24 relative overflow-hidden min-h-[800px]">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {!isNavigating ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-16">
                                <h2 className="font-serif text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">{dict.headline}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-light max-w-xl mx-auto text-lg">
                                    {dict.subtext}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {dict.cards.map((group: any, idx: number) => (
                                    <motion.div
                                        key={group.category}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="w-full aspect-square cursor-default"
                                        onMouseEnter={() => setHoveredCategory(group.category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {/* Styled Card Container */}
                                        <div className={`group relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-900 transition-all duration-300 ${hoveredCategory === group.category ? 'shadow-blue-500/20 ring-2 ring-blue-500/50 dark:ring-blue-400/50' : ''}`}>

                                            {/* 1. FRONT CONTENT (Initial View) */}
                                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.320,1)] group-hover:-translate-y-[30%] group-hover:opacity-0 p-6 text-center">
                                                <p className="text-3xl md:text-3xl font-serif font-medium text-slate-800 dark:text-slate-100 tracking-tight">
                                                    {group.category}
                                                </p>
                                            </div>

                                            {/* 2. HOVER CONTENT (Slide Up) */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.320,1)] translate-y-[96%] group-hover:translate-y-0">

                                                {/* Heading in Overlay */}
                                                <p className="text-xl font-serif font-medium mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 text-slate-900 dark:text-slate-100">
                                                    {group.category}
                                                </p>

                                                {/* List Items */}
                                                <ul className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                                                    {group.items.map((item: string) => (
                                                        <li key={item} className="text-sm font-light tracking-wide text-slate-600 dark:text-slate-300">
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA Section - Find Your Speaking Path */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="mt-20 text-center"
                            >
                                <div className="h-8 mb-8">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={activeCtaText}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className={`text-lg font-light tracking-wide ${hoveredCategory ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {activeCtaText}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                <motion.button
                                    onClick={handleCtaClick}
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0 20px 25px -5px rgb(59 130 246 / 0.4), 0 8px 10px -6px rgb(59 130 246 / 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    animate={hoveredCategory ? {
                                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                                        scale: [1, 1.02, 1],
                                        transition: { duration: 2, repeat: Infinity }
                                    } : {}}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-medium px-10 py-4 rounded-xl shadow-xl shadow-blue-500/10 transition-all"
                                >
                                    {dict.button} →
                                </motion.button>

                                <p className="mt-6 text-sm text-slate-400 dark:text-slate-500 font-light tracking-wide">
                                    {dict.meta}
                                </p>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-20"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 rounded-full bg-blue-500/10 blur-xl mb-8"
                            />
                            <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-2">
                                {dict.loading.headline}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                {dict.loading.subtext}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
