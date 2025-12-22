'use client';

import { Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TutorProps {
    name: string;
    specialty: string;
    image?: string;
    style?: string;
}

export const TutorCard = ({ name, specialty, style }: TutorProps) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative backdrop-blur-md bg-card/50 border border-border dark:bg-card/40 dark:border-white/5 rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-electric/5"
        >
            {/* Glow Effect on Hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -mr-10 -mt-10" />

            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="relative">
                            {/* Placeholder Profile - Grayscale to Color */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-xl font-serif text-oxford dark:text-gray-300 font-bold uppercase shadow-inner overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                {name.charAt(0)}
                            </div>
                            {/* Presence Indicator */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-oxford rounded-full shadow-sm z-20">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-academic-gold/10 px-2 py-1 rounded-full border border-academic-gold/20">
                            <CheckCircle2 size={12} className="text-academic-gold" />
                            <span className="text-[10px] font-medium tracking-wide text-academic-gold uppercase">CELTA Certified</span>
                        </div>
                    </div>

                    <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-electric transition-colors">{name}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{specialty}</p>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {style ? style : "Focuses on calm, structured conversation practice with detailed feedback."}
                    </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        Style
                    </span>
                    <button className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-electric group-hover:border-electric transition-all duration-300 shadow-sm relative overflow-hidden group/btn">
                        <Play size={14} className="ml-1 relative z-10 group-hover/btn:hidden" fill="currentColor" />
                        {/* Waveform Placeholder on Hover */}
                        <div className="hidden group-hover/btn:flex gap-0.5 items-center justify-center h-4">
                            <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-electric rounded-full" />
                            <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-electric rounded-full" />
                            <motion.div animate={{ height: [6, 12, 5] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-electric rounded-full" />
                        </div>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
