import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  cancelSessionRequestSchema,
  cancelSessionResponseSchema,
  type CancelSessionResponse,
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
    const idempotencyCheck = await handleIdempotency(prisma, req, userId, 'session.cancel')
    if (idempotencyCheck) {
      return apiSuccess({
        data: idempotencyCheck.body,
        status: idempotencyCheck.status
      })
    }

    // 3. Get user from database
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      include: { student_profiles: true },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Validate request body
    const body = await req.json()
    const { sessionId } = cancelSessionRequestSchema.parse(body)

    // 4. CRITICAL: Cancel session and refund credits in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get session
      const session = await tx.sessions.findUnique({
        where: { id: sessionId },
        include: {
          student_profiles: true,
        },
      })

      if (!session) {
        return ApiErrors.sessionNotFound()
      }

      // Validate user owns the session or is admin
      const isOwner = session.student_profiles.user_id === user.id
      const isAdmin = user.role === 'ADMIN'

      if (!isOwner && !isAdmin) {
        return ApiErrors.forbidden('Not authorized')
      }

      // Validate session can be cancelled
      if (session.status !== 'SCHEDULED') {
        return ApiErrors.forbidden('Only scheduled sessions can be cancelled')
      }

      // Check if session is in the future (at least 2 hours from now)
      const now = new Date()
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

      if (session.start_time < twoHoursFromNow) {
        return ApiErrors.forbidden('Cannot cancel sessions less than 2 hours before start time')
      }

      // Update session status with state machine validation
      const updatedSession = await atomicUpdateSessionStatus(
        tx,
        sessionId,
        'CANCELLED',
        'SCHEDULED', // Expected current status
        {
          sessionId,
          userId: user.id,
          userRole: user.role,
        }
      )

      // Log audit event for session cancellation
      await AuditLogger.logSessionLifecycle(prisma, {
        sessionId: updatedSession.id,
        studentId: session.student_id,
        tutorId: session.tutor_id,
        oldStatus: 'SCHEDULED',
        newStatus: 'CANCELLED',
        triggeredBy: isAdmin ? 'ADMIN' : 'STUDENT',
        userId: user.id,
        reason: 'Session cancelled and credit refunded'
      })

      // Refund credit to student
      const updatedStudentProfile = await tx.student_profiles.update({
        where: { id: session.student_id },
        data: {
          credits: {
            increment: 1,
          },
        },
      })

      // Log audit event for credit refund
      await AuditLogger.logCreditMutation(prisma, {
        userId: user.id,
        studentId: session.student_id,
        amount: 1,
        balanceBefore: session.student_profiles.credits,
        balanceAfter: session.student_profiles.credits + 1,
        reason: 'Session cancellation refund'
      })

      return updatedSession
    })

    const response: CancelSessionResponse = {
      success: true,
      message: 'Session cancelled and credit refunded',
      refunded: true,
    }

    // Save idempotency record
    const idempotencyKey = extractIdempotencyKey(req)
    if (idempotencyKey) {
      await saveIdempotencyRecord(
        prisma,
        idempotencyKey,
        'session.cancel',
        userId!,
        body,
        response,
        200
      )
    }

    return apiSuccess({
      data: response,
      schema: cancelSessionResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    if (error instanceof Error) {
      if (error.message === 'Session not found') {
        return ApiErrors.sessionNotFound()
      }
      if (error.message === 'Not authorized') {
        return ApiErrors.forbidden('Not authorized')
      }
      if (
        error.message === 'Only scheduled sessions can be cancelled' ||
        error.message === 'Cannot cancel sessions less than 2 hours before start time'
      ) {
        return ApiErrors.forbidden(error.message)
      }
    }

    console.error('Session cancellation error:', error)
    return ApiErrors.internalError(error)
  }
}
