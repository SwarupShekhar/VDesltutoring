"use client";
import React, { useRef, useState } from "react";
import { useScroll, motion, useMotionValueEvent, useInView, AnimatePresence } from "framer-motion";
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

    // Logic updated to use InView for reliable triggering

    return (
        <motion.div
            className="h-[25rem] overflow-y-auto flex justify-center relative space-x-10 rounded-3xl p-10 scrollbar-hide scroll-smooth bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-2xl w-full"
            ref={ref}
        >
            <div className="relative flex items-start px-4 w-full md:w-auto">
                <div className="max-w-2xl relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-slate-200 dark:bg-slate-800" />

                    {content.map((item, index) => (
                        <StickyItem
                            key={item.title + index}
                            item={item}
                            index={index}
                            activeCard={activeCard}
                            setActiveCard={setActiveCard}
                        />
                    ))}
                    <div className="h-40" />
                </div>
            </div>
            <div
                className={cn(
                    "hidden lg:block h-80 w-[500px] rounded-2xl bg-white dark:bg-slate-900 sticky top-10 overflow-hidden shadow-xl border border-black/5 dark:border-white/10 self-start",
                    contentClassName
                )}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCard + "-content"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-full w-full"
                    >
                        {content[activeCard].content ?? null}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Helper component to track visibility
function StickyItem({ item, index, activeCard, setActiveCard }: any) {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-20% 0px -50% 0px" }); // Trigger when item is near center-top

    // Update active card when in view
    if (isInView && activeCard !== index) {
        // We use a timeout or requestAnimationFrame to avoid "update during render" warning if strict
        // But usually setting state in render body is bad, triggering in effect is better.
        // However, this is a functional component body.
    }

    // Better: Use useEffect to set state
    React.useEffect(() => {
        if (isInView) {
            setActiveCard(index);
        }
    }, [isInView, index, setActiveCard]);

    return (
        <div ref={ref} className="my-40 pl-12 relative">
            {/* Timeline Dot */}
            <motion.div
                animate={{
                    backgroundColor: activeCard === index ? "#3B82F6" : "currentColor",
                    scale: activeCard === index ? 1.2 : 1,
                    opacity: activeCard === index ? 1 : 0.3
                }}
                className="absolute left-[-4px] top-3 w-3 h-3 rounded-full transition-colors text-slate-400 dark:text-slate-600 bg-slate-400 dark:bg-slate-600"
            />

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100"
            >
                {item.title}
            </motion.h2>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-lg text-slate-600 dark:text-slate-300 max-w-sm mt-6 leading-relaxed"
            >
                {item.description}
            </motion.p>

            {/* Mobile Content Card */}
            <div className="block lg:hidden mt-8 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden border border-black/5 dark:border-white/10 shadow-xl opacity-100">
                {item.content}
            </div>
        </div>
    );

}
