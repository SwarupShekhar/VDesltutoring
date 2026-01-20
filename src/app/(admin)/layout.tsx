import Link from 'next/link'
import { requireRole } from '@/modules/auth'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireRole(['ADMIN'])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                        Englivo <span className="text-blue-600">Admin</span>
                    </div>
                    <nav className="flex gap-6">
                        <NavLink href="/admin/blog">Blog</NavLink>
                        <NavLink href="/admin/qa">QA Inspector</NavLink>
                        <NavLink href="/admin/control">Engine Control</NavLink>
                        <NavLink href="/admin/analytics">Analytics</NavLink>
                    </nav>
                </div>
            </header>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
            {children}
        </Link>
    )
}
