
import { NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Initialize Google Cloud TTS Client
// Automatically uses GOOGLE_APPLICATION_CREDENTIALS from env
const googleClient = new TextToSpeechClient();

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        // Strip emojis
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

        let audioBase64: string;

        try {
            // 1. Try ElevenLabs
            console.log("[TTS] Attempting ElevenLabs...");
            audioBase64 = await elevenLabsTTS(cleanText);
            console.log("[TTS] ElevenLabs success.");
        } catch (elevenError) {
            // 2. Fallback to Google Cloud TTS
            console.error("[TTS] ElevenLabs failed:", elevenError);
            console.log("[TTS] Falling back to Google Cloud TTS...");

            try {
                audioBase64 = await googleTTS(cleanText);
                console.log("[TTS] Google Cloud TTS success.");
            } catch (googleError) {
                console.error("[TTS] Google Cloud TTS failed:", googleError);
                throw new Error("All TTS providers failed.");
            }
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

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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

// --- Google Cloud TTS Helper ---
async function googleTTS(text: string): Promise<string> {
    const request = {
        input: { text },
        // Warmer voices:
        // "en-US-Neural2-F" - Female, neutral (original)
        // "en-US-Neural2-H" - Female, warm and friendly
        // "en-US-Journey-F" - Female, conversational and expressive
        voice: {
            languageCode: "en-US",
            name: "en-US-Journey-F" // Most natural, conversational voice
        },
        audioConfig: {
            audioEncoding: "MP3" as const,
            pitch: 2.0,              // Slightly higher pitch = friendlier
            speakingRate: 1.0        // Normal speed
        },
    };

    const [response] = await googleClient.synthesizeSpeech(request);

    if (!response.audioContent) {
        throw new Error("Google Cloud TTS returned empty audio content.");
    }

    return Buffer.from(response.audioContent).toString("base64");
}
