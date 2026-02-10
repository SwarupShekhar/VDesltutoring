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

    const email = clerkUser.emailAddresses[0]?.emailAddress || ''
    const IS_OWNER_ADMIN = email === 'swarupshekhar.vaidikedu@gmail.com'

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

    // 3. Auto-registration / Account Linking logic
    if (!dbUser) {
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
      console.log('User not found by Clerk ID:', clerkUser.id, 'Checking by email:', userEmail);

      // Check if user exists by email (Pre-existing account with old/missing Clerk ID)
      const existingUserByEmail = await prisma.users.findUnique({
        where: { email: userEmail },
      });

      if (existingUserByEmail) {
        console.log('Found existing user by email. Linking new Clerk ID...');
        dbUser = await prisma.users.update({
          where: { id: existingUserByEmail.id },
          data: {
            clerkId: clerkUser.id,
            // Update metadata if needed
            full_name: existingUserByEmail.full_name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            profile_image_url: clerkUser.imageUrl || existingUserByEmail.profile_image_url,
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
          },
        });
      } else {
        // Truly new user: Create
        console.log('Auto-registering new user:', clerkUser.id);
        dbUser = await prisma.users.create({
          data: {
            clerkId: clerkUser.id,
            email: userEmail,
            full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
            role: IS_OWNER_ADMIN ? 'ADMIN' : 'LEARNER',
            student_profiles: {
              create: {
                credits: IS_OWNER_ADMIN ? 9999 : 0
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
        });
      }
    }

    // 4. Double-check Admin status for owner
    const finalRole = IS_OWNER_ADMIN ? 'ADMIN' : dbUser.role
    const finalCredits = IS_OWNER_ADMIN ? 9999 : (dbUser.student_profiles?.credits || 0)

    if (!dbUser) {
      return ApiErrors.userNotFound()
    }

    // 4. Return only the required fields
    return apiSuccess({
      data: {
        id: dbUser.id,
        role: finalRole,
        is_active: dbUser.is_active,
        // Include credits for learners
        ...((finalRole === 'LEARNER' || IS_OWNER_ADMIN) && {
          credits: finalCredits,
        }),
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return ApiErrors.internalError(error)
  }
}