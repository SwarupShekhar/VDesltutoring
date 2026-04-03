import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        let audioBuffer: Buffer;
        let mimeType: string = "audio/webm";

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            // Mobile app sends audio as FormData file upload
            const formData = await request.formData();
            const audioFile = formData.get("audio") as File | null;

            if (!audioFile) {
                return NextResponse.json({ error: "No audio file in form data" }, { status: 400 });
            }

            const arrayBuffer = await audioFile.arrayBuffer();
            audioBuffer = Buffer.from(arrayBuffer);
            mimeType = audioFile.type || formData.get("mimeType")?.toString() || "audio/webm";
            console.log(`[Deepgram API] Received FormData audio: ${audioBuffer.length} bytes, type: ${mimeType}`);
        } else {
            // Web app sends JSON with base64-encoded audio
            let body;
            const rawBody = await request.text();
            try {
                body = JSON.parse(rawBody);
            } catch (jsonErr) {
                console.error(`[Deepgram API] Invalid JSON body: "${rawBody.substring(0, 200)}"`, jsonErr);
                return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
            }

            if (!body.audio) {
                return NextResponse.json({ error: "No audio provided" }, { status: 400 });
            }

            audioBuffer = Buffer.from(body.audio, "base64");
            mimeType = body.mimeType || "audio/webm";
        }

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
                model: "nova-3",
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
