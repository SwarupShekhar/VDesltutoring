"use client";
import React, { useRef, useState } from "react";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
    content,
    contentClassName,
}: {
    content: {
        title: string;

        description: string | React.ReactNode;
        content?: React.ReactNode | any;
        // color prop removed
    }[];
    contentClassName?: string;
}) => {
    const [activeCard, setActiveCard] = useState(0);
    const ref = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        container: ref,
        offset: ["start start", "end start"],
    });
    const cardLength = content.length;

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Optimized O(1) breakpoint logic (avoids array allocation on every frame)
        // Breakpoints are at 0, 1/N, 2/N ...
        // We want closest integer k to (latest * N)
        // N = cardLength

        // Note: The original logic used index/cardLength.
        // E.g. 4 cards: 0, 0.25, 0.5, 0.75.
        // Range 0.88-1.0 maps to 0.75 (index 3).

        const index = Math.min(
            Math.max(Math.round(latest * cardLength), 0),
            cardLength - 1
        );

        if (index !== activeCard) {
            setActiveCard(index);
        }
    });

    return (
        <motion.div
            className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-3xl p-10 scrollbar-hide bg-slate-950 border border-white/5 shadow-2xl"
            ref={ref}
        >
            <div className="relative flex items-start px-4 w-full md:w-auto">
                <div className="max-w-2xl relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-slate-800" />

                    {content.map((item, index) => (
                        <div key={item.title + index} className="my-32 pl-12 relative">
                            {/* Timeline Dot */}
                            <motion.div
                                animate={{
                                    backgroundColor: activeCard === index ? "#3B82F6" : "#1e293b",
                                    scale: activeCard === index ? 1.2 : 1
                                }}
                                className="absolute left-[-4px] top-3 w-3 h-3 rounded-full transition-colors"
                            />

                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                                className="text-3xl md:text-4xl font-serif font-bold text-slate-100"
                            >
                                {item.title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                                className="text-lg text-slate-300/80 max-w-sm mt-6 leading-relaxed"
                            >
                                {item.description}
                            </motion.p>

                            {/* Mobile Content Card */}
                            <div className="block lg:hidden mt-8 rounded-2xl bg-slate-900 overflow-hidden border border-white/10 shadow-xl opacity-100">
                                {item.content}
                            </div>
                        </div>
                    ))}
                    <div className="h-24" />
                </div>
            </div>
            <div
                className={cn(
                    "hidden lg:block h-72 w-96 rounded-2xl bg-slate-900 sticky top-10 overflow-hidden shadow-2xl border border-white/10",
                    contentClassName
                )}
            >
                {content[activeCard].content ?? null}
            </div>
        </motion.div>
    );
};
