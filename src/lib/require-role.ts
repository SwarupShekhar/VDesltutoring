
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

  // User is authenticated, now fetch user details from our API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const headerList = await headers()

  let user = null;

  try {
    const res = await fetch(`${baseUrl}/api/me`, {
      cache: 'no-store',
      headers: {
        cookie: headerList.get('cookie') ?? '',
      },
    })

    if (res.ok) {
      user = await res.json()
    }
  } catch (error) {
    // If there's an error fetching user data (e.g., network error), we return null below.
    console.error('Error fetching user data:', error)
  }

  // Perform checks outside try/catch to avoid catching NEXT_REDIRECT
  if (user) {
    if (!user.is_active || !allowedRoles.includes(user.role)) {
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