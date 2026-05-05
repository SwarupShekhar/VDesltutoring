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
      const path = language === 'en' ? `/p/${slug}` : `/${language}/p/${slug}`
      revalidatePath(path)
    }

    return new NextResponse('OK')
  } catch (error) {
    console.error('[Sanity Webhook] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
