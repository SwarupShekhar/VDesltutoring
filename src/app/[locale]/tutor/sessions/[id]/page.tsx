"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Track, RoomEvent } from "livekit-client"
import { SessionPrepPanel } from "@/components/Tutor/SessionPrepPanel"

type SessionPhase = "prep" | "active"

export default function TutorSessionPage() {
    const [token, setToken] = useState<string | null>(null)
    const [roomName, setRoomName] = useState<string>("")
    const [phase, setPhase] = useState<SessionPhase>("prep")
    const [studentId, setStudentId] = useState<string | null>(null)
    const [studentName, setStudentName] = useState<string>("")
    const params = useParams()

    // Fetch session details including student info
    useEffect(() => {
        async function fetchSessionData() {
            try {
                // Fetch session details to get student ID
                const sessionRes = await fetch(`/api/sessions/${params.id}`, { credentials: "include" })
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json()
                    setStudentId(sessionData.student_id || sessionData.studentId)
                    setStudentName(sessionData.student_name || sessionData.studentName || "Student")
                }
            } catch (err) {
                console.error("Failed to fetch session data:", err)
            }
        }

        if (params.id) {
            fetchSessionData()
        }
    }, [params.id])

    // Fetch LiveKit token when ready to start
    const handleStartSession = async () => {
        try {
            const res = await fetch("/api/livekit/token", { credentials: "include" })
            const data = await res.json()
            setToken(data.token)
            setRoomName(data.roomName)
            setPhase("active")
        } catch (err) {
            console.error("Failed to get token:", err)
        }
    }

    // Prep phase - Show CEFR blockers
    if (phase === "prep") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                {/* Header */}
                <header className="px-8 py-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Session Preparation</h1>
                            <p className="text-slate-400 mt-1">
                                Review CEFR blockers before starting with {studentName}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = "/tutor/dashboard"}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </header>

                {/* Session Prep Content */}
                <main className="max-w-5xl mx-auto p-8">
                    {studentId ? (
                        <div className="space-y-8">
                            <SessionPrepPanel
                                studentId={studentId}
                                onReady={() => { }} // Checklist completion handled internally
                            />

                            {/* Start Session Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleStartSession}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl shadow-2xl shadow-blue-500/25 transition-all transform hover:scale-105"
                                >
                                    Start Session →
                                </button>
                            </div>

                            <p className="text-center text-slate-500 text-sm">
                                Complete the coaching checklist above, then click Start Session
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-400">Loading session details...</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        )
    }

    // Active session phase
    if (!token) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0b1120] text-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Connecting to session...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-[#0b1120] text-white">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                <div>
                    <h1 className="text-lg font-semibold font-serif">Tutoring Session</h1>
                    <p className="text-sm opacity-70">
                        Guide fluency, not grammar
                    </p>
                </div>

                {/* Live fluency indicator placeholder */}
                <div className="flex items-center gap-4">
                    <div className="text-sm text-yellow-400 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Student active
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("End this session?")) {
                                fetch("/api/sessions/complete", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ sessionId: params.id, status: "COMPLETED" })
                                }).then(() => window.location.href = "/tutor/dashboard")
                            }
                        }}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
                    >
                        End Session
                    </button>
                </div>
            </header>

            <LiveKitRoom
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                connect
                audio
                video
                className="flex-1 relative"
            >
                <SessionContent />
            </LiveKitRoom>
        </div>
    )
}

function SessionContent() {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ])

    // State for fluency cues
    const [cues, setCues] = useState<{
        wpm?: number,
        fillers?: string[],
        suggestion?: string
    }>({});

    const room = useRoomContext();

    useEffect(() => {
        if (!room) return;

        const handleData = (payload: Uint8Array, participant: any) => {
            try {
                const str = new TextDecoder().decode(payload);
                const data = JSON.parse(str);
                console.log("Received fluency data:", data);

                // Update cues
                setCues(prev => ({
                    ...prev,
                    wpm: data.wpm,
                    fillers: data.fillers || [],
                    suggestion: data.suggestion,
                }));
            } catch (err) {
                console.error("Failed to parse data message", err);
            }
        };

        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative">
                <GridLayout tracks={tracks} className="h-full p-6 gap-4">
                    <ParticipantTile />
                </GridLayout>

                {/* Tutor coaching hints */}
                <aside className="absolute right-4 top-4 w-72 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-4 text-sm space-y-4 shadow-xl z-10">
                    <div>
                        <p className="font-semibold text-blue-200 mb-2">Fluency Cues</p>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="text-xs">⏱️</span>
                                {cues.wpm ? `${cues.wpm} WPM` : "Monitoring pace..."}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-xs">👂</span>
                                {cues.fillers && cues.fillers.length > 0
                                    ? `Fillers: ${cues.fillers.slice(0, 3).join(", ")}`
                                    : "No fillers detected"}
                            </li>
                        </ul>
                    </div>
                    {cues.suggestion && (
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-blue-400 italic">
                                Tip: &quot;{cues.suggestion}&quot;
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Media Controls */}
            <div className="p-4 flex justify-center border-t border-white/10 bg-[#0f172a]">
                <ControlBar variation="minimal" controls={{ screenShare: true }} />
            </div>
        </div>
    )
}
