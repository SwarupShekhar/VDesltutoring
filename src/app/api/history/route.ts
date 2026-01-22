import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Resolve Clerk ID to internal UUID
        const user = await prisma.users.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = user.id;

        // Fetch AI Tutor sessions
        const aiSessions = await prisma.ai_chat_sessions.findMany({
            where: { user_id: userId },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' }
                }
            },
            orderBy: { started_at: 'desc' },
            take: 50
        });

        // Fetch Live Practice sessions
        const liveSessions = await prisma.live_sessions.findMany({
            where: {
                OR: [
                    { user_a: userId },
                    { user_b: userId }
                ],
                status: 'ended'
            },
            include: {
                summaries: {
                    where: { user_id: userId }
                },
                transcripts: {
                    where: { user_id: userId },
                    orderBy: { timestamp: 'asc' },
                    take: 100
                }
            },
            orderBy: { ended_at: 'desc' },
            take: 50
        });

        // Transform AI sessions
        const aiHistory = aiSessions.map(session => ({
            id: session.id,
            type: 'ai_tutor' as const,
            date: session.started_at,
            duration: session.ended_at
                ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
                : 0,
            cefrLevel: null, // cefr_level not in ai_chat_sessions yet
            archetype: null,
            insights: session.feedback_summary,
            patterns: [],
            transcript: session.messages.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp
            }))
        }));

        // Transform Live Practice sessions
        const liveHistory = liveSessions.map(session => {
            const summary = session.summaries[0];
            return {
                id: session.id,
                type: 'live_practice' as const,
                date: session.ended_at || session.started_at,
                duration: session.ended_at && session.started_at
                    ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
                    : 0,
                fluencyScore: summary?.fluency_score || 0,
                confidenceScore: summary?.confidence_score || 0,
                weaknesses: (summary?.weaknesses as string[]) || [],
                drillPlan: (summary?.drill_plan as any[]) || [],
                transcript: session.transcripts.map(t => ({
                    text: t.text,
                    timestamp: t.timestamp
                }))
            };
        });

        // Combine and sort by date
        const allHistory = [...aiHistory, ...liveHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({ history: allHistory });

    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
