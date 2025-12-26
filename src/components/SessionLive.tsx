'use client';

import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
    ControlBar,
    DisconnectButton,
    GridLayout,
    ParticipantTile,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useMemo, useEffect, useRef } from 'react';

interface SessionLiveProps {
    token: string;
    serverUrl: string;
    roomName: string;
    userName: string;
    isStudent?: boolean;
}

export default function SessionLive({ token, serverUrl, roomName, userName, isStudent = false }: SessionLiveProps) {
    const mediaRecorder = useRef<MediaRecorder | null>(null);

    // Deepgram Integration (Only for Student)
    useEffect(() => {
        if (!isStudent) return;

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

                            // 1. Send to Deepgram
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
                                    console.log("Transcript:", transcript);

                                    // 2. Send to Fluency Analyze
                                    fetch("/api/fluency/analyze", {
                                        method: "POST",
                                        body: JSON.stringify({ transcript })
                                    }).catch(console.error);

                                    // 3. Send to Gemini (AI Bot)
                                    // NOTE: This might cause AI to speak if the page listens to it, 
                                    // but currently SessionLive doesn't handle AI audio playback, just transcript submission.
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
    }, [isStudent]);

    return (
        <div className="h-[calc(100vh-80px)] w-full bg-slate-950 flex flex-col">
            {/* Header is handled by the page, this is just the room container */}
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                connect={true}
                data-lk-theme="default"
                className="flex-1 flex flex-col"
            >
                <div className="flex-1 relative">
                    <VideoConference />
                    <div className="absolute top-4 right-4 z-10 hidden md:block">
                        {/* Placeholder for Whiteboard if needed later, or small overlay */}
                    </div>
                </div>

                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </div>
    );
}
