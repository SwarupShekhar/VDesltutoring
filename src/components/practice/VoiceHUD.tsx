"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Zap } from 'lucide-react'

interface VoiceHUDProps {
    stream: MediaStream | null
    isRecording: boolean
}

export function VoiceHUD({ stream, isRecording }: VoiceHUDProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const silenceCountRef = useRef(0)
    const [hint, setHint] = useState<string | null>(null)
    const animationRef = useRef<number>(0)
    const analyserRef = useRef<AnalyserNode | null>(null)

    const HINTS = [
        "You're doing great, keep going!",
        "Try to finish your thought...",
        "Don't worry about mistakes, just talk!",
        "Keep the momentum up!",
        "Focus on the flow, not the words."
    ]

    useEffect(() => {
        if (!stream || !isRecording) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            silenceCountRef.current = 0
            setHint(null)
            return
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = analyser

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
            if (!canvasRef.current) return
            const ctx = canvasRef.current.getContext('2d')
            if (!ctx) return

            animationRef.current = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            // Canvas drawing
            const { width, height } = canvasRef.current
            ctx.clearRect(0, 0, width, height)

            const barWidth = (width / bufferLength) * 2.5
            let barHeight
            let x = 0

            // Check for silence/low activity
            let totalVolume = 0
            for (let i = 0; i < bufferLength; i++) {
                totalVolume += dataArray[i]

                barHeight = (dataArray[i] / 255) * height

                // Color gradient based on volume
                const r = 120 + (dataArray[i] / 2)
                const g = 150 + (dataArray[i] / 4)
                const b = 255

                ctx.fillStyle = `rgb(${r},${g},${b})`
                ctx.fillRect(x, height - barHeight, barWidth, barHeight)

                x += barWidth + 1
            }

            const avgVolume = totalVolume / bufferLength
            if (avgVolume < 10) {
                silenceCountRef.current += 1

                // Trigger hint if silence persists
                if (silenceCountRef.current > 180 && !hint) {
                    const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)]
                    setHint(randomHint)
                }
            } else {
                silenceCountRef.current = 0
                if (hint) setHint(null)
            }
        }

        draw()

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            audioContext.close()
        }
    }, [stream, isRecording, hint])

    if (!isRecording) return null

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* Visualizer Canvas */}
            <div className="relative h-24 w-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full opacity-60"
                    width={400}
                    height={100}
                />

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-indigo-500 p-3 rounded-full text-white shadow-lg shadow-indigo-500/30"
                    >
                        <Mic className="w-6 h-6" />
                    </motion.div>
                </div>
            </div>

            {/* Living Hint */}
            <AnimatePresence>
                {hint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/50 text-sm font-bold shadow-sm"
                    >
                        <Zap className="w-4 h-4" />
                        {hint}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
