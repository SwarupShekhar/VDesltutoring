'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const cardImages = [
    "https://res.cloudinary.com/de8vvmpip/image/upload/v1773913378/A_candid_professional_202603191512-Photoroom_m9afib.png",
    "https://res.cloudinary.com/de8vvmpip/image/upload/v1773913495/A_natural__candid_202603191514-Photoroom_ozcika.png",
    "https://res.cloudinary.com/de8vvmpip/image/upload/v1773913675/A_professional_photograph_202603191517-Photoroom_xwul86.png",
    "https://res.cloudinary.com/de8vvmpip/image/upload/v1773913785/A_realistic_professional_202603191519-Photoroom_wgsjcl.png"
];

export function SituationalGateway({ dict, isLoggedIn }: { dict: any; isLoggedIn: boolean }) {
    const params = useParams();
    const router = useRouter();
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
            router.push(locale === 'en' ? (isLoggedIn ? '/practice' : '/sign-up') : `/${locale}/${isLoggedIn ? 'practice' : 'sign-up'}`);
        }, 600);
    };

    return (
        <section className="py-24 relative overflow-hidden min-h-[800px]">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/20 pointer-events-none" />
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
                                        className="w-full min-h-[420px] cursor-default"
                                        onMouseEnter={() => setHoveredCategory(group.category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {/* Styled Card Container */}
                                        <div className={`group relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all duration-300 ${hoveredCategory === group.category ? 'shadow-blue-500/10 ring-1 ring-blue-500/20' : ''}`}>

                                            {/* 1. FRONT CONTENT (Initial View) */}
                                            <div className="absolute inset-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.320,1)] md:group-hover:-translate-y-[20%] md:group-hover:opacity-0 z-10">
                                                
                                                {/* Category Title */}
                                                <div className="p-8 pb-2 text-center">
                                                    <p className="text-2xl md:text-2xl font-serif font-medium text-slate-800 dark:text-slate-100 tracking-tight">
                                                        {group.category}
                                                    </p>
                                                </div>

                                                {/* Image Area with Grid and Doodles */}
                                                <div className="mt-auto relative w-full h-72 flex items-end justify-center pointer-events-none overflow-hidden">
                                                    {/* Subtle Grid */}
                                                    <div className="absolute inset-0 z-0" 
                                                        style={{
                                                            backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px)`,
                                                            backgroundSize: '20px 20px',
                                                            maskImage: 'linear-gradient(to top, black 20%, transparent 80%)',
                                                            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 80%)'
                                                        }}
                                                    />

                                                    {/* Language Doodles - Added more for "fullness" */}
                                                    <div className="absolute inset-0 z-5 opacity-40">
                                                        {/* Icon: Message Bubble */}
                                                        <motion.div 
                                                            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                            className="absolute left-[10%] top-[25%] text-blue-400"
                                                        >
                                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                        </motion.div>

                                                        {/* Icon: Mic (English/Speech related) */}
                                                        <motion.div 
                                                            animate={{ scale: [1, 1.1, 1] }}
                                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                                            className="absolute right-[10%] top-[40%] text-indigo-300"
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                                        </motion.div>

                                                        {/* Icon: Star/Sparkle */}
                                                        <motion.div 
                                                            animate={{ rotate: [0, 90, 0], scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                                            className="absolute left-[35%] top-[10%] text-amber-300"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                                        </motion.div>

                                                        {/* Text Doodles (Specific to category index) */}
                                                        <motion.div 
                                                            animate={{ scale: [1, 1.05, 1], x: [0, 4, 0] }}
                                                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                                            className="absolute right-[15%] top-[15%] text-indigo-500 font-serif font-bold text-lg"
                                                        >
                                                            {idx === 0 ? 'CV' : (idx === 1 ? 'Hi!' : (idx === 2 ? 'Goal' : 'Expert'))}
                                                        </motion.div>

                                                        <motion.div 
                                                            animate={{ y: [0, 5, 0], opacity: [0.4, 0.7, 0.4] }}
                                                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                                            className="absolute left-[15%] top-[55%] text-slate-400 font-serif italic text-sm"
                                                        >
                                                            {idx === 0 ? 'Flow' : (idx === 1 ? 'English' : (idx === 2 ? 'IELTS' : 'Coach'))}
                                                        </motion.div>

                                                        <motion.div 
                                                            animate={{ rotate: [-5, 5, -5] }}
                                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                                            className="absolute right-[25%] top-[60%] text-rose-400/30"
                                                        >
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 4 5h-1c-1.5 0-2.75-.5-3.45-1.451C2.3 18.15 2 19 2 20c0 .5.5 1 1 1z"/></svg>
                                                        </motion.div>

                                                        {/* Icon: Headset (Communication) */}
                                                        {idx % 2 === 0 && (
                                                            <motion.div 
                                                                animate={{ scale: [0.9, 1, 0.9] }}
                                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                                className="absolute left-[45%] top-[45%] text-emerald-400/40"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 14q0 2-2 2h-1a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1q2 0 2 2z"/><path d="M3 14q0 2 2 2h1a2 2 0 0 1 2-2V10a2 2 0 0 1-2-2H5q-2 0-2 2z"/><path d="M3 10a9 9 0 0 1 18 0"/></svg>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    <Image
                                                        src={cardImages[idx] || cardImages[0]}
                                                        alt={group.category}
                                                        width={300}
                                                        height={300}
                                                        className="relative z-10 object-contain object-bottom w-auto h-full max-h-[110%] transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
                                                    />
                                                </div>
                                            </div>

                                            {/* 2. HOVER CONTENT (Desktop Only - Slide Up) */}
                                            <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.320,1)] translate-y-full group-hover:translate-y-0 z-20">
                                                <p className="text-xl font-serif font-medium mb-8 text-slate-900 dark:text-slate-100">
                                                    {group.category}
                                                </p>
                                                
                                                {/* Improved List Presentation - Staggered Tags */}
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {group.items.map((item: string, i: number) => (
                                                        <motion.div 
                                                            key={item}
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                                                            animate={hoveredCategory === group.category ? { 
                                                                opacity: 1, 
                                                                scale: 1, 
                                                                y: 0,
                                                                transition: { delay: 0.4 + (i * 0.05) }
                                                            } : { opacity: 0 }}
                                                            className="px-4 py-2 bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300/50 dark:border-slate-600/50 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-slate-700 dark:text-slate-100 shadow-sm flex items-center gap-2 group/item transition-colors duration-300"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover/item:scale-125 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                            {item}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Mobile View Support - Content stacked */}
                                            <div className="flex md:hidden flex-col h-full pointer-events-none opacity-0">
                                                {/* Hidden on mobile to avoid duplication with absolute front content, but keeps space */}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="mt-12 md:mt-20 text-center"
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
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-medium px-12 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all inline-flex items-center gap-3"
                                >
                                    {dict.button}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
