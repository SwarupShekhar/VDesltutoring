import { NextResponse } from "next/server"
import { createClient } from "@deepgram/sdk"

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

export async function POST(req: Request) {
    try {
        if (!DEEPGRAM_API_KEY) {
            console.error("Deepgram API Key is missing")
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
        }

        const deepgram = createClient(DEEPGRAM_API_KEY)
        const { audio, mimeType } = await req.json()

        const { result } = await deepgram.listen.prerecorded.transcribeFile(
            Buffer.from(audio, "base64"),
            {
                mimetype: mimeType || "audio/webm",
                punctuate: true,
                model: "nova-2",
                language: "en-US",
            }
        )

        console.log("DG Response:", JSON.stringify(result, null, 2))

        const transcript =
            result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""

        return NextResponse.json({
            transcript,
            result // Include full result for downstream timing/confidence analysis
        })
    } catch (err) {
        console.error("Deepgram error", err)
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
    }
}
