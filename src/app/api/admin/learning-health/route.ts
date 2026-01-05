import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays } from 'date-fns'
import { computeSkillScores } from '@/lib/cefrEngine'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Check if user is ADMIN
        const user = await prisma.users.findUnique({
            where: { clerkId: userId },
            select: { role: true }
        })

        // Check for hardcoded admin as well
        const clerkUser = await (await import('@clerk/nextjs/server')).currentUser()
        const isOwner = clerkUser?.emailAddresses[0]?.emailAddress === 'swarupshekhar.vaidikedu@gmail.com'

        if (user?.role !== 'ADMIN' && !isOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const now = new Date()
        const todayStart = startOfDay(now)
        const sevenDaysAgo = subDays(todayStart, 7)

        // 1. Active learners today
        const activeTodayCount = await prisma.users.count({
            where: {
                role: 'LEARNER',
                OR: [
                    { last_login: { gte: todayStart } },
                    { fluency_snapshots: { some: { created_at: { gte: todayStart } } } },
                    { ai_chat_sessions: { some: { started_at: { gte: todayStart } } } }
                ]
            }
        })

        // 2. Performance Deltas (last 7 days)
        // We need to find students who had snapshots 7 days ago AND today (or recently)
        const students = await prisma.users.findMany({
            where: { role: 'LEARNER' },
            select: {
                id: true,
                fluency_snapshots: {
                    orderBy: { created_at: 'desc' }
                }
            }
        })

        let totalFluencyDelta = 0
        let totalCefrDelta = 0
        let improvingCount = 0
        let decliningCount = 0
        let analyticCount = 0

        students.forEach(student => {
            const snapshots = student.fluency_snapshots
            if (snapshots.length < 2) return

            const latest = snapshots[0]
            // Find snapshot closest to 7 days ago
            const oldSnapshot = snapshots.find(s => s.created_at <= sevenDaysAgo) || snapshots[snapshots.length - 1]

            if (latest.id === oldSnapshot.id) return

            // Map snapshots to metrics for CEFR engine
            const latestProfile = computeSkillScores({
                fluency: (latest.wpm > 120 ? 1 : latest.wpm / 120), // Simple mapping for now
                pronunciation: latest.pronunciation / 100,
                grammar: latest.grammar_scaffold / 100,
                vocabulary: 0.5 // Default if not in snapshot
            })

            const oldProfile = computeSkillScores({
                fluency: (oldSnapshot.wpm > 120 ? 1 : oldSnapshot.wpm / 120),
                pronunciation: oldSnapshot.pronunciation / 100,
                grammar: oldSnapshot.grammar_scaffold / 100,
                vocabulary: 0.5
            })

            const fluencyDelta = latestProfile.fluency.score - oldProfile.fluency.score
            const cefrDelta = latestProfile.overall.score - oldProfile.overall.score

            totalFluencyDelta += fluencyDelta
            totalCefrDelta += cefrDelta
            analyticCount++

            if (fluencyDelta > 0 || cefrDelta > 0) improvingCount++
            if (fluencyDelta < 0 || cefrDelta < 0) decliningCount++
        })

        const avgFluencyChange = analyticCount > 0 ? totalFluencyDelta / analyticCount : 0
        const avgCefrChange = analyticCount > 0 ? totalCefrDelta / analyticCount : 0
        const improvingPercent = students.length > 0 ? (improvingCount / students.length) * 100 : 0
        const decliningPercent = students.length > 0 ? (decliningCount / students.length) * 100 : 0

        return NextResponse.json({
            activeToday: activeTodayCount,
            avgFluencyChange: parseFloat(avgFluencyChange.toFixed(2)),
            avgCefrChange: parseFloat(avgCefrChange.toFixed(2)),
            improvingPercent: parseFloat(improvingPercent.toFixed(1)),
            decliningPercent: parseFloat(decliningPercent.toFixed(1)),
            totalLearners: students.length
        })

    } catch (error) {
        console.error('Learning Health API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
