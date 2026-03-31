"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Track } from "livekit-client"

export default function StudentSessionPage() {
    const [token, setToken] = useState<string | null>(null)
    const [roomName, setRoomName] = useState<string>("")
    const params = useParams()

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
        return <div className="p-10 text-center text-slate-500">Connecting to your tutor...</div>
    }

    return (
        <div className="h-screen flex flex-col bg-[#0b1120] text-white">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0f172a] flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-semibold font-serif">Live English Session</h1>
                    <p className="text-sm opacity-70">
                        Speak freely. Your tutor is listening.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
                >
                    Leave
                </button>
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

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative">
                <GridLayout tracks={tracks} className="h-full p-6 gap-4">
                    <ParticipantTile />
                </GridLayout>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm border border-white/5 shadow-lg">
                    🎧 Focus on speaking smoothly - not perfectly
                </div>
            </div>

            <div className="p-4 flex justify-center border-t border-white/10 bg-[#0f172a]">
                <ControlBar variation="minimal" controls={{ screenShare: true }} />
            </div>
        </div>
    )
}
