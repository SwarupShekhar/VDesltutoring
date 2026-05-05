'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FontWeightProps {
    text: string;
    fontSize?: number;
    className?: string;
}

export const FontWeight = ({ text, fontSize = 24, className }: FontWeightProps) => {
    // Calculate a responsive size using clamp. 
    // Minimum is 60% of the target size, maximum is the target size.
    const minSize = Math.max(16, fontSize * 0.6);
    const responsiveSize = `clamp(${minSize}px, 6vw, ${fontSize}px)`;

    return (
        <div className={cn("flex items-center justify-center w-full", className)}>
            <div
                style={{ fontSize: responsiveSize }}
                className="font-serif font-bold tracking-tight leading-none"
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
            </div>
        </div>
    );
};
