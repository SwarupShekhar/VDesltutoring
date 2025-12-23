
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { apiSuccess, ApiErrors } from '@/lib/api-response'
import { z } from 'zod'

const assignSessionTutorSchema = z.object({
    tutorId: z.string().uuid(),
})

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 1. Authenticate
        const { userId } = await auth()
        if (!userId) return ApiErrors.unauthorized()

        // 2. Validate Admin
        const user = await prisma.users.findUnique({
            where: { clerkId: userId },
        })
        if (!user || user.role !== 'ADMIN') {
            return ApiErrors.forbidden('Only admins can assign tutors to sessions')
        }

        // 3. Parse Body
        const body = await req.json()
        const { tutorId } = assignSessionTutorSchema.parse(body)

        // 4. Validate Tutor
        console.log(`[AssignSession] Received request to assign tutor ${tutorId} to session ${id}`);
        const tutor = await prisma.tutor_profiles.findUnique({
            where: { id: tutorId },
            include: { users: true }
        })
        if (!tutor) {
            console.error(`[AssignSession] Tutor ${tutorId} not found in DB`);
            return ApiErrors.tutorNotFound();
        }
        console.log(`[AssignSession] Found tutor: ${tutor.users?.full_name} (${tutor.id})`);

        // 5. Update Session & Notify
        const [updatedSession] = await prisma.$transaction([
            prisma.sessions.update({
                where: { id },
                data: {
                    tutor_id: tutorId,
                    status: 'SCHEDULED'
                },
                include: {
                    tutor_profiles: { include: { users: true } }
                }
            }),
            prisma.notifications.create({
                data: {
                    user_id: tutor.user_id!,
                    title: 'New Session Assigned',
                    message: `You have been assigned to a session. Please check your dashboard for details.`
                }
            })
        ]);

        return apiSuccess({
            data: {
                success: true,
                session: {
                    id: updatedSession.id,
                    tutorName: updatedSession.tutor_profiles?.users?.full_name
                }
            }
        })

        // Force revalidation of dashboard pages - Robust Strategy
        // Dynamic paths might not match visited static paths in some Next.js versions/configs
        revalidatePath('/[locale]/admin/dashboard', 'page')
        revalidatePath('/[locale]/tutor/dashboard', 'page')

        // Explicit locale fallback (assuming 'en' is primary)
        revalidatePath('/en/admin/dashboard', 'page')
        revalidatePath('/en/tutor/dashboard', 'page')

        // Root layout revalidation to catch sidebars/navs/etc
        revalidatePath('/', 'layout')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return ApiErrors.invalidRequest(error)
        }
        console.error('Assign session tutor error:', error)
        return ApiErrors.internalError(error)
    }
}
