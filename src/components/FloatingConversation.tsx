'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CONVERSATION_FRAGMENTS = [
    { text: "Actually...", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    { text: "So...", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
    { text: "Well,", color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
    { text: "I mean,", color: "border-rose-500/30 bg-rose-500/10 text-rose-400" },
    { text: "Basically,", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
    { text: "You know,", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
    { text: "Like,", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
    { text: "Honestly,", color: "border-blue-400/30 bg-blue-400/10 text-blue-300" },
    { text: "Right?", color: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
    { text: "Umm...", color: "border-gray-500/30 bg-gray-500/10 text-gray-400" },
    { text: "Listen,", color: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
    { text: "Look,", color: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
    { text: "Anyway,", color: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
    { text: "Literally,", color: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
    { text: "Totally,", color: "border-lime-500/30 bg-lime-500/10 text-lime-400" },
    { text: "See,", color: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400" }
];

export const FloatingConversation = () => {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setMounted(true);
        // Only access window on client
        setDimensions({ width: window.innerWidth, height: window.innerHeight });

        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
            {CONVERSATION_FRAGMENTS.map((item, i) => {
                // Generate random paths relative to viewport size
                // Values are offset from center (0)
                const xPath = Array.from({ length: 4 }).map(() => (Math.random() * dimensions.width) - (dimensions.width / 2));
                const yPath = Array.from({ length: 4 }).map(() => (Math.random() * dimensions.height) - (dimensions.height / 2));

                // Ensure we start roughly near where CSS placed it, or just animate from 0 (relative)
                // Framer motion 'animate' overrides transform, so these are absolute positions if we use x/y like this?
                // No, x/y in Framer are usually 'transform: translateX/Y'.
                // So if top/left is random %, x/y moves RELATIVE to that.
                // To cover the screen, we need large relative values.

                return (
                    <motion.div
                        key={i}
                        className={`absolute backdrop-blur-[4px] border rounded-full px-5 py-2.5 font-serif italic text-xl shadow-lg ${item.color}`}
                        style={{
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                        }}
                        animate={{
                            x: xPath,
                            y: yPath,
                            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
                            scale: [0.95, 1.05, 0.98, 1.02, 0.95]
                        }}
                        transition={{
                            duration: Math.random() * 40 + 40, // 40-80s duration
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                        }}
                    >
                        {item.text}
                    </motion.div>
                );
            })}
        </div>
    );
};
