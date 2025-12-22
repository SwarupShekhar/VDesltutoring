import { Navbar } from '@/components/Navbar';

interface AppShellProps {
  children: React.ReactNode;
  role: 'LEARNER' | 'TUTOR' | 'ADMIN';
}

export function AppShell({ children, role }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <Navbar role={role} />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}