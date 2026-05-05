'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CTABlockProps {
  _key?: string
  title?: string
  label?: string
  link?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export function CTABlock({ title, label, link, variant = 'primary' }: CTABlockProps) {
  const getStyles = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900'
      case 'secondary':
        return 'bg-electric text-white hover:bg-electric/90 shadow-lg shadow-electric/25'
      default:
        return 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 shadow-xl'
    }
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 md:p-20 rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-electric/5 via-transparent to-indigo-500/5" />
          
          <h2 className="text-4xl md:text-6xl font-serif mb-10 text-foreground relative z-10 leading-tight">
            {title}
          </h2>
          
          {label && link && (
            link.startsWith('http') ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-bold transition-all relative z-10 ${getStyles()}`}
              >
                {label}
              </a>
            ) : (
              <Link
                href={link}
                className={`inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-bold transition-all relative z-10 ${getStyles()}`}
              >
                {label}
              </Link>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}
