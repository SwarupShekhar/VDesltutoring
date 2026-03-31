import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/performance/history
 *
 * Returns performance trending data.
 * Previously sourced from live_session_summary (P2P sessions, now removed).
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            sessions: [],
            streak: { count: 0, improving: false, system: null }
        });

    } catch (error) {
        console.error('[Performance History API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch performance history' },
            { status: 500 }
        );
    }
}
