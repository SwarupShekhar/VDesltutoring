import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, transcript, wordData, duration } = body;

        if (!sessionId || !transcript) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = user.id;

        // Save Transcript
        await prisma.live_transcripts.create({
            data: {
                session_id: sessionId,
                user_id: userId,
                text: transcript,
                word_data: wordData || [],
                timestamp: new Date()
            }
        });

        // Compute Simple Metrics (same as worker)
        const words = transcript.split(/\s+/).filter((w: string) => w.length > 0);
        const wordCount = words.length;

        const fillerRegex = /\b(um|uh|hmm|like|you know|i mean)\b/gi;
        const fillers = (transcript.match(fillerRegex) || []).length;
        const hesitationCount = fillers;

        // Upsert Live Metrics
        await prisma.live_metrics.upsert({
            where: {
                session_id_user_id: {
                    session_id: sessionId,
                    user_id: userId
                }
            },
            update: {
                word_count: { increment: wordCount },
                filler_count: { increment: fillers },
                hesitation_count: { increment: hesitationCount },
                speaking_time: { increment: duration || (wordCount * 0.4) }
            },
            create: {
                session_id: sessionId,
                user_id: userId,
                word_count: wordCount,
                filler_count: fillers,
                hesitation_count: hesitationCount,
                speaking_time: duration || (wordCount * 0.4)
            }
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Metrics Update Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
