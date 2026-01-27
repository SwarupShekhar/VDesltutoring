import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'
import { computeSkillScores } from '@/lib/cefrEngine'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Admin check
        const userRole = await prisma.users.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        })

        const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
        const isOwner = clerkUser?.emailAddresses[0]?.emailAddress === 'swarupshekhar.vaidikedu@gmail.com'

        if (userRole?.role !== 'ADMIN' && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const threeDaysAgo = subDays(new Date(), 3)

        // Fetch all learners with their snapshots and sessions
        const learners = await prisma.users.findMany({
            where: { role: 'LEARNER' },
            select: {
                id: true,
                full_name: true,
                email: true,
                last_login: true,
                fluency_snapshots: {
                    orderBy: { created_at: 'desc' },
                    take: 5
                },
                ai_chat_sessions: {
                    orderBy: { started_at: 'desc' },
                    take: 1
                },
                live_sessions_as_a: {
                    orderBy: { started_at: 'desc' }, // P2P as User A
                    take: 1
                },
                live_sessions_as_b: {
                    orderBy: { started_at: 'desc' }, // P2P as User B
                    take: 1
                },
                user_fluency_profile: {
                    select: { last_updated: true } // Check assessment activity
                }
            }
        })

        const atRisk = learners.map(learner => {
            const snapshots = learner.fluency_snapshots

            // Calculate true last active time from all sources
            const timestamps = [
                learner.last_login,
                learner.ai_chat_sessions?.[0]?.started_at,
                learner.live_sessions_as_a?.[0]?.started_at,
                learner.live_sessions_as_b?.[0]?.started_at,
                // @ts-ignore - user_fluency_profile included in query
                learner.user_fluency_profile?.last_updated
            ].filter(Boolean).map(d => new Date(d!).getTime())

            const lastActive = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null

            let issue = ""
            let riskScore = 0

            // 1. Inactivity check
            if (!lastActive || lastActive < threeDaysAgo) {
                issue = "No practice in 3+ days"
                riskScore += 40
            }

            // 2. Trend check
            if (snapshots.length >= 2) {
                const latest = snapshots[0]
                const previous = snapshots[1]

                if (latest.wpm < previous.wpm * 0.9) {
                    issue = issue ? issue + " & Declining speed" : "Declining speaking speed"
                    riskScore += 30
                }

                if (latest.fillers > previous.fillers * 1.2) {
                    issue = issue ? issue + " & Rising filler rate" : "Rising filler rate"
                    riskScore += 20
                }
            }

            // Compute current CEFR
            const currentProfile = snapshots[0] ? computeSkillScores({
                fluency: (snapshots[0].wpm > 120 ? 1 : snapshots[0].wpm / 120),
                pronunciation: snapshots[0].pronunciation / 100,
                grammar: snapshots[0].grammar_scaffold / 100,
                vocabulary: 0.5
            }) : null

            return {
                id: learner.id,
                name: learner.full_name,
                email: learner.email,
                fluencyTrend: snapshots.length >= 2 ? (snapshots[0].wpm - snapshots[1].wpm) : 0,
                cefr: currentProfile?.overall.cefr || 'N/A',
                lastActive,
                issue,
                riskScore
            }
        })
            .filter(l => l.riskScore > 0)
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 10)

        return NextResponse.json(atRisk)

    } catch (error) {
        console.error('At-Risk Learners API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
