
import { NextResponse } from "next/server"
import { createClient } from "@deepgram/sdk"

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

export async function POST(req: Request) {
    try {
        const { text } = await req.json()

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        // Use Deepgram Aura for TTS
        const response = await deepgram.speak.request(
            { text },
            {
                model: "aura-asteria-en", // A nice natural voice
                encoding: "mp3",
            }
        )

        const stream = await response.getStream()

        if (!stream) {
            throw new Error("Error getting stream from Deepgram")
        }

        const buffer = await getBufferFromStream(stream)
        const audioBase64 = buffer.toString("base64")

        return NextResponse.json({ audio: audioBase64 })

    } catch (error) {
        console.error("TTS Error:", error)
        return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
    }
}

// Helper to convert web stream to buffer
async function getBufferFromStream(stream: ReadableStream): Promise<Buffer> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
    }

    return Buffer.concat(chunks)
}
