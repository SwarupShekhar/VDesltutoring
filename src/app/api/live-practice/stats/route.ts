import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Count users waiting in the queue
        const waitingCount = await prisma.live_queue.count();

        // 2. Count active live sessions (status = 'live')
        const activeSessionsCount = await prisma.live_sessions.count({
            where: {
                status: 'live',
            },
        });

        // Total active users = Waiting users + (2 users per active session)
        const totalActiveUsers = waitingCount + (activeSessionsCount * 2);

        return NextResponse.json({ activeCount: totalActiveUsers });
    } catch (error) {
        console.error('[API] Failed to fetch live stats:', error);
        return NextResponse.json({ activeCount: 0 }, { status: 500 });
    }
}
