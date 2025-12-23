import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['TUTOR'])

  return (
    <AppShell role="TUTOR">
      {children}
    </AppShell>
  )
}