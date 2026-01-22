
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        // Strip emojis AND Markdown syntax (*, **, _, ~, etc)
        // We want to remove the symbols but keep the text inside.
        // e.g. "**flow**" -> "flow"
        const cleanText = text
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove Emojis
            .replace(/[*_~`]/g, ''); // Remove Markdown symbols

        let audioBase64: string;

        try {
            // 1. Google Cloud TTS (Primary as per user request)
            // console.log("[TTS] Attempting ElevenLabs...");
            // audioBase64 = await elevenLabsTTS(cleanText);
            // console.log("[TTS] ElevenLabs success.");

            console.log("[TTS] Using Google Cloud TTS...");
            audioBase64 = await googleTTS(cleanText);
            console.log("[TTS] Google Cloud TTS success.");

        } catch (error) {
            console.error("[TTS] Google Cloud TTS failed:", error);
            throw new Error("TTS Provider failed.");
        }

        return NextResponse.json({ audio: audioBase64 });

    } catch (error) {
        console.error("TTS Fatal Error:", error);
        return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
    }
}

// --- ElevenLabs Helper ---
async function elevenLabsTTS(text: string): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");

    // Warmer, more natural voices:
    // "EXAVITQu4vr4xnSDxMaL" - Sarah (warm, friendly female)
    // "pNInz6obpgDQGcFmaJgB" - Adam (warm, conversational male)
    // "21m00Tcm4TlvDq8ikWAM" - Rachel (neutral female - original)
    const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah - warm and friendly
    const modelId = "eleven_turbo_v2_5"; // Faster, more natural model

    // optimize_streaming_latency=3 (Enable optimizations for lower latency)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
        },
        body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
                stability: 0.4,           // Lower = more expressive (was 0.5)
                similarity_boost: 0.8,    // Higher = more natural (was 0.75)
                style: 0.3,               // Adds warmth and emotion
                use_speaker_boost: true   // Enhances clarity and warmth
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
}

// --- Google Cloud TTS Helper (REST API) ---
// Switched to REST API to support simple API Key usage
async function googleTTS(text: string): Promise<string> {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
        console.error("[TTS] Missing GOOGLE_TTS_API_KEY environment variable");
        throw new Error("Missing GOOGLE_TTS_API_KEY");
    }

    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    console.log(`[TTS] Calling Google TTS API... Text length: ${text.length}`);

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            input: { text },
            voice: {
                languageCode: "en-US",
                name: "en-US-Journey-F" // Most natural, conversational voice
            },
            audioConfig: {
                audioEncoding: "MP3",
                pitch: 0.0,              // Reset to 0 (2.0 was likely too high/chipmunk)
                speakingRate: 1.0
            }
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[TTS] Google API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Google TTS API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.audioContent;
}
