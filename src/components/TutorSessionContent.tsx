"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Track, RoomEvent } from "livekit-client"
import { SessionPrepPanel } from "@/components/Tutor/SessionPrepPanel"

type SessionPhase = "prep" | "active"

interface TutorSessionContentProps {
    dict: {
        prepTitle: string;
        prepSubtitle: string;
        backToDashboard: string;
        startSession: string;
        completeChecklist: string;
    };
    locale: string;
}

export function TutorSessionContent({ dict, locale }: TutorSessionContentProps) {
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

    // Replace {studentName} in subtitle
    const prepSubtitle = dict.prepSubtitle.replace("{studentName}", studentName);

    // Prep phase - Show CEFR blockers
    if (phase === "prep") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                {/* Header */}
                <header className="px-8 py-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{dict.prepTitle}</h1>
                            <p className="text-slate-400 mt-1">
                                {prepSubtitle}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = `/${locale}/tutor/dashboard`}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            ← {dict.backToDashboard}
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
                                    {dict.startSession} →
                                </button>
                            </div>

                            <p className="text-center text-slate-500 text-sm">
                                {dict.completeChecklist}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </main>
            </div>
        )
    }

    if (!token) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )

    return (
        <div className="h-screen bg-slate-900 overflow-hidden flex flex-col">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-4">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                    <h2 className="text-lg font-medium text-white">Live Session with {studentName}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                        CEFR B2 Target
                    </span>
                    <button
                        onClick={() => window.location.href = `/${locale}/tutor/dashboard`}
                        className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-sm"
                    >
                        End Session
                    </button>
                </div>
            </header>

            <div className="flex-1 relative">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    onDisconnected={() => setPhase("prep")}
                    data-lk-theme="default"
                    className="h-full"
                >
                    <MyVideoConference />
                    <ControlBar variation="minimal" />
                </LiveKitRoom>
            </div>
        </div>
    )
}

function MyVideoConference() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ]
    )
    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - 120px)' }}>
            <ParticipantTile />
        </GridLayout>
    )
}
