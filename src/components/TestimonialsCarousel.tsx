'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote as QuoteIcon } from 'lucide-react';

type Story = {
    quote: string;
    author: string;
    role: string;
};

export const TestimonialsCarousel = ({ stories, headline, subtext }: { stories: Story[], headline: string, subtext: string }) => {
    // We use a "triple" list to allow seamless infinite scrolling in both directions
    const [displayStories, setDisplayStories] = useState<Story[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Update items per page based on window size
    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 1 : 2);
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize display stories with clones
    useEffect(() => {
        if (stories.length > 0) {
            setDisplayStories([...stories, ...stories, ...stories]);
            setCurrentIndex(stories.length); // Start at the middle set
        }
    }, [stories]);

    const handleNext = useCallback(() => {
        if (!isTransitioning) return;
        setCurrentIndex((prev) => prev + 1);
    }, [isTransitioning]);

    const handlePrev = useCallback(() => {
        if (!isTransitioning) return;
        setCurrentIndex((prev) => prev - 1);
    }, [isTransitioning]);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(handleNext, 7000);
        return () => clearInterval(timer);
    }, [handleNext]);

    // Handle Wrap-around (The "Teleport" trick)
    useEffect(() => {
        const total = stories.length;
        if (currentIndex === total * 2) {
            // Reached the end of the second set, jump to the start of the second set
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(total);
            }, 600); // Wait for the 600ms css/motion transition
            return () => clearTimeout(timer);
        }
        if (currentIndex === total - 1) {
            // Reached the end of the first set (moving backwards), jump to the end of the second set
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(total * 2 - 1);
            }, 600);
            return () => clearTimeout(timer);
        }

        // Always reset transition state after a potential teleport
        if (!isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, stories.length, isTransitioning]);

    if (displayStories.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-6xl mb-6 tracking-tight text-slate-900 dark:text-white"
                    >
                        {headline}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 text-xl font-light max-w-2xl mx-auto"
                    >
                        {subtext}
                    </motion.p>
                </div>

                <div className="relative group/carousel">
                    {/* Carousel Track */}
                    <div className="overflow-hidden px-4 -mx-4">
                        <motion.div
                            ref={scrollContainerRef}
                            className="flex"
                            animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
                            transition={isTransitioning ? { type: "spring", stiffness: 100, damping: 20, mass: 1 } : { duration: 0 }}
                            style={{
                                cursor: 'grab',
                            }}
                        >
                            {displayStories.map((story, i) => (
                                <div
                                    key={i}
                                    className="min-w-full md:min-w-[50%] p-4 lg:p-6"
                                >
                                    <div className="h-full bg-white dark:bg-white/[0.02] p-10 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all duration-500 relative flex flex-col justify-between shadow-sm hover:shadow-2xl hover:-translate-y-1">
                                        <div className="absolute top-8 right-10 text-slate-100 dark:text-white/5 pointer-events-none">
                                            <QuoteIcon size={80} strokeWidth={1.5} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex gap-1 mb-6">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <div key={s} className="w-4 h-4 text-amber-400">★</div>
                                                ))}
                                            </div>
                                            <p className="text-xl md:text-2xl font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed mb-10">
                                                "{story.quote}"
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-8">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                {story.author[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-lg leading-none mb-1">{story.author}</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-medium">{story.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 hidden lg:block opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                        <button
                            onClick={handlePrev}
                            disabled={!isTransitioning}
                            aria-label="Previous testimonial"
                            className="p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-90"
                        >
                            <ChevronLeft size={28} className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 hidden lg:block opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                        <button
                            onClick={handleNext}
                            disabled={!isTransitioning}
                            aria-label="Next testimonial"
                            className="p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-90"
                        >
                            <ChevronRight size={28} className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>

                    {/* Dots / Progress */}
                    <div className="flex justify-center gap-3 mt-12 overflow-hidden py-2 px-1">
                        {stories.map((_, idx) => {
                            const activeIdx = (currentIndex % stories.length);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (isTransitioning) setCurrentIndex(stories.length + idx);
                                    }}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${activeIdx === idx ? 'w-10 bg-blue-600 dark:bg-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'w-2.5 bg-slate-300 dark:bg-white/10 hover:bg-slate-400 dark:hover:bg-white/20'}`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
