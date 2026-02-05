"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, ArrowRight, CheckCircle, BarChart3, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import {
    extractMetricsFromDeepgram,
    computeEnglivoScoreWithCefr,
    FluencyMetrics
} from "@/lib/fluencyScore"
import { EnglivoScore } from "@/types/englivoTypes"
import { pickMicroLesson, getMicroLesson } from "@/lib/microLessonSelector"
import { MicroLesson } from "@/lib/microLessons"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { PremiumMetricBar } from '@/components/PremiumMetricBar'
import { getDiagnosis, getReasoning, getProgressPrediction } from "@/lib/fluencyInterpretation"

// --- Helper: Blob to Base64 ---
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            const base64 = result.split(",")[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// --- Steps ---
type Step =
    | "INTRO"
    | "RECORD_BASELINE"
    | "ANALYZING"
    | "REVEAL"
    | "DRILL_INTRO"
    | "RECORD_DRILL"
    | "COMPARISON"

const BASELINE_PROMPT = "Talk for 30 seconds about your day. What have you done so far?"
const DRILL_TOPIC = "What is your favorite meal and why? Describe it."

export default function FluencyCheckPage() {
    // State
    const [step, setStep] = useState<Step>("INTRO")
    const [isRecording, setIsRecording] = useState(false)
    const [elapsed, setElapsed] = useState(0)

    // Data
    const [baselineData, setBaselineData] = useState<EnglivoScore | null>(null)
    const [drillData, setDrillData] = useState<EnglivoScore | null>(null)
    const [weakness, setWeakness] = useState<MicroLesson | null>(null)

    // Refs
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // --- Recording Logic ---
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            mediaRecorder.current = recorder
            chunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                await processAudio(blob)
            }

            recorder.start()
            setIsRecording(true)
            setElapsed(0)

            timerRef.current = setInterval(() => {
                setElapsed(prev => {
                    if (prev >= 30) {
                        stopRecording()
                        return prev
                    }
                    return prev + 1
                })
            }, 1000)

        } catch (err) {
            console.error("Mic access denied", err)
            // Handle error (e.g. show permission alert)
        }
    }

    function stopRecording() {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
            if (step === "RECORD_BASELINE") setStep("ANALYZING")
            // if step === RECORD_DRILL, wait for processing to switch to COMPARISON
        }
    }

    // --- Processing Logic ---
    async function processAudio(blob: Blob) {
        try {
            const base64 = await blobToBase64(blob)
            const mimeType = "audio/webm"

            const dgRes = await fetch("/api/deepgram", {
                method: "POST",
                body: JSON.stringify({ audio: base64, mimeType })
            })

            if (!dgRes.ok) throw new Error("Transcription failed")

            const { result: dgResult } = await dgRes.json()

            // Calculate duration from blob size roughly or use existing logic
            // Using Deepgram timestamps as in PracticePage
            const words = dgResult?.results?.channels?.[0]?.alternatives?.[0]?.words || []
            const duration = words.length > 0 ? words[words.length - 1]?.end || 10 : 10

            const metrics = extractMetricsFromDeepgram(dgResult, duration)
            const scoreData = computeEnglivoScoreWithCefr(metrics)

            if (step === "RECORD_BASELINE" || step === "ANALYZING") {
                setBaselineData(scoreData)

                // Identify Weakness
                const lessonType = pickMicroLesson(metrics)
                let lesson = getMicroLesson(lessonType)

                // Fallback if no specific weakness found (Good speaker)
                if (!lesson) {
                    lesson = getMicroLesson("START_FASTER")! // Default to flow optimization
                }
                setWeakness(lesson)

                // SAVE DIAGNOSIS TO MEMORY (The Loop)
                const diagnosis = getDiagnosis(scoreData)
                fetch('/api/user/coach-memory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        focusSkill: lesson.title,
                        lastWeakness: lesson.description, // e.g. "Long pauses before speaking"
                        lastSessionSummary: `Baseline Check: ${scoreData.cefr?.level}. ${diagnosis}`,
                        baseline: {
                            cefr: scoreData.cefr?.level,
                            score: scoreData.englivoScore
                        }
                    })
                }).catch(err => console.error("Failed to save memory:", err))

                // Fake analysis time for effect
                setTimeout(() => setStep("REVEAL"), 2000)
            } else if (step === "RECORD_DRILL") {
                setDrillData(scoreData)
                setStep("COMPARISON")
            }

        } catch (err) {
            console.error("Processing failed", err)
            // Error handling
            if (step === "ANALYZING") setStep("RECORD_BASELINE") // Retry
        }
    }

    // --- Renders ---

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-3xl rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-3xl rounded-full" />
            </div>
            <div className="w-full max-w-lg mx-auto text-center space-y-8">

                {/* PROGRESS BAR (Optional) */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: "0%" }}
                        animate={{ width: step === "INTRO" ? "10%" : step === "COMPARISON" ? "100%" : "50%" }}
                    />
                </div>

                <AnimatePresence mode="wait">

                    {/* STEP 1: INTRO */}
                    {step === "INTRO" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                                Let’s hear how <br /> you speak.
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">
                                This is not a test. It’s a snapshot of your natural speaking pattern.
                            </p>
                            <div className="pt-8">
                                <Button size="lg" onClick={() => setStep("RECORD_BASELINE")} className="rounded-full px-8 py-6 text-lg">
                                    Start Baseline Check
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: RECORD BASELINE */}
                    {step === "RECORD_BASELINE" && (
                        <motion.div
                            key="baseline"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-8"
                        >
                            <div className="text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <p className="text-sm font-bold uppercase text-slate-400 mb-2">Prompt</p>
                                <p className="text-xl font-medium text-slate-900 dark:text-white">"{BASELINE_PROMPT}"</p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                                        } shadow-xl`}
                                >
                                    {isRecording ? <Square className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}

                                    {isRecording && (
                                        <div className="absolute inset-0 rounded-full animate-ping bg-red-500/50 -z-10" />
                                    )}
                                </button>
                                <p className="text-slate-400 font-mono text-lg font-medium">{elapsed}s / 30s</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: ANALYZING */}
                    {step === "ANALYZING" && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Analyzing your cadence...</p>
                        </motion.div>
                    )}

                    {/* STEP 4: REVEAL */}
                    {step === "REVEAL" && baselineData && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8 w-full max-w-2xl"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                                    Your Speaking Style
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Here is what the data says about your pattern.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* METRICS COLUMN */}
                                <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Real-time Signals</h3>
                                    <PremiumMetricBar
                                        item={{
                                            id: 'pauses', label: 'Pauses',
                                            before: baselineData.raw.pauseRatio * 100,
                                            after: baselineData.raw.pauseRatio * 100,
                                            unit: '%', trend: 'down'
                                        }}
                                        forceState="after"
                                        showDelta={false}
                                    />
                                    <PremiumMetricBar
                                        item={{
                                            id: 'fillers', label: 'Fillers',
                                            before: baselineData.raw.fillerRate * 100,
                                            after: baselineData.raw.fillerRate * 100,
                                            unit: '%', trend: 'down'
                                        }}
                                        forceState="after"
                                        showDelta={false}
                                    />
                                    <PremiumMetricBar
                                        item={{
                                            id: 'fluency', label: 'Flow Score',
                                            before: baselineData.englivoScore,
                                            after: baselineData.englivoScore,
                                            unit: '', trend: 'up'
                                        }}
                                        forceState="after"
                                        showDelta={false}
                                    />
                                </div>

                                {/* RADAR COLUMN */}
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">English Profile</h3>

                                    {/* A) DIAGNOSIS */}
                                    <div className="mb-4 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20">
                                        <p className="text-sm text-orange-800 dark:text-orange-200 font-medium leading-snug">
                                            {getDiagnosis(baselineData)}
                                        </p>
                                    </div>

                                    <div className="h-[200px] w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                { subject: 'Flow', A: baselineData.dimensions.flow, fullMark: 100 },
                                                { subject: 'Confidence', A: baselineData.dimensions.confidence, fullMark: 100 },
                                                { subject: 'Clarity', A: baselineData.dimensions.clarity, fullMark: 100 },
                                                { subject: 'Speed', A: baselineData.dimensions.speed, fullMark: 100 },
                                                { subject: 'Stability', A: baselineData.dimensions.stability, fullMark: 100 },
                                            ]}>
                                                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} />
                                                <Radar
                                                    name="Level"
                                                    dataKey="A"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    fill="#3b82f6"
                                                    fillOpacity={0.2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="text-center space-y-3 mt-2 w-full">
                                        <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                                            CEFR Level: <span className="text-blue-600 dark:text-blue-400 text-sm ml-1">{baselineData.cefr?.level || 'A2'}</span>
                                        </div>

                                        {/* B) REASONING */}
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            {getReasoning(baselineData)}
                                        </p>

                                        {/* C) PROGRESS PREDICTION */}
                                        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                            <p className="text-xs text-slate-400">
                                                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                                                {getProgressPrediction(baselineData)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-center">
                                <p className="text-blue-800 dark:text-blue-200 italic font-medium">
                                    "This is not about English. It's about your speaking reflex."
                                </p>
                            </div>

                            <Button size="lg" onClick={() => setStep("DRILL_INTRO")} className="w-full rounded-xl py-6 text-lg">
                                Fix My Priority Block <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 5: DRILL INTRO */}
                    {step === "DRILL_INTRO" && weakness && (
                        <motion.div
                            key="drill_intro"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-8 text-center"
                        >
                            <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mb-4">
                                <Sparkles className="w-8 h-8" />
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Let's fix just this: <br />
                                <span className="text-blue-600 dark:text-blue-400">{weakness.title}</span>
                            </h2>

                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                                "{weakness.description}"
                            </p>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-sm font-bold uppercase text-slate-400 mb-2">The Drill</p>
                                <p className="text-xl font-medium italic text-slate-800 dark:text-slate-200">
                                    "{weakness.drill}"
                                    <br />
                                    <span className="text-base font-normal not-italic text-slate-500 mt-2 block">
                                        Answer: "{DRILL_TOPIC}"
                                    </span>
                                </p>
                            </div>

                            <Button size="lg" onClick={() => {
                                setStep("RECORD_DRILL")
                                setElapsed(0)
                                setIsRecording(false) // Ready to record
                            }} className="w-full rounded-xl py-6 text-lg">
                                I'm Ready
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 6: RECORD DRILL */}
                    {step === "RECORD_DRILL" && (
                        <motion.div
                            key="record_drill"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <p className="text-sm font-bold uppercase text-slate-400 mb-2">Prompt</p>
                                <p className="text-xl font-medium text-slate-900 dark:text-white">"{DRILL_TOPIC}"</p>
                                <hr className="my-4 border-slate-200 dark:border-slate-700" />
                                <p className="text-sm font-bold uppercase text-blue-500 mb-1">Constraint</p>
                                <p className="text-lg font-medium text-blue-600 dark:text-blue-400 italic">"{weakness?.drill}"</p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                                        } shadow-xl`}
                                >
                                    {isRecording ? <Square className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}

                                    {isRecording && (
                                        <div className="absolute inset-0 rounded-full animate-ping bg-red-500/50 -z-10" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 7: COMPARISON */}
                    {step === "COMPARISON" && baselineData && drillData && weakness && (
                        <motion.div
                            key="comparison"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 text-center"
                        >
                            <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-2">
                                <TrendingUp className="w-10 h-10" />
                            </div>

                            <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                                You just changed your pattern.
                            </h2>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
                                <div className="bg-white dark:bg-slate-900 p-4">
                                    <div className="text-sm text-slate-500 mb-1">Before</div>
                                    <div className="text-3xl font-bold text-slate-400">
                                        {/* Show meaningful metric based on weakness */}
                                        {weakness.type === 'START_FASTER' || weakness.type === 'STOP_RESTARTING'
                                            ? `${Math.round(baselineData.raw.pauseRatio * 100)}%`
                                            : `${Math.round(baselineData.raw.fillerRate * 100)}%`
                                        }
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {weakness.type === 'START_FASTER' ? 'Pauses' : 'Fillers'}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 animate-pulse" />
                                    <div className="relative text-sm text-green-600 font-bold mb-1">NOW</div>
                                    <div className="relative text-3xl font-bold text-green-600 dark:text-green-400">
                                        {weakness.type === 'START_FASTER' || weakness.type === 'STOP_RESTARTING'
                                            ? `${Math.round(drillData.raw.pauseRatio * 100)}%`
                                            : `${Math.round(drillData.raw.fillerRate * 100)}%`
                                        }
                                    </div>
                                    <div className="relative text-xs text-green-600/80 mt-1">
                                        Improved!
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="text-lg text-slate-600 dark:text-slate-300">
                                    This is how fluency is built.<br />
                                    <strong>One pattern at a time.</strong>
                                </p>

                                <Button size="lg" asChild className="w-full rounded-xl py-6 text-lg shadow-xl shadow-blue-600/20">
                                    <Link href="/practice">
                                        Start Daily Training <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
