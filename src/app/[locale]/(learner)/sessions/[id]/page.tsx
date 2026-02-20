"use client"

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext, ControlBar } from "@livekit/components-react"
import "@livekit/components-styles"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Track } from "livekit-client"
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"

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
                <SessionContent sessionId={params.id as string} />
            </LiveKitRoom>
        </div>
    )
}

function SessionContent({ sessionId }: { sessionId: string }) {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ])

    // Access Room Context for Data Channel
    const room = useRoomContext();
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const dgConnection = useRef<any>(null);

    // Deepgram & Analysis Logic
    useEffect(() => {
        // Only start if we have a room object (implies LiveKitRoom is connected)
        if (!room) return;

        const startDeepgram = async () => {
            try {
                // Fetch Temp Streaming Token
                const tokenRes = await fetch("/api/deepgram/token");
                if (!tokenRes.ok) throw new Error("Could not get Deepgram token");
                const { token } = await tokenRes.json();

                const deepgram = createClient(token);

                // Open WebSocket connection
                const connection = deepgram.listen.live({
                    model: "nova-3",
                    language: "en-US",
                    smart_format: true,
                    interim_results: true,
                    utterance_end_ms: 1000
                });
                
                dgConnection.current = connection;

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                mediaRecorder.current = recorder;

                connection.on(LiveTranscriptionEvents.Open, () => {
                    recorder.ondataavailable = async (e) => {
                        if (e.data.size > 0 && connection.getReadyState() === 1) {
                            connection.send(e.data);
                        }
                    };
                    // Record in 250ms chunks for smooth real-time streaming
                    recorder.start(250);
                });

                connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                    const transcript = data.channel.alternatives[0].transcript;
                    if (transcript && data.is_final) {
                        const duration = data.duration || 1;
                        
                        // Send to Fluency Analysis and output to LiveKit Data Channel
                        fetch("/api/fluency/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ transcript, duration })
                        })
                            .then(r => r.json())
                            .then(res => {
                                if (res.success && res.analysis) {
                                    const payload = new TextEncoder().encode(JSON.stringify(res.analysis));
                                    room.localParticipant.publishData(payload, { reliable: true });
                                }
                            })
                            .catch(console.error);
                        
                        // Send text/metrics to our Backend DB replacing the 24/7 worker
                        fetch("/api/live-practice/metrics", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                sessionId: sessionId,
                                transcript: transcript,
                                wordData: data.channel.alternatives[0].words || [],
                                duration: duration
                            })
                        }).catch(console.error);

                        // Optional: Send to Gemini for potential context
                        fetch("/api/gemini", {
                            method: "POST",
                            body: JSON.stringify({ transcript })
                        }).catch(console.error);
                    }
                });

                connection.on(LiveTranscriptionEvents.Error, (err) => {
                    console.error("Deepgram WS Error:", err);
                });
            } catch (err) {
                console.error("Failed to start microphone for transcription", err);
            }
        };

        startDeepgram();

        return () => {
            if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                mediaRecorder.current.stop();
            }
            if (dgConnection.current) {
                dgConnection.current.requestClose();
            }
        };
    }, [room, sessionId]); // Depend on 'room' and 'sessionId'

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
