"use client";
import { motion } from "framer-motion";
import ColourfulText from "@/components/ui/colourful-text";

interface AIVsCoachingSectionProps {
    dict: {
        title_line1: string;
        title_line2_pre: string;
        title_line2_highlight: string;
        microcopy: string;
        appsCard: { title: string; items: string[] };
        englivoCard: { title: string; items: string[]; anchor: string };
    };
}

export function AIVsCoachingSection({ dict }: AIVsCoachingSectionProps) {
    if (!dict) return null;

    return (
        <section className="w-full py-20 bg-background relative overflow-hidden border-t border-border">
            {/* Background enhancement */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[120px] pointer-events-none opacity-40" />

            <div className="max-w-6xl mx-auto px-6 text-center relative z-10">

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-3xl md:text-5xl font-serif font-bold leading-tight text-foreground mb-8"
                >
                    {dict.title_line1} <br />
                    <span className="text-muted-foreground">
                        <ColourfulText text="Coaches" /> {dict.title_line2_pre.replace("Coaches ", "")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-purple-400 font-extrabold drop-shadow-sm">{dict.title_line2_highlight}</span>.
                    </span>
                </motion.h2>

                {/* Animated Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-electric/40 to-transparent my-10 origin-center"
                />

                {/* Framing Microcopy */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm md:text-base text-muted-foreground uppercase tracking-widest font-medium mb-12"
                >
                    {dict.microcopy}
                </motion.p>

                {/* Comparison Grid */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">

                    {/* Practice Apps Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm grayscale-[0.5] opacity-80 hover:opacity-100 transition-opacity"
                    >
                        <h4 className="text-xl font-serif font-medium mb-8 text-muted-foreground flex items-center justify-center gap-2">
                            {dict.appsCard.title}
                        </h4>
                        <ul className="space-y-5 text-muted-foreground/70 text-lg text-left max-w-xs mx-auto">
                            {dict.appsCard.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Englivo Side - Authority Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.98 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1.02 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="p-10 rounded-3xl border-2 border-electric bg-gradient-to-b from-electric/10 to-transparent backdrop-blur-md shadow-[0_0_100px_rgba(59,130,246,0.3)] relative z-10"
                    >
                        {/* Subtle corner accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-electric/20 to-transparent rounded-tr-3xl" />

                        <h4 className="text-2xl font-serif font-bold mb-8 text-foreground flex items-center justify-center gap-2">
                            {dict.englivoCard.title}
                        </h4>
                        <ul className="space-y-6 text-foreground text-lg text-left max-w-xs mx-auto font-medium">
                            {dict.englivoCard.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-electric shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> {item}
                                </li>
                            ))}
                        </ul>

                        {/* Anchor Line */}
                        <div className="mt-10 pt-6 border-t border-electric/30 text-sm font-bold text-electric tracking-wide uppercase">
                            {dict.englivoCard.anchor}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
