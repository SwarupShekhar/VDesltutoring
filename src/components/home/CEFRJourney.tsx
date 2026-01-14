"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CEFRJourneyProps {
    dict: {
        headline: string;
        subtext: string;
        levels: {
            [key: string]: {
                title: string;
                tagline: string;
            }
        };
        tooltip: string;
        cta: string;
        ladderTag: string;
    };
    locale: string;
}

const CEFR_LADDER_CONFIG = [
    { level: "A1", color: "slate", glow: "rgba(148, 163, 184, 0.3)" },
    { level: "A2", color: "sky", glow: "rgba(56, 189, 248, 0.3)" },
    { level: "B1", color: "emerald", glow: "rgba(16, 185, 129, 0.3)" },
    { level: "B2", color: "indigo", glow: "rgba(99, 102, 241, 0.3)" },
    { level: "C1", color: "purple", glow: "rgba(168, 85, 247, 0.3)" },
    { level: "C2", color: "amber", glow: "rgba(245, 158, 11, 0.3)" }
]

export const CEFRJourney = ({ dict, locale }: CEFRJourneyProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
        }
    }

    return (
        <section className="relative py-24 px-6 overflow-hidden bg-slate-50 dark:bg-[#0A0C10] transition-colors duration-500">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header content */}
                <div className="text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            {dict.headline}
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
                            {dict.subtext}
                        </p>
                    </motion.div>
                </div>

                {/* The Ladder Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-16"
                >
                    {CEFR_LADDER_CONFIG.map((item, idx) => (
                        <motion.div
                            key={item.level}
                            variants={cardVariants}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="relative group"
                        >
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`h-full p-6 rounded-2xl border backdrop-blur-xl transition-all duration-500
                  ${hoveredIndex === idx
                                        ? 'border-indigo-500/50 dark:border-white/20 shadow-2xl scale-[1.02]'
                                        : 'border-slate-200 dark:border-white/10 shadow-lg'}
                  bg-white dark:bg-white/[0.03]
                `}
                                style={{
                                    boxShadow: hoveredIndex === idx ? `0 20px 40px -10px ${item.glow}` : 'none'
                                }}
                            >
                                {/* Level Badge */}
                                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center font-bold text-xl text-white
                    bg-gradient-to-br transition-all duration-500 shadow-md
                    ${item.level === 'A1' ? 'from-slate-400 to-slate-600' : ''}
                    ${item.level === 'A2' ? 'from-sky-400 to-sky-600' : ''}
                    ${item.level === 'B1' ? 'from-emerald-400 to-emerald-600' : ''}
                    ${item.level === 'B2' ? 'from-indigo-400 to-indigo-600' : ''}
                    ${item.level === 'C1' ? 'from-purple-400 to-purple-600' : ''}
                    ${item.level === 'C2' ? 'from-amber-400 to-amber-600' : ''}
                `}>
                                    {item.level}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                                    {dict.levels[item.level].title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                                    {dict.levels[item.level].tagline}
                                </p>

                                {/* Micro-interaction Glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>

                            {/* Tooltip implementation */}
                            <AnimatePresence>
                                {hoveredIndex === idx && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 z-20 pointer-events-none"
                                    >
                                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-2 px-3 rounded-lg shadow-xl text-center uppercase tracking-wider relative border border-white/10 dark:border-slate-200">
                                            {dict.tooltip}
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold tracking-widest text-[10px] uppercase bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{dict.ladderTag}</span>
                    </div>

                    <Link href={`/${locale}/dashboard`} className="group no-underline">
                        <Button className="h-14 px-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all shadow-xl font-bold flex items-center gap-2">
                            {dict.cta}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
