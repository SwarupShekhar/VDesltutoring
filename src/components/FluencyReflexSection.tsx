"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

interface FluencyReflexSectionProps {
    dict: {
        title: string;
        subtitle: string;
        title1: string;
        desc1: string;
        content1: string;
        title2: string;
        desc2: string;
        content2_p1: string;
        content2_p2: string;
        title3: string;
        desc3: string;
        content3_p1: string;
        content3_p2: string;
        content3_p3: string;
        title4: string;
        desc4: string;
        content4_p1: string;
        content4_p2: string;
        content4_p3: string;
        content4_p4: string;
        title5: string;
        desc5: string;
        content5_p1: string;
        content5_p2: string;
        content5_p3: string;
        title6: string;
        desc6: string;
        content6_p1: string;
        content6_p2: string;
        content6_p3: string;
        content6_p4: string;
        title7: string;
        desc7: string;
        content7_p1: string;
        content7_p2: string;
        title8: string;
        desc8: string;
        content8_p1: string;
        content8_p2: string;
        content8_p3: string;
    };
}

export function FluencyReflexSection({ dict }: FluencyReflexSectionProps) {
    // Helper to highlight keywords
    const highlightKeywords = (text: string) => {
        const parts = text.split(/(AI|human coaching|human tutor|tutor|Tutors)/g);
        return (
            <span>
                {parts.map((part, i) => {
                    if (part === 'AI') return <span key={i} className="text-cyan-400 font-bold">AI</span>;
                    if (['human coaching', 'human tutor', 'tutor', 'Tutors'].includes(part)) return <span key={i} className="text-pink-500 font-bold">{part}</span>;
                    return <span key={i}>{part}</span>;
                })}
            </span>
        );
    };

    const content = [
        {
            title: dict.title1,
            description: highlightKeywords(dict.desc1),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white text-lg md:text-2xl font-light text-center p-6 md:p-10">
                    {dict.content1}
                </div>
            ),
        },
        {
            title: dict.title2,
            description: highlightKeywords(dict.desc2),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg md:text-2xl text-center p-6 md:p-10">
                    {dict.content2_p1} <br /> {dict.content2_p2}
                </div>
            ),
        },
        {
            title: dict.title3,
            description: highlightKeywords(dict.desc3),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg md:text-2xl text-center p-6 md:p-10">
                    {dict.content3_p1} <br /> {dict.content3_p2} <br /> {dict.content3_p3}
                </div>
            ),
        },
        {
            title: dict.title4,
            description: highlightKeywords(dict.desc4),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white text-base md:text-xl text-center p-6 md:p-10 uppercase tracking-widest font-bold">
                    {dict.content4_p1} <br /> {dict.content4_p2} <br /> {dict.content4_p3} <br /> {dict.content4_p4}
                </div>
            ),
        },
        {
            title: dict.title5,
            description: highlightKeywords(dict.desc5),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg md:text-2xl text-center p-6 md:p-10">
                    {dict.content5_p1} <br /> {dict.content5_p2} <br /> {dict.content5_p3}
                </div>
            ),
        },
        {
            title: dict.title6,
            description: highlightKeywords(dict.desc6),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-sky-500 text-white text-base md:text-xl text-center p-6 md:p-10">
                    {dict.content6_p1} <br /> {dict.content6_p2} <br /> {dict.content6_p3} <br /> {dict.content6_p4}
                </div>
            ),
        },
        {
            title: dict.title7,
            description: highlightKeywords(dict.desc7),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-black text-white text-lg md:text-2xl text-center p-6 md:p-10">
                    {dict.content7_p1} <br /> {dict.content7_p2}
                </div>
            ),
        },
        {
            title: dict.title8,
            description: highlightKeywords(dict.desc8),
            content: (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900 to-violet-900 text-white text-lg md:text-2xl text-center p-6 md:p-10 font-bold tracking-wide">
                    {dict.content8_p1} <br /> {dict.content8_p2} <br /> {dict.content8_p3}
                </div>
            ),
        },
    ];

    return (
        <section className="py-24 bg-background overflow-hidden border-y border-border">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl mb-6">{dict.title}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {dict.subtitle}
                    </p>
                </div>
                {/* @ts-ignore */}
                <StickyScroll content={content} />
            </div>
        </section>
    );
}
