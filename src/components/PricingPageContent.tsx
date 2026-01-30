"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function PricingPageContent({ dict, locale }: { dict: any, locale: string }) {
    const t = dict;
    const router = useRouter();

    const handlePlanClick = (plan: string) => {
        router.push(locale === 'en' ? `/checkout?plan=${plan}` : `/${locale}/checkout?plan=${plan}`);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-24"
            >
                <h2 className="font-serif text-5xl md:text-7xl mb-8 text-foreground">{t.hero.title}</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t.hero.subtitle }} />
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24 relative z-10">
                {/* Basic */}
                <PricingCard
                    plan={t.plans.basic}
                    planKey="basic"
                    delay={0.1}
                    onClick={() => handlePlanClick('basic')}
                />

                {/* Standard */}
                <PricingCard
                    plan={t.plans.standard}
                    planKey="standard"
                    highlighted
                    delay={0.2}
                    onClick={() => handlePlanClick('standard')}
                />

                {/* Premium */}
                <PricingCard
                    plan={t.plans.premium}
                    planKey="premium"
                    delay={0.3}
                    onClick={() => handlePlanClick('premium')}
                />
            </div>

            {/* Enterprise */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto glass-card p-12 rounded-3xl text-center border border-white/20 dark:border-white/10 relative overflow-hidden mb-24"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
                <h3 className="text-3xl font-serif mb-4 text-foreground relative z-10">{t.enterprise.title}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto relative z-10">{t.enterprise.description}</p>
                <a href="mailto:sales@naturalfluency.com" className="inline-block px-8 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative z-10">
                    {t.enterprise.button}
                </a>
            </motion.div>

            {/* Trust Statement */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center pb-24"
            >
                <p className="text-2xl font-serif text-electric/80 italic max-w-3xl mx-auto px-4">
                    "{t.trust}"
                </p>
            </motion.div>
        </>
    );
}

function PricingCard({ plan, planKey, highlighted = false, delay, onClick }: { plan: any, planKey: string, highlighted?: boolean, delay: number, onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ scale: 1.02 }}
            className={`relative p-8 rounded-3xl border flex flex-col ${highlighted
                ? 'bg-electric/5 border-electric shadow-xl shadow-electric/10'
                : 'glass-card border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'}`}
        >
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-electric text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                    {plan.badge}
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{plan.title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-serif text-foreground">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-electric font-medium mt-2">{plan.tagline}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="w-5 h-5 text-electric shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onClick}
                className={`w-full py-4 rounded-xl font-bold transition-all ${highlighted
                    ? 'bg-electric text-white hover:bg-electric/90 shadow-lg shadow-electric/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
                {plan.button}
            </button>
        </motion.div>
    )
}
