'use client';

import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { PremiumMetricBar, MetricItem, METRIC_COLORS } from '@/components/PremiumMetricBar';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

// --- DATA CONSTANTS ---

const METRICS_LIVE = [
    {
        id: 'pauses',
        labelKey: "pauses",
        before: 18,
        after: 18,
        unit: "%",
        trend: 'down' as const
    },
    {
        id: 'fillers',
        labelKey: "fillers",
        before: 11,
        after: 11,
        unit: "%",
        trend: 'down' as const
    },
    {
        id: 'fluency',
        labelKey: "fluency",
        before: 42,
        after: 42,
        unit: "",
        trend: 'up' as const
    }
];

const RADAR_DATA = [
    { subject: 'Fluency', A: 85, fullMark: 100 },
    { subject: 'Pronunciation', A: 65, fullMark: 100 },
    { subject: 'Grammar', A: 70, fullMark: 100 },
    { subject: 'Vocabulary', A: 80, fullMark: 100 },
    { subject: 'Coherence', A: 75, fullMark: 100 },
];

const PROOF_METRICS = {
    before: [
        { labelKey: "pauses", value: "18%", color: "text-amber-500" },
        { labelKey: "fillers", value: "11%", color: "text-rose-500" },
        { labelKey: "fluency", value: "42", color: "text-slate-500" }
    ],
    after: [
        { labelKey: "pauses", value: "9%", color: "text-emerald-500" },
        { labelKey: "fillers", value: "4%", color: "text-emerald-500" },
        { labelKey: "fluency", value: "71", color: "text-emerald-500" }
    ]
};

export function FluencyEngineShowcase({ dict }: { dict: any }) {
    // If dict is missing (e.g. during build or before prop is passed), fallback gracefully to avoid crash
    const t = dict || {
        headline: "The Fluency Engine",
        subtext: "Englivo doesn’t guess how well you speak. It measures how your brain produces language in real time.",
        features: {
            pauseRatio: "Pause Ratio",
            fillerUsage: "Filler Usage",
            speakingSpeed: "Speaking Speed",
            fluencyScore: "Fluency Score",
            cefrMapping: "CEFR Mapping"
        },
        featureCaption: "These signals are extracted directly from your voice.",
        livePanel: {
            title: "What Englivo Sees While You Speak",
            caption: "These numbers update every second while you talk.",
            metrics: { pauses: "Pauses", fillers: "Fillers", fluency: "Fluency" }
        },
        radar: { title: "Your Real English Level", caption: "Englivo maps your speaking data to the same CEFR levels used by universities." },
        proof: {
            headline: "One session can change your speaking pattern",
            before: "Before", after: "After", week0: "Week 0", week1: "Week 1",
            caption: "Same person. Same topic. After one targeted fluency drill."
        },
        cta: { button: "Start Your Fluency Check", subtext: "Speak for 30 seconds. See your real numbers." }
    };

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 overflow-hidden">
            <motion.div
                className="container mx-auto px-6 max-w-7xl"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >

                {/* HEADLINE */}
                <motion.div variants={itemVariants} className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-5xl mb-6 text-slate-900 dark:text-white">
                        {t.headline}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {t.subtext}
                    </p>
                </motion.div>

                {/* GRID SECTION: ENGINE REVEAL + REAL METRICS + RADAR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">

                    {/* 1. TEXT / FEATURES (Left - 4 cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            {[
                                { key: "pauseRatio", label: t.features.pauseRatio },
                                { key: "fillerUsage", label: t.features.fillerUsage },
                                { key: "speakingSpeed", label: t.features.speakingSpeed },
                                { key: "fluencyScore", label: t.features.fluencyScore },
                                { key: "cefrMapping", label: t.features.cefrMapping }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xl font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
                            {t.featureCaption}
                        </p>
                    </motion.div>

                    {/* 2. REAL METRICS PANEL (Middle - 4 cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-white/10 flex flex-col justify-center relative overlow-hidden">
                        {/* Subtle gradient glow behind */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="mb-6 relative z-10">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{t.livePanel.title}</h3>
                        </div>
                        <div className="space-y-8 relative z-10">
                            {METRICS_LIVE.map((m) => (
                                <PremiumMetricBar
                                    key={m.id}
                                    item={{
                                        ...m,
                                        id: m.id,
                                        label: t.livePanel.metrics[m.labelKey as keyof typeof t.livePanel.metrics],
                                        before: m.before,
                                        after: m.after,
                                        unit: m.unit,
                                        trend: m.trend
                                    }}
                                    forceState="after"
                                    showDelta={false}
                                />
                            ))}
                        </div>
                        <div className="mt-8 text-center relative z-10">
                            <p className="text-xs text-slate-400">{t.livePanel.caption}</p>
                        </div>
                    </motion.div>

                    {/* 3. CEFR RADAR (Right - 4 cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-white/10 flex flex-col justify-center">
                        <div className="mb-4 text-center">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{t.radar.title}</h3>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                                    <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                                    <Radar
                                        name="Level"
                                        dataKey="A"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="#3b82f6"
                                        fillOpacity={0.2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400">
                                {t.radar.caption}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* 4. BEFORE / AFTER PROOF */}
                <motion.div variants={itemVariants} className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-3xl md:text-4xl text-slate-900 dark:text-white">
                            {t.proof.headline}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* BEFORE CARD */}
                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 border border-white/50 dark:border-white/5">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.proof.before}</h3>
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase">{t.proof.week0}</span>
                            </div>
                            <ul className="space-y-4">
                                {PROOF_METRICS.before.map((m) => (
                                    <li key={m.labelKey} className="flex justify-between items-center text-lg">
                                        <span className="text-slate-500">{t.livePanel.metrics[m.labelKey as keyof typeof t.livePanel.metrics]}</span>
                                        <span className={`font-mono font-bold ${m.color}`}>{m.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* AFTER CARD */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-emerald-500/20 ring-1 ring-emerald-500/10 relative overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="mb-6 flex items-center justify-between relative z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.proof.after}</h3>
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{t.proof.week1}</span>
                            </div>
                            <ul className="space-y-4 relative z-10">
                                {PROOF_METRICS.after.map((m) => (
                                    <li key={m.labelKey} className="flex justify-between items-center text-lg">
                                        <span className="text-slate-500">{t.livePanel.metrics[m.labelKey as keyof typeof t.livePanel.metrics]}</span>
                                        <span className={`font-mono font-bold ${m.color}`}>{m.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-slate-500 italic">{t.proof.caption}</p>
                    </div>
                </motion.div>

                {/* 5. CTA */}
                <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                    <Link href="/ai-tutor?mode=challenge&targetLevel=A1">
                        <Button size="lg" className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold px-10 h-14 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            {t.cta.button}
                        </Button>
                    </Link>
                    <p className="mt-4 text-slate-500 text-sm">
                        {t.cta.subtext}
                    </p>
                </motion.div>

            </motion.div>
        </section>
    );
}
