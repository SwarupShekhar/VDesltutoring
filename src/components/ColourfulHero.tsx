"use client";
import React from "react";
import ColourfulText from "@/components/ui/colourful-text";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ColourfulHeroProps {
    locale: string;
    isLoggedIn: boolean;
}

export function ColourfulHero({ locale, isLoggedIn }: ColourfulHeroProps) {
    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
            <motion.img
                src="https://assets.aceternity.com/linear-demo.webp"
                className="h-full w-full object-cover absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_80%)] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1 }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
                <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-white font-sans leading-tight">
                    AI-powered practice. <br />
                    Expert <ColourfulText text="human coaching" />. <br />
                    Real-world speaking confidence.
                </h1>

                <Link href={isLoggedIn ? (locale === 'en' ? '/practice' : `/${locale}/practice`) : (locale === 'en' ? '/book/session' : `/${locale}/book/session`)}>
                    <Button
                        size="lg"
                        className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-10 h-14 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                    >
                        {isLoggedIn ? "Start Practice" : "Book Session"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
