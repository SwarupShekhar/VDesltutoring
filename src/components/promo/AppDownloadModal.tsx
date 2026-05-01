'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Download, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AppDownloadModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AppDownloadModal = ({ isOpen, onClose }: AppDownloadModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto border border-slate-200 dark:border-slate-800"
            >
              {/* Left Side: Visuals */}
              <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-teal-500/10 z-0" />
                
                {/* Phone Mockup */}
                <div className="relative z-10 w-full max-w-[280px] aspect-[9/19] rounded-[3rem] border-[8px] border-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-900">
                  <Image 
                    src="/englivo_app_calling_ui_1777638508282.png" 
                    alt="App Calling UI" 
                    fill 
                    className="object-cover"
                  />
                </div>

                {/* Decorative Pulse */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                      <Smartphone className="w-3.5 h-3.5" />
                      App Exclusive Feature
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                      Start Your Free <span className="text-indigo-600 dark:text-indigo-400">Live Practice</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">
                      Instant tutor calls and your first 30 minutes of free speaking practice are only available on the Englivo mobile app.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Instant connection to available tutors",
                      "Crystal clear voice calling experience",
                      "30 Minutes free for all new app users",
                      "Syncs perfectly with your web profile"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <Button className="rounded-full px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform flex items-center gap-2 h-12">
                      <Download className="w-4 h-4" />
                      Download App
                    </Button>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                        {/* Placeholder for QR Code */}
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                      </div>
                      <p>Scan QR code to<br/>download on mobile</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
