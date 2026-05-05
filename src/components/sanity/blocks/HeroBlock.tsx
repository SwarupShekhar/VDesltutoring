'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/image'
import type { SanityImage } from '@/types/sanity'

interface HeroBlockProps {
  _key: string
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaLink?: string
  backgroundImage?: SanityImage
}

export function HeroBlock({
  title,
  subtitle,
  ctaLabel,
  ctaLink,
  backgroundImage,
}: HeroBlockProps) {
  const bgImageUrl = backgroundImage?.asset 
    ? (() => {
        const builder = urlForImage(backgroundImage as any)
        return builder?.width(1920).auto('format').url()
      })()
    : (typeof backgroundImage === 'string' ? backgroundImage : null)

  return (
    <section className="relative py-24 overflow-hidden">
      {bgImageUrl && (
        <div 
          className="absolute inset-0 z-0 opacity-20"
          role="img"
          aria-label={backgroundImage?.alt || title}
          style={{ 
            backgroundImage: `url(${bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-8 text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
              {subtitle}
            </p>
          )}
          {ctaLabel && ctaLink && (
            ctaLink.startsWith('http') ? (
              <a
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all shadow-xl"
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all shadow-xl"
              >
                {ctaLabel}
              </Link>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}
