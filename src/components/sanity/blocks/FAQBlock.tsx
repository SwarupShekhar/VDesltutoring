'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQBlockProps {
  _key?: string
  title?: string
  faqs?: FAQItem[]
}

export function FAQBlock({ title, faqs }: FAQBlockProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="container mx-auto px-4 max-w-3xl">
        {title && (
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16 text-foreground">
            {title}
          </h2>
        )}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="glass-card overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {faq.question}
                </span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Plus className="w-5 h-5 text-indigo-500" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
