import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, duration, feedback, scores } = await req.json();

        // Find local user by Clerk ID
        const dbUser = await prisma.users.findUnique({
            where: { clerkId: user.id },
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
                fluency_score: scores?.fluency,
                grammar_score: scores?.grammar,
                vocabulary_score: scores?.vocabulary,
                feedback_summary: feedback,
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

        return NextResponse.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error('Failed to save session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
