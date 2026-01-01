'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const AUDIO_URLS = {
    week1: 'https://res.cloudinary.com/de8vvmpip/video/upload/v1766834998/hesitant_lbk3dc.mp3',
    week12: 'https://res.cloudinary.com/de8vvmpip/video/upload/v1766834997/fluent_ytmgoz.mp3'
};

// Mock Waveform Bars
const Waveform = ({ isActive, intensity }: { isActive: boolean, intensity: 'low' | 'high' }) => {
    return (
        <div className="flex items-center justify-center gap-[3px] h-16 w-full">
            {Array.from({ length: 40 }).map((_, i) => {
                // Generate random heights for visual variety
                const baseHeight = Math.random() * 40 + 10;
                return (
                    <motion.div
                        key={i}
                        initial={{ height: 4 }}
                        animate={isActive ? {
                            height: intensity === 'high'
                                ? [baseHeight, baseHeight * 1.5, baseHeight]
                                : [baseHeight * 0.5, baseHeight, baseHeight * 0.5],
                            opacity: 1
                        } : { height: 4, opacity: 0.3 }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.05
                        }}
                        className={`w-1 rounded-full ${intensity === 'high' ? 'bg-blue-500' : 'bg-slate-400'}`}
                    />
                );
            })}
        </div>
    );
};

export function AudioTransformation({ dict }: { dict: any }) {
    const [activeTab, setActiveTab] = useState<'week1' | 'week12'>('week1');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // switch audio source when tab changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            audioRef.current.src = AUDIO_URLS[activeTab];
            audioRef.current.load();
        }
    }, [activeTab]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    return (
        <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Audio Element (Hidden) */}
                <audio
                    ref={audioRef}
                    onEnded={handleAudioEnded}
                    src={AUDIO_URLS[activeTab]}
                    className="hidden"
                />

                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
                        {dict.headline}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        {dict.subtext}
                    </p>
                </div>

                {/* Audio Player Container */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-white/10 relative overflow-hidden">

                    {/* Toggle Switch */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm inline-flex relative">
                            {/* Sliding Background */}
                            <motion.div
                                className="absolute bg-blue-600 rounded-full h-[calc(100%-12px)] top-1.5 bottom-1.5"
                                layoutId="activeTab"
                                initial={false}
                                animate={{
                                    left: activeTab === 'week1' ? '6px' : '50%',
                                    width: 'calc(50% - 9px)',
                                    x: activeTab === 'week12' ? '3px' : '0'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => setActiveTab('week1')}
                                className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'week1' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                {dict.week1}
                            </button>
                            <button
                                onClick={() => setActiveTab('week12')}
                                className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'week12' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                {dict.week12}
                            </button>
                        </div>
                    </div>

                    {/* Visualizer Area */}
                    <div className="mb-12 flex flex-col items-center justify-center min-h-[120px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <Waveform
                                    isActive={isPlaying}
                                    intensity={activeTab === 'week1' ? 'low' : 'high'}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {!isPlaying && (
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-4 animate-pulse">
                                {dict.label}
                            </p>
                        )}
                    </div>

                    {/* Play Control */}
                    <div className="flex justify-center">
                        <button
                            onClick={togglePlay}
                            aria-label={isPlaying ? "Pause audio" : "Play audio"}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 ${activeTab === 'week1' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-blue-600 text-white shadow-blue-500/30'}`}
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}
