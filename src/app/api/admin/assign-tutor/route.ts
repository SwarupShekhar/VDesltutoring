import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  assignTutorRequestSchema,
  assignTutorResponseSchema,
  type AssignTutorResponse,
} from '@/schemas/api.schema'
import {
  apiSuccess,
  ApiErrors,
  handleValidationError,
} from '@/lib/api-response'

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
      return ApiErrors.forbidden('Only admins can assign tutors')
    }

    // 4. Validate request body
    const body = await req.json()
    const { studentId, tutorId } = assignTutorRequestSchema.parse(body)

    // 5. Validate student and tutor exist
    const [student, tutor] = await Promise.all([
      prisma.student_profiles.findUnique({
        where: { id: studentId },
      }),
      prisma.tutor_profiles.findUnique({
        where: { id: tutorId },
        include: { users: true },
      }),
    ])

    if (!student) {
      return ApiErrors.studentNotFound()
    }

    if (!tutor || !tutor.users?.is_active) {
      return ApiErrors.tutorNotFound()
    }

    // 6. Assign tutor to student
    const updatedStudent = await prisma.student_profiles.update({
      where: { id: studentId },
      data: {
        primary_tutor_id: tutorId,
      },
    })

    const response: AssignTutorResponse = {
      success: true,
      message: 'Tutor assigned successfully',
      student: {
        id: updatedStudent.id,
        primaryTutorId: updatedStudent.primary_tutor_id,
      },
      tutor: {
        id: tutor.id,
        name: tutor.users?.full_name ?? null,
      },
    }

    return apiSuccess({
      data: response,
      schema: assignTutorResponseSchema,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Assign tutor error:', error)
    return ApiErrors.internalError(error)
  }
}
