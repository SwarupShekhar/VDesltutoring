import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['LEARNER'])

  return (
    <AppShell role="LEARNER">
      {children}
    </AppShell>
  )
}