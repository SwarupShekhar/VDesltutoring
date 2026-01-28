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
    const [callTime, setCallTime] = useState(0);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [lastReportSessionId, setLastReportSessionId] = useState<string | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [reportDebug, setReportDebug] = useState<string | null>(null);

    const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const roomRef = useRef<Room | null>(null);
    const isMatchingRef = useRef(false);
    const [partner, setPartner] = useState<{ full_name: string } | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const fetchReportWithRetry = useCallback(async (sessionId: string) => {
        setIsLoadingReport(true);
        setReport(null);
        setReportDebug(null);
        setLastReportSessionId(sessionId);

        // Initial delay: Give FluencyEngine time to process the session summary
        await new Promise(resolve => setTimeout(resolve, 2000));

        const maxAttempts = 10; // ~25-30s worst case
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const res = await fetch(`/api/live-practice/report/${sessionId}`, { method: "GET" });
                if (res.ok) {
                    const data = await res.json();
                    setReport(data);
                    setIsLoadingReport(false);
                    setReportDebug(null);
                    return;
                } else {
                    const data = await res.json().catch(() => ({}));
                    setReportDebug(
                        `Report attempt ${attempt + 1}/${maxAttempts} failed: ` +
                        `status ${res.status}${data.error ? ` – ${data.error}` : ""}`
                    );
                }
            } catch (e: any) {
                setReportDebug(
                    `Report attempt ${attempt + 1}/${maxAttempts} network error: ${e?.message || "unknown error"}`
                );
            }

            // Backoff: 2.5s between polls
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        setIsLoadingReport(false);
        setError("Your feedback is still being prepared. Please check again in a moment.");
    }, []);

    const startPractice = async () => {
        setError(null);
        setReport(null);
        setLastReportSessionId(null);
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

            // Start Call Timer
            setCallTime(0);
            if (callTimerRef.current) clearInterval(callTimerRef.current);
            callTimerRef.current = setInterval(() => {
                setCallTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("LiveKit connection error:", err);
            setError("Failed to connect to the call. Please try again.");
            setStatus("IDLE");
            isMatchingRef.current = false;
            setPartner(null);
        }
    };

    const toggleMute = async () => {
        if (!roomRef.current) return;
        try {
            const current = isMuted;
            await roomRef.current.localParticipant.setMicrophoneEnabled(current); // Logic inverted: if muted(true), set enabled(true)
            setIsMuted(!current);
        } catch (e) {
            console.error("Failed to toggle mute", e);
        }
    };

    const endCall = async () => {
        // 1. Immediately update UI state to avoid lag
        setStatus("IDLE");
        isMatchingRef.current = false;
        setIsMuted(false);
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
        setCallTime(0);
        const sessionIdToLeave = currentSessionId;
        setCurrentSessionId(null);
        setPartner(null);
        if (matchTimerRef.current) clearInterval(matchTimerRef.current);
        if (callTimerRef.current) clearInterval(callTimerRef.current);

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

            // 5. Fetch end-of-call feedback for THIS user
            fetchReportWithRetry(sessionIdToLeave);
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
            if (callTimerRef.current) clearInterval(callTimerRef.current);
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

                        {(isLoadingReport || report || reportDebug) && (
                            <div className="mt-6 text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your end-of-call feedback</p>
                                    {isLoadingReport && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Preparing…
                                        </div>
                                    )}
                                </div>

                                {report && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-lg bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Fluency</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">{report.fluencyScore}</p>
                                            </div>
                                            <div className="rounded-lg bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">{report.confidenceScore}</p>
                                            </div>
                                        </div>

                                        {report.aiReport?.insights && (
                                            <div className="rounded-lg bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">What the AI noticed</p>
                                                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                                    <p><span className="font-medium">Fluency:</span> {report.aiReport.insights.fluency}</p>
                                                    <p><span className="font-medium">Grammar:</span> {report.aiReport.insights.grammar}</p>
                                                    <p><span className="font-medium">Vocabulary:</span> {report.aiReport.insights.vocabulary}</p>
                                                </div>
                                            </div>
                                        )}

                                        {Array.isArray(report.aiReport?.refinements) && report.aiReport.refinements.length > 0 && (
                                            <div className="rounded-lg bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">A few helpful refinements</p>
                                                <div className="space-y-2">
                                                    {report.aiReport.refinements.slice(0, 3).map((r: any, idx: number) => (
                                                        <div key={idx} className="text-sm">
                                                            <p className="text-slate-500 dark:text-slate-400">You said: <span className="text-slate-700 dark:text-slate-200">{r.original}</span></p>
                                                            <p className="text-slate-500 dark:text-slate-400">More natural: <span className="text-slate-800 dark:text-white font-medium">{r.better}</span></p>
                                                            <p className="text-slate-500 dark:text-slate-400">{r.explanation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {report.aiReport?.next_step && (
                                            <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-300">
                                                <span className="font-semibold">Next step:</span> {report.aiReport.next_step}
                                            </div>
                                        )}

                                        {lastReportSessionId && (
                                            <button
                                                onClick={() => fetchReportWithRetry(lastReportSessionId)}
                                                className="w-full mt-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Refresh feedback
                                            </button>
                                        )}
                                    </div>
                                )}

                                {!isLoadingReport && !report && reportDebug && (
                                    <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                                        <p className="text-xs font-mono text-amber-800 dark:text-amber-200">
                                            Technical detail: {reportDebug}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New Feature: View Last Report */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={() => window.location.href = '/en/history'}
                                className="px-4 py-3 bg-white dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2"
                            >
                                📊 View History
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
                    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col items-center justify-between p-6 animate-in fade-in duration-300">
                        {/* Top Bar */}
                        <div className="w-full flex justify-between items-center max-w-lg mt-8">
                            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <span className="text-green-700 dark:text-green-300 text-xs font-bold tracking-wide uppercase">Live</span>
                            </div>
                            <div className="text-slate-400 text-sm font-mono">
                                {formatTime(callTime)}
                            </div>
                        </div>

                        {/* Main Visuals */}
                        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg gap-12">
                            {/* Partner Profile */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-slate-800">
                                        <span className="text-5xl">👤</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg">
                                        <div className="h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                                        {partner?.full_name || "Partner"}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Speaking English</p>
                                </div>
                            </div>

                            {/* Connection Line */}
                            <div className="w-px h-16 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800"></div>

                            {/* User Profile (Smaller) */}
                            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full opacity-60">
                                <div className="h-8 w-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm">You</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Listening...</span>
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="w-full max-w-md mb-8">
                            <div className="flex items-center justify-center gap-6 bg-white dark:bg-slate-800 px-8 py-5 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={toggleMute}
                                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 ${isMuted
                                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                                        : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-600"
                                        }`}
                                >
                                    {isMuted ? <Mic className="h-6 w-6 opacity-40" /> : <Mic className="h-6 w-6" />}
                                </button>

                                <button
                                    onClick={endCall}
                                    className="h-16 w-32 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                >
                                    <PhoneOff className="h-8 w-8" />
                                </button>

                                <button
                                    onClick={() => {
                                        const reason = prompt("Report user reason:");
                                        if (reason) alert("Report submitted.");
                                    }}
                                    className="h-14 w-14 rounded-full bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition-colors flex items-center justify-center"
                                >
                                    <TriangleAlert className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
