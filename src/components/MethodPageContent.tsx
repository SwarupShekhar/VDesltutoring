"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, MessageCircle, Zap, Globe, CheckCircle, ArrowRight, Star, Sparkles, Brain, Heart } from "lucide-react";
import Image from "next/image";

import Link from "next/link";

export function MethodPageContent({ dict, locale }: { dict: any; locale: string }) {
    const t = dict;

    return (
        <div className="font-sans text-slate-900 bg-white dark:bg-slate-950 dark:text-slate-100 overflow-hidden">

            {/* Hero Section */}
            <section className="relative pt-32 pb-40 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-linear-to-b from-blue-100/50 to-transparent dark:from-indigo-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-linear-to-t from-orange-100/40 to-transparent dark:from-orange-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm mb-8 border border-blue-100 dark:border-blue-800">
                                <Sparkles className="w-4 h-4" />
                                <span>The New Standard in Language Learning</span>
                            </div>
                            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                {t.hero.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-light max-w-lg">
                                {t.hero.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={`/${locale}/sign-up`} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-lg transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    {t.hero.ctaPrimary} <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href={`/${locale}/how-it-works`} className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full font-semibold text-lg transition-all flex items-center justify-center">
                                    {t.hero.ctaSecondary}
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                                <div className="absolute inset-0 bg-linear-to-tr from-indigo-200 to-blue-100 dark:from-indigo-900 dark:to-blue-900 rounded-[3rem] transform rotate-3 opacity-60 blur-2xl" />
                                <div className="absolute inset-4 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <Image
                                        src="https://res.cloudinary.com/de8vvmpip/image/upload/v1770360154/confibuilder_stj7o8.png"
                                        alt="The Fluency Engine - Confidence Builder Interface"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-24 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs mb-4 block">The Challenge</span>
                        <h2 className="text-3xl md:text-5xl font-serif mb-6 text-slate-900 dark:text-white leading-tight">{t.problem.title}</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                            {t.problem.copy}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-10 md:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold mb-12 text-center text-slate-900 dark:text-white uppercase tracking-widest opacity-50">{t.problem.listTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-slate-100 dark:bg-slate-800 -z-10" />

                            {t.problem.items.map((item: any, i: number) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-3xl">
                                            {i === 0 ? "⛓️" : i === 1 ? "🎯" : "🕰️"}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-2xl font-serif italic text-slate-700 dark:text-slate-300">
                                {t.problem.conclusion}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-40 relative overflow-hidden text-balance">
                {/* Background Design Elements */}
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[100px] -translate-x-1/2" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[100px] translate-x-1/2" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-[10px] mb-6 border border-indigo-100 dark:border-indigo-800"
                        >
                            Our Approach
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-serif mb-8 text-slate-900 dark:text-white tracking-tight leading-tight">{t.solution.title}</h2>
                        <p className="max-w-xl mx-auto text-slate-500 dark:text-slate-400 text-xl font-light leading-relaxed">Rebuilding language learning from the ground up.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {t.solution.cards.map((card: any, i: number) => {
                            const Icon = i === 0 ? Zap : i === 1 ? Sparkles : Globe;
                            const colorClass = i === 0 ? "indigo" : i === 1 ? "blue" : "sky";
                            
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: i * 0.15, ease: [0.21, 0.45, 0.32, 0.9] }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-2 bg-linear-to-tr from-indigo-500/20 to-blue-500/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                                    
                                    <div className="relative h-full p-12 rounded-[2.2rem] bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}-50/50 dark:bg-${colorClass}-900/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`} />
                                        
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 shadow-sm ${i === 0 ? 'bg-indigo-600 text-white shadow-indigo-200' : i === 1 ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-sky-500 text-white shadow-sky-200'} group-hover:scale-110`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            
                                            <h3 className="text-2xl font-serif font-bold mb-6 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {card.title}
                                            </h3>
                                            
                                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-lg mb-8 grow">
                                                {card.content}
                                            </p>

                                            <div className="mt-auto">
                                                <div className={`h-1 w-12 rounded-full bg-${colorClass}-200 dark:bg-${colorClass}-800 group-hover:w-full transition-all duration-700`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How We Do It Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs mb-4 block">Methodology</span>
                            <h2 className="text-4xl md:text-5xl font-serif mb-10 text-slate-900 dark:text-white leading-tight">{t.howItWorks.title}</h2>

                            <div className="space-y-6">
                                {t.howItWorks.cards.map((card: any, i: number) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                        <div className="shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{card.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-blue-500/10 rounded-[3rem] blur-3xl transform rotate-6" />
                            <div className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white/50 dark:border-slate-700/50">
                                {/* Visual representation of AI Interface + Tutor */}
                                <div className="space-y-6 font-sans">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl rounded-tl-sm max-w-[85%] border border-indigo-100 dark:border-indigo-800/30">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">I noticed you hesitated on "schedule". Try saying: "Let's check the schedule."</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 justify-end">
                                        <div className="bg-blue-600 p-5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg shadow-blue-600/20">
                                            <p className="text-sm text-white font-medium">Okay! Let's check the schedule for next week.</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">You</div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/50 relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Live Coaching</div>
                                        <div className="flex items-center gap-4 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/20">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-300 to-red-300 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
                                                S
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Sarah, Senior Goal Coach</p>
                                                <p className="text-xs text-slate-500 mt-1">"Excellent correction! That flowed much better."</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs mb-4 block">Outcomes</span>
                        <h2 className="text-4xl font-serif mb-4 text-slate-900 dark:text-white">{t.benefits.title}</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {t.benefits.items.map((item: any, i: number) => {
                            const Icon = i === 0 ? Trophy : i === 1 ? MessageCircle : i === 2 ? Zap : Globe;
                            const colors = i === 0 ? "text-amber-500 bg-amber-50" : i === 1 ? "text-blue-500 bg-blue-50" : i === 2 ? "text-purple-500 bg-purple-50" : "text-emerald-500 bg-emerald-50";
                            return (
                                <div key={i} className="text-center p-8 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${colors.split(" ")[1]} dark:bg-slate-800`}>
                                        <Icon className={`w-10 h-10 ${colors.split(" ")[0]}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-center mt-12 max-w-3xl mx-auto">
                        <div className="relative inline-block">
                            <span className="absolute -top-4 -left-6 text-6xl text-indigo-200 dark:text-indigo-900 font-serif opacity-50">“</span>
                            <p className="text-2xl font-serif text-slate-700 dark:text-slate-300 relative z-10 leading-relaxed">
                                {t.benefits.quote}
                            </p>
                            <span className="absolute -bottom-8 -right-6 text-6xl text-indigo-200 dark:text-indigo-900 font-serif opacity-50 rotate-180">“</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Differentiation Section */}
            <section className="py-24 bg-slate-900 text-white rounded-4xl mx-4 lg:mx-8 mb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif mb-20">{t.differentiation.title}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-20 relative">
                        <div className="p-10 bg-white/5 rounded-4xl backdrop-blur-sm border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                            <h3 className="text-sm tracking-widest uppercase mb-4 text-slate-400">The Old Way</h3>
                            <div className="text-2xl font-serif text-slate-300">{t.differentiation.comparison.others}</div>
                        </div>

                        <div className="absolute left-1/2 top-11 md:top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white text-slate-900 rounded-full items-center justify-center font-bold text-lg z-20 shadow-xl hidden md:flex">
                            VS
                        </div>

                        <div className="p-12 bg-linear-to-br from-indigo-600 to-blue-600 rounded-4xl shadow-2xl transform md:scale-105 border border-white/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 mix-blend-overlay opacity-30"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    <span className="font-bold tracking-wider uppercase text-xs text-indigo-100">The Englivo Way</span>
                                </div>
                                <div className="text-3xl font-serif font-bold text-white leading-tight">{t.differentiation.comparison.us}</div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <p className="text-indigo-200 mb-6 text-lg">{t.differentiation.shift.from}</p>
                        <h3 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                            {t.differentiation.shift.to}
                        </h3>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-32 text-center text-balance">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="p-16 md:p-24 rounded-4xl bg-linear-to-b from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

                        <h2 className="text-4xl md:text-6xl font-serif mb-12 text-slate-900 dark:text-white leading-tight relative z-10">
                            {t.finalCta.headline}
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center relative z-10">
                            <Link href={`/${locale}/sign-up`} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg transition-all shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.5)] hover:-translate-y-1">
                                {t.finalCta.ctaPrimary}
                            </Link>
                            <Link href={`/${locale}/sessions/book`} className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-full font-bold text-lg transition-all shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                {t.finalCta.ctaSecondary}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
