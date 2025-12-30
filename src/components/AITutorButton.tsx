"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AITutorButtonProps {
    isLoggedIn: boolean;
    locale: string;
}

export const AITutorButton = ({ isLoggedIn, locale }: AITutorButtonProps) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (isLoggedIn) {
            router.push('/ai-tutor');
        } else {
            router.push(`/${locale}/sign-in`);
        }
    };

    return (
        <div className="fixed bottom-8 left-8 z-[100] flex items-center gap-4">
            <motion.button
                onClick={handleClick}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group cursor-pointer outline-none scale-100 active:scale-95 transition-transform duration-200"
                whileHover={{ scale: 1.05 }}
            >
                {/* Pulsing Rings - Enhanced Visibility */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-full h-full rounded-full border-[3px] border-blue-400/60 dark:border-blue-400/40 bg-blue-500/20"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 0.6,
                            }}
                        />
                    ))}
                </div>

                {/* Main Button */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center text-white overflow-hidden ring-4 ring-white/30 dark:ring-slate-900/30 z-10 backdrop-brightness-110">
                    {/* Shiny Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <motion.div
                        animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <Bot size={32} fill="currentColor" className="text-white drop-shadow-md" />
                    </motion.div>

                    {/* Sparkle Icon */}
                    <motion.div
                        className="absolute top-3 right-3"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Sparkles size={12} className="text-yellow-200" fill="currentColor" />
                    </motion.div>
                </div>
            </motion.button>

            {/* Tooltip / Label */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-xl shadow-xl font-medium text-sm whitespace-nowrap pointer-events-none"
                    >
                        Practice with AI
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
