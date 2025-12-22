import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getSessionsResponseSchema, type GetSessionsResponse } from '@/schemas/api.schema'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Get user from database
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      include: {
        student_profiles: true,
        tutor_profiles: true,
      },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Get query parameters
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || user.role?.toLowerCase()
    const status = searchParams.get('status')

    // 4. Build query based on role
    let sessions

    if (role === 'learner' && user.student_profiles) {
      sessions = await prisma.sessions.findMany({
        where: {
          student_id: user.student_profiles.id,
          ...(status && { status: status as any }),
        },
        include: {
          tutor_profiles: {
            include: { users: true },
          },
        },
        orderBy: { start_time: 'desc' },
      })
    } else if (role === 'tutor' && user.tutor_profiles) {
      sessions = await prisma.sessions.findMany({
        where: {
          tutor_id: user.tutor_profiles.id,
          ...(status && { status: status as any }),
        },
        include: {
          student_profiles: {
            include: { users: true },
          },
        },
        orderBy: { start_time: 'desc' },
      })
    } else if (role === 'admin' && user.role === 'ADMIN') {
      // Admin sees everything
      sessions = await prisma.sessions.findMany({
        where: {
          ...(status && { status: status as any }),
        },
        include: {
          student_profiles: {
            include: { users: true },
          },
          tutor_profiles: {
            include: { users: true },
          },
        },
        orderBy: { start_time: 'desc' },
        take: 100, // Limit for performance
      })
    } else {
      return ApiErrors.forbidden('Invalid role or profile not found')
    }

    // 5. Format response
    const formattedSessions = sessions.map((session) => {
      // Type narrowing: ensure we have the correct profile based on the include
      const studentProfile = 'student_profiles' in session ? session.student_profiles : null
      const tutorProfile = 'tutor_profiles' in session ? session.tutor_profiles : null

      return {
        id: session.id,
        startTime: session.start_time,
        endTime: session.end_time,
        // Handle potential null status
        status: session.status || 'SCHEDULED',
        livekitRoomId: session.livekit_room_id,
        meetingLink: session.meeting_link,
        adminNotes: session.admin_notes,
        createdAt: session.created_at,
        student: studentProfile ? {
          id: studentProfile.id,
          name: studentProfile.users?.full_name ?? null,
          email: studentProfile.users?.email ?? null,
        } : null,
        tutor: tutorProfile ? {
          id: tutorProfile.id,
          name: tutorProfile.users?.full_name ?? null,
          email: tutorProfile.users?.email ?? null,
        } : null,
      }
    })

    // Create response object
    const response: GetSessionsResponse = {
      sessions: formattedSessions,
      role: role as string,
    }

    return apiSuccess({
      data: response,
      schema: getSessionsResponseSchema,
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return ApiErrors.internalError(error)
  }
}
