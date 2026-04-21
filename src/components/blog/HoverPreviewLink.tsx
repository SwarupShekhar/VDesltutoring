'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface RelatedPostPreview {
    slug: string
    title: string
    cover: string | null
    excerpt: string | null
    category: string | null
}

interface HoverPreviewLinkProps {
    href: string
    children: React.ReactNode
    preview?: RelatedPostPreview
    locale?: string
}

export function HoverPreviewLink({ href, children, preview, locale }: HoverPreviewLinkProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [position, setPosition] = useState<'above' | 'below'>('below')
    const containerRef = useRef<HTMLSpanElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const spaceBelow = window.innerHeight - rect.bottom
                setPosition(spaceBelow < 250 ? 'above' : 'below')
            }
            setIsHovered(true)
        }, 150) // Subtle delay to prevent accidental triggers
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovered(false)
    }

    if (!preview) {
        return (
            <Link href={href} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline decoration-2 underline-offset-2 transition-colors">
                {children}
            </Link>
        )
    }

    return (
        <span 
            ref={containerRef}
            className="relative inline"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link 
                href={href}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline decoration-2 underline-offset-2 transition-colors"
            >
                {children}
            </Link>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: position === 'below' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: position === 'below' ? 0 : 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: position === 'below' ? 10 : -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute left-0 z-50 w-72 sm:w-80 p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl pointer-events-none ${
                            position === 'below' ? 'top-full mt-2' : 'bottom-full mb-2'
                        }`}
                    >
                        {preview.cover && (
                            <div className="relative aspect-video w-full overflow-hidden mb-3">
                                <Image 
                                    src={preview.cover} 
                                    alt={preview.title}
                                    fill
                                    className="object-cover"
                                />
                                {preview.category && (
                                    <span className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                                        {preview.category}
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <div className={`p-4 ${!preview.cover ? 'pt-5' : ''}`}>
                            {!preview.cover && preview.category && (
                                <span className="inline-block mb-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded">
                                    {preview.category}
                                </span>
                            )}
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                                {preview.title}
                            </h4>
                            {preview.excerpt && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                    {preview.excerpt}
                                </p>
                            )}
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                Read lesson 
                                <span className="text-lg leading-none">→</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    )
}
