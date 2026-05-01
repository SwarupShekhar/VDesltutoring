import { auth } from '@clerk/nextjs/server'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

const BRIDGE_URL = 'https://bridge-api-3m4n.onrender.com'
const BRIDGE_SECRET = process.env.BRIDGE_INTERNAL_SECRET || process.env.INTERNAL_SECRET

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Parse body
    const body = await req.json()
    const { app } = body

    if (!app || !['CORE', 'PULSE'].includes(app)) {
      return ApiErrors.invalidRequest('Invalid app type. Must be CORE or PULSE.')
    }

    // 3. Call Bridge API directly to ensure correct URL and Secret
    const response = await fetch(`${BRIDGE_URL}/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': BRIDGE_SECRET || '',
      },
      body: JSON.stringify({ last_active_app: app }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Bridge API Error] last-active: ${response.status} ${errorText}`)
      return ApiErrors.internalError('Failed to update bridge status')
    }

    return apiSuccess({ 
      data: { 
        success: true,
        clerkId: userId,
        app 
      } 
    })

  } catch (error) {
    console.error('Bridge last-active error:', error)
    return ApiErrors.internalError(error)
  }
}
