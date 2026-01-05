import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { computeSkillScores } from '@/lib/cefrEngine'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params

        // Try finding by user ID first
        let student = await prisma.users.findUnique({
            where: { id },
            include: {
                fluency_snapshots: {
                    orderBy: { created_at: 'desc' },
                    take: 20
                },
                ai_chat_sessions: {
                    orderBy: { started_at: 'desc' },
                    include: {
                        messages: {
                            orderBy: { timestamp: 'asc' }
                        }
                    },
                    take: 5
                },
                student_profiles: {
                    include: {
                        sessions: {
                            where: { status: 'COMPLETED' },
                            orderBy: { start_time: 'desc' },
                            take: 10
                        }
                    }
                }
            }
        })

        // If not found, try finding by student_profile ID
        if (!student) {
            const profile = await prisma.student_profiles.findUnique({
                where: { id },
                select: { user_id: true }
            })

            if (profile?.user_id) {
                student = await prisma.users.findUnique({
                    where: { id: profile.user_id },
                    include: {
                        fluency_snapshots: {
                            orderBy: { created_at: 'desc' },
                            take: 20
                        },
                        ai_chat_sessions: {
                            orderBy: { started_at: 'desc' },
                            include: {
                                messages: {
                                    orderBy: { timestamp: 'asc' }
                                }
                            },
                            take: 5
                        },
                        student_profiles: {
                            include: {
                                sessions: {
                                    where: { status: 'COMPLETED' },
                                    orderBy: { start_time: 'desc' },
                                    take: 10
                                }
                            }
                        }
                    }
                })
            }
        }

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // Latest CEFR Radar
        const latestSnapshot = student.fluency_snapshots[0]
        const cefrProfile = latestSnapshot ? computeSkillScores({
            fluency: (latestSnapshot.wpm > 120 ? 1 : latestSnapshot.wpm / 120),
            pronunciation: latestSnapshot.pronunciation / 100,
            grammar: latestSnapshot.grammar_scaffold / 100,
            vocabulary: 0.5
        }) : null

        // Risk Score
        let riskScore = 0
        if (!student.last_login || (new Date().getTime() - new Date(student.last_login).getTime()) > 3 * 24 * 60 * 60 * 1000) {
            riskScore += 40
        }
        if (student.fluency_snapshots.length >= 2) {
            if (student.fluency_snapshots[0].wpm < student.fluency_snapshots[1].wpm) riskScore += 30
        }

        return NextResponse.json({
            name: student.full_name,
            email: student.email,
            cefrProfile,
            fluencyHistory: student.fluency_snapshots.map(s => ({
                date: s.created_at,
                wpm: s.wpm,
                fillers: s.fillers
            })).reverse(),
            lastAIObservations: student.ai_chat_sessions.map(session => ({
                date: session.started_at,
                summary: session.feedback_summary,
                scores: {
                    fluency: session.fluency_score,
                    grammar: session.grammar_score,
                    vocabulary: session.vocabulary_score
                }
            })),
            recentPracticeScores: student.student_profiles?.sessions.map(s => ({
                date: s.start_time,
                notes: s.completion_notes
            })),
            riskScore
        })

    } catch (error) {
        console.error('Student Intelligence API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
