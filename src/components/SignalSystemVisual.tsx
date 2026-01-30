"use client";
import { motion } from "framer-motion";

// Custom easing for premium feel
const premiumEase = [0.22, 1, 0.36, 1] as const;

interface SignalSystemVisualProps {
    dict: {
        title: string;
        subtitle: string;
        step1: { title: string; sub: string };
        step2: { title: string; sub: string };
        step3: { title: string; sub: string };
    };
}

const iconVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            duration: 1.5,
            ease: premiumEase
        }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.4,
            delayChildren: 0.2
        }
    }
};

export function SignalSystemVisual({ dict }: SignalSystemVisualProps) {
    return (
        <section className="w-full py-28 bg-background relative border-t border-white/5 overflow-hidden">
            {/* 4. Depth: Ambient Glow & Noise */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-electric/5 rounded-full blur-[100px] pointer-events-none opacity-30" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] animate-grain pointer-events-none mix-blend-overlay" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
                        {dict.title}
                    </h3>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
                        {dict.subtitle}
                    </p>
                </motion.div>

                {/* 3-Step Flow */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0"
                >

                    {/* 2. Connecting Line (Enhanced) */}
                    <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-white/5 -z-10 overflow-hidden">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1.8, ease: premiumEase, delay: 0.5 }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-electric/60 to-transparent origin-left box-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </div>

                    {/* Step 1: Listen (Waveform Loop) */}
                    <Step
                        title={dict.step1.title}
                        sub={dict.step1.sub}
                        icon={
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="stroke-electric drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                                <motion.path
                                    d="M5 30Q15 30 20 15T35 45T50 30"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    variants={iconVariants}
                                    animate={{ d: ["M5 30Q15 30 20 15T35 45T50 30", "M5 30Q15 30 20 45T35 15T50 30", "M5 30Q15 30 20 15T35 45T50 30"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </svg>
                        }
                    />

                    {/* Step 2: Speak (Audio Levels) */}
                    <Step
                        title={dict.step2.title}
                        sub={dict.step2.sub}
                        icon={
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="stroke-electric drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                                {[15, 25, 35, 45].map((x, i) => (
                                    <motion.line
                                        key={i}
                                        x1={x} y1="20" x2={x} y2="40"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        variants={iconVariants}
                                        animate={{ y1: [20, 10, 20], y2: [40, 50, 40] }}
                                        transition={{ duration: 1 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                                    />
                                ))}
                            </svg>
                        }
                    />

                    {/* Step 3: Analyze (Scanning Radar) */}
                    <Step
                        title={dict.step3.title}
                        sub={dict.step3.sub}
                        icon={
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="stroke-electric drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                                <motion.circle cx="30" cy="30" r="20" strokeWidth="1.5" variants={iconVariants} className="opacity-50" />
                                <motion.g animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                    <motion.path d="M30 30L30 10" strokeWidth="2" strokeLinecap="round" variants={iconVariants} className="opacity-80" />
                                    <motion.circle cx="30" cy="10" r="2" fill="currentColor" className="text-electric" />
                                </motion.g>
                                <motion.circle cx="30" cy="30" r="2" fill="currentColor" className="text-electric" />
                            </svg>
                        }
                    />

                </motion.div>
            </div>
        </section>
    );
}

function Step({ title, sub, icon }: { title: string, sub: string, icon: React.ReactNode }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } }
            }}
            className="flex flex-col items-center flex-1 z-10 w-full md:w-auto"
        >
            <motion.div
                className="w-32 h-32 rounded-full bg-background/50 border border-white/10 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-md group"
                whileHover={{ scale: 1.05, borderColor: "rgba(59,130,246,0.5)", boxShadow: "inset 0 0 30px rgba(59,130,246,0.1)" }}
                initial={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
                <div className="absolute inset-0 bg-electric/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {icon}
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{sub}</p>
        </motion.div>
    );
}
