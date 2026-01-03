"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Star, Flame, Trophy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PracticeTurn } from "@/lib/practice"
import { getTodayMission, evaluateMission, DailyMission, MissionProgress } from "@/lib/dailyMission"
import {
    computeFluencyScore,
    extractMetricsFromDeepgram,
    scoreToStars,
    getCoachingPoints,
    FluencyMetrics
} from "@/lib/fluencyScore"
import { pickMicroLesson, getMicroLesson } from "@/lib/microLessonSelector"
import { MicroLesson } from "@/lib/microLessons"
import { getSkillProgress, incrementSkillProgress } from "@/lib/skillProgress"

import { PracticeFeedback } from "./PracticeFeedback"

// --- Helper: Stars Overlay Component ---
function StarsOverlay({ stars, onComplete }: { stars: number, onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2000)
        return () => clearTimeout(timer)
    }, [onComplete])

    if (stars === 0) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                    {Array.from({ length: stars }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 50 }}
                            animate={{ opacity: 1, scale: 1.5, y: -200 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                type: "spring",
                                bounce: 0.6
                            }}
                        >
                            <Star className="w-24 h-24 text-yellow-400 fill-yellow-400 drop-shadow-2xl" />
                        </motion.div>
                    ))}
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-lg font-medium drop-shadow-md bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
                >
                    Stars show how smooth and confident your speaking sounded.
                </motion.p>
            </div>
        </div>
    )
}

// --- Helper: Mission Card Component ---
function MissionCard({ mission, progress, complete }: { mission: DailyMission, progress: MissionProgress, complete: boolean }) {
    // Helper to render progress text based on mission type
    const renderProgress = () => {
        const { goal } = mission;
        if ("stars" in goal) return `${progress.stars}/${goal.stars} Stars`;
        if ("maxFillers" in goal) return `${progress.turns}/${goal.turns} Turns (Safe)`;
        if ("turns" in goal) return `${progress.turns}/${goal.turns} Turns`;
        if ("flow" in goal) return `${Math.round(progress.flow)}%/${goal.flow}% Flow`;
        if ("minWords" in goal) return `${progress.words}/${goal.minWords} Words`;
        if ("cumulativeFluency" in goal) return `${progress.cumulativeFluency.toFixed(1)}/${goal.cumulativeFluency} Fluency`;
        return "";
    }

    // Progress percentage for bar
    const getPercentage = () => {
        const { goal } = mission;
        if ("stars" in goal) return (progress.stars / goal.stars) * 100;
        if ("maxFillers" in goal) return (progress.turns / goal.turns) * 100;
        if ("turns" in goal) return (progress.turns / goal.turns) * 100;
        if ("flow" in goal) return (progress.flow / goal.flow) * 100; // Rough approximation
        if ("minWords" in goal) return (progress.words / goal.minWords) * 100;
        if ("cumulativeFluency" in goal) return (progress.cumulativeFluency / goal.cumulativeFluency) * 100;
        return 0;
    }

    return (
        <div className={`
            relative overflow-hidden rounded-2xl p-4 border transition-all duration-500
            ${complete
                ? "bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }
        `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -right-4 -top-8 w-24 h-24 bg-current rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`
                        p-2 rounded-full 
                        ${complete ? "bg-white/20" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"}
                    `}>
                        {complete ? <CheckCircle className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${complete ? "text-white" : "text-slate-500"}`}>
                            {complete ? "Mission Complete!" : mission.title}
                        </p>
                        <p className={`font-medium ${complete ? "text-white" : "text-foreground"}`}>
                            {mission.description}
                        </p>
                    </div>
                </div>

                <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-bold font-serif">
                        {renderProgress()}
                    </p>
                </div>
            </div>

            {/* Progress Bar (only if not complete) */}
            {!complete && (
                <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, getPercentage())}%` }}
                        className="h-full bg-blue-500 rounded-full"
                    />
                </div>
            )}
        </div>
    )
}

// --- Helper: Mission Rewards Overlay ---
function RewardOverlay({ reward, onClose }: { reward: string, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6"
            >
                <div className="text-6xl animate-bounce">🎉</div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Mission Complete!</h2>
                    <p className="text-muted-foreground">+1 Streak</p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-xl">
                    <p className="text-sm font-bold uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                        Reward Unlocked
                    </p>
                    <p className="text-lg font-medium text-foreground mt-1">{reward}</p>
                </div>

                <Button onClick={onClose} size="lg" className="w-full rounded-full">
                    Continue Practicing
                </Button>
            </motion.div>
        </div>
    )
}



// ... existing imports

export default function PracticePage() {
    // --- State ---
    const [turn, setTurn] = useState<PracticeTurn | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [feedback, setFeedback] = useState("")
    const [microLesson, setMicroLesson] = useState<MicroLesson | null>(null)
    const [skillLevel, setSkillLevel] = useState(1)
    const [textInput, setTextInput] = useState("") // New state for Dictation/Comprehension


    // Gamification State
    const [stars, setStars] = useState(0)
    const [showStars, setShowStars] = useState(false)
    const [streak, setStreak] = useState(0)
    const [skill, setSkill] = useState(50) // Start at middle for "Confidence"

    // Progress Comparison State
    const [lastSessionAvg, setLastSessionAvg] = useState<number | null>(null)
    const [todayAvg, setTodayAvg] = useState<number | null>(null)

    // Mission State
    const [mission, setMission] = useState<DailyMission | null>(null)
    const [missionProgress, setMissionProgress] = useState<MissionProgress>({
        flow: 0,
        stars: 0,
        turns: 0,
        fillers: 0,
        words: 0,
        cumulativeFluency: 0
    })
    const [missionComplete, setMissionComplete] = useState(false)

    // Polish State
    const [lastScore, setLastScore] = useState(0)
    const [currentMetrics, setCurrentMetrics] = useState<FluencyMetrics | null>(null)

    // Session Batching State
    const [sessionRounds, setSessionRounds] = useState<{ score: number; metrics: FluencyMetrics; transcript: string; feedback: string }[]>([])
    const [isSessionFinished, setIsSessionFinished] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Reward State
    const [missionCompleted, setMissionCompleted] = useState(false) // Trigger for overlay
    const [reward, setReward] = useState<string | null>(null)

    // Refs
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const [error, setError] = useState<string | null>(null)





    useEffect(() => {
        fetchNextTurn()
        // Initialize Mission
        const todayMission = getTodayMission()
        setMission(todayMission)
        // Check Local Storage for Progress
        loadProgress()
    }, [])

    function loadProgress() {
        try {
            const todayStr = new Date().toDateString()
            const stored = localStorage.getItem("esl_practice_stats")

            if (stored) {
                const data = JSON.parse(stored)

                // If stored data is from a previous day, it becomes "Last Session"
                if (data.date !== todayStr) {
                    setLastSessionAvg(data.avgStars)
                    setTodayAvg(0)
                    // Reset for today
                    localStorage.setItem("esl_practice_stats", JSON.stringify({
                        date: todayStr,
                        totalStars: 0,
                        count: 0,
                        avgStars: 0,
                        lastSessionAvg: data.avgStars
                    }))
                } else {
                    // It's today
                    setTodayAvg(data.avgStars)
                    setLastSessionAvg(data.lastSessionAvg || null)
                }
            } else {
                // First time ever
                localStorage.setItem("esl_practice_stats", JSON.stringify({
                    date: todayStr,
                    totalStars: 0,
                    count: 0,
                    avgStars: 0,
                    lastSessionAvg: null
                }))
            }
        } catch (e) { console.error("LS Error", e) }
    }

    function updateProgress(newStars: number) {
        try {
            const todayStr = new Date().toDateString()
            const stored = localStorage.getItem("esl_practice_stats")
            let data = stored ? JSON.parse(stored) : { date: todayStr, totalStars: 0, count: 0, avgStars: 0, lastSessionAvg: null }

            // Safety check if date mismatch happened mid-session (unlikely but possible)
            if (data.date !== todayStr) {
                data.lastSessionAvg = data.avgStars
                data.date = todayStr
                data.totalStars = 0
                data.count = 0
            }

            data.totalStars += newStars
            data.count += 1
            data.avgStars = parseFloat((data.totalStars / data.count).toFixed(1))

            localStorage.setItem("esl_practice_stats", JSON.stringify(data))
            setTodayAvg(data.avgStars)
        } catch (e) { console.error("LS Update Error", e) }
    }

    async function fetchNextTurn() {
        try {
            setError(null)
            // Rotate Listening Clip - REMOVED (Legacy)

            // Get recent fluency score for adaptive difficulty
            let avgFluencyScore = 0.5
            try {
                const history = JSON.parse(localStorage.getItem('fluency_history') || '[]')
                if (history.length > 0) {
                    const recentScores = history.slice(-5).map((h: any) => h.fluencyScore || 0.5)
                    avgFluencyScore = recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length
                }
            } catch (e) {
                // Fallback to default
            }

            const res = await fetch(`/api/practice/turn?fluencyScore=${avgFluencyScore.toFixed(2)}`)
            if (!res.ok) {
                const err = await res.text()
                throw new Error(`Failed to load turn: ${res.status} ${err}`)
            }
            const data = await res.json()
            setTurn(data)
            setTranscript("")
            setTextInput("") // Reset text input
            setTurn(data)
            setTranscript("")
            setTextInput("") // Reset text input
            setFeedback("")
            setCurrentMetrics(null) // Reset metrics
            setMicroLesson(null)
            // Don't reset gamification state! (stars, streak, skill persist)
        } catch (err) {
            console.error("Fetch Next Turn Error:", err)
            setError("Could not load a practice challenge. Please ensure you are logged in.")
        }
    }

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
                await processAudio(blob, recorder.mimeType)
                stream.getTracks().forEach(t => t.stop())
            }

            recorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Mic access failed", err)
        }
    }

    function stopRecording() {
        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop()
            setIsRecording(false)
            setIsProcessing(true)
        }
    }

    async function processAudio(blob: Blob, mimeType: string) {
        try {
            // 1. STT via Deepgram
            const base64 = await blobToBase64(blob)
            const dgRes = await fetch("/api/deepgram", {
                method: "POST",
                body: JSON.stringify({ audio: base64, mimeType })
            })
            const { transcript, result: dgResult } = await dgRes.json()
            setTranscript(transcript)

            // 2. Extract Real Fluency Metrics from Deepgram
            // Estimate audio duration from Deepgram words
            const words = dgResult?.results?.channels?.[0]?.alternatives?.[0]?.words || []
            const audioDuration = words.length > 0
                ? words[words.length - 1]?.end || 10
                : 10

            const metrics = extractMetricsFromDeepgram(dgResult, audioDuration)
            const fluencyScore = computeFluencyScore(metrics)
            const stars = scoreToStars(fluencyScore)

            // 3. Get Honest Coaching Points
            const coachingPoints = getCoachingPoints(metrics)

            // 4. Build Feedback Based on Actual Performance
            let finalFeedback = ''

            if (fluencyScore >= 0.75) {
                finalFeedback = 'Excellent flow! You sound confident.'
            } else if (fluencyScore >= 0.55) {
                finalFeedback = coachingPoints[0] || 'Good effort. You are developing a steady rhythm.'
            } else {
                finalFeedback = coachingPoints[0] || 'Your pauses are holding you back. Try starting faster.'
            }

            // Add specific metric callouts (Softer if score is high)
            if (metrics.fillerRate > 0.08) {
                finalFeedback += fluencyScore > 0.75 ? ' Try to reduce those few fillers.' : ' Your filler words are lowering your fluency.'
            }
            if (metrics.pauseRatio > 0.15) {
                finalFeedback += fluencyScore > 0.75 ? ' Watch out for small pauses.' : ' Your pauses are breaking your flow.'
            }

            // Picks targeted micro-lesson if metrics show specific weakness
            const lessonType = pickMicroLesson(metrics)
            const lesson = getMicroLesson(lessonType)
            setMicroLesson(lesson)

            if (lesson) {
                const progress = getSkillProgress(lesson.path)
                setSkillLevel(progress.currentLevel)
            }

            setFeedback(finalFeedback)
            setLastScore(fluencyScore)
            setCurrentMetrics(metrics)

            // Add to session rounds
            const newRound = { score: fluencyScore, metrics, transcript, feedback: finalFeedback }
            setSessionRounds(prev => [...prev, newRound])

            handleRewards(stars, fluencyScore, transcript, metrics)

        } catch (err) {
            console.error("Processing failed", err)
            setFeedback("Something went wrong. Let's try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    // --- SAVE SESSION LOGIC ---
    useEffect(() => {
        if (isSessionFinished && !isSaving && sessionRounds.length > 0) {
            const saveSession = async () => {
                setIsSaving(true)
                try {
                    const avgScore = sessionRounds.reduce((acc, r) => acc + r.score, 0) / sessionRounds.length

                    await fetch('/api/practice/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            rounds: sessionRounds,
                            averageScore: avgScore
                        })
                    })
                } catch (e) {
                    console.error("Failed to save session", e)
                }
            }
            saveSession()
        }
    }, [isSessionFinished, isSaving, sessionRounds])

    // --- RENDER: SESSION SUMMARY ---
    if (isSessionFinished) {
        const avgScore = sessionRounds.reduce((acc, r) => acc + r.score, 0) / sessionRounds.length
        const avgWpm = Math.round(sessionRounds.reduce((acc, r) => acc + (r.metrics.wpm || 0), 0) / sessionRounds.length)
        const avgPauses = Math.round((sessionRounds.reduce((acc, r) => acc + r.metrics.pauseRatio, 0) / sessionRounds.length) * 100)

        return (
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col pt-20 px-4 md:px-8 max-w-7xl mx-auto font-sans">
                <main className="flex-1 flex flex-col justify-center items-center">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 text-center border border-slate-100 dark:border-slate-800 space-y-8 animate-in zoom-in-95 duration-500">

                        <div className="space-y-2">
                            <div className="inline-block p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Session Complete</h1>
                            <p className="text-slate-600 dark:text-slate-400">Great work! Here is your average performance.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 py-8 border-y border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Fluency</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(avgScore * 100)}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Pace</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{avgWpm} <span className="text-sm text-slate-400 font-normal">wpm</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Pauses</p>
                                <p className={`text-3xl font-bold ${avgPauses < 15 ? 'text-green-500' : 'text-orange-500'}`}>{avgPauses}%</p>
                            </div>
                        </div>

                        <Link href="/dashboard" prefetch={false}>
                            <Button size="lg" className="w-full py-6 text-lg rounded-xl shadow-lg shadow-blue-500/20">
                                Return to Dashboard
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    // --- Text Submission Logic (for Comprehension) ---
    async function handleSubmitText() {
        if (!textInput.trim() || !turn) return
        setIsProcessing(true)
        try {
            // Evaluate text response (Grammar/Relevance)
            const res = await fetch("/api/practice/evaluate", {
                method: "POST",
                body: JSON.stringify({
                    transcript: textInput,
                    turn,
                    fluency: { HESITATION: 0, FILLER_OVERUSE: 0 }
                })
            })
            const data = await res.json()
            setFeedback(data.feedback)
            // Reward for writing (Treat as max fluency for scoring purposes to unify reward logic, or map differently)
            // Since it's writing, we give stars based on AI evaluation
            const stars = data.stars || 1 // Fallback
            handleRewards(stars, 0.8, textInput)
        } catch (e) {
            console.error("Evaluation failed", e)
            setFeedback("Could not check answer.")
        } finally {
            setIsProcessing(false)
        }
    }


    // Updated handleRewards using fluency score for data-driven rewards
    function handleRewards(newStars: number, fluencyScore: number, text: string, metrics?: FluencyMetrics) {
        // Update Stars (now based on real fluency score)
        setStars(newStars)
        updateProgress(newStars) // Update local stats
        if (newStars > 0) setShowStars(true)

        // Update Streak - Only increases when performance is good (stars >= 2)
        // Resets on poor performance (stars = 1) to make streaks meaningful
        if (newStars >= 2) {
            setStreak(s => s + 1)
        } else {
            setStreak(0) // Streak resets on low fluency
        }

        // Update Skill Bar (Flow Meter) using actual fluency score
        let newSkill = 50
        setSkill(prev => {
            const score = fluencyScore * 100
            newSkill = Math.min(100, Math.max(0, prev * 0.85 + score * 0.15))
            return newSkill
        })

        // Save fluency data to localStorage for dashboard
        try {
            const fluencyData = {
                timestamp: Date.now(),
                fluencyScore,
                stars: newStars,
                metrics: metrics || null
            }
            const history = JSON.parse(localStorage.getItem('fluency_history') || '[]')
            history.push(fluencyData)
            // Keep last 50 entries
            if (history.length > 50) history.shift()
            localStorage.setItem('fluency_history', JSON.stringify(history))
        } catch (e) {
            console.error('Failed to save fluency history', e)
        }

        // --- UPDATE MISSION PROGRESS ---
        if (mission && !missionComplete) {
            setMissionProgress((prev: MissionProgress) => {
                const next = { ...prev }

                // Accumulate stats based on real fluency data
                next.stars += newStars
                next.turns += 1
                next.flow = newSkill // Use current flow level
                next.words += text.trim().split(/\s+/).length

                // Add cumulative fluency progress for new mission type
                next.cumulativeFluency += fluencyScore

                // Track filler count from metrics
                if (metrics) {
                    const wordCount = text.trim().split(/\s+/).length
                    next.fillers += Math.round(metrics.fillerRate * wordCount)
                }

                // Check Completion
                if (evaluateMission(mission, next) && !missionCompleted) {
                    setMissionComplete(true)
                    setMissionCompleted(true) // Trigger Validation Overlay
                    setReward("Confidence Boost")
                    setStreak(s => s + 1)
                }

                return next
            })
        }
    }

    function blobToBase64(blob: Blob): Promise<string> {
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result?.toString().split(",")[1] || "")
            reader.readAsDataURL(blob)
        })
    }

    if (error) return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-500 font-medium">{error}</p>
            <Button onClick={fetchNextTurn}>Try Again</Button>
        </div>
    )

    if (!turn) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin text-4xl text-blue-500">⏳</div>
        </div>
    )

    return (
        <div className="min-h-screen py-6 px-4 space-y-8 max-w-5xl mx-auto flex flex-col">

            {/* --- Rewards Overlays --- */}
            <AnimatePresence>
                {/* Stars Overlay */}
                {showStars && (
                    <StarsOverlay
                        key="stars-overlay"
                        stars={stars}
                        onComplete={() => setShowStars(false)}
                    />
                )}

                {/* Mission Reward Overlay */}
                {missionCompleted && reward && (
                    <RewardOverlay
                        key="reward-overlay"
                        reward={reward}
                        onClose={() => setMissionCompleted(false)}
                    />
                )}
            </AnimatePresence>

            {/* 1️⃣ TOP ZONE: Progress & Stats (Compact) */}
            <header className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">

                {/* Left: Yesterday vs Today */}
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="text-slate-500">
                        <span className="opacity-60 mr-1.5">Yesterday</span>
                        {lastSessionAvg ? `⭐ ${lastSessionAvg}` : "-"}
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                    <div className="text-blue-600 dark:text-blue-400">
                        <span className="opacity-60 mr-1.5">Today</span>
                        ⭐ {todayAvg || "0.0"}
                    </div>
                </div>

                {/* Center: Mission Status (if active) */}
                {mission && (
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{mission.title}</span>
                        {missionComplete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(missionProgress.turns / (('turns' in mission.goal) ? mission.goal.turns : 5)) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Right: Flow & Streak */}
                <div className="flex items-center gap-6">
                    {/* Skill Bar */}
                    <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Flow</span>
                            <span>{skill.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill}%` }}
                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-full font-bold border border-orange-100 dark:border-orange-500/20 text-xs">
                        <Flame className={`${streak > 0 ? "animate-pulse" : ""} w-4 h-4`} />
                        <span>{streak}</span>
                    </div>
                </div>
            </header>


            {/* 2️⃣ MIDDLE ZONE: Primary Speaking Loop (BIG) */}
            <main className="flex-1 flex flex-col justify-center relative">
                <AnimatePresence mode="wait">
                    {!feedback ? (
                        <motion.div
                            key="challenge-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden"
                        >

                            {/* Card Header & Mode Label */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
                            <div className="mt-6 text-center">
                                <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                                    🗣️ Speaking Drill
                                </span>
                            </div>

                            <div className="p-8 md:p-12 space-y-10 text-center">

                                {/* Prompt */}
                                <div className="space-y-4">
                                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                                        {turn.prompt}
                                    </h1>
                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                                        {turn.situation} • {turn.type.replace("_", " ")}
                                    </p>
                                </div>

                                {/* Interaction Area */}
                                <div className="min-h-[140px] flex items-center justify-center w-full">
                                    {turn.type === 'LISTEN_TYPE' ? (
                                        <div className="w-full max-w-lg space-y-6">
                                            {turn.audioUrl && (
                                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                                    <audio src={turn.audioUrl} controls className="w-full" />
                                                </div>
                                            )}
                                            <textarea
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Type exactly what you hear..."
                                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                                            />
                                        </div>
                                    ) : (
                                        transcript ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-2xl text-slate-700 dark:text-slate-300 font-light leading-relaxed"
                                            >
                                                “{transcript}”
                                            </motion.p>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-xl text-slate-400 font-light">
                                                    {turn.type === 'COMPLETE_SENTENCE' ? "Tap to record your completion..." : "Tap the mic and speak naturally..."}
                                                </p>
                                                {turn.type !== 'COMPLETE_SENTENCE' && (
                                                    <p className="text-xs text-blue-500/80 font-medium">
                                                        This trains your speaking reflex, not your grammar.
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-8">
                                    {turn.type === 'LISTEN_TYPE' ? (
                                        <Button
                                            onClick={handleSubmitText}
                                            disabled={!textInput.trim() || isProcessing}
                                            size="lg"
                                            className="rounded-full px-8 py-6 text-lg w-full max-w-xs"
                                        >
                                            {isProcessing ? "Checking..." : "Submit Answer"}
                                        </Button>
                                    ) : !isProcessing ? (
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-2xl ${isRecording
                                                ? "bg-red-500 scale-110 shadow-red-500/40"
                                                : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-105 shadow-blue-500/30"
                                                }`}
                                        >
                                            {isRecording && (
                                                <span className="absolute inset-0 rounded-full border-[6px] border-red-500/30 animate-ping" />
                                            )}
                                            {isRecording ? (
                                                <Square className="w-10 h-10 text-white fill-current" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-white" />
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 text-blue-600 font-bold animate-pulse text-lg">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            Analyzing Flow...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <PracticeFeedback
                            key="feedback-card"
                            score={lastScore}
                            feedback={feedback}
                            metrics={currentMetrics || { speechSpeed: 0, pauseRatio: 0, fillerRate: 0, restartRate: 0, silenceRatio: 0, wordCount: 0, wpm: 0 }}
                            microLesson={microLesson}
                            hideMetrics={turn?.type === 'LISTEN_TYPE'}
                            onNext={() => {
                                if (sessionRounds.length >= 5) {
                                    setIsSessionFinished(true)
                                } else {
                                    fetchNextTurn()
                                }
                            }}
                            onDrill={() => {
                                if (microLesson) {
                                    incrementSkillProgress(microLesson.path)
                                    // Don't count drills towards the 5-question limit, or do? Let's say yes for flow.
                                    if (sessionRounds.length >= 5) {
                                        setIsSessionFinished(true)
                                    } else {
                                        fetchNextTurn()
                                    }
                                }
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>

        </div>
    )
}
