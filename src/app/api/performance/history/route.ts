import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/performance/history
 * 
 * Fetches aggregated performance data for historical trending analysis
 * Used for: Streak tracking, trending charts, improvement detection
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');

        // Fetch last N sessions with performance analytics
        const sessions = await prisma.live_session_summary.findMany({
            where: {
                user_id: userId,
                performance_analytics: {
                    not: null
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            select: {
                id: true,
                session_id: true,
                created_at: true,
                performance_analytics: true,
                session: {
                    select: {
                        started_at: true
                    }
                }
            }
        });

        // Transform data for frontend
        const historyData = sessions.map((session: any) => {
            const analytics = session.performance_analytics as any;

            return {
                sessionId: session.session_id,
                date: session.session.started_at.toISOString().split('T')[0],
                timestamp: session.session.started_at,
                primaryLimiter: analytics?.primaryLimiter || null,
                scores: {
                    cognitiveReflex: analytics?.cognitiveReflex?.score || 0,
                    speechRhythm: analytics?.speechRhythm?.score || 0,
                    languageMaturity: analytics?.languageMaturity?.score || 0,
                    socialPresence: analytics?.socialPresence?.score || 0,
                    pressureStability: analytics?.pressureStability?.score || 0
                }
            };
        }).reverse(); // Oldest first for chronological display

        // Detect improvement streak
        const streak = detectStreak(historyData);

        return NextResponse.json({
            sessions: historyData,
            streak
        });

    } catch (error) {
        console.error('[Performance History API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch performance history' },
            { status: 500 }
        );
    }
}

/**
 * Detects if user has an improvement streak (3+ consecutive sessions)
 */
function detectStreak(sessions: any[]): {
    count: number;
    improving: boolean;
    system: string | null;
} {
    if (sessions.length < 3) {
        return { count: 0, improving: false, system: null };
    }

    // Check if the same primary limiter is improving over last 3-5 sessions
    const recentSessions = sessions.slice(-5); // Last 5 sessions
    const limiterSystem = recentSessions[recentSessions.length - 1]?.primaryLimiter?.system;

    if (!limiterSystem) {
        return { count: 0, improving: false, system: null };
    }

    // Check if this system's score is consistently improving
    let consecutiveImprovements = 0;
    for (let i = recentSessions.length - 1; i > 0; i--) {
        const current = recentSessions[i]?.scores?.[limiterSystem] || 0;
        const previous = recentSessions[i - 1]?.scores?.[limiterSystem] || 0;

        if (current > previous) {
            consecutiveImprovements++;
        } else {
            break;
        }
    }

    const hasStreak = consecutiveImprovements >= 2; // 3+ sessions improving

    return {
        count: hasStreak ? consecutiveImprovements + 1 : 0,
        improving: hasStreak,
        system: hasStreak ? limiterSystem : null
    };
}
