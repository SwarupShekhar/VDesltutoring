
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { geminiService } from "@/lib/gemini-service";
import { PerformanceEngine } from "@/lib/performance-engine";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> } // Params is a Promise in newer Next.js versions
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

        const { sessionId } = await params;

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

        // Fetch transcripts for THIS user only (privacy)
        const transcripts = await prisma.live_transcripts.findMany({
            where: { session_id: sessionId, user_id: user.id },
            orderBy: { timestamp: "asc" }
        });

        const transcriptText = transcripts.map(t => t.text).join(" ").trim();

        // Gemini feedback (best-effort; do not block base report)
        // 1. Try to use persisted feedback from Async Worker (Fastest)
        // @ts-ignore - ai_feedback exists in DB but TS might lag
        let aiReport: any = summary.ai_feedback;

        if (!aiReport) {
            // 2. Fallback: Generate on-the-fly if missing (Slower)
            try {
                // Only call Gemini if we have meaningful speech
                if (transcriptText.split(/\s+/).filter(Boolean).length >= 10) {
                    console.log(`[Report] Generating fallback AI report for session ${sessionId}`);
                    aiReport = await geminiService.generateReport(transcriptText);
                }
            } catch (e) {
                console.error("Gemini report generation failed:", e);
                aiReport = null;
            }
        }

        // Prepare Response
        const metrics = summary.session.metrics[0] || {};

        let coachingFeedback = summary.coaching_feedback;
        let performanceAnalytics = summary.performance_analytics;
        let transcriptFull = summary.transcript_full;

        // 3. Fallback: Generate Performance Intelligence on-the-fly if missing
        if (!coachingFeedback || !performanceAnalytics) {
            try {
                if (transcripts.length > 0) {
                    const transcriptSegments = transcripts.map(t => ({
                        text: t.text,
                        timestamp: t.timestamp,
                        userId: t.user_id,
                        wordData: t.word_data
                    }));

                    const analytics = PerformanceEngine.analyze(
                        transcriptSegments,
                        {
                            speakingTime: metrics.speaking_time || 0,
                            wordCount: metrics.word_count || 0,
                            fillerCount: metrics.filler_count || 0,
                            grammarErrors: metrics.grammar_errors || 0,
                            speechRate: metrics.speech_rate || 0
                        },
                        (summary.session.ended_at ?
                            (new Date(summary.session.ended_at).getTime() - new Date(summary.session.started_at).getTime()) / 1000 :
                            60) || 60
                    );

                    performanceAnalytics = analytics;
                    coachingFeedback = PerformanceEngine.generateCoachingFeedback(
                        analytics,
                        [], // corrections
                        transcriptSegments
                    );

                    console.log(`[Report API] Generated on-the-fly coaching feedback for session ${sessionId}`);
                }
            } catch (e) {
                console.error("[Report API] Failed to generate on-the-fly coaching feedback:", e);
            }
        }

        return NextResponse.json({
            sessionId: sessionId,
            fluencyScore: summary.fluency_score,
            confidenceScore: summary.confidence_score,
            weaknesses: summary.weaknesses,
            drillPlan: summary.drill_plan,
            coachingFeedback: coachingFeedback,
            performanceAnalytics: performanceAnalytics,
            transcriptFull: transcriptFull,
            metrics: {
                speakingTime: metrics.speaking_time,
                wordCount: metrics.word_count,
                fillers: metrics.filler_count,
                speed: metrics.speech_rate,
                grammarErrors: metrics.grammar_errors
            },
            aiReport,
            date: summary.created_at
        });

    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
