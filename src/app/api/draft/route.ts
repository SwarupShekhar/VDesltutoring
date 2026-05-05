import { NextRequest } from 'next/server'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret') || searchParams.get('sanity-preview-secret');
  const language = searchParams.get('language') || 'en';
  
  const storedSecret = process.env.SANITY_PREVIEW_SECRET;
  
  if (!storedSecret) {
    return new Response('Preview secret not configured', { status: 500 })
  }

  if (secret !== storedSecret) {
    console.error(`[Draft Mode] Secret mismatch. Received: ${secret?.slice(0, 3)}... Expected: ${storedSecret.slice(0, 3)}...`)
    return new Response('Invalid preview secret', { status: 401 })
  }
  
  (await draftMode()).enable()
  
  if (slug) {
    // Redirect to the landing page respecting locale
    const redirectPath = language === 'en' ? `/p/${slug}` : `/${language}/p/${slug}`
    redirect(redirectPath)
  }
  
  // Default redirect to home
  redirect('/')
}
