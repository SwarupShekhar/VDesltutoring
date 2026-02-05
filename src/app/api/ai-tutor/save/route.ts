
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, duration, report } = await req.json();

        // Find local user by Clerk ID
        const dbUser = await prisma.users.findUnique({
            where: { clerkId: clerkId },
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create Session
        const session = await prisma.ai_chat_sessions.create({
            data: {
                user_id: dbUser.id,
                started_at: new Date(Date.now() - (duration || 0) * 1000), // Approximate start time
                ended_at: new Date(),
                // We no longer track numeric scores, but keeping columns for legacy data
                fluency_score: null,
                grammar_score: null,
                vocabulary_score: null,
                // Store the full qualitative report
                feedback_summary: JSON.stringify(report),
                messages: {
                    create: messages.map((m: any) => ({
                        role: m.role,
                        content: m.content,
                        timestamp: new Date(), // or m.timestamp if available
                    })),
                },
            },
            include: {
                messages: true,
            },
        });

        // Update Coach Memory with latest insights
        const analysis = report.insights || {}
        const weakness = analysis.weakest_skill || 'general fluency'
        const focus = analysis.recommended_focus || 'speaking confidence'

        await prisma.users.update({
            where: { id: dbUser.id },
            data: {
                coach_memory: {
                    lastSessionDate: new Date(),
                    lastWeakness: weakness,
                    focusSkill: focus,
                    lastSessionSummary: report.summary || `Worked on ${focus}`,
                    lastImprovement: report.progress || "Completed a session"
                }
            } as any
        });

        // UPDATE DASHBOARD PROFILE (The Fix)
        try {
            const { updateUserFluencyProfile } = await import('@/lib/assessment/updateUserFluencyProfile');

            // Calculate proxy metrics since AI sessions don't always give raw scores
            // 1 message ~ 15 words
            const estimatedWords = messages.filter((m: any) => m.role === 'user').length * 15;

            // Derive score from report if available, else standard estimation
            let score = 50; // Default B1
            if (report?.cefr_analysis?.level) {
                const map: Record<string, number> = { 'A1': 20, 'A2': 35, 'B1': 50, 'B2': 65, 'C1': 80, 'C2': 95 };
                score = map[report.cefr_analysis.level] || 50;
            }

            await updateUserFluencyProfile(dbUser.id, {
                fluency_score: score,
                word_count: estimatedWords,
                speaking_time_seconds: duration || (estimatedWords * 0.5),
                session_type: 'AI_TUTOR'
            });
        } catch (e) {
            console.error("Failed to update fluency profile:", e);
        }

        return NextResponse.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error('Failed to save session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
