import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  purchasePackageRequestSchema,
  purchasePackageResponseSchema,
  type PurchasePackageResponse,
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
    const idempotencyCheck = await handleIdempotency(prisma, req, userId, 'package.purchase')
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

    // 3. Validate role - only LEARNER can purchase
    if (user.role !== 'LEARNER') {
      return ApiErrors.forbidden('Only learners can purchase packages')
    }

    // 4. Validate request body
    const body = await req.json()
    const { packageId } = purchasePackageRequestSchema.parse(body)

    // 5. Get package details
    const packageData = await prisma.packages.findUnique({
      where: { id: packageId },
    })

    if (!packageData) {
      return ApiErrors.packageNotFound()
    }

    if (!packageData.is_public) {
      return ApiErrors.forbidden('Package not available')
    }

    // 6. CRITICAL: Credit mutation MUST be in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ensure student profile exists
      let studentProfile = user.student_profiles

      if (!studentProfile) {
        studentProfile = await tx.student_profiles.create({
          data: {
            user_id: user.id,
            credits: 0,
          },
        })
      }

      // Add credits to student profile
      const updatedProfile = await tx.student_profiles.update({
        where: { id: studentProfile.id },
        data: {
          credits: {
            increment: packageData.credit_amount,
          },
        },
      })

      // Log audit event for credit addition
      await AuditLogger.logCreditMutation(prisma, {
        userId: user.id,
        studentId: updatedProfile.id,
        amount: packageData.credit_amount,
        balanceBefore: studentProfile?.credits || 0,
        balanceAfter: updatedProfile.credits,
        reason: `Package purchase: ${packageData.name}`
      })

      return updatedProfile
    })

    const response: PurchasePackageResponse = {
      success: true,
      credits: result.credits,
      added: packageData.credit_amount,
    }

    // Save idempotency record
    const idempotencyKey = extractIdempotencyKey(req)
    if (idempotencyKey) {
      await saveIdempotencyRecord(
        prisma,
        idempotencyKey,
        'package.purchase',
        userId!,
        body,
        response,
        200
      )
    }

    return apiSuccess({
      data: response,
      schema: purchasePackageResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Package purchase error:', error)
    return ApiErrors.internalError(error)
  }
}
