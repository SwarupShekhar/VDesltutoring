'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';

const SPEAKING_MOMENTS = [
    {
        id: "explain_delay",
        title: "Explaining a delay",
        description: "When you know what happened but struggle to start explaining.",
        example: "“Can you explain why this was delayed?”",
        reframe: "Starting matters more than perfect explanation."
    },
    {
        id: "unexpected_question",
        title: "Being asked unexpectedly",
        description: "When you understand the question but your mind goes blank.",
        example: "“What do you think about this idea?”",
        reframe: "You don’t need an answer - you need an entry."
    },
    {
        id: "disagree_politely",
        title: "Disagreeing politely",
        description: "When you want to disagree but fear sounding rude.",
        example: "“I’m not sure I agree with that.”",
        reframe: "Tone comes from pacing, not vocabulary."
    },
    {
        id: "clarify_mistake",
        title: "Clarifying a misunderstanding",
        description: "When something goes wrong and you need to explain yourself.",
        example: "“Let me clarify what I meant.”",
        reframe: "Speaking early prevents pressure."
    },
    {
        id: "joining_conversation",
        title: "Joining a conversation late",
        description: "When the discussion is already moving fast.",
        example: "“Can I add something here?”",
        reframe: "Claiming space is a skill."
    },
    {
        id: "thinking_mid_sentence",
        title: "Losing your sentence halfway",
        description: "When you start speaking and forget what you wanted to say.",
        example: "“What I was trying to say is…”",
        reframe: "Pausing confidently keeps flow alive."
    }
];

export const SpeakingMomentsGrid = ({ dict }: { dict?: any }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Fallback to array if old structure or empty
    const moments = Array.isArray(dict) ? dict : (dict?.items || SPEAKING_MOMENTS);
    const activeMoment = moments.find((m: any) => m.id === selectedId);

    // Dynamic labels with fallbacks
    const headline = dict?.headline || "Moments where speaking English feels hardest";
    const subtext = dict?.subtext || "These are not grammar problems. They’re timing problems.";

    const modalLabels = {
        whyHard: dict?.modal?.whyHard || "Why this feels hard",
        whyHardDesc: dict?.modal?.whyHardDesc || "You're trying to prepare everything before speaking.",
        reframeLabel: dict?.modal?.reframeLabel || "Englivo Reframe",
        practice: dict?.modal?.practice || "Practice this moment",
        teach: dict?.modal?.teach || "See how we teach this"
    };

    return (
        <section className="py-24 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4"
                    >
                        {headline}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-400 font-sans"
                    >
                        {subtext}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moments.map((moment: any, index: number) => (
                        <motion.div
                            key={moment.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.15)" }}
                            onClick={() => setSelectedId(moment.id)}
                            className="glass-card group cursor-pointer p-8 rounded-2xl border border-white/20 dark:border-white/10 relative overflow-hidden transition-colors hover:bg-white/5"
                        >
                            {/* Gentle Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 relative z-10">
                                {moment.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
                                {moment.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* EXPANDED MODAL VIEW */}
            <AnimatePresence>
                {selectedId && activeMoment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        <motion.div
                            layoutId={selectedId}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
                        >
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8">
                                <h4 className="text-2xl font-serif text-gray-900 dark:text-white mb-6 pr-8">
                                    {activeMoment.title}
                                </h4>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border-l-4 border-electric">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">The Moment</p>
                                        <p className="text-lg italic text-gray-700 dark:text-gray-200 font-serif">
                                            {activeMoment.example}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{modalLabels.whyHard}</p>
                                        <p className="text-base text-gray-600 dark:text-gray-300">
                                            {modalLabels.whyHardDesc}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-electric mb-2 flex items-center gap-2">
                                            <Sparkles size={12} /> {modalLabels.reframeLabel}
                                        </p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {activeMoment.reframe}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                                    <button className="flex-1 bg-electric text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group">
                                        Practice this moment
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="px-6 py-3 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        See how we teach this
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
