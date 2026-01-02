"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Star, Flame, Trophy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PracticeTurn } from "@/lib/practice"
import { getTodayMission, evaluateMission, DailyMission, MissionProgress } from "@/lib/dailyMission"

import { COMPREHENSION_BANK } from "@/lib/comprehensionBank"

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

    // Listening Challenge State
    const [currentClip, setCurrentClip] = useState(
        COMPREHENSION_BANK[Math.floor(Math.random() * COMPREHENSION_BANK.length)]
    )

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
        words: 0
    })
    const [missionComplete, setMissionComplete] = useState(false)

    // Reward State
    const [missionCompleted, setMissionCompleted] = useState(false) // Trigger for overlay
    const [reward, setReward] = useState<string | null>(null)

    // Refs
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const [error, setError] = useState<string | null>(null)

    // Listening Challenge Logic
    const [isListeningRecording, setIsListeningRecording] = useState(false)
    const [listeningFeedback, setListeningFeedback] = useState<string | null>(null)
    const [listeningSuccess, setListeningSuccess] = useState(false)




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
            // Rotate Listening Clip
            setCurrentClip(
                COMPREHENSION_BANK[Math.floor(Math.random() * COMPREHENSION_BANK.length)]
            )

            const res = await fetch("/api/practice/turn")
            if (!res.ok) {
                const err = await res.text()
                throw new Error(`Failed to load turn: ${res.status} ${err}`)
            }
            const data = await res.json()
            setTurn(data)
            setTranscript("")
            setFeedback("")
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
            // 1. STT
            const base64 = await blobToBase64(blob)
            const dgRes = await fetch("/api/deepgram", {
                method: "POST",
                body: JSON.stringify({ audio: base64, mimeType })
            })
            const { transcript, result: dgResult } = await dgRes.json()
            setTranscript(transcript)

            // 2. Evaluate
            const evalRes = await fetch("/api/practice/evaluate", {
                method: "POST",
                body: JSON.stringify({
                    transcript,
                    turn,
                    fluency: {
                        // In real app, extract actual hesitation count using timestamps
                        HESITATION: 0,
                        FILLER_OVERUSE: 0
                    }
                })
            })
            const evaluation = await evalRes.json()

            // 3. Update State & Rewards
            // 3. Update State & Rewards
            // Add supportive listening feedback if relevant
            let finalFeedback = evaluation.feedback || "Good job!"
            if (evaluation.stars >= 4) {
                finalFeedback = `Nice — you caught that. Your listening is getting sharper. ${finalFeedback}`
            } else {
                finalFeedback = `Good try. Let’s listen again — your ear is still tuning. ${finalFeedback}`
            }

            setFeedback(finalFeedback)
            handleRewards(evaluation.stars, evaluation.confidence, transcript)

        } catch (err) {
            console.error("Processing failed", err)
            setFeedback("Something went wrong. Let's try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    // --- Listening Challenge Recording Logic ---
    async function startListeningRecording() {
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
                await processListeningAudio(blob, recorder.mimeType)
                stream.getTracks().forEach(t => t.stop())
            }

            recorder.start()
            setIsListeningRecording(true)
        } catch (err) {
            console.error("Mic access failed", err)
        }
    }

    function stopListeningRecording() {
        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop()
            setIsListeningRecording(false)
            // setIsProcessing(true) // Optional: share processing state or add separate one
        }
    }

    async function processListeningAudio(blob: Blob, mimeType: string) {
        try {
            const base64 = await blobToBase64(blob)

            // 1. STT
            const dgRes = await fetch("/api/deepgram", {
                method: "POST",
                body: JSON.stringify({ audio: base64, mimeType })
            })
            const { transcript } = await dgRes.json()

            // 2. Evaluate using same endpoint but as a "Listening Challenge" turn
            const evalRes = await fetch("/api/practice/evaluate", {
                method: "POST",
                body: JSON.stringify({
                    transcript,
                    turn: {
                        prompt: currentClip.prompt, // Evaluate against the comprehension question
                        type: "listening_challenge",
                        situation: "listening_warmup"
                    },
                    fluency: { HESITATION: 0, FILLER_OVERUSE: 0 }
                })
            })
            const evaluation = await evalRes.json()

            // 3. Handle Result
            if (evaluation.stars > 0 || evaluation.success) {
                setListeningSuccess(true)
                setListeningFeedback("Correct! You understood the clip.")
                handleRewards(1, 0.8, transcript) // Small reward: 1 star
            } else {
                setListeningSuccess(false)
                setListeningFeedback("Not quite. Listen again and try to answer exactly.")
            }

        } catch (err) {
            console.error("Listening Check Failed", err)
            setListeningFeedback("Could not check answer.")
        }
    }

    // Updated handleRewards to accept transcript for word count
    function handleRewards(newStars: number, confidence: number, text: string) {
        // Update Stars
        setStars(newStars)
        updateProgress(newStars) // Update local stats
        if (newStars > 0) setShowStars(true)

        // Update Streak
        if (newStars >= 2) {
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }

        // Update Skill Bar (Flow Meter)
        // Weighted average: 85% history + 15% new confidence
        let newSkill = 50
        setSkill(prev => {
            const score = confidence * 100
            newSkill = Math.min(100, Math.max(0, prev * 0.85 + score * 0.15))
            return newSkill
        })

        // --- UPDATE MISSION PROGRESS ---
        if (mission && !missionComplete) {
            setMissionProgress((prev: MissionProgress) => {
                const next = { ...prev }

                // Accumulate stats
                next.stars += newStars
                next.turns += 1
                next.flow = newSkill // Use current flow level
                next.words += text.trim().split(/\s+/).length // Simple word count
                // next.fillers += ... // (Needs deeper extraction)

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
                        stars={stars}
                        onComplete={() => setShowStars(false)}
                    />
                )}

                {/* Mission Reward Overlay */}
                {missionCompleted && reward && (
                    <RewardOverlay
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
            <main className="flex-1 flex flex-col justify-center">
                <div className="relative w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">

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
                        <div className="min-h-[140px] flex items-center justify-center">
                            {transcript ? (
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
                                        Tap the mic and speak naturally...
                                    </p>
                                    <p className="text-xs text-blue-500/80 font-medium">
                                        This trains your speaking reflex, not your grammar.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-8">
                            {!isProcessing ? (
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

                            {/* Feedback & Next Button */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6 w-full max-w-md mx-auto"
                                    >
                                        <div className={`p-6 rounded-2xl border-l-4 shadow-sm ${stars >= 2
                                            ? "bg-green-50/50 dark:bg-green-900/10 border-green-500 text-green-900 dark:text-green-100"
                                            : "bg-orange-50/50 dark:bg-orange-900/10 border-orange-500 text-orange-900 dark:text-orange-100"
                                            }`}>
                                            <p className="text-lg font-medium leading-relaxed">{feedback}</p>
                                        </div>

                                        <Button size="lg" onClick={fetchNextTurn} className="w-full rounded-xl py-6 text-lg shadow-lg shadow-blue-500/20">
                                            Next Challenge →
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>


            {/* 3️⃣ BOTTOM ZONE: Listening Warm-up (Small) */}
            <footer className="mt-8 flex justify-center pb-20">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400 text-xs shadow-sm">🎧</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                Listening Challenge
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                            First listen, then answer.
                        </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-lg font-medium text-slate-900 dark:text-white leading-snug">
                                {currentClip.title}
                            </p>
                            <p className="text-sm text-slate-500 font-medium">{currentClip.prompt}</p>
                        </div>

                        <audio
                            controls
                            src={currentClip.audioUrl}
                            className="w-full h-10 accent-blue-600"
                        />
                    </div>

                    {/* Interaction - Mic & Feedback */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                        {listeningFeedback ? (
                            <div className="flex-1 flex items-center justify-between">
                                <p className={`text-sm font-medium leading-snug ${listeningSuccess ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                                    {listeningFeedback}
                                </p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                    onClick={() => {
                                        setListeningFeedback(null)
                                        setListeningSuccess(false)
                                    }}
                                >
                                    ↺
                                </Button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={isListeningRecording ? stopListeningRecording : startListeningRecording}
                                    disabled={isProcessing}
                                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListeningRecording
                                            ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                                            : "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500"
                                        }`}
                                >
                                    {isListeningRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                        {isListeningRecording ? "Listening..." : "Tap to Answer"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {isListeningRecording ? "Speak clearly now" : "Tell me what you heard"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </footer>

        </div>
    )
}
