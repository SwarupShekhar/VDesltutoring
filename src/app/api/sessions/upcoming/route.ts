import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Get user's student profile
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      include: {
        student_profiles: true,
      },
    })

    if (!user || !user.student_profiles) {
      return ApiErrors.profileNotFound('student')
    }

    // 3. Find the next scheduled session
    const upcomingSession = await prisma.sessions.findFirst({
      where: {
        student_id: user.student_profiles.id,
        status: 'SCHEDULED',
        start_time: {
          gt: new Date(),
        },
      },
      include: {
        tutor_profiles: {
          include: {
            users: {
              select: {
                full_name: true,
                email: true,
                profile_image_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        start_time: 'asc',
      },
    })

    if (!upcomingSession) {
      // Requirements: On no upcoming session: 404
      const response = ApiErrors.sessionNotFound()
      response.headers.set('x-matched-path', '/api/sessions/upcoming')
      return response
    }

    // 4. Format response to match expected mobile shape (camelCase)
    const formattedSession = {
      id: upcomingSession.id,
      studentId: upcomingSession.student_id,
      tutorId: upcomingSession.tutor_id,
      startTime: upcomingSession.start_time,
      endTime: upcomingSession.end_time,
      status: upcomingSession.status,
      livekitRoomId: upcomingSession.livekit_room_id,
      meetingLink: upcomingSession.meeting_link,
      createdAt: upcomingSession.created_at,
      tutor: upcomingSession.tutor_profiles ? {
        id: upcomingSession.tutor_profiles.id,
        name: upcomingSession.tutor_profiles.users?.full_name,
        email: upcomingSession.tutor_profiles.users?.email,
        profileImageUrl: upcomingSession.tutor_profiles.users?.profile_image_url,
      } : null,
    }

    const response = apiSuccess({ data: formattedSession })
    response.headers.set('x-matched-path', '/api/sessions/upcoming')
    return response

  } catch (error) {
    console.error('Get upcoming session error:', error)
    return ApiErrors.internalError(error)
  }
}
