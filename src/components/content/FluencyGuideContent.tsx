'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Brain, Clock, Mic, Layers, MessageSquare, Zap, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function FluencyGuideContent({ locale, content }: { locale: string; content: any }) {
    const { user } = useUser();
    const blogPrefix = `/${locale || 'en'}/blog`; // Use locale or default
    const currentLocale = locale || 'en';

    // Secure Destinations
    const aiTutorHref = user ? "/ai-tutor" : `/${currentLocale}/sign-up`;
    const livePracticeHref = user ? `/${currentLocale}/live-practice` : `/${currentLocale}/sign-up`;

    // Fallback if content is missing (prevents crash during dev/translation lag)
    const t = content?.fluencyGuide || {};
    const tHero = t.hero || {};
    const tDiagnosis = t.diagnosis || {};
    const tProcess = t.process || {};
    const tMethod = t.method || {};
    const tStart = t.startPoints || {};
    const tFinal = t.finalCta || {};

    const diagnosisCards = tDiagnosis.cards || [];
    const processPoints = tProcess.points || [];
    const methodSteps = tMethod.steps || [];

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">

                {/* HERO TITLE */}
                <header className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-6xl text-slate-900 dark:text-white mb-6 leading-tight"
                    >
                        {tHero.title}<br />
                        <span className="text-indigo-600 dark:text-indigo-400 text-3xl md:text-5xl">{tHero.subtitle}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 dark:text-slate-400 font-light"
                    >
                        {tHero.description}
                    </motion.p>
                </header>

                {/* SECTION 1 – DIAGNOSIS PATHS */}
                <section className="mb-32">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-2xl font-serif mb-8 text-center"
                    >
                        {tDiagnosis.title}
                    </motion.h2>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* CARD A */}
                        <motion.div variants={item} className="p-8 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col">
                            <div className="w-10 h-10 mb-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Brain size={20} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{diagnosisCards[0]?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-grow">{diagnosisCards[0]?.desc}</p>
                            <Link href={`${blogPrefix}/stop-translating-in-head`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline mt-auto">
                                {diagnosisCards[0]?.linkText} <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </motion.div>

                        {/* CARD B */}
                        <motion.div variants={item} className="p-8 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col">
                            <div className="w-10 h-10 mb-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{diagnosisCards[1]?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-grow">{diagnosisCards[1]?.desc}</p>
                            <Link href={`${blogPrefix}/b1-to-b2-speaking-gap`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline mt-auto">
                                {diagnosisCards[1]?.linkText} <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </motion.div>

                        {/* CARD C */}
                        <motion.div variants={item} className="p-8 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col">
                            <div className="w-10 h-10 mb-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{diagnosisCards[2]?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-grow">{diagnosisCards[2]?.desc}</p>
                            <Link href={`${blogPrefix}/thinking-in-chunks-the-secret-behind-natural-english-fluency`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center hover:underline mt-auto">
                                {diagnosisCards[2]?.linkText} <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* SECTION 2 – WHAT FLUENCY REALLY IS */}
                <section className="mb-32">
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-10 md:p-14 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl font-serif mb-6 relative z-10">{tProcess.title}</h2>
                        <div className="flex flex-col md:flex-row gap-12 relative z-10">
                            <div className="flex-1">
                                <ul className="space-y-4">
                                    {processPoints.map((item: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <span className="text-lg text-slate-700 dark:text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 flex flex-col justify-center gap-4 border-l border-indigo-200 dark:border-indigo-800/50 pl-0 md:pl-12">
                                <Link href={`${blogPrefix}/what-b2-english-actually-means-in-real-life-not-grammar`} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <span className="font-medium">{tProcess.links?.b2Meaning}</span>
                                    <ArrowRight size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <Link href={`${blogPrefix}/pauses-cefr-speaking`} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <span className="font-medium">{tProcess.links?.pauses}</span>
                                    <ArrowRight size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 – THE ENGLIVO METHOD */}
                <section className="mb-32">
                    <h2 className="text-2xl font-serif mb-12 text-center">{tMethod.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-500" />
                            <div className="relative p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 text-2xl font-serif mb-6">{methodSteps[0]?.number}</div>
                                <h3 className="text-xl font-bold mb-2">{methodSteps[0]?.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{methodSteps[0]?.desc}</p>
                                <Link href={aiTutorHref}>
                                    <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">
                                        {methodSteps[0]?.cta}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-500 delay-75" />
                            <div className="relative p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 text-2xl font-serif mb-6">{methodSteps[1]?.number}</div>
                                <h3 className="text-xl font-bold mb-2">{methodSteps[1]?.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{methodSteps[1]?.desc}</p>
                                <Link href={livePracticeHref}>
                                    <span className="inline-block px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-full hover:border-indigo-400 transition-colors">
                                        {methodSteps[1]?.cta}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-500 delay-150" />
                            <div className="relative p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 text-2xl font-serif mb-6">{methodSteps[2]?.number}</div>
                                <h3 className="text-xl font-bold mb-2">{methodSteps[2]?.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{methodSteps[2]?.desc}</p>
                                <Link href={`${blogPrefix}/filler-words-enemy-or-tool`}>
                                    <span className="inline-block px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-medium rounded-full hover:border-indigo-400 transition-colors">
                                        {methodSteps[2]?.cta}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4 – START POINTS */}
                <section className="mb-32">
                    <h2 className="text-2xl font-serif mb-8 text-center">{tStart.title}</h2>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <Link href={`${blogPrefix}/stop-translating-in-head`} className="block group p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">{tStart.diagnosis?.label}</span>
                                    <span className="text-lg font-medium">{tStart.diagnosis?.text}</span>
                                </div>
                                <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </Link>
                        <Link href={`${blogPrefix}/b1-to-b2-speaking-gap`} className="block group p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">{tStart.growth?.label}</span>
                                    <span className="text-lg font-medium">{tStart.growth?.text}</span>
                                </div>
                                <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </Link>
                        <Link href={`${blogPrefix}/best-english-practice-professionals`} className="block group p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">{tStart.career?.label}</span>
                                    <span className="text-lg font-medium">{tStart.career?.text}</span>
                                </div>
                                <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="text-center pb-20">
                    <div className="inline-block p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-8">
                        <div className="bg-white dark:bg-slate-950 rounded-full px-8 py-4">
                            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                                {tFinal.headline}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href={aiTutorHref}>
                            <button className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform flex items-center">
                                <Zap size={20} className="mr-2" /> {tFinal.primary}
                            </button>
                        </Link>
                        <Link href={livePracticeHref}>
                            <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-full font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center">
                                <Mic size={20} className="mr-2" /> {tFinal.secondary}
                            </button>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
