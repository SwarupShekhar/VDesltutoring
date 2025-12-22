import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  apiSuccess,
  ApiErrors,
} from '@/lib/api-response'
import { LiveKitService } from '@/lib/livekit-service'
import { AuditLogger } from '@/lib/audit-logger'

// Response schema
const joinSessionResponseSchema = z.object({
  success: z.literal(true),
  token: z.string(),
  roomName: z.string(),
  session: z.object({
    id: z.string().uuid(),
    startTime: z.date(),
    endTime: z.date(),
    status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  }),
})

export async function POST(
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

    // 3. Get session
    const session = await prisma.sessions.findUnique({
      where: { id: params.id },
      include: {
        student_profiles: {
          include: {
            users: true,
          },
        },
        tutor_profiles: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!session) {
      return ApiErrors.sessionNotFound()
    }

    // 4. Validate user authorization
    const isStudent = session.student_id === user.student_profiles?.id
    const isTutor = session.tutor_id === user.tutor_profiles?.id
    const isAdmin = user.role === 'ADMIN'

    if (!isStudent && !isTutor && !isAdmin) {
      return ApiErrors.forbidden('You are not authorized to join this session')
    }

    // 5. Validate session access (time window, etc.)
    const accessValidation = LiveKitService.validateAccess({
      sessionId: session.id,
      userId: user.id,
      userRole: user.role || '',
      sessionStartTime: session.start_time,
      sessionEndTime: session.end_time,
    })

    if (!accessValidation.valid) {
      return ApiErrors.forbidden(accessValidation.reason || 'Access denied')
    }

    // 6. Create LiveKit room if it doesn't exist
    if (!session.livekit_room_id) {
      try {
        const roomId = await LiveKitService.createRoom(session.id)
        
        // Update session with room ID
        await prisma.sessions.update({
          where: { id: session.id },
          data: {
            livekit_room_id: roomId,
          },
        })
      } catch (error) {
        console.error('Failed to create LiveKit room:', error)
        return ApiErrors.internalError('Failed to initialize session')
      }
    }

    // 7. Determine user role for LiveKit
    let liveKitRole: 'student' | 'tutor' | 'admin'
    if (isStudent) {
      liveKitRole = 'student'
    } else if (isTutor) {
      liveKitRole = 'tutor'
    } else {
      liveKitRole = 'admin'
    }

    // 8. Generate LiveKit token
    const token = await LiveKitService.generateToken({
      roomId: session.livekit_room_id || session.id,
      userId: user.id,
      userName: user.full_name,
      role: liveKitRole,
      metadata: {
        sessionId: session.id,
        userType: user.role,
      },
    })

    // 9. Log audit event
    await AuditLogger.logUserAction(prisma, {
      userId: user.id,
      userType: user.role as 'STUDENT' | 'TUTOR' | 'ADMIN',
      action: 'Joined session',
      resourceId: session.id,
      resourceType: 'session',
      details: {
        role: liveKitRole,
        roomName: session.livekit_room_id || session.id,
      },
    })

    // 10. Return response
    const response = {
      success: true,
      token,
      roomName: session.livekit_room_id || session.id,
      session: {
        id: session.id,
        startTime: session.start_time,
        endTime: session.end_time,
        status: session.status || 'SCHEDULED',
      },
    }

    return apiSuccess({
      data: response,
      // schema: joinSessionResponseSchema, // Uncomment when ready to validate
    })

  } catch (error) {
    console.error('Session join error:', error)
    return ApiErrors.internalError(error)
  }
}