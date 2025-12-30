"use client";

import React from "react";
import { motion } from "framer-motion";

export function MethodPageContent({ dict }: { dict: any }) {
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
                <div className="w-24 h-1 bg-electric mx-auto mb-8 rounded-full opacity-50" />
                <h2 className="text-2xl md:text-3xl font-serif text-muted-foreground italic leading-relaxed" dangerouslySetInnerHTML={{ __html: t.hero.subtitle }} />
            </motion.div>

            {/* Section 1 */}
            <Section label={t.section1.label} title={t.section1.title}>
                <p className="text-lg leading-loose text-slate-700 dark:text-slate-300">
                    {t.section1.content}
                </p>
            </Section>

            {/* Section 2 */}
            <Section label={t.section2.label} title={t.section2.title}>
                <p className="text-lg leading-loose text-slate-700 dark:text-slate-300">
                    {t.section2.content}
                </p>
            </Section>

            {/* Section 3 */}
            <Section label={t.section3.label} title={t.section3.title}>
                <p className="text-lg leading-loose text-slate-700 dark:text-slate-300">
                    {t.section3.content}
                </p>
            </Section>

            {/* Section 4 - Grid */}
            <div className="my-32">
                <div className="text-center mb-16">
                    <span className="text-electric font-bold tracking-widest uppercase text-sm">{t.section4.label}</span>
                    <h3 className="text-4xl font-serif mt-4 text-foreground">{t.section4.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {t.section4.cards.map((card: any, i: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="glass-card p-8 rounded-2xl bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-800"
                        >
                            <h4 className="text-xl font-serif font-bold mb-4 text-electric">{card.title}</h4>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {card.content}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Section 5 */}
            <Section label={t.section5.label} title={t.section5.title}>
                <p className="text-lg leading-loose text-slate-700 dark:text-slate-300">
                    {t.section5.content}
                </p>
            </Section>

            {/* Final */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center py-24 px-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl"
            >
                <h3 className="text-3xl font-serif mb-6">{t.final.label}</h3>
                <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto">
                    {t.final.content}
                </p>
            </motion.div>
        </>
    );
}

function Section({ label, title, children }: { label: string, title: string, children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-32 pl-4 md:pl-8 border-l-2 border-electric/30"
        >
            <span className="text-electric font-bold tracking-widest uppercase text-xs mb-2 block">{label}</span>
            <h3 className="text-3xl md:text-4xl font-serif mb-8 text-foreground">{title}</h3>
            {children}
        </motion.section>
    )
}
