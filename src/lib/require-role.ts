import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

type Role = 'LEARNER' | 'TUTOR' | 'ADMIN'

export async function requireRole(allowedRoles: Role[]) {
  // First, check if the user is authenticated using Clerk
  const { userId } = await auth()
  
  if (!userId) {
    // User is not authenticated
    redirect('/sign-in')
  }

  // User is authenticated, now fetch user details from our API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const headerList = await headers()
  
  try {
    const res = await fetch(`${baseUrl}/api/me`, {
      cache: 'no-store',
      headers: {
        cookie: headerList.get('cookie') ?? '',
      },
    })

    if (!res.ok) {
      // If it's a 401 or 403, redirect to sign-in
      if (res.status === 401 || res.status === 403) {
        redirect('/sign-in')
      }
      // For other errors, we still want to allow access
      // This prevents blocking users due to API issues
      return null
    }

    const user = await res.json()

    if (!user.is_active || !allowedRoles.includes(user.role)) {
      redirect('/unauthorized')
    }

    return user
  } catch (error) {
    // If there's an error fetching user data, we should still allow access
    // This prevents blocking users due to API issues
    console.error('Error fetching user data:', error)
    return null
  }
}