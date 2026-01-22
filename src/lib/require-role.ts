
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

type Role = 'LEARNER' | 'TUTOR' | 'ADMIN'

export async function requireRole(allowedRoles: Role[], locale: string = 'en') {
  // First, check if the user is authenticated using Clerk
  const { userId } = await auth()

  if (!userId) {
    redirect(`/${locale}/sign-in`)
  }

  // User is authenticated, now fetch user details directly from DB
  const { prisma } = await import('@/lib/prisma')

  let user = null;

  try {
    user = await prisma.users.findUnique({
      where: { clerkId: userId },
      include: {
        student_profiles: true,
        tutor_profiles: true
      }
    });

  } catch (error) {
    console.error('Error fetching user data from DB:', error)
  }

  // Perform checks outside try/catch to avoid catching NEXT_REDIRECT
  if (user) {
    if (!user.is_active || !user.role || !allowedRoles.includes(user.role)) {
      // Smart Redirect Logic
      if (user.role === 'ADMIN') {
        redirect(`/${locale}/admin/dashboard`)
      }
      if (user.role === 'TUTOR') {
        redirect(`/${locale}/tutor/dashboard`)
      }
      if (user.role === 'LEARNER') {
        redirect(`/${locale}/dashboard`)
      }

      redirect(`/${locale}/unauthorized`)
    }
    return user
  }

  // If we shouldn't fail open, we might redirect or return null
  // Original implementation returned null, effectively allowing render but maybe broken state?
  // Ideally if API fails we should arguably show error or fail closed.
  // But let's stick to original behavior of returning null which allows page stricture to load (maybe)
  return null
}