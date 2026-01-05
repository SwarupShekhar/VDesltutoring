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

        // Fetch tutors and their associated sessions/students
        const tutors = await prisma.users.findMany({
            where: { role: 'TUTOR' },
            select: {
                id: true,
                full_name: true,
                tutor_profiles: {
                    select: {
                        sessions: {
                            where: { status: 'COMPLETED' },
                            include: {
                                student_profiles: {
                                    include: {
                                        users: {
                                            include: {
                                                fluency_snapshots: {
                                                    orderBy: { created_at: 'asc' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const result = tutors.map(tutor => {
            const sessions = tutor.tutor_profiles?.sessions || []
            const uniqueStudents = new Set(sessions.map(s => s.student_id))

            let totalFluencyGain = 0
            let totalCefrGain = 0
            let studentsWithData = 0
            let activeAfter30Days = 0

            const thirtyDaysAgo = subDays(new Date(), 30)

            uniqueStudents.forEach(studentId => {
                const studentSessions = sessions.filter(s => s.student_id === studentId)
                if (studentSessions.length === 0) return

                const student = studentSessions[0].student_profiles.users
                if (!student) return

                const snapshots = student.fluency_snapshots
                if (snapshots.length >= 2) {
                    const first = snapshots[0]
                    const latest = snapshots[snapshots.length - 1]

                    const firstProfile = computeSkillScores({
                        fluency: (first.wpm > 120 ? 1 : first.wpm / 120),
                        pronunciation: first.pronunciation / 100,
                        grammar: first.grammar_scaffold / 100,
                        vocabulary: 0.5
                    })

                    const latestProfile = computeSkillScores({
                        fluency: (latest.wpm > 120 ? 1 : latest.wpm / 120),
                        pronunciation: latest.pronunciation / 100,
                        grammar: latest.grammar_scaffold / 100,
                        vocabulary: 0.5
                    })

                    totalFluencyGain += (latestProfile.fluency.score - firstProfile.fluency.score)
                    totalCefrGain += (latestProfile.overall.score - firstProfile.overall.score)
                    studentsWithData++
                }

                // Retention check
                const lastSession = studentSessions.sort((a, b) => b.start_time.getTime() - a.start_time.getTime())[0]
                if (lastSession.start_time > thirtyDaysAgo) {
                    activeAfter30Days++
                }
            })

            const retentionRate = uniqueStudents.size > 0 ? (activeAfter30Days / uniqueStudents.size) * 100 : 0
            const avgFluencyGain = studentsWithData > 0 ? totalFluencyGain / studentsWithData : 0
            const avgCefrGain = studentsWithData > 0 ? totalCefrGain / studentsWithData : 0

            return {
                tutor: tutor.full_name,
                students: uniqueStudents.size,
                avgFluencyGain: parseFloat(avgFluencyGain.toFixed(1)),
                avgCefrGain: parseFloat(avgCefrGain.toFixed(1)),
                retention: parseFloat(retentionRate.toFixed(1))
            }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Tutor Performance API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
