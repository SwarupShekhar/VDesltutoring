import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  completeSessionRequestSchema,
  completeSessionResponseSchema,
  type CompleteSessionResponse,
} from '@/schemas/api.schema'
import {
  apiSuccess,
  ApiErrors,
  handleValidationError,
} from '@/lib/api-response'
import { atomicUpdateSessionStatus } from '@/lib/session-state-machine'
import { handleIdempotency, saveIdempotencyRecord, extractIdempotencyKey } from '@/lib/idempotency'
import { AuditLogger } from '@/lib/audit-logger'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Handle idempotency
    const idempotencyCheck = await handleIdempotency(prisma, req, userId, 'session.complete')
    if (idempotencyCheck) {
      return apiSuccess({
        data: idempotencyCheck.body,
        status: idempotencyCheck.status
      })
    }

    // 3. Get user from database
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Validate role - only ADMIN or TUTOR can complete sessions
    if (user.role !== 'ADMIN' && user.role !== 'TUTOR') {
      return ApiErrors.forbidden('Only admins or tutors can complete sessions')
    }

    // 4. Validate request body
    const body = await req.json()
    const { sessionId, status, notes } = completeSessionRequestSchema.parse(body)

    // 5. Complete session (no transaction needed - no credit mutation)
    const session = await prisma.sessions.findUnique({
      where: { id: sessionId },
      include: {
        tutor_profiles: true,
      },
    })

    if (!session) {
      return ApiErrors.sessionNotFound()
    }

    // Validate tutor owns the session (if not admin)
    if (user.role === 'TUTOR') {
      if (session.tutor_profiles.user_id !== user.id) {
        return ApiErrors.forbidden('Not authorized')
      }
    }

    // Validate session is in LIVE or SCHEDULED status
    if (session.status !== 'LIVE' && session.status !== 'SCHEDULED') {
      return ApiErrors.forbidden('Only live or scheduled sessions can be completed')
    }

    // Update session status with state machine validation
    const updatedSession = await atomicUpdateSessionStatus(
      prisma,
      sessionId,
      status,
      session.status!, // Expected current status
      {
        sessionId,
        userId: user.id,
        userRole: user.role,
      }
    )

    // Log audit event for session completion
    await AuditLogger.logSessionLifecycle(prisma, {
      sessionId: updatedSession.id,
      studentId: session.student_id,
      tutorId: session.tutor_id,
      oldStatus: session.status!,
      newStatus: status,
      triggeredBy: user.role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
      userId: user.id,
      reason: `Session marked as ${status.toLowerCase()}`
    })

    const response: CompleteSessionResponse = {
      success: true,
      message: `Session marked as ${status.toLowerCase()}`,
      session: {
        id: updatedSession.id,
        status: status, // Use the status we just set
      },
    }

    // Save idempotency record
    const idempotencyKey = extractIdempotencyKey(req)
    if (idempotencyKey) {
      await saveIdempotencyRecord(
        prisma,
        idempotencyKey,
        'session.complete',
        userId!,
        body,
        response,
        200
      )
    }

    return apiSuccess({
      data: response,
      schema: completeSessionResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Session completion error:', error)
    return ApiErrors.internalError(error)
  }
}
