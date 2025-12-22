import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  apiSuccess,
  ApiErrors,
  handleValidationError,
} from '@/lib/api-response'
import { AuditLogger } from '@/lib/audit-logger'

// Request schema
const updateEvidenceSchema = z.object({
  tutorJoinTime: z.string().datetime().optional(),
  studentJoinTime: z.string().datetime().optional(),
  tutorLeaveTime: z.string().datetime().optional(),
  studentLeaveTime: z.string().datetime().optional(),
  completionNotes: z.string().optional(),
})

// Response schema
const updateEvidenceResponseSchema = z.object({
  success: z.literal(true),
  session: z.object({
    id: z.string().uuid(),
    tutorJoinTime: z.string().datetime().nullable(),
    studentJoinTime: z.string().datetime().nullable(),
    tutorLeaveTime: z.string().datetime().nullable(),
    studentLeaveTime: z.string().datetime().nullable(),
    completionNotes: z.string().nullable(),
  }),
})

// Type extension for session with evidence fields
interface SessionWithEvidence extends Record<string, any> {
  id: string
  tutor_join_time: Date | null
  student_join_time: Date | null
  tutor_leave_time: Date | null
  student_leave_time: Date | null
  completion_notes: string | null
}

export async function PATCH(
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
      include: {
        student_profiles: true,
        tutor_profiles: true,
      },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Parse request body
    const body = await req.json()
    const parsedBody = updateEvidenceSchema.safeParse(body)
    
    if (!parsedBody.success) {
      return handleValidationError(parsedBody.error)
    }

    // 4. Get session
    // Using prisma.$queryRaw to work around TypeScript caching issues
    const sessions: any[] = await prisma.$queryRaw`
      SELECT 
        id,
        student_id,
        tutor_id,
        start_time,
        end_time,
        status,
        livekit_room_id,
        meeting_link,
        admin_notes
      FROM sessions 
      WHERE id = ${params.id}
    `

    if (sessions.length === 0) {
      return ApiErrors.sessionNotFound()
    }

    const session = sessions[0]

    // 5. Validate user authorization
    const isStudent = session.student_id === user.student_profiles?.id
    const isTutor = session.tutor_id === user.tutor_profiles?.id
    const isAdmin = user.role === 'ADMIN'

    if (!isStudent && !isTutor && !isAdmin) {
      return ApiErrors.forbidden('You are not authorized to update this session')
    }

    // 6. Prepare update data
    const updateData: any = {}
    
    // Only allow users to update their own join/leave times
    if (isTutor && parsedBody.data.tutorJoinTime) {
      updateData.tutor_join_time = new Date(parsedBody.data.tutorJoinTime)
    }
    
    if (isTutor && parsedBody.data.tutorLeaveTime) {
      updateData.tutor_leave_time = new Date(parsedBody.data.tutorLeaveTime)
    }
    
    if (isStudent && parsedBody.data.studentJoinTime) {
      updateData.student_join_time = new Date(parsedBody.data.studentJoinTime)
    }
    
    if (isStudent && parsedBody.data.studentLeaveTime) {
      updateData.student_leave_time = new Date(parsedBody.data.studentLeaveTime)
    }
    
    // Only tutors and admins can add completion notes
    if ((isTutor || isAdmin) && parsedBody.data.completionNotes) {
      updateData.completion_notes = parsedBody.data.completionNotes
    }

    // 7. Update session evidence
    // Using prisma.$executeRaw to work around TypeScript caching issues
    const setClauses: string[] = []
    const values: any[] = [params.id]
    
    Object.entries(updateData).forEach(([key, value], index) => {
      setClauses.push(`${key} = $${index + 2}`)
      values.push(value)
    })
    
    if (setClauses.length > 0) {
      const query = `
        UPDATE sessions 
        SET ${setClauses.join(', ')} 
        WHERE id = $1
      `
      await prisma.$executeRaw(query as any, ...values)
    }

    // Get updated session data
    const updatedSessions: any[] = await prisma.$queryRaw`
      SELECT 
        id,
        tutor_join_time,
        student_join_time,
        tutor_leave_time,
        student_leave_time,
        completion_notes
      FROM sessions 
      WHERE id = ${params.id}
    `
    
    const updatedSession = updatedSessions[0]

    // 8. Log audit event
    await AuditLogger.logUserAction(prisma, {
      userId: user.id,
      userType: user.role as 'STUDENT' | 'TUTOR' | 'ADMIN',
      action: 'Updated session evidence',
      resourceId: session.id,
      resourceType: 'session',
      details: {
        updatedFields: Object.keys(updateData),
      },
    })

    // 9. Return response
    const response = {
      success: true,
      session: {
        id: updatedSession.id,
        tutorJoinTime: updatedSession.tutor_join_time?.toISOString() || null,
        studentJoinTime: updatedSession.student_join_time?.toISOString() || null,
        tutorLeaveTime: updatedSession.tutor_leave_time?.toISOString() || null,
        studentLeaveTime: updatedSession.student_leave_time?.toISOString() || null,
        completionNotes: updatedSession.completion_notes || null,
      },
    }

    return apiSuccess({
      data: response,
      // schema: updateEvidenceResponseSchema, // Uncomment when ready to validate
    })

  } catch (error) {
    console.error('Session evidence update error:', error)
    return ApiErrors.internalError(error)
  }
}