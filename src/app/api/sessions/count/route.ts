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

    // 2. Get user's student profile
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
      include: {
        student_profiles: true,
      },
    })

    if (!user || !user.student_profiles) {
      // If no student profile, they have 0 sessions
      const response = apiSuccess({ data: { count: 0 } })
      response.headers.set('x-matched-path', '/api/sessions/count')
      return response
    }

    // 3. Count total sessions
    const count = await prisma.sessions.count({
      where: {
        student_id: user.student_profiles.id,
      },
    })

    const response = apiSuccess({ data: { count } })
    response.headers.set('x-matched-path', '/api/sessions/count')
    return response
  } catch (error) {
    console.error('Get sessions count error:', error)
    return ApiErrors.internalError(error)
  }
}
