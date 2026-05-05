import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { document, type } = await request.json()

    if (type === 'published' && document?._type === 'page') {
      const { slug, language } = document
      const slugString = typeof slug === 'string' ? slug : slug?.current
      
      if (slugString) {
        const path = language === 'en' ? `/p/${slugString}` : `/${language}/p/${slugString}`
        console.log(`[Sanity Webhook] Revalidating path: ${path}`)
        revalidatePath(path)
        
        // Also revalidate the Explore hub so the new changes show up there
        const explorePath = language === 'en' ? '/explore' : `/${language}/explore`
        console.log(`[Sanity Webhook] Revalidating explore: ${explorePath}`)
        revalidatePath(explorePath)
      }
    }

    return new NextResponse('OK')
  } catch (error) {
    console.error('[Sanity Webhook] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
