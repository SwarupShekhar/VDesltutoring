"use client"

import { useEffect, useRef, useState } from "react"
import { LiveKitRoom } from "@livekit/components-react"
import AIAvatar from "@/components/AIAvatar"
import { HomeNavbar } from "@/components/HomeNavbar"
import { VoiceVisualizer } from "@/components/VoiceVisualizer"
import { FluencyReportModal } from "@/components/FluencyReportModal"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Square, Play } from "lucide-react"

type ChatMessage = { role: "user" | "assistant"; content: string; timestamp: Date }

export default function AITutor() {
    const [token, setToken] = useState<string | null>(null)
    const [transcript, setTranscript] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [listening, setListening] = useState(false)
    const [speaking, setSpeaking] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [started, setStarted] = useState(false)
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
    const [chats, setChats] = useState<ChatMessage[]>([])

    // Report State
    const [showReport, setShowReport] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportData, setReportData] = useState(null)

    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const voiceDetectRef = useRef<number | null>(null)

    const router = useRouter()

    // Fetch LiveKit token
    useEffect(() => {
        fetch("/api/livekit/token", { credentials: "include" })
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
        // Small delay to ensure UI transition completes and audio context is ready
        setTimeout(async () => {
            await speak("Hi, I am your English tutor. Tell me how your day is going.")
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
            const fullTranscript = chats.map(c => `${c.role.toUpperCase()}: ${c.content}`).join("\n")
            const reportRes = await fetch("/api/ai-tutor/report", {
                method: "POST",
                body: JSON.stringify({ transcript: fullTranscript })
            })
            const report = await reportRes.json()
            setReportData(report)

            // 2. Save Session
            await fetch("/api/ai-tutor/save", {
                method: "POST",
                body: JSON.stringify({
                    messages: chats,
                    duration: 300, // TODO: Track actual duration
                    report: report
                })
            })
        } catch (e) {
            console.error(e)
        } finally {
            setReportLoading(false)
        }
    }

    const handleReportClose = () => {
        setShowReport(false)
        router.push('/')
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
                if (blob.size < 100) return // ignore tiny empty blobs

                const base64 = await blobToBase64(blob)

                // Speech → Text
                const dg = await fetch("/api/deepgram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        audio: base64,
                        mimeType: recorder.mimeType
                    })
                }).then(r => r.json())

                console.log("Deepgram:", dg)

                if (dg.transcript && dg.transcript.length > 2) {
                    setTranscript(dg.transcript)
                    setChats(prev => [...prev, { role: "user", content: dg.transcript, timestamp: new Date() }])

                    setProcessing(true)

                    // Text → AI
                    const aiResponseRaw = await fetch("/api/ai", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transcript: dg.transcript })
                    })

                    if (!aiResponseRaw.ok) {
                        let errorMessage = `AI API Error: ${aiResponseRaw.status}`
                        try {
                            const errorData = await aiResponseRaw.json()
                            if (errorData.detail) errorMessage = errorData.detail
                        } catch (e) {
                            // ignore json parse error
                        }
                        setAiResponse(`Error: ${errorMessage}`)
                        setProcessing(false)
                        throw new Error(errorMessage)
                    }

                    const ai = await aiResponseRaw.json()

                    setAiResponse(ai.response)

                    // Gemini → Voice
                    await speak(ai.response)
                }
            }

            let silenceStart = Date.now()

            const detectVoice = () => {
                if (!analyser) return

                analyser.getByteFrequencyData(data)
                const volume = data.reduce((a, b) => a + b, 0) / data.length

                const THRESHOLD = 10

                if (volume > THRESHOLD) {
                    // Speaking detected
                    silenceStart = Date.now()

                    // Barge-in: User is speaking, stop AI immediately
                    if (audioRef.current && !audioRef.current.paused) {
                        audioRef.current.pause();
                        setSpeaking(false);
                    }

                    if (recorder.state === "inactive") {
                        recorder.start() // Record indefinitely until silence
                        setListening(true)
                    }
                } else {
                    // Silence logic
                    if (recorder.state === "recording") {
                        if (Date.now() - silenceStart > 1200) { // 1.2s of silence stops recording
                            recorder.stop()
                            setListening(false)
                        }
                    }
                }

                voiceDetectRef.current = requestAnimationFrame(detectVoice)
            }

            detectVoice()
        } catch (err) {
            console.error("Recording failed:", err)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
                <HomeNavbar locale="en" dict={{}} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-xl font-light animate-pulse text-blue-600 dark:text-blue-400">Connecting to your tutor...</div>
                </div>
            </div>
        )
    }

    if (!started) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
                <HomeNavbar locale="en" dict={{}} />
                <div className="flex-1 flex flex-col items-center justify-center space-y-12 p-10 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center space-y-6">
                        <div className="w-40 h-40 bg-gradient-to-tr from-blue-100 to-white dark:from-blue-600 dark:to-blue-500 rounded-full flex items-center justify-center shadow-2xl dark:shadow-[0_0_80px_rgba(37,99,235,0.5)] mb-6 ring-4 ring-white/20">
                            <span className="text-6xl animate-bounce-slow">🎓</span>
                        </div>
                        <h1 className="text-6xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-center tracking-tight">
                            Fluency Tutor
                        </h1>
                        <p className="text-slate-600 dark:text-gray-300 max-w-lg text-center text-xl leading-relaxed font-light">
                            Your personal AI conversational partner. <br />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">No judgment. Just practice.</span>
                        </p>
                    </div>

                    <button
                        onClick={startSession}
                        className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-4 z-10 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Play size={28} fill="currentColor" />
                        <span>Start Conversation</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col relative overflow-hidden transition-colors duration-300">
            <HomeNavbar locale="en" dict={{}} />

            {/* Premium Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 w-full max-w-6xl mx-auto z-10 h-full">

                {/* Top Section: Avatar */}
                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
                    <div className={`transition-all duration-700 flex flex-col items-center transform ${listening ? 'scale-105' : 'scale-100'}`}>
                        <AIAvatar state={speaking ? 'speaking' : processing ? 'processing' : listening ? 'listening' : 'idle'} />
                    </div>
                </div>

                {/* Middle Section: Chat Bubbles (Floating) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
                    {/* User Bubble */}
                    <div className={`relative p-8 backdrop-blur-md border rounded-3xl min-h-[140px] flex flex-col justify-between transition-all duration-500 ${listening
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.1)]'
                        : 'bg-white/60 dark:bg-white/5 border-slate-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">You</span>
                            {listening ? <Mic size={18} className="text-green-500 animate-pulse" /> : <MicOff size={18} className="text-slate-300 dark:text-gray-600" />}
                        </div>
                        <p className="text-xl font-light leading-relaxed text-slate-800 dark:text-gray-100">
                            {transcript || <span className="text-slate-300 dark:text-gray-600 italic">Listening...</span>}
                        </p>
                    </div>

                    {/* AI Bubble */}
                    <div className={`relative p-8 backdrop-blur-md border rounded-3xl min-h-[140px] flex flex-col justify-between transition-all duration-500 ${speaking
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
                        : 'bg-blue-50/20 dark:bg-white/5 border-blue-100/30 dark:border-white/10'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-blue-400 dark:text-blue-400 uppercase tracking-widest">AI Tutor</span>
                        </div>
                        <p className="text-xl font-light leading-relaxed text-blue-900 dark:text-blue-100">
                            {aiResponse || <span className="text-blue-300 dark:text-gray-600 italic">...</span>}
                        </p>
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

    function blobToBase64(blob: Blob): Promise<string> {
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () =>
                resolve(reader.result?.toString().split(",")[1] || "")
            reader.readAsDataURL(blob)
        })
    }
}
