"use client"

import { useEffect, useRef, useState } from "react"
import { LiveKitRoom } from "@livekit/components-react"
import AIAvatar from "@/components/AIAvatar"
import { HomeNavbar } from "@/components/HomeNavbar"
import { VoiceVisualizer } from "@/components/VoiceVisualizer"
import { FluencyReportModal } from "@/components/FluencyReportModal"
import { ErrorCorrectionDisplay } from "@/components/ErrorCorrectionDisplay"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Mic, MicOff, Square, Play } from "lucide-react"

type ChatMessage = {
    role: "user" | "assistant"
    content: string
    timestamp: Date
    corrections?: Array<{
        original: string
        corrected: string
        type: "grammar" | "vocabulary" | "fluency"
    }>
}

export default function AITutor() {
    const { user } = useUser()
    const firstName = user?.firstName || "Student"

    const [token, setToken] = useState<string | null>(null)
    const [transcript, setTranscript] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [listening, setListening] = useState(false)
    const [speaking, setSpeaking] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [started, setStarted] = useState(false)
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
    const [chats, setChats] = useState<ChatMessage[]>([])
    const chatsRef = useRef<ChatMessage[]>([])

    // Keep ref in sync with state for event listeners
    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    // Request Locking to prevent double-speak
    const requestCounter = useRef(0)

    // Report State
    const [showReport, setShowReport] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportData, setReportData] = useState<any>(null)

    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const voiceDetectRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)

    const router = useRouter()
    // Use searchParams for mode detection
    // Note: In Next.js client components, we use useSearchParams()
    // but here we can just parse window.location or similar if useSearchParams is not available directly on this version,
    // assuming standard Next.js 13/14 app router, useSearchParams is best.
    // For now, let's assume we can grab it from window as a fallback or add useSearchParams import.

    // Quick Fix: Since we need `useSearchParams`, let's add it.
    // However, I can't easily add the import at the top without replacing the whole file header.
    // I already see `useRouter` from `next/navigation`. `useSearchParams` is in the same package.

    // Let's rely on a simpler prop or state if possible, but reading URL is essential for the link from dashboard.
    // I will use a utility to parse it safely inside useEffect to avoid import hassle if restricted,
    // actually, I'll just add the import in a subsequent edit if needed, but wait:
    // I can parse window.location in useEffect.

    const [mode, setMode] = useState<'practice' | 'challenge'>('practice')
    const [targetLevel, setTargetLevel] = useState<string>('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const m = params.get('mode')
            const t = params.get('targetLevel')
            if (m === 'challenge') setMode('challenge')
            if (t) setTargetLevel(t)
        }
    }, [])

    // Fetch LiveKit token
    useEffect(() => {
        fetch("/api/livekit/token?mode=ai", { credentials: "include" })
            .then(res => res.json())
            .then(data => setToken(data.token))
            .catch(console.error)
    }, [])

    // Start microphone recording loop only after session starts
    useEffect(() => {
        if (!token || !started) return
        startRecording()

        return () => {
            // Cleanup on unmount or session end
            if (voiceDetectRef.current) cancelAnimationFrame(voiceDetectRef.current)
            if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                mediaRecorder.current.stop()
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [token, started])

    const startSession = async () => {
        setStarted(true)
        startTimeRef.current = Date.now()
        // Small delay to ensure UI transition completes and audio context is ready
        setTimeout(async () => {
            if (mode === 'challenge') {
                await speak(`Welcome to the ${targetLevel} Trial. I am your examiner. To pass, you must demonstrate ${targetLevel} proficiency. Let's begin.`)
            } else {
                await speak("Hi, I am your English tutor. Tell me how your day is going.")
            }
        }, 500)
    }

    const endSession = async () => {
        // Stop Everything
        if (voiceDetectRef.current) cancelAnimationFrame(voiceDetectRef.current)
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") mediaRecorder.current.stop()
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        setListening(false)
        setSpeaking(false)

        setShowReport(true)
        setReportLoading(true)

        try {
            // 1. Generate Report
            // Force wait for 1 second to ensure state settles
            await new Promise(r => setTimeout(r, 1000))

            const fullTranscript = chats.map(c => `${c.role.toUpperCase()}: ${c.content}`).join("\n")

            console.log("Generating report for transcript length:", fullTranscript.length)

            const reportRes = await fetch("/api/ai-tutor/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript: fullTranscript })
            })

            if (!reportRes.ok) {
                const errText = await reportRes.text()
                throw new Error(`Report API 500: ${errText}`)
            }

            const report = await reportRes.json()
            setReportData(report)

            // 2. Save Session
            const durationSeconds = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
            await fetch("/api/ai-tutor/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: chats,
                    duration: durationSeconds,
                    report: report
                })
            })
        } catch (e) {
            console.error("Report Generation Failed:", e)
            // Fallback so user isn't stuck
            setReportData({
                identity: { archetype: "Analysis Failed", description: "We couldn't generate the full report due to a connection error." },
                insights: { fluency: "N/A", grammar: "N/A", vocabulary: "N/A" },
                patterns: ["Please try again later."],
                refinements: [],
                next_step: "Practice more to generate data."
            })
        } finally {
            setReportLoading(false)
        }
    }

    const handleReportClose = () => {
        setShowReport(false)

        let redirectUrl = '/' // Default to home/dashboard

        // Check for Challenge Success
        if (mode === 'challenge' && reportData?.cefr_analysis?.level) {
            // Logic: If the assigned level matches or exceeds the target level
            // For simplicity, if they got ANY valid CEFR level back from the Strict Examiner, it's a verify.
            // But let's be precise: did they hit the target?
            if (reportData.cefr_analysis.level === targetLevel) {
                redirectUrl = '/dashboard?celebrate=true'
            }
        }

        router.push(redirectUrl)
    }

    const speak = async (text: string) => {
        try {
            // Barge-in: Stop current audio if any
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }

            setProcessing(true)

            // Add to chat history
            setChats(prev => [...prev, { role: "assistant", content: text, timestamp: new Date() }])

            const tts = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            }).then(r => r.json())
            setProcessing(false)

            if (tts.audio) {
                const audio = new Audio("data:audio/mp3;base64," + tts.audio)
                audioRef.current = audio
                setSpeaking(true)
                audio.onended = () => setSpeaking(false)

                // Robust play handling
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name === "AbortError") {
                            console.log("Audio playback interrupted (barge-in)");
                        } else {
                            console.error("Audio playback error:", error);
                        }
                        setSpeaking(false)
                    });
                }
            }
        } catch (err) {
            console.error("Speaking failed:", err)
            setProcessing(false)
            setSpeaking(false)
        }
    }

    const startRecording = async () => {
        try {
            // 1. Enable Echo Cancellation to prevent AI hearing itself
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })
            streamRef.current = stream

            const audioContext = new AudioContext()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            setAnalyserNode(analyser)

            const data = new Uint8Array(analyser.fftSize)

            const recorder = new MediaRecorder(stream)
            mediaRecorder.current = recorder

            recorder.ondataavailable = async (e) => {
                const blob = e.data
                if (blob.size < 100) return
                if (!started) return

                const base64 = await blobToBase64(blob)

                console.log("Processing audio chunk...")
                // Increment request ID to invalidate previous pending requests
                const currentRequestId = ++requestCounter.current

                // Set processing TRUE immediately to lock UI
                setProcessing(true)

                const dg = await fetch("/api/deepgram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        audio: base64,
                        mimeType: recorder.mimeType
                    })
                }).then(r => r.json())

                console.log("Deepgram Transcript:", dg.transcript)

                // If a newer request started while we were processing speech-to-text, abort this one
                if (requestCounter.current !== currentRequestId) {
                    console.log("Request obsolete (barge-in detected during STT). Ignoring.")
                    return
                }

                if (dg.transcript && dg.transcript.trim().length > 1) {
                    setTranscript(dg.transcript)
                    setChats(prev => [...prev, { role: "user", content: dg.transcript, timestamp: new Date() }])

                    try {
                        // 1) Analyze fluency (Parallel)
                        const fluencyPromise = fetch("/api/fluency/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                transcript: dg.transcript,
                                duration: 3,
                                deepgram: dg.result
                            })
                        }).then(r => r.json())

                        // 2) AI Response
                        const aiResponseRaw = await fetch("/api/ai", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                transcript: dg.transcript,
                                metrics: { fluencyScore: 0.5 }, // Top-level metrics for API compatibility
                                fluency: { metrics: { fluencyScore: 0.5 } }, // Keep for backward compatibility if needed
                                firstName: firstName,
                                // Challenge Mode Params
                                systemPromptType: mode === 'challenge' ? 'TRIAL' : 'TUTOR',
                                targetLevel: targetLevel,
                                // Send last 10 turns for context
                                history: chatsRef.current.slice(-10).map(c => ({
                                    role: c.role,
                                    content: c.content
                                }))
                            })
                        })

                        if (!aiResponseRaw.ok) throw new Error("AI API Failed")
                        const ai = await aiResponseRaw.json()

                        // Check lock again before speaking
                        if (requestCounter.current !== currentRequestId) {
                            console.log("Request obsolete (barge-in detected during AI generation). Ignoring.")
                            return
                        }

                        // Store AI response with corrections
                        const aiMessage = {
                            role: "assistant" as const,
                            content: ai.response,
                            timestamp: new Date(),
                            corrections: ai.corrections || []
                        }
                        setChats(prev => [...prev, aiMessage])

                        setAiResponse(ai.response)
                        await speak(ai.response)

                    } catch (err) {
                        console.error("AI/Fluency Pipeline Error:", err)
                        if (requestCounter.current === currentRequestId) {
                            setAiResponse("I'm having trouble connecting. Could you say that again?")
                            setProcessing(false)
                            await speak("I didn't quite catch that.")
                        }
                    }
                } else {
                    console.log("Empty transcript, ignoring.")
                    // If we locked processing for an empty transcript, unlock it now
                    if (requestCounter.current === currentRequestId) {
                        setProcessing(false)
                    }
                }
            }

            let silenceStart = Date.now()

            const detectVoice = () => {
                if (!analyser || !started) {
                    if (voiceDetectRef.current) cancelAnimationFrame(voiceDetectRef.current)
                    return
                }

                analyser.getByteFrequencyData(data)
                // specific frequency range (human voice) might be better, but avg is okay for simple VAD
                const volume = data.reduce((a, b) => a + b, 0) / data.length

                // Dynamic Threshold: If AI is speaking, raise threshold to prevent self-interruption (Barge-in requires shouting)
                const BASE_THRESHOLD = 15 // Slightly higher base
                const INTERRUPT_THRESHOLD = 40 // Much higher if AI is talking

                // Check if AI is currently speaking (via ref check to be safe)
                const isAiSpeaking = audioRef.current && !audioRef.current.paused

                const effectiveThreshold = isAiSpeaking ? INTERRUPT_THRESHOLD : BASE_THRESHOLD

                if (volume > effectiveThreshold) {
                    // Speaking detected
                    silenceStart = Date.now()

                    // Barge-in Logic
                    if (isAiSpeaking) {
                        console.log("Barge-in detected! Stopping AI.")
                        audioRef.current?.pause()
                        setSpeaking(false)
                        setProcessing(false)

                        // Increment request ID to kill any pending AI generation
                        requestCounter.current++
                    }

                    if (recorder.state === "inactive") {
                        console.log("Voice started. Recording...")
                        recorder.start()
                        setListening(true)
                    }
                } else {
                    // Silence Logic
                    if (recorder.state === "recording") {
                        // Reduced silence timeout to 1.2s for snappier response
                        if (Date.now() - silenceStart > 1200) {
                            console.log("Silence detected. Stopping recording...")
                            recorder.stop()
                            setListening(false)
                        }
                    }
                }

                voiceDetectRef.current = requestAnimationFrame(detectVoice)
            }

            detectVoice()
        } catch (err) {
            console.error("Recording init failed:", err)
        }
    }

    const isBossMode = mode === 'challenge'

    if (!token) {
        return (
            <div className={`min-h-screen ${isBossMode ? 'bg-zinc-950 text-red-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'} flex flex-col transition-colors duration-300`}>
                <HomeNavbar locale="en" dict={{}} />
                <div className="flex-1 flex items-center justify-center">
                    <div className={`text-xl font-light animate-pulse ${isBossMode ? 'text-red-500 font-mono tracking-widest uppercase' : 'text-blue-600 dark:text-blue-400'}`}>
                        {isBossMode ? 'Initializing Exam Protocols...' : 'Connecting to your tutor...'}
                    </div>
                </div>
            </div>
        )
    }

    if (!started) {
        return (
            <div className={`min-h-screen ${isBossMode ? 'bg-zinc-950' : 'bg-slate-50 dark:bg-slate-950'} text-slate-900 dark:text-white flex flex-col transition-colors duration-300`}>
                <HomeNavbar locale="en" dict={{}} />
                <div className="flex-1 flex flex-col items-center justify-center space-y-12 p-10 relative overflow-hidden">
                    {/* Decorative Background */}
                    {!isBossMode && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
                        </div>
                    )}

                    {isBossMode && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-zinc-950 to-zinc-950" />
                    )}

                    <div className="relative z-10 flex flex-col items-center space-y-6">
                        {isBossMode ? (
                            <div className="w-40 h-40 border-4 border-red-800 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.2)] mb-6 bg-zinc-900">
                                <span className="text-6xl animate-pulse">🛑</span>
                            </div>
                        ) : (
                            <div className="w-40 h-40 bg-gradient-to-tr from-blue-100 to-white dark:from-blue-600 dark:to-blue-500 rounded-full flex items-center justify-center shadow-2xl dark:shadow-[0_0_80px_rgba(37,99,235,0.5)] mb-6 ring-4 ring-white/20">
                                <span className="text-6xl animate-bounce-slow">🎓</span>
                            </div>
                        )}

                        <h1 className={`text-6xl font-bold font-serif bg-clip-text text-transparent ${isBossMode ? 'bg-gradient-to-r from-red-500 to-red-800 tracking-widest uppercase' : 'bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300'} text-center`}>
                            {isBossMode ? `${targetLevel} TRIAL` : 'Fluency Tutor'}
                        </h1>
                        <p className={`${isBossMode ? 'text-zinc-500 font-mono text-sm uppercase tracking-widest' : 'text-slate-600 dark:text-gray-300 text-xl font-light'} max-w-lg text-center leading-relaxed`}>
                            {isBossMode ? (
                                <>
                                    Examiner Protocol Active.<br />
                                    This seesion will be strictly graded.<br />
                                    Good luck.
                                </>
                            ) : (
                                <>
                                    Your personal AI conversational partner. <br />
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">No judgment. Just practice.</span>
                                </>
                            )}
                        </p>
                    </div>

                    <button
                        onClick={startSession}
                        className={`group relative px-12 py-5 ${isBossMode ? 'bg-red-900 hover:bg-red-800 border border-red-700/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl hover:shadow-2xl'} text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 z-10 overflow-hidden`}
                    >
                        {!isBossMode && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                        <Play size={28} fill="currentColor" />
                        <span>{isBossMode ? 'ENTER TRIAL' : 'Start Conversation'}</span>
                    </button>
                </div>
            </div>
        )
    }

    // MAIN SESSION UI
    return (
        <div className={`min-h-screen ${isBossMode ? 'bg-zinc-950 font-mono' : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'} flex flex-col relative overflow-hidden transition-colors duration-300`}>
            {!isBossMode && <HomeNavbar locale="en" dict={{}} />}

            {/* Premium Background */}
            {!isBossMode ? (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 blur-[100px] rounded-full" />
                </div>
            ) : (
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
                    <div className="absolute top-0 right-0 p-8 opacity-20 text-red-700 font-mono text-xs">
                        CLASSIFIED ASSESSMENT // {targetLevel}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 w-full max-w-6xl mx-auto z-10 h-full">

                {/* Top Section: Avatar / Timer */}
                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
                    {isBossMode ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className={`w-32 h-32 rounded-full border-2 ${speaking ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'border-zinc-800'} flex items-center justify-center bg-zinc-950 transition-all duration-300`}>
                                {listening ? (
                                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                                ) : speaking ? (
                                    <VoiceVisualizer analyser={analyserNode} isListening={true} />
                                ) : (
                                    <div className="w-16 h-1 bg-red-900/50" />
                                )}
                            </div>
                            <div className="text-red-700/50 font-mono text-sm tracking-[0.2em] animate-pulse">
                                {listening ? 'LISTENING' : speaking ? 'EXAMINER SPEAKING' : 'PROCESSING'}
                            </div>
                        </div>
                    ) : (
                        <div className={`transition-all duration-700 flex flex-col items-center transform ${listening ? 'scale-105' : 'scale-100'}`}>
                            <AIAvatar state={speaking ? 'speaking' : processing ? 'processing' : listening ? 'listening' : 'idle'} />
                        </div>
                    )}
                </div>

                {/* Middle Section: Chat Bubbles (Floating) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
                    {/* User Bubble */}
                    <div className={`relative p-8 backdrop-blur-md border rounded-3xl min-h-[140px] flex flex-col justify-between transition-all duration-500 ${isBossMode
                        ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                        : listening
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.1)]'
                            : 'bg-white/60 dark:bg-white/5 border-slate-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>

                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-xs font-bold uppercase tracking-widest ${isBossMode ? 'text-zinc-500' : 'text-slate-400 dark:text-gray-500'}`}>You</span>
                            {listening ? <Mic size={18} className={`${isBossMode ? 'text-red-500' : 'text-green-500'} animate-pulse`} /> : <MicOff size={18} className="text-slate-300 dark:text-gray-600" />}
                        </div>
                        <p className={`text-xl font-light leading-relaxed ${isBossMode ? 'text-zinc-100' : 'text-slate-800 dark:text-gray-100'}`}>
                            {transcript || <span className="text-slate-300 dark:text-gray-600 italic">Listening...</span>}
                        </p>
                    </div>

                    {/* AI Bubble */}
                    <div className={`relative p-8 backdrop-blur-md border rounded-3xl min-h-[140px] flex flex-col justify-between transition-all duration-500 ${isBossMode
                        ? 'bg-red-950/10 border-red-900/20 text-red-100'
                        : speaking
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
                            : 'bg-blue-50/20 dark:bg-white/5 border-blue-100/30 dark:border-white/10'}`}>

                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-xs font-bold uppercase tracking-widest ${isBossMode ? 'text-red-800' : 'text-blue-400 dark:text-blue-400'}`}>
                                {isBossMode ? 'EXAMINER' : 'AI Tutor'}
                            </span>
                        </div>
                        <div>
                            <p className={`text-xl font-light leading-relaxed ${isBossMode ? 'text-red-100' : 'text-blue-900 dark:text-blue-100'}`}>
                                {aiResponse || <span className="text-blue-300 dark:text-gray-600 italic">...</span>}
                            </p>
                            {chats.length > 0 && chats[chats.length - 1].role === "assistant" && (
                                <ErrorCorrectionDisplay corrections={chats[chats.length - 1].corrections || []} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Controls & Visualizer */}
                <div className="flex flex-col items-center gap-8 w-full">
                    {/* Visualizer (Only visible when listening/active for a cooler effect) */}
                    <div className={`w-full max-w-md h-12 transition-opacity duration-500 ${listening ? 'opacity-100' : 'opacity-30'}`}>
                        {analyserNode && <VoiceVisualizer analyser={analyserNode} isListening={true} />}
                    </div>

                    <button
                        onClick={endSession}
                        className="group px-8 py-3 bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 text-red-500 rounded-full font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
                    >
                        <Square size={18} fill="currentColor" />
                        <span>End Session</span>
                    </button>
                </div>

                <LiveKitRoom
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    token={token}
                    connect
                    audio
                    video={false}
                />
            </div>

            <FluencyReportModal
                isOpen={showReport}
                onClose={handleReportClose}
                report={reportData}
                isLoading={reportLoading}
            />
        </div>
    )
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = () =>
            resolve(reader.result?.toString().split(",")[1] || "")
        reader.readAsDataURL(blob)
    })
}
