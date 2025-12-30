"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function AboutPageContent({ dict }: { dict: any }) {
    const t = dict;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-32"
            >
                <h1 className="font-serif text-5xl md:text-7xl mb-8 text-foreground" dangerouslySetInnerHTML={{ __html: t.hero.title }} />
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t.hero.subtitle }} />
            </motion.div>

            <div className="space-y-32 relative max-w-4xl mx-auto">
                {t.sections.map((section: any, index: number) => (
                    <Section key={index} section={section} index={index} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center py-32 px-4"
            >
                <h3 className="text-4xl md:text-6xl font-serif mb-6 text-foreground">{t.final.title}</h3>
                <p className="text-2xl md:text-3xl text-electric font-serif italic">{t.final.subtitle}</p>
            </motion.div>
        </>
    );
}

function Section({ section, index }: { section: any, index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 md:gap-12"
        >
            <div className={`flex flex-col ${isEven ? 'items-start text-left' : 'items-center text-center'}`}>
                <span className="text-electric font-bold uppercase tracking-widest text-xs mb-4 block">{section.label}</span>
                <h2 className="text-3xl md:text-5xl font-serif mb-6 text-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: section.title }} />

                <div className={`text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl ${isEven ? '' : 'mx-auto'}`}>
                    <ContentParser content={section.content} align={isEven ? 'left' : 'center'} />
                </div>
            </div>

            {/* Divider Line */}
            {index < 5 && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-12" />
            )}
        </motion.div>
    )
}

function ContentParser({ content, align }: { content: string, align: 'left' | 'center' }) {
    // 1. Split by double breaks to find paragraphs vs lists blocks
    // NOTE: This assumes the JSON uses <br/><br/> for paragraph separation
    const blocks = content.split('<br/><br/>');

    return (
        <div className="space-y-8">
            {blocks.map((block, i) => {
                // If block contains bullet points (•)
                if (block.includes('•')) {
                    // Split lines by <br/>
                    const lines = block.split('<br/>').filter(line => line.trim().length > 0);

                    // Identify lines that are actual list items vs headers of the list
                    const listItems = lines.filter(line => line.trim().startsWith('•'));
                    const introText = lines.filter(line => !line.trim().startsWith('•'));

                    return (
                        <div key={i} className="space-y-4">
                            {introText.length > 0 && (
                                <p className="font-medium text-foreground text-xl">
                                    {introText.join(' ')}
                                </p>
                            )}
                            <ul className={`grid gap-3 ${align === 'center' ? 'justify-center text-left inline-block' : ''}`}>
                                {listItems.map((item, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <div className="mt-1.5 p-0.5 rounded-full bg-electric/10 text-electric shrink-0">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-200">
                                            {item.replace('•', '').trim()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                } else {
                    // Regular paragraph
                    // Handle single <br/> inside paragraphs if any
                    return (
                        <p key={i} dangerouslySetInnerHTML={{ __html: block }} />
                    );
                }
            })}
        </div>
    );
}
