import { NextRequest } from 'next/server'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { client } from '@/sanity/lib/client'

// Create a client with a read token so we can validate Sanity-generated secrets
const clientWithToken = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
})

export async function GET(request: NextRequest) {
  // Validate the preview URL secret that Sanity Presentation tool generates
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    clientWithToken,
    request.url,
  )

  if (!isValid) {
    console.error('[Draft Mode] Invalid preview URL secret')
    return new Response('Invalid preview secret', { status: 401 })
  }

  ;(await draftMode()).enable()

  redirect(redirectTo)
}
