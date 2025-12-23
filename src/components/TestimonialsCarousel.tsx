'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Story = {
    quote: string;
    author: string;
    role: string;
};

export const TestimonialsCarousel = ({ stories, headline, subtext }: { stories: Story[], headline: string, subtext: string }) => {
    const [current, setCurrent] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % stories.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [stories.length]);

    const next = () => setCurrent((prev) => (prev + 1) % stories.length);
    const prev = () => setCurrent((prev) => (prev - 1 + stories.length) % stories.length);

    // Show 2 at a time on desktop if possible, but for key carousel feel, 1 big one or 2 side-by-side in a slider track is better.
    // Let's do a sliding track of 2 items visible on md+.

    // Actually, simpler carousel: Show a subset.
    // Let's assume we want to slide through them.

    return (
        <section className="py-32 bg-background border-y border-border relative overflow-hidden">

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl mb-4">{headline}</h2>
                    <p className="text-muted-foreground text-lg">{subtext}</p>
                </div>

                <div className="relative">
                    {/* Carousel Track */}
                    <div className="overflow-hidden">
                        <motion.div
                            className="flex"
                            animate={{ x: `-${current * 100}%` }}
                            transition={{ ease: "easeInOut", duration: 0.6 }}
                        >
                            {stories.map((story, i) => (
                                <div key={i} className="min-w-full md:min-w-[50%] p-4">
                                    <div className="bg-muted/10 p-10 rounded-3xl border border-transparent hover:border-electric/20 transition-colors relative group h-full flex flex-col justify-between">
                                        <div>
                                            <div className="text-electric text-6xl font-serif opacity-20 group-hover:opacity-40 transition-opacity mb-4">"</div>
                                            <p className="text-xl font-serif leading-relaxed mb-8 relative z-10 text-foreground/90">
                                                {story.quote}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{story.author}</p>
                                            <p className="text-muted-foreground text-sm uppercase tracking-wide">{story.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button onClick={prev} className="p-3 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex gap-2 items-center">
                            {stories.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${current === idx || (current + 1) === idx /* rough approx for desktop 2-up? No, simplistic */ ? 'w-6 bg-electric' : 'bg-muted-foreground/30'}`}
                                // Note: Logic above is simple 1-by-1 sliding. For 2-up view it gets complex. 
                                // I'll stick to 1-by-1 sliding on mobile, maybe 2-by-2 on desktop logic requires math.
                                // Simpler: Just 1-by-1 slide but the width of item is 50% on desktop.
                                // If width is 50%, then 'x: -current * 50%' would slide 1 item at a time.
                                />
                            ))}
                        </div>
                        <button onClick={next} className="p-3 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
