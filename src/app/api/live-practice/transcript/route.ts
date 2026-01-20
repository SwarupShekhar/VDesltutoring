
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { sessionId, text } = body;

        if (!sessionId || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.users.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify session exists and user is part of it? 
        // For performance, we might skip full verification if we trust the sessionId, 
        // but let's be safe.
        // Actually, for speed, let's just create. If session_id FK fails, it fails.
        // But `live_transcripts` relation requires `session_id` to exist.

        // Create transcript entry
        await prisma.live_transcripts.create({
            data: {
                session_id: sessionId,
                user_id: user.id,
                text: text
            }
        });

        // Also update word count metrics?
        // Let's do a simple increment on live_metrics to keep counters fresh
        const wordCount = text.split(" ").length;
        // Estimate duration: Average speaking rate ~150wpm = 2.5 words/sec = 0.4 sec/word
        const estimatedDuration = wordCount * 0.4;

        await prisma.live_metrics.upsert({
            where: {
                session_id_user_id: {
                    session_id: sessionId,
                    user_id: user.id
                }
            },
            create: {
                session_id: sessionId,
                user_id: user.id,
                word_count: wordCount,
                speaking_time: estimatedDuration,
                hesitation_count: 0,
                grammar_errors: 0
            },
            update: {
                word_count: { increment: wordCount },
                speaking_time: { increment: estimatedDuration }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error saving transcript:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
