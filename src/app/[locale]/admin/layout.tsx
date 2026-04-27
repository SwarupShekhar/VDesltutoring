import Link from "next/link";
import { requireRole } from '@/lib/require-role'
import { AppShell } from '@/components/AppShell'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: 'noindex, nofollow'
  }
}

export default async function AdminLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireRole(['ADMIN'], locale)

  return (
    <AppShell role="ADMIN">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
          <h2 className="text-xl font-bold mb-8 text-blue-400">ESL Academy</h2>
          <nav className="space-y-4">
            <Link href="/admin/dashboard" className="block hover:text-blue-400">Dashboard</Link>
            <Link href="/admin/tutors" className="block px-4 py-2 hover:bg-gray-100 rounded-lg">
              Manage Tutors
            </Link>
            <Link href="/admin/blog" className="block hover:text-blue-400">Blog System</Link>
            <Link href="/admin/internal-links" className="block hover:text-blue-400 text-slate-400">Internal Links</Link>
            <Link href="/admin/dashboard" className="block hover:text-blue-400">Manage Sessions</Link>
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