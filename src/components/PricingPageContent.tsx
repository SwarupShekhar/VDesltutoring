"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { InstantCallTeaser } from "./promo/InstantCallTeaser";

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
                <h1 className="font-serif text-5xl md:text-7xl mb-8 text-foreground">{t.hero.title}</h1>
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

            {/* Enterprise - Highlighted and Improved */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto relative group mb-24"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative glass-card p-12 rounded-[2.5rem] text-center border border-blue-500/30 dark:border-blue-400/20 overflow-hidden bg-white/80 dark:bg-slate-900/80 shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-indigo-500/5" />
                    
                    {/* Badge */}
                    <div className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6 relative z-10">
                        Corporate Solutions
                    </div>
                    
                    <h3 className="text-4xl md:text-5xl font-serif mb-6 text-foreground relative z-10 leading-tight">
                        {t.enterprise.title}
                    </h3>
                    
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed font-light">
                        {t.enterprise.description}
                    </p>
                    
                    <a 
                        href="mailto:sales@englivo.com" 
                        className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 relative z-10 group/btn"
                    >
                        {t.enterprise.button}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                </div>
            </motion.div>

            {/* PROMO - INSTANT CALL TEASER */}
            <div className="max-w-6xl mx-auto px-4 mb-24">
                <InstantCallTeaser />
            </div>

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
