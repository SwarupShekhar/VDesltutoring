import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // ...
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

    console.log(`[API] /admin/tutors found ${tutors.length} tutors`);

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