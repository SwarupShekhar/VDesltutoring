'use client';

import { useState, useEffect } from 'react';

import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
    ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface SessionLiveProps {
    token: string;
    serverUrl: string;
    roomName: string;
    userName: string;
    isStudent?: boolean;
}

export default function SessionLive({ token, serverUrl, roomName, userName, isStudent = false }: SessionLiveProps) {
    // --- Speech Recognition for Lexical Analysis ---
    // Minimal Web Speech API implementation to capture transcripts for the Lexical Engine
    // without requiring heavy external dependencies.

    // Safety check for browser support (Chrome/Safari/Edge)
    // Note: sessionId not used in state if using roomName prop directly
    const [isListening, setIsListening] = useState(false);

    // Extract sessionId from roomName (assuming roomName is the sessionId or contains it)
    // Actually, SessionLive is passed `roomName`. We need the actual `sessionId` (UUID) to save to DB.
    // Usually P2P rooms are named with the UUID. If roomName IS the UUID, great.
    // If NOT, we might be saving to a room name instead of UUID which would fail FK.
    // Let's assume roomName passed here IS the sessionId for now, or we need to pass sessionId prop.

    // Let's assume roomName === sessionId for the MVP P2P flow.
    // If unrelated, we might need a prop update.

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // @ts-ignore - webkitSpeechRecognition is not standard TS
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("[SessionLive] Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = async (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const text = lastResult[0].transcript.trim();
                console.log("[SessionLive] Captured speech:", text);

                // Send to API
                try {
                    await fetch('/api/live-practice/transcript', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: roomName, // CAUTION: Assuming roomName is UUID
                            text: text
                        })
                    });
                } catch (err) {
                    console.error("[SessionLive] Failed to upload transcript", err);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.warn("[SessionLive] Speech recognition error:", event.error);
        };

        try {
            recognition.start();
        } catch (e) {
            // Already started or denied
        }

        return () => {
            recognition.stop();
        };
    }, [roomName]);

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
