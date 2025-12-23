import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'

export default async function LearnerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(['LEARNER'], locale)

  return (
    <AppShell role="LEARNER">
      {children}
    </AppShell>
  )
}