'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppDownloadModal } from './AppDownloadModal'

export const InstantCallTeaser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 shadow-xl shadow-indigo-500/20 text-white"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Phone className="w-32 h-32 -mr-8 -mt-8" />
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Tutors Available Now
            </div>
            <h3 className="text-2xl font-serif font-bold leading-tight">
              Instant Speaking Practice
            </h3>
            <p className="text-indigo-100/80">
              Get 30 minutes of free talk time with a human tutor. Start an instant call and improve your fluency today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full px-8 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors h-12 font-bold flex items-center gap-2 group/btn shadow-lg"
            >
              <Phone className="w-4 h-4 group-hover/btn:animate-bounce" />
              Call a Tutor
              <Sparkles className="w-4 h-4 text-amber-400" />
            </Button>
            
            <div className="flex -space-x-3 items-center">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-slate-200 overflow-hidden"
                >
                  <img 
                    src={`https://i.pravatar.cc/150?u=tutor${i}`} 
                    alt="Tutor" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
              <div className="pl-4 text-xs font-medium text-indigo-100">
                <Users className="w-3 h-3 inline mr-1" />
                12 tutors online
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AppDownloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
