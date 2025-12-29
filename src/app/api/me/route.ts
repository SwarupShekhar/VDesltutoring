import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export async function GET() {
  try {
    // 1. Authenticate user
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return ApiErrors.unauthorized()
    }

    // 2. Get user from database with required fields only
    let dbUser = await prisma.users.findUnique({
      where: { clerkId: clerkUser.id },
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

    // 3. Auto-registration if user doesn't exist locally
    if (!dbUser) {
      console.log('Auto-registering user:', clerkUser.id)
      dbUser = await prisma.users.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
          role: 'LEARNER',
          student_profiles: {
            create: {
              credits: 0
            }
          }
        },
        select: {
          id: true,
          role: true,
          is_active: true,
          student_profiles: {
            select: {
              credits: true,
            },
          },
        }
      })
    }

    if (!dbUser) {
      return ApiErrors.userNotFound()
    }

    // 4. Return only the required fields
    return apiSuccess({
      data: {
        id: dbUser.id,
        role: dbUser.role,
        is_active: dbUser.is_active,
        // Include credits for learners
        ...(dbUser.role === 'LEARNER' && dbUser.student_profiles && {
          credits: dbUser.student_profiles.credits,
        }),
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return ApiErrors.internalError(error)
  }
}