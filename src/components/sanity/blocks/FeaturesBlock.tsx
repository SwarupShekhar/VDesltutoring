'use client'

import React from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'

interface Feature {
  title: string
  description?: string
  icon?: string
}

interface FeaturesBlockProps {
  _key?: string
  title?: string
  features?: Feature[]
}

export function FeaturesBlock({ title, features }: FeaturesBlockProps) {
  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16 text-foreground">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features?.map((feature, i) => {
            const isImageUrl = feature.icon?.startsWith('http')
            const IconComponent = !isImageUrl ? (Icons[feature.icon as keyof typeof Icons] || Icons.Check) as any : null

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-4xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-electric/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center mb-6 text-electric overflow-hidden">
                  {isImageUrl ? (
                    <img src={feature.icon} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
