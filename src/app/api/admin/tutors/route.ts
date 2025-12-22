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

    // 2. Get user from database
    const user = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return ApiErrors.userNotFound()
    }

    // 3. Validate role - only ADMIN
    if (user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Only admins can access tutors list')
    }

    // 4. Get all tutors with their profiles
    const tutors = await prisma.tutor_profiles.findMany({
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
          }
        }
      },
      orderBy: {
        users: {
          full_name: 'asc'
        }
      }
    })

    // 5. Format response
    const formattedTutors = tutors.map(tutor => ({
      id: tutor.id,
      name: tutor.users?.full_name || 'Unknown',
      email: tutor.users?.email || 'Unknown',
    }))

    return apiSuccess({
      data: formattedTutors,
    })
  } catch (error) {
    console.error('Get tutors error:', error)
    return ApiErrors.internalError(error)
  }
}