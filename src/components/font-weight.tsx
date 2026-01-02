'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FontWeightProps {
    text: string;
    fontSize?: number;
    className?: string;
}

export const FontWeight = ({ text, fontSize = 24, className }: FontWeightProps) => {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <h1
                style={{ fontSize: `${fontSize}px` }}
                className="font-serif font-bold tracking-tight"
            >
                {text.split('').map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ fontWeight: 400 }}
                        whileHover={{ fontWeight: 900 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block cursor-pointer transition-all duration-300 hover:text-electric"
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </h1>
        </div>
    );
};
