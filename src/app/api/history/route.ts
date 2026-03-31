import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        // Transform AI sessions
        const aiHistory = aiSessions.map(session => {
            let reportData = null;
            try {
                reportData = session.feedback_summary ? JSON.parse(session.feedback_summary) : null;
            } catch (e) {
                console.warn(`Failed to parse feedback_summary for session ${session.id}`);
            }

            return {
                id: session.id,
                type: 'ai_tutor' as const,
                date: session.started_at,
                duration: session.ended_at
                    ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
                    : 0,
                cefrLevel: reportData?.cefr_analysis?.level || 'N/A',
                archetype: reportData?.identity?.archetype || 'N/A',
                insights: reportData,
                patterns: reportData?.patterns || [],
                transcript: session.messages.map(m => ({
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp
                }))
            };
        });

        return NextResponse.json({ history: aiHistory });

    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
