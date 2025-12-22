import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  bookSessionRequestSchema,
  bookSessionResponseSchema,
  type BookSessionResponse,
} from '@/schemas/api.schema'
import {
  apiSuccess,
  ApiErrors,
  handleValidationError,
} from '@/lib/api-response'
import { createSessionWithValidation } from '@/lib/session-state-machine'
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
    const idempotencyCheck = await handleIdempotency(prisma, req, userId, 'session.book')
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

    // 3. Validate role - only LEARNER can book
    if (user.role !== 'LEARNER') {
      return ApiErrors.forbidden('Only learners can book sessions')
    }

    // 4. Ensure student profile exists
    if (!user.student_profiles) {
      return ApiErrors.profileNotFound('student')
    }

    // 5. Validate request body
    const body = await req.json()
    const { startTime, endTime, tutorId } = bookSessionRequestSchema.parse(body)

    const start = new Date(startTime)
    const end = new Date(endTime)

    // 6. Validate time range
    if (start >= end) {
      return ApiErrors.invalidTimeRange()
    }

    // 7. Determine tutor to assign
    const assignedTutorId = tutorId || user.student_profiles.primary_tutor_id

    if (!assignedTutorId) {
      return ApiErrors.noTutorAssigned()
    }

    // 8. CRITICAL: Book session in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Validate credit balance
      const studentProfile = await tx.student_profiles.findUnique({
        where: { id: user.student_profiles!.id },
      })

      if (!studentProfile || studentProfile.credits < 1) {
        throw new Error('Insufficient credits')
      }

      // Validate tutor exists
      const tutor = await tx.tutor_profiles.findUnique({
        where: { id: assignedTutorId },
        include: { users: true },
      })

      if (!tutor || !tutor.users?.is_active) {
        throw new Error('Tutor not available')
      }

      // Check for conflicts (tutor already booked at this time)
      const conflicts = await tx.sessions.findMany({
        where: {
          tutor_id: assignedTutorId,
          status: { in: ['SCHEDULED', 'LIVE'] },
          OR: [
            {
              start_time: { lte: start },
              end_time: { gt: start },
            },
            {
              start_time: { lt: end },
              end_time: { gte: end },
            },
            {
              start_time: { gte: start },
              end_time: { lte: end },
            },
          ],
        },
      })

      if (conflicts.length > 0) {
        throw new Error('Time slot not available')
      }

      // Deduct credits
      await tx.student_profiles.update({
        where: { id: studentProfile.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      })

      // Create session with state machine validation
      const sessionData = createSessionWithValidation({
        student_id: studentProfile.id,
        tutor_id: assignedTutorId,
        start_time: start,
        end_time: end,
      })

      const session = await tx.sessions.create({
        data: sessionData,
        include: {
          tutor_profiles: {
            include: {
              users: true,
            },
          },
        },
      })

      // Log audit event for session booking
      await AuditLogger.logSessionLifecycle(prisma, {
        sessionId: session.id,
        studentId: session.student_id,
        tutorId: session.tutor_id,
        newStatus: 'SCHEDULED',
        triggeredBy: 'STUDENT',
        userId: user.id,
        reason: 'Session booked successfully'
      })

      // Log audit event for credit deduction
      await AuditLogger.logCreditMutation(prisma, {
        userId: user.id,
        studentId: studentProfile.id,
        amount: -1,
        balanceBefore: studentProfile.credits,
        balanceAfter: studentProfile.credits - 1,
        reason: 'Session booking'
      })

      return session
    })

    // Format response according to schema
    const response: BookSessionResponse = {
      success: true,
      session: {
        id: result.id,
        startTime: result.start_time,
        endTime: result.end_time,
        status: result.status || 'SCHEDULED', // Handle potential null
        tutor: {
          name: result.tutor_profiles.users?.full_name ?? null,
        },
      },
    }

    // Save idempotency record
    const idempotencyKey = extractIdempotencyKey(req)
    if (idempotencyKey) {
      await saveIdempotencyRecord(
        prisma,
        idempotencyKey,
        'session.book',
        userId!,
        body,
        response,
        200
      )
    }

    return apiSuccess({
      data: response,
      schema: bookSessionResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    if (error instanceof Error) {
      if (error.message === 'Insufficient credits') {
        return ApiErrors.insufficientCredits()
      }
      if (error.message === 'Tutor not available') {
        return ApiErrors.tutorNotAvailable()
      }
      if (error.message === 'Time slot not available') {
        return ApiErrors.timeSlotConflict()
      }
    }

    console.error('Session booking error:', error)
    return ApiErrors.internalError(error)
  }
}
