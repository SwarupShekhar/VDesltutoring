
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get DB User ID
        const user = await prisma.users.findUnique({
            where: { clerkId },
            select: { id: true, full_name: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const sessionId = params.sessionId;

        // Fetch Summary & Metrics
        const summary = await prisma.live_session_summary.findUnique({
            where: {
                session_id_user_id: {
                    session_id: sessionId,
                    user_id: user.id
                }
            },
            include: {
                session: {
                    include: {
                        metrics: {
                            where: { user_id: user.id },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!summary) {
            // Maybe session just ended and worker hasn't processed it yet?
            // Or session doesn't exist.
            // We can try to trigger processing explicitly if missing? No, user should wait.
            return NextResponse.json({ error: "Report not ready or not found" }, { status: 404 });
        }

        // Prepare Response
        const metrics = summary.session.metrics[0] || {};

        return NextResponse.json({
            sessionId: sessionId,
            fluencyScore: summary.fluency_score,
            confidenceScore: summary.confidence_score,
            weaknesses: summary.weaknesses,
            drillPlan: summary.drill_plan,
            metrics: {
                speakingTime: metrics.speaking_time,
                wordCount: metrics.word_count,
                fillers: metrics.filler_count,
                speed: metrics.speech_rate,
                grammarErrors: metrics.grammar_errors
            },
            date: summary.created_at
        });

    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
