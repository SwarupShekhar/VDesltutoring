import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  adjustCreditsRequestSchema,
  adjustCreditsResponseSchema,
  type AdjustCreditsResponse,
} from '@/schemas/api.schema'
import {
  apiSuccess,
  ApiErrors,
  handleValidationError,
} from '@/lib/api-response'
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
    const idempotencyCheck = await handleIdempotency(prisma, req, userId, 'admin.adjust_credits')
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

    // 3. Validate role - only ADMIN
    if (user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Only admins can adjust credits')
    }

    // 4. Validate request body
    const body = await req.json()
    const { studentId, amount, reason } = adjustCreditsRequestSchema.parse(body)

    // 5. CRITICAL: Credit adjustment MUST be in transaction
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student_profiles.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new Error('Student not found')
      }

      const newCredits = student.credits + amount

      if (newCredits < 0) {
        throw new Error('Cannot set credits below zero')
      }

      // Log audit event for admin credit adjustment
      await AuditLogger.logCreditMutation(prisma, {
        userId: user.id,
        studentId: studentId,
        amount: amount,
        balanceBefore: student.credits,
        balanceAfter: newCredits,
        reason: reason || 'Admin credit adjustment',
        adminId: user.id
      })

      // Log admin override
      await AuditLogger.logAdminOverride(prisma, {
        adminId: user.id,
        action: `Adjusted credits for student ${studentId}`,
        targetUserId: studentId,
        targetResourceId: studentId,
        targetType: 'student_profile',
        reason: reason || 'Admin credit adjustment',
        details: {
          amount: amount,
          balanceBefore: student.credits,
          balanceAfter: newCredits
        }
      })

      const updatedStudent = await tx.student_profiles.update({
        where: { id: studentId },
        data: {
          credits: newCredits,
        },
      })

      return updatedStudent
    })

    console.log(`Admin ${user.email} adjusted credits for student ${studentId}: ${amount}. Reason: ${reason || 'None'}`)

    const response: AdjustCreditsResponse = {
      success: true,
      message: 'Credits adjusted successfully',
      student: {
        id: result.id,
        credits: result.credits,
        adjustment: amount,
      },
    }

    // Save idempotency record
    const idempotencyKey = extractIdempotencyKey(req)
    if (idempotencyKey) {
      await saveIdempotencyRecord(
        prisma,
        idempotencyKey,
        'admin.adjust_credits',
        userId!,
        body,
        response,
        200
      )
    }

    return apiSuccess({
      data: response,
      schema: adjustCreditsResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    if (error instanceof Error) {
      if (error.message === 'Student not found') {
        return ApiErrors.studentNotFound()
      }
      if (error.message === 'Cannot set credits below zero') {
        return ApiErrors.creditsBelowZero()
      }
    }

    console.error('Adjust credits error:', error)
    return ApiErrors.internalError(error)
  }
}
