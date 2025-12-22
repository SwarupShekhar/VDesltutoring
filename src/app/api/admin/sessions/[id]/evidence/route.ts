import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  apiSuccess,
  ApiErrors,
} from '@/lib/api-response'

// Response schema
const getSessionEvidenceResponseSchema = z.object({
  success: z.literal(true),
  session: z.object({
    id: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    tutorJoinTime: z.string().datetime().nullable(),
    studentJoinTime: z.string().datetime().nullable(),
    tutorLeaveTime: z.string().datetime().nullable(),
    studentLeaveTime: z.string().datetime().nullable(),
    completionNotes: z.string().nullable(),
    tutor: z.object({
      id: z.string().uuid(),
      name: z.string().nullable(),
    }),
    student: z.object({
      id: z.string().uuid(),
      name: z.string().nullable(),
    }),
  }),
})

// Type extension to include the new evidence fields
interface SessionWithEvidence extends Record<string, any> {
  id: string
  start_time: Date
  end_time: Date
  status: string | null
  tutor_join_time: Date | null
  student_join_time: Date | null
  tutor_leave_time: Date | null
  student_leave_time: Date | null
  completion_notes: string | null
  tutor_profiles?: {
    id: string
    users?: {
      full_name: string | null
    } | null
  } | null
  student_profiles?: {
    id: string
    users?: {
      full_name: string | null
    } | null
  } | null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve the params promise
    const params = await context.params
    
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Get user from database
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Check if user is admin
    if (user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Admin access required')
    }

    // 4. Get session with evidence
    // Using prisma.$queryRaw to work around TypeScript caching issues
    const sessions: any[] = await prisma.$queryRaw`
      SELECT 
        id,
        start_time,
        end_time,
        status,
        tutor_join_time,
        student_join_time,
        tutor_leave_time,
        student_leave_time,
        completion_notes
      FROM sessions 
      WHERE id = ${params.id}
    `

    if (sessions.length === 0) {
      return ApiErrors.sessionNotFound()
    }

    const session = sessions[0]

    // Get tutor and student profiles separately
    const [tutorProfile, studentProfile] = await Promise.all([
      prisma.tutor_profiles.findUnique({
        where: { id: session.tutor_id },
        select: {
          id: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      }),
      prisma.student_profiles.findUnique({
        where: { id: session.student_id },
        select: {
          id: true,
          users: {
            select: {
              full_name: true,
            },
          },
        },
      }),
    ])

    // 5. Return session evidence
    const response = {
      success: true,
      session: {
        id: session.id,
        startTime: session.start_time.toISOString(),
        endTime: session.end_time.toISOString(),
        status: session.status || 'SCHEDULED',
        tutorJoinTime: session.tutor_join_time?.toISOString() || null,
        studentJoinTime: session.student_join_time?.toISOString() || null,
        tutorLeaveTime: session.tutor_leave_time?.toISOString() || null,
        studentLeaveTime: session.student_leave_time?.toISOString() || null,
        completionNotes: session.completion_notes || null,
        tutor: {
          id: tutorProfile?.id || '',
          name: tutorProfile?.users?.full_name || null,
        },
        student: {
          id: studentProfile?.id || '',
          name: studentProfile?.users?.full_name || null,
        },
      },
    }

    return apiSuccess({
      data: response,
      // schema: getSessionEvidenceResponseSchema, // Uncomment when ready to validate
    })

  } catch (error) {
    console.error('Get session evidence error:', error)
    return ApiErrors.internalError(error)
  }
}