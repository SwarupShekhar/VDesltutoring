"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Track } from "livekit-client"

export default function StudentSessionPage() {
    const [token, setToken] = useState<string | null>(null)
    const [roomName, setRoomName] = useState<string>("")
    const params = useParams()

    // 1. Fetch Token
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
            {/* Header */}
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

            {/* LiveKit Room */}
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

    // Access Room Context for Data Channel
    const room = useRoomContext();
    const mediaRecorder = useRef<MediaRecorder | null>(null);

    // Deepgram & Analysis Logic
    useEffect(() => {
        // Only start if we have a room object (implies LiveKitRoom is connected)
        if (!room) return;

        const startDeepgram = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorder.current = recorder;

                recorder.ondataavailable = async (e) => {
                    if (e.data.size > 0) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                            const base64 = (reader.result as string)?.split(",")[1];
                            if (!base64) return;

                            // Send to Deepgram
                            try {
                                const dgResponse = await fetch("/api/deepgram", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        audio: base64,
                                        mimeType: recorder.mimeType
                                    })
                                });

                                if (!dgResponse.ok) return;

                                const dg = await dgResponse.json();
                                const transcript = dg.transcript;

                                if (transcript && transcript.length > 1) {
                                    // Send to Analysis
                                    fetch("/api/fluency/analyze", {
                                        method: "POST",
                                        body: JSON.stringify({ transcript, duration: 1 }) // 1s chunks
                                    })
                                        .then(r => r.json())
                                        .then(data => {
                                            if (data.success && data.analysis) {
                                                // Broadcast to Tutor via LiveKit Data Channel
                                                const payload = new TextEncoder().encode(JSON.stringify(data.analysis));
                                                room.localParticipant.publishData(payload, { reliable: true });
                                            }
                                        })
                                        .catch(console.error);

                                    // Optional: Send to Gemini for potential context
                                    fetch("/api/gemini", {
                                        method: "POST",
                                        body: JSON.stringify({ transcript })
                                    }).catch(console.error);
                                }
                            } catch (err) {
                                console.error("Transcription pipeline error", err);
                            }
                        };
                        reader.readAsDataURL(e.data);
                    }
                };

                recorder.start(1000); // 1-second chunks
            } catch (err) {
                console.error("Failed to start microphone for transcription", err);
            }
        };

        startDeepgram();

        return () => {
            if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                mediaRecorder.current.stop();
            }
        };
    }, [room]); // Depend on 'room' to ensure it's available

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative">
                <GridLayout tracks={tracks} className="h-full p-6 gap-4">
                    <ParticipantTile />
                </GridLayout>

                {/* Bottom coaching bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm border border-white/5 shadow-lg">
                    🎧 Focus on speaking smoothly - not perfectly
                </div>
            </div>

            {/* Media Controls */}
            <div className="p-4 flex justify-center border-t border-white/10 bg-[#0f172a]">
                <ControlBar variation="minimal" controls={{ screenShare: true }} />
            </div>
        </div>
    )
}
