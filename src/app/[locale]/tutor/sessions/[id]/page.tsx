"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Track, RoomEvent } from "livekit-client"

export default function TutorSessionPage() {
    const [token, setToken] = useState<string | null>(null)
    const [roomName, setRoomName] = useState<string>("")
    const params = useParams()

    // Note: params.id is available via hook in Client Component if needed later

    useEffect(() => {
        fetch("/api/livekit/token", { credentials: "include" })
            .then(r => r.json())
            .then(d => {
                setToken(d.token)
                setRoomName(d.roomName)
            })
            .catch(console.error)
    }, [])

    if (!token) {
        return <div className="p-10 text-center text-slate-500">Preparing session...</div>
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
