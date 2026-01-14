"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Award, Star } from 'lucide-react'

interface LevelUpModalProps {
    level: string
    onClose: () => void
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
    useEffect(() => {
        const duration = 3 * 1000
        const end = Date.now() + duration

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#2563eb', '#9333ea', '#fbbf24']
            })
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#2563eb', '#9333ea', '#fbbf24']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }

        frame()
    }, [])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    onClick={e => e.stopPropagation()}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-yellow-500/30 overflow-hidden"
                >
                    {/* Background Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>

                    <div className="flex flex-col items-center text-center p-8 pt-12 space-y-6">

                        {/* Animated Badge */}
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="w-32 h-32 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.4)] border-4 border-white dark:border-slate-800"
                            >
                                <span className="text-6xl font-black text-yellow-900 drop-shadow-sm">{level}</span>
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 border-4 border-white dark:border-slate-800">
                                <Award size={24} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400"
                            >
                                Level Unlocked!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-slate-600 dark:text-slate-300"
                            >
                                You have officially reached proficiency level <strong>{level}</strong>. Keep pushing your limits!
                            </motion.p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-lg"
                        >
                            Continue Journey
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
