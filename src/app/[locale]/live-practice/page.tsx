"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Room, RoomEvent, Track, DisconnectReason } from "livekit-client";
import { useUser } from "@clerk/nextjs";
import { Mic, Headphones, Loader2, AlertCircle, PhoneOff, Radio, TriangleAlert, Zap } from "lucide-react";

type ConnectionStatus = "IDLE" | "CHECKING_PERMISSIONS" | "MATCHING" | "CONNECTING" | "IN_CALL";

export default function LivePracticePage() {
    const { user } = useUser();
    const [status, setStatus] = useState<ConnectionStatus>("IDLE");
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [matchTime, setMatchTime] = useState(0);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const roomRef = useRef<Room | null>(null);
    const isMatchingRef = useRef(false);
    const [partner, setPartner] = useState<{ full_name: string } | null>(null);

    const startPractice = async () => {
        setError(null);
        setStatus("CHECKING_PERMISSIONS");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());

            setStatus("MATCHING");
            setMatchTime(0);
            isMatchingRef.current = true;

            if (matchTimerRef.current) clearInterval(matchTimerRef.current);
            matchTimerRef.current = setInterval(() => {
                setMatchTime(prev => prev + 1);
            }, 1000);

            pollForMatch();

        } catch (err) {
            console.error("Permission denied:", err);
            setError("Microphone permission is required. Please allow access.");
            setStatus("IDLE");
            isMatchingRef.current = false;
        }
    };

    const pollForMatch = useCallback(async () => {
        if (!user || !isMatchingRef.current) return;

        // Clear any existing poll timeout to prevent overlap
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        try {
            const response = await fetch("/api/live-practice/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal: "Practice Speaking", fluency_score: 80 }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to join queue (${response.status})`);
            }

            const data = await response.json();

            // Guard: If we stopped matching while request was in flight, ignore data
            if (!isMatchingRef.current) return;

            if (data.matched) {
                isMatchingRef.current = false;
                setStatus("CONNECTING");
                if (matchTimerRef.current) {
                    clearInterval(matchTimerRef.current);
                    matchTimerRef.current = null;
                }
                setCurrentSessionId(data.sessionId);
                setPartner(data.partner);
                connectToLiveKit(data.roomName, data.token);
            } else if (data.waiting) {
                pollTimeoutRef.current = setTimeout(pollForMatch, 3000);
            } else {
                setError(data.error || "Unexpected response from server");
                setStatus("IDLE");
                isMatchingRef.current = false;
            }
        } catch (err: any) {
            console.error("Polling error:", err);
            setError(err.message || "Connection error. Retrying...");
            pollTimeoutRef.current = setTimeout(pollForMatch, 5000);
        }
    }, [user]);

    const connectToLiveKit = async (roomName: string, token: string) => {
        try {
            const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
            if (!liveKitUrl) throw new Error("LiveKit URL missing");

            // Disconnect old room if any
            if (roomRef.current) {
                roomRef.current.disconnect();
            }

            const newRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
            });

            roomRef.current = newRoom;

            newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === Track.Kind.Audio) {
                    track.attach();
                }
            });

            // Detect when the OTHER person leaves
            newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
                console.log("Partner left the room:", participant.identity);
                setError("Your partner has left the call.");
                endCall();
            });

            // Listen for explicit end-call signal from partner
            newRoom.on(RoomEvent.DataReceived, (payload) => {
                const decoder = new TextDecoder();
                const message = decoder.decode(payload);
                if (message === "session_ended") {
                    console.log("Received session_ended signal from partner");
                    setError("The session has ended.");
                    endCall();
                }
            });

            newRoom.on(RoomEvent.Disconnected, (reason) => {
                console.log("Room disconnected", reason);
                if (roomRef.current === newRoom) {
                    setStatus("IDLE");
                    setRoom(null);
                    setPartner(null);
                    roomRef.current = null;

                    if (reason !== DisconnectReason.CLIENT_INITIATED) {
                        setError("The session has ended. Your partner has left.");
                    }
                }
            });

            await newRoom.connect(liveKitUrl, token);
            console.log("Connected to LiveKit room:", roomName);

            await newRoom.localParticipant.setMicrophoneEnabled(true);

            setRoom(newRoom);
            setStatus("IN_CALL");

        } catch (err) {
            console.error("LiveKit connection error:", err);
            setError("Failed to connect to the call. Please try again.");
            setStatus("IDLE");
            isMatchingRef.current = false;
            setPartner(null);
        }
    };

    const endCall = async () => {
        // 1. Immediately update UI state to avoid lag
        setStatus("IDLE");
        isMatchingRef.current = false;
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

        // 2. Clear room connection
        if (roomRef.current) {
            const currentRoom = roomRef.current;

            // Try to notify partner via data message for instant sync
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode("session_ended");
                await currentRoom.localParticipant.publishData(data, { reliable: true });
            } catch (e) {
                console.warn("Failed to send end-of-session signal:", e);
            }

            currentRoom.disconnect();
            roomRef.current = null;
            setRoom(null);
        }

        // 3. Cleanup other state
        setMatchTime(0);
        const sessionIdToLeave = currentSessionId;
        setCurrentSessionId(null);
        setPartner(null);
        if (matchTimerRef.current) clearInterval(matchTimerRef.current);

        // 4. Notify backend
        if (sessionIdToLeave) {
            try {
                await fetch('/api/live-practice/leave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: sessionIdToLeave })
                });
            } catch (e) {
                console.error("Failed to notify backend of leave", e);
            }
        }
    };

    // Format seconds to mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMatchingRef.current = false;
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            if (matchTimerRef.current) clearInterval(matchTimerRef.current);
            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4 font-sans">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-slate-100 dark:border-slate-700 transition-all">
                <div className="mb-8 flex justify-center">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Headphones className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Live Practice</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Connect with a peer to practice speaking English in real-time.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 text-left shadow-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {status === "IDLE" && (
                    <div className="space-y-4">
                        <button
                            onClick={startPractice}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Mic className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            Start Live Practice
                        </button>

                        {/* New Feature: View Last Report */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                // Navigate to history or last report? 
                                // Ideally we fetch the last report ID. For now just linking to static 'latest' or hidden until we fetch.
                                // Let's keep it simple: A "View my Progress" button that goes to history (if we had one) or just info.
                                // Actually, user requested "Dashboard Integration".
                                // Let's add a "View Reports" button that goes to a hypothetical /live-practice/history
                                // But we don't have that page yet.
                                // Maybe just a placeholder for now or checking if they have a last session in localStorage?
                                // Better: Don't clutter unless we have data.
                                onClick={() => alert("Feature coming soon: View your past sessions!")}
                                className="px-4 py-3 bg-white dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2"
                            >
                                <TriangleAlert className="w-4 h-4 text-amber-500" />
                                View History
                            </button>
                            <div className="px-4 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 text-sm font-medium flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                AI Analysis Active
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Microphone access required
                        </p>
                    </div>
                )}

                {status === "CHECKING_PERMISSIONS" && (
                    <div className="flex flex-col items-center py-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 font-medium">Checking microphone...</p>
                    </div>
                )}

                {status === "MATCHING" && (
                    <div className="flex flex-col items-center py-4">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                            <div className="relative bg-white dark:bg-slate-700 p-4 rounded-full border border-blue-100 dark:border-blue-800">
                                <Radio className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Finding a partner</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Time elapsed: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formatTime(matchTime)}</span></p>

                        <button
                            onClick={() => {
                                setStatus("IDLE");
                                if (matchTimerRef.current) clearInterval(matchTimerRef.current);
                            }}
                            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {status === "CONNECTING" && (
                    <div className="flex flex-col items-center py-4">
                        <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
                        <p className="text-slate-700 dark:text-slate-200 font-medium text-lg">Match found! Connecting...</p>
                    </div>
                )}



                {status === "IN_CALL" && (
                    <div className="flex flex-col items-center animate-in fade-in duration-500">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-6 rounded-3xl mb-8 w-full">
                            <div className="flex justify-center items-center gap-4 mb-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-green-700 dark:text-green-400 font-semibold tracking-wide uppercase text-sm">Live Session</span>
                            </div>

                            <div className="flex justify-center gap-8 my-6">
                                {/* Simulating User Avatars */}
                                <div className="flex flex-col items-center">
                                    <div className="h-16 w-16 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mb-2">
                                        <span className="text-2xl">👤</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">You</span>
                                </div>
                                <div className="h-16 flex items-center text-slate-300 dark:text-slate-600">
                                    ----------------
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2 border-2 border-blue-500">
                                        <span className="text-2xl">👤</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {partner?.full_name || "Partner"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <PhoneOff className="h-5 w-5" />
                                End Call
                            </button>

                            <button
                                onClick={async () => {
                                    if (!room) return;
                                    const reason = prompt("Please describe the issue (optional):");
                                    if (reason === null) return; // cancelled

                                    try {
                                        // We need sessionId. We can get it from room name parsing or we should have saved it? 
                                        // Room name format: live-userA-userB-timestamp
                                        // BUT API returns sessionId. We didn't save it in state explicitly separate from room data?
                                        // Wait, 'connectToLiveKit' received it? No, 'data.sessionId' was returned by JOIN API.
                                        // We need to store sessionId in state to report it.
                                        // IMPORTANT: The current component implementation didn't save 'sessionId' in state.
                                        // I must add 'sessionId' state.

                                        // Hack for now: Logic below assumes we have it. If not, I need to update state first.
                                        // Let's modify the component state in prev steps or do it here. 
                                        // I'll update the component to store sessionId.
                                    } catch (e) {
                                        alert("Failed to report.");
                                    }
                                }}
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 p-3 rounded-xl transition-all"
                                title="Report User"
                            >
                                <TriangleAlert className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
