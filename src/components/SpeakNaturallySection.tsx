'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function SpeakNaturallySection({ dict }: { dict?: any }) {
    const cards = [
      {
        title: dict?.card1?.title || "Speak Naturally in Real Conversations",
        description: dict?.card1?.desc || "Build confidence by speaking in real-world situations — not memorizing scripts.",
        image: "https://res.cloudinary.com/de8vvmpip/image/upload/v1773912428/A_natural__candid_202603191456-Photoroom_v1vzmm.png",
      },
      {
        title: dict?.card2?.title || "Guidance From Mentors Who Fix How You Speak",
        description: dict?.card2?.desc || "Train with experts who help you think faster and respond with clarity.",
        image: "https://res.cloudinary.com/de8vvmpip/image/upload/v1773911404/A_premium__professional_202603191431-Photoroom_laicvz.png",
      },
      {
        title: dict?.card3?.title || "Turn Communication Into Your Competitive Edge",
        description: dict?.card3?.desc || "Perform with clarity and confidence when it matters most.",
        image: "https://res.cloudinary.com/de8vvmpip/image/upload/v1773911436/Context__A_professional__202603191415-Photoroom_anbg5c.png",
      }
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* 1) Section Heading */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight tracking-tight"
                    >
                        {dict?.title || (
                            <>
                                From Everyday Conversations to <br className="hidden md:block" />
                                <span className="text-indigo-600 dark:text-indigo-400">High-Stakes Communication</span>
                            </>
                        )}
                    </motion.h2>
                </div>

                {/* 2) Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 0.6, 
                                delay: idx * 0.15,
                                ease: "easeOut"
                            }}
                            className="group relative flex flex-col h-full min-h-[520px] bg-muted/20 dark:bg-muted/10 border border-black/5 dark:border-white/5 rounded-[3rem] overflow-hidden hover:bg-muted/30 dark:hover:bg-muted/15 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
                        >
                            {/* Card Header & Text */}
                            <div className="p-10 pb-0 z-10">
                                <h3 className="font-serif text-2xl md:text-3xl mb-5 leading-tight text-foreground transition-colors group-hover:text-indigo-500 duration-300">
                                    {card.title}
                                </h3>
                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-light">
                                    {card.description}
                                </p>
                            </div>

                            {/* Card Image Wrapper (Bottom) */}
                            <div className={`mt-auto relative w-full h-80 flex items-end ${idx === 0 ? 'justify-end pr-10' : 'justify-center'} pointer-events-none overflow-hidden`}>
                                {/* Subtle Grid Background behind the image - further reduced for card 1 and made seamless */}
                                <div className="absolute inset-0 z-0" 
                                    style={{
                                        backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, ${idx === 0 ? 0.015 : 0.03}) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, ${idx === 0 ? 0.015 : 0.03}) 1px, transparent 1px)`,
                                        backgroundSize: '24px 24px',
                                        maskImage: idx === 0 
                                            ? 'linear-gradient(to top, black 0%, transparent 70%), linear-gradient(to left, black 0%, transparent 60%)'
                                            : 'radial-gradient(circle at bottom center, black 0%, transparent 60%)',
                                        WebkitMaskImage: idx === 0 
                                            ? 'linear-gradient(to top, black 0%, transparent 70%), linear-gradient(to left, black 0%, transparent 60%)'
                                            : 'radial-gradient(circle at bottom center, black 0%, transparent 60%)',
                                        maskComposite: idx === 0 ? 'intersect' : undefined,
                                        WebkitMaskComposite: idx === 0 ? 'source-in' : undefined
                                    }}
                                />
                                
                                {/* Colorful Doodles around the image */}
                                <div className="absolute inset-0 z-5 pointer-events-none">
                                    {/* Doodle 1: Speech Bubble */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className={`absolute ${idx === 0 ? 'right-[20%] top-[20%]' : (idx === 1 ? 'left-[10%] top-[40%]' : 'left-[15%] top-[20%]')} text-indigo-400/40`}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    </motion.div>
                                    
                                    {/* Doodle 2: Quote */}
                                    <motion.div
                                        animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className={`absolute ${idx === 0 ? 'right-[5%] top-[50%]' : (idx === 1 ? 'right-[15%] top-[10%]' : 'right-[10%] top-[30%])')} text-rose-400/40`}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 4 5h-1c-1.5 0-2.75-.5-3.45-1.451C2.3 18.15 2 19 2 20c0 .5.5 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 4 5h-1c-1.5 0-2.75-.5-3.45-1.451C14.3 18.15 14 19 14 20c0 .5.5 1 1 1z"/></svg>
                                    </motion.div>

                                    {/* Doodle 3: Sparkle/Star */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        className={`absolute ${idx === 0 ? 'right-[40%] top-[10%]' : (idx === 1 ? 'right-[5%] top-[60%]' : 'right-[25%] top-[10%]')} text-amber-400/40`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                                    </motion.div>

                                    {/* Doodle 4: Floating Letter */}
                                    <motion.div
                                        animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className={`absolute ${idx === 0 ? 'right-[50%] top-[40%]' : (idx === 1 ? 'left-[20%] top-[15%]' : 'left-[5%] top-[50%]')} font-serif text-xl font-bold text-indigo-600/20`}
                                    >
                                        {idx === 0 ? 'A' : (idx === 1 ? 'Hi' : 'Hello')}
                                    </motion.div>
                                </div>
                                
                                {/* Decorative overflow glow behind image on hover */}
                                <div className={`absolute bottom-0 ${idx === 0 ? 'right-10' : 'left-1/2 -translate-x-1/2'} w-4/5 h-1/2 bg-indigo-500/0 group-hover:bg-indigo-500/10 blur-3xl rounded-full transition-all duration-700 z-1`} />
                                
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    width={450}
                                    height={450}
                                    className="relative z-10 object-contain object-bottom w-auto h-full max-h-[110%] transform origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08] drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                                    loading="lazy"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
