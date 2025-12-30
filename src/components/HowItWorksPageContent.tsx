"use client";

import React from "react";
import { motion } from "framer-motion";

export function HowItWorksPageContent({ dict }: { dict: any }) {
    const t = dict;

    return (
        <>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-32"
            >
                <h1 className="font-serif text-5xl md:text-7xl mb-8 text-foreground">{t.hero.title}</h1>
                <h2 className="text-2xl md:text-3xl font-serif text-electric mb-6">{t.hero.subtitle}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t.hero.description }} />
            </motion.div>

            {/* Steps */}
            <div className="space-y-32 relative">
                {/* Connector Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-electric/0 via-electric/30 to-electric/0 -translate-x-1/2 hidden md:block" />

                {t.steps.map((step: any, index: number) => (
                    <Step key={index} step={step} index={index} />
                ))}
            </div>

            {/* Final */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center py-24 px-8 mt-32 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
                <span className="text-electric font-bold tracking-widest uppercase text-xs mb-4 block">{t.final.label}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">{t.final.title}</h3>
                <p className="text-2xl text-slate-600 dark:text-slate-400 mb-12 italic">{t.final.subtitle}</p>

                <div className="text-left max-w-lg mx-auto bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
                    <p className="font-bold mb-4 text-foreground">{t.final.listTitle}</p>
                    <ul className="space-y-2">
                        {t.final.list.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-electric" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xl font-medium text-foreground">
                    {t.final.conclusion}
                </p>
            </motion.div>
        </>
    );
}

function Step({ step, index }: { step: any, index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
            {/* Number Bubble (Center) */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-electric/10 border-2 border-electric flex items-center justify-center text-xs font-bold text-electric z-10 hidden md:flex">
                {index + 1}
            </div>

            {/* Content Side */}
            <div className="flex-1 text-left md:text-right w-full">
                <div className={`p-8 rounded-2xl glass-card border border-electric/10 bg-gradient-to-br from-white/50 to-white/10 dark:from-slate-900/50 dark:to-slate-900/10 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="text-electric font-bold uppercase tracking-widest text-xs mb-2 block">{step.step}</span>
                    <h3 className="text-3xl font-serif mb-4 text-foreground">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{step.description}</p>

                    {step.details && (
                        <ul className={`space-y-2 inline-block text-left ${isEven ? 'md:mr-auto' : ''}`}>
                            {step.details.map((detail: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="text-electric">•</span> {detail}
                                </li>
                            ))}
                        </ul>
                    )}

                    {step.subsections && (
                        <div className="space-y-4 mt-6 text-left">
                            {step.subsections.map((sub: any, i: number) => (
                                <div key={i} className="bg-electric/5 p-4 rounded-lg">
                                    <p className="font-bold text-electric text-sm mb-1">{sub.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{sub.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Empty Side for balance or Image/Quote */}
            <div className="flex-1 w-full pl-4 md:pl-0">
                <div className={`max-w-xs ${isEven ? 'mr-auto' : 'ml-auto'}`}>
                    {step.quote && (
                        <div className="text-2xl font-serif italic text-electric/80 mb-4">
                            {step.quote}
                        </div>
                    )}
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                        {step.footer}
                    </p>
                </div>
            </div>

        </motion.div>
    )
}
