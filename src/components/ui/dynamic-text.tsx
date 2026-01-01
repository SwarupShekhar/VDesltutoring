"use client";

/**
 * @author: @dorianbaffier
 * @description: Dynamic Text
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Greeting {
    text: string;
    language: string;
}

const greetings: Greeting[] = [
    { text: "Hello", language: "English" },
    { text: "こんにちは", language: "Japanese" },
    { text: "Bonjour", language: "French" },
    { text: "Hola", language: "Spanish" },
    { text: "안녕하세요", language: "Korean" },
    { text: "Ciao", language: "Italian" },
    { text: "Hallo", language: "German" },
    { text: "こんにちは", language: "Japanese" },
    { text: "Hello", language: "English" },
];

const DynamicText = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { amount: 0.5 });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);

    // Reset animation when scrolling back into view
    useEffect(() => {
        if (isInView) {
            setCurrentIndex(0);
            setIsAnimating(true);
        }
    }, [isInView]);

    useEffect(() => {
        if (!isAnimating) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;

                if (nextIndex >= greetings.length) {
                    clearInterval(interval);
                    setIsAnimating(false);
                    return prevIndex;
                }

                return nextIndex;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [isAnimating]);

    // Animation variants for the text
    const textVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 },
    };

    return (
        <section
            ref={containerRef}
            aria-label="Rapid greetings in different languages"
            className="flex min-h-[60px] items-center justify-center gap-1 pt-4"
        >
            <div className="relative flex h-16 w-60 items-center justify-center overflow-hidden">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute flex items-center gap-2 font-medium text-2xl text-gray-800 dark:text-gray-200"
                >
                    <div
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-black dark:bg-white"
                    />
                    {greetings[currentIndex].text}
                </motion.div>
            </div>
        </section>
    );
};

export default DynamicText;
