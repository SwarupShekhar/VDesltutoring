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
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const { innerWidth: width, innerHeight: height } = window;
        setDimensions({ width, height });

        const newItems = CONVERSATION_FRAGMENTS.map((item) => {
            const xPath = Array.from({ length: 4 }).map(() => (Math.random() * width) - (width / 2));
            const yPath = Array.from({ length: 4 }).map(() => (Math.random() * height) - (height / 2));

            return {
                ...item,
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                xPath,
                yPath,
                duration: Math.random() * 40 + 40,
                delay: Math.random() * 5
            };
        });
        setItems(newItems);

        const handleResize = () => {
            // Optional: Re-calculate on resize? Or just let them fly?
            // Re-calculating might reset animations. Let's just update dimensions if needed or leave as is.
            // Actually, width/height in xPath are fixed values.
            // If window resizes, the relative movement might feel off, but it's fine for ambient bubbles.
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted || items.length === 0) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    className={`absolute backdrop-blur-[4px] border rounded-full px-5 py-2.5 font-serif italic text-xl shadow-lg ${item.color}`}
                    style={{
                        top: item.top,
                        left: item.left,
                    }}
                    animate={{
                        x: item.xPath,
                        y: item.yPath,
                        opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
                        scale: [0.95, 1.05, 0.98, 1.02, 0.95]
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: item.delay
                    }}
                >
                    {item.text}
                </motion.div>
            ))}
        </div>
    );
};
