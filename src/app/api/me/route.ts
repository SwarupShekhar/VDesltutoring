import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export async function GET() {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Get user from database with required fields only
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
        is_active: true,
        student_profiles: {
          select: {
            credits: true,
          },
        },
      },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Return only the required fields
    return apiSuccess({
      data: {
        id: user.id,
        role: user.role,
        is_active: user.is_active,
        // Include credits for learners
        ...(user.role === 'LEARNER' && user.student_profiles && {
          credits: user.student_profiles.credits,
        }),
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return ApiErrors.internalError(error)
  }
}