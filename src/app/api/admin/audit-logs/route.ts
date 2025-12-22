import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  apiSuccess,
  ApiErrors,
} from '@/lib/api-response'

export async function GET(req: NextRequest) {
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
      return ApiErrors.forbidden('Only admins can view audit logs')
    }

    // 4. Fetch recent audit logs (last 50)
    // @ts-ignore - Prisma client typing issue
    const logs = await prisma.audit_logs.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: 50,
    })

    // 5. Format response
    return apiSuccess({
      data: {
        logs: logs.map((log: any) => ({
          id: log.id,
          userId: log.user_id,
          userType: log.user_type,
          action: log.action,
          eventType: log.event_type,
          resourceId: log.resource_id,
          resourceType: log.resource_type,
          details: log.details,
          createdAt: log.created_at,
        })),
      },
    })

  } catch (error) {
    console.error('Get audit logs error:', error)
    return ApiErrors.internalError(error)
  }
}