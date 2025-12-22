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
      return ApiErrors.forbidden('Only admins can access students list')
    }

    // 4. Get all students with their profiles and credits
    const students = await prisma.student_profiles.findMany({
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
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.users?.full_name || 'Unknown',
      email: student.users?.email || 'Unknown',
      credits: student.credits,
    }))

    return apiSuccess({
      data: formattedStudents,
    })
  } catch (error) {
    console.error('Get students error:', error)
    return ApiErrors.internalError(error)
  }
}