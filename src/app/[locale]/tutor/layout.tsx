import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'

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