'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCcw } from 'lucide-react';

export const WhySpeakingFeelsHard = () => {
    const [stage, setStage] = useState<'intro' | 'activity' | 'clarity'>('intro');
    const [distractions, setDistractions] = useState([
        { id: 1, text: "Grammar?", x: 20, y: 30 },
        { id: 2, text: "Translate", x: 70, y: 20 },
        { id: 3, text: "Accent", x: 50, y: 50 },
        { id: 4, text: "Judgment", x: 80, y: 60 },
        { id: 5, text: "Vocab", x: 30, y: 70 },
        { id: 6, text: "Perfect?", x: 10, y: 50 },
    ]);

    const handleClear = (id: number) => {
        setDistractions(prev => prev.filter(d => d.id !== id));
    };

    useEffect(() => {
        if (stage === 'activity' && distractions.length === 0) {
            setTimeout(() => setStage('clarity'), 500);
        }
    }, [distractions, stage]);

    const resetActivity = () => {
        setDistractions([
            { id: 1, text: "Grammar?", x: 20, y: 30 },
            { id: 2, text: "Translate", x: 70, y: 20 },
            { id: 3, text: "Accent", x: 50, y: 50 },
            { id: 4, text: "Judgment", x: 80, y: 60 },
            { id: 5, text: "Vocab", x: 30, y: 70 },
            { id: 6, text: "Perfect?", x: 10, y: 50 },
        ]);
        setStage('intro');
    };

    return (
        <section className="py-32 bg-background text-foreground min-h-[700px] flex flex-col justify-center items-center relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">

                <AnimatePresence mode="wait">
                    {/* STAGE 1: INTRO */}
                    {stage === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight">
                                The Cognitive Mirror
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                                Speaking feels hard because your mind is crowded. <br />
                                <span className="text-electric font-medium">Try to clear the noise.</span>
                            </p>
                            <button
                                onClick={() => setStage('activity')}
                                className="px-8 py-4 bg-electric text-white rounded-full font-bold shadow-lg shadow-electric/30 hover:shadow-electric/50 hover:scale-105 transition-all"
                            >
                                Start Experiment
                            </button>
                        </motion.div>
                    )}

                    {/* STAGE 2: THE ACTIVITY */}
                    {stage === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full max-w-3xl h-[400px] bg-card/50 backdrop-blur-sm border border-border rounded-3xl overflow-hidden shadow-2xl mx-auto"
                        >
                            <div className="absolute inset-x-0 top-8 text-center pointer-events-none z-0">
                                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                                    Tap the words to focus
                                </p>
                            </div>

                            {/* Center "Self" */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-foreground rounded-full flex items-center justify-center text-background font-serif font-bold z-10 shadow-xl">
                                You
                            </div>

                            {/* Floating Distractions */}
                            {distractions.map((d) => (
                                <motion.button
                                    key={d.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: [0, 10, -10, 0],
                                        y: [0, -10, 10, 0],
                                    }}
                                    transition={{
                                        x: { duration: 3 + Math.random(), repeat: Infinity, repeatType: "mirror" },
                                        y: { duration: 4 + Math.random(), repeat: Infinity, repeatType: "mirror" }
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => handleClear(d.id)}
                                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                                    className="absolute px-5 py-2 bg-background/90 text-destructive border border-destructive/20 rounded-full font-medium shadow-sm hover:bg-destructive hover:text-white transition-colors cursor-pointer z-20"
                                >
                                    {d.text}
                                    <X size={12} className="inline-block ml-1 opacity-50" />
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {/* STAGE 3: CLARITY */}
                    {stage === 'clarity' && (
                        <motion.div
                            key="clarity"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="w-32 h-32 mx-auto bg-electric/10 rounded-full flex items-center justify-center relative">
                                <motion.div
                                    className="absolute inset-0 bg-electric/20 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="text-4xl">✨</div>
                            </div>

                            <h3 className="font-serif text-3xl md:text-5xl text-foreground">
                                This is Natural Flow.
                            </h3>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                When you stop managing the mechanics, the channel opens. <br />
                                We teach you how to ignore the noise and <strong className="text-foreground">trust your instincts</strong>.
                            </p>

                            <button
                                onClick={resetActivity}
                                className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RefreshCcw size={14} /> Replay
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
