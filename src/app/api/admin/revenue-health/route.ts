import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { subDays, differenceInDays } from 'date-fns'

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

        const students = await prisma.users.findMany({
            where: { role: 'LEARNER' },
            include: {
                student_profiles: {
                    include: {
                        sessions: {
                            orderBy: { start_time: 'desc' }
                        }
                    }
                }
            }
        })

        const result = students.map(student => {
            const profile = student.student_profiles
            const sessions = profile?.sessions || []
            const credits = profile?.credits || 0

            // Calculate burn rate over last 30 days
            const thirtyDaysAgo = subDays(new Date(), 30)
            const recentSessions = sessions.filter(s => s.status === 'COMPLETED' && s.start_time >= thirtyDaysAgo)

            const burnRate = recentSessions.length / 30 // sessions per day
            const daysLeft = burnRate > 0 ? Math.floor(credits / burnRate) : 999

            let risk = "🟢 Stable"
            if (daysLeft < 7) risk = "🔴 Critically Low"
            else if (daysLeft < 14) risk = "🟡 Re-up Needed"

            return {
                id: student.id,
                student: student.full_name,
                credits: credits,
                burnRate: parseFloat(burnRate.toFixed(2)),
                daysLeft: daysLeft === 999 ? 'N/A' : daysLeft,
                risk: risk
            }
        })
            .sort((a, b) => {
                if (typeof a.daysLeft === 'number' && typeof b.daysLeft === 'number') return a.daysLeft - b.daysLeft
                return 0
            })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Revenue Health API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
