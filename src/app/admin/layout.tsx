import Link from "next/link";
import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['ADMIN'])

  return (
    <AppShell role="ADMIN">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
          <h2 className="text-xl font-bold mb-8 text-blue-400">ESL Academy</h2>
          <nav className="space-y-4">
            <Link href="/admin/dashboard" className="block hover:text-blue-400">Dashboard</Link>
            <Link href="/admin/tutors/add" className="block hover:text-blue-400">Add New Tutor</Link>
            <Link href="/admin/sessions" className="block hover:text-blue-400">Manage Sessions</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AppShell>
  );
}