import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: 'noindex, nofollow'
  }
}

export default async function TutorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['TUTOR'], locale)

  return (
    <AppShell role="TUTOR">
      {children}
    </AppShell>
  )
}