import { auth } from '@clerk/nextjs/server'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

const BRIDGE_URL = 'https://bridge-api-3m4n.onrender.com'
const BRIDGE_SECRET = process.env.BRIDGE_INTERNAL_SECRET

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // 2. Parse body
    const body = await req.json()
    const { cefrLevel, fluencyScore, source } = body

    if (!cefrLevel) {
      return ApiErrors.invalidRequest('cefrLevel is required')
    }

    // 3. Call Bridge API directly
    const response = await fetch(`${BRIDGE_URL}/sync/cefr`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': BRIDGE_SECRET || '',
      },
      body: JSON.stringify({ 
        clerkId: userId,
        cefrLevel,
        fluencyScore,
        source 
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Bridge API Error] sync-cefr: ${response.status} ${errorText}`)
      return ApiErrors.internalError('Failed to sync CEFR data with bridge')
    }

    return apiSuccess({ 
      data: { 
        success: true,
        clerkId: userId,
        cefrLevel,
        fluencyScore,
        source
      } 
    })

  } catch (error) {
    console.error('Bridge sync-cefr error:', error)
    return ApiErrors.internalError(error)
  }
}
