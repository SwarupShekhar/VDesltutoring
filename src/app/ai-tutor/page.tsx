"use client"

import { useEffect, useRef, useState } from "react"
import { LiveKitRoom } from "@livekit/components-react"
import AIAvatar from "@/components/AIAvatar"
import { HomeNavbar } from "@/components/HomeNavbar"
import { VoiceVisualizer } from "@/components/VoiceVisualizer"
import { FluencyReportModal } from "@/components/FluencyReportModal"
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
                    feedback: JSON.stringify(report.feedback),
                    scores: report.scores
                })
            })
        } catch (e) {
            console.error(e)
        } finally {
            setReportLoading(false)
        }
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
                if (blob.size < 4000) return // ignore silence blobs

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

                    // Text → Gemini
                    const aiResponseRaw = await fetch("/api/gemini", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transcript: dg.transcript })
                    })

                    if (!aiResponseRaw.ok) {
                        throw new Error(`Gemini API Error: ${aiResponseRaw.status}`)
                    }

                    const ai = await aiResponseRaw.json()

                    setAiResponse(ai.response)

                    // Gemini → Voice
                    await speak(ai.response)
                }
            }

            const detectVoice = () => {
                analyser.getByteFrequencyData(data)
                const volume = data.reduce((a, b) => a + b, 0) / data.length

                if (volume > 10) { // Threshold adjusted (lower is more sensitive)
                    // Barge-in: User is speaking, stop AI immediately
                    if (audioRef.current && !audioRef.current.paused) {
                        audioRef.current.pause();
                        setSpeaking(false);
                    }

                    if (recorder.state === "inactive") {
                        recorder.start(2000) // record 2s chunks when speaking
                        setListening(true)
                    }
                } else if (volume < 5 && recorder.state === "recording") {
                    // Stop if silence? No, let recorder.start(2000) handle chunking, 
                    // but we can update UI state
                    // setListening(false) -> actually we want to show listening while recording chunk
                }

                // Update listening UI based on recorder state
                if (recorder.state === "recording") setListening(true)
                else setListening(false)

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
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-10">
                    <div className="w-32 h-32 bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-[0_0_60px_rgba(37,99,235,0.4)] mb-4 ring-1 ring-blue-200 dark:ring-0">
                        <span className="text-5xl">🎓</span>
                    </div>
                    <h1 className="text-5xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-200 dark:to-white">English Fluency Tutor</h1>
                    <p className="text-slate-600 dark:text-gray-400 max-w-md text-center text-lg leading-relaxed">
                        Improve your speaking skills with an advanced AI tutor. <br />
                        <span className="text-blue-600 dark:text-blue-200 font-medium">Real-time feedback. Natural conversation.</span>
                    </p>
                    <button
                        onClick={startSession}
                        className="px-10 py-4 bg-blue-600 dark:bg-white text-white dark:text-blue-900 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <Play size={24} fill="currentColor" />
                        Start Conversation
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col relative overflow-hidden transition-colors duration-300">
            <HomeNavbar locale="en" dict={{}} />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto p-6 w-full z-10">

                <div className={`transition-all duration-700 flex flex-col items-center ${listening ? 'scale-110' : 'scale-100'}`}>
                    <AIAvatar state={speaking ? 'speaking' : processing ? 'processing' : listening ? 'listening' : 'idle'} />
                    <div className="mt-8 w-full max-w-xs h-16 flex items-center justify-center">
                        {analyserNode && <VoiceVisualizer analyser={analyserNode} isListening={true} />}
                    </div>
                </div>


                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl min-h-[160px] flex flex-col justify-between transition-all duration-300 group shadow-sm dark:shadow-none ${listening ? 'border-green-500/30 bg-green-50 dark:bg-green-900/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'hover:shadow-md dark:hover:bg-white/10'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${listening ? "bg-green-500 animate-pulse" : "bg-slate-400 dark:bg-gray-600"}`}></span>
                                You
                            </p>
                            {listening ? <Mic size={16} className="text-green-500 animate-pulse" /> : <MicOff size={16} className="text-slate-400 dark:text-gray-600" />}
                        </div>
                        <p className="text-xl font-light leading-relaxed text-slate-800 dark:text-gray-200">{transcript || <span className="text-slate-400 dark:text-gray-600 italic">Listening...</span>}</p>
                    </div>

                    <div className={`p-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl min-h-[160px] flex flex-col justify-between transition-all duration-300 shadow-sm dark:shadow-none ${speaking ? 'border-blue-400/50 bg-blue-100 dark:bg-blue-900/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]' : ''}`}>
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${speaking ? "bg-blue-500 dark:bg-blue-400 animate-pulse" : "bg-blue-300 dark:bg-blue-900"}`}></span>
                                AI Tutor
                            </p>
                        </div>
                        <p className="text-xl font-light leading-relaxed text-blue-900 dark:text-blue-100">{aiResponse || <span className="text-blue-300 dark:text-white/10 italic">Thinking...</span>}</p>
                    </div>
                </div>

                <button
                    onClick={endSession}
                    className="mt-8 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-medium hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                    <Square size={16} fill="currentColor" />
                    End Session
                </button>

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
                onClose={() => setShowReport(false)}
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
