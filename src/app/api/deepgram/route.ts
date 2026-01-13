import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { audio, mimeType } = await request.json();

        if (!audio) {
            return NextResponse.json({ error: "No audio provided" }, { status: 400 });
        }

        // Convert Base64 to Buffer
        const audioBuffer = Buffer.from(audio, "base64");

        // 🛡️ Guard: Ignore very short audio (Silence / Glitch)
        // 1KB is roughly 0.2-0.5s of audio depending on compression. 
        // Deepgram often hallucinates "Hello?" on empty/short buffers.
        if (audioBuffer.length < 1000) {
            console.log(`[Deepgram API] Ignored short audio chunk (${audioBuffer.length} bytes)`);
            return NextResponse.json({ transcript: "" });
        }

        const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                mimetype: mimeType || "audio/webm",
                model: "nova-2",
                language: "en-US",
                smart_format: true,
                punctuate: true,
                utterance_end_ms: 1000
            }
        );

        if (error) {
            console.error("Deepgram API Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || "";

        // Log for debugging
        if (transcript.trim()) {
            console.log(`[Deepgram API] Transcript: "${transcript}"`);
        }

        return NextResponse.json({
            transcript,
            result // Pass full result for fluency analysis if needed
        });

    } catch (err) {
        console.error("Deepgram Endpoint Fatal Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
