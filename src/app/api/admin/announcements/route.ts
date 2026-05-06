import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

export async function POST(req: NextRequest) {
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
      return ApiErrors.forbidden('Only admins can send announcements')
    }

    // 4. Validate request body
    const body = await req.json()
    const { title, message } = body

    if (!title || !message) {
      return ApiErrors.invalidRequest('Title and message are required')
    }

    // 5. Get all tutor users
    const tutors = await prisma.users.findMany({
      where: { role: 'TUTOR' },
      select: { id: true, email: true }
    })

    if (tutors.length === 0) {
      return apiSuccess({
        data: {
          success: true,
          message: 'No tutors registered to receive announcements',
          count: 0
        }
      })
    }

    // 6. Create notifications in transaction
    await prisma.$transaction(
      tutors.map(t => prisma.notifications.create({
        data: {
          user_id: t.id,
          title,
          message,
          is_read: false
        }
      }))
    )

    console.log(`Admin ${user.email} sent announcement "${title}" to ${tutors.length} tutors.`)

    return apiSuccess({
      data: {
        success: true,
        message: `Announcement sent successfully to ${tutors.length} tutors`,
        count: tutors.length
      }
    })
  } catch (error) {
    console.error('Tutor announcement error:', error)
    return ApiErrors.internalError(error)
  }
}
