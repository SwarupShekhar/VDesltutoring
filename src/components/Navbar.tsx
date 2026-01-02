'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { FontWeight } from '@/components/font-weight';

interface NavItem {
  name: string;
  href: string;
}

interface NavbarProps {
  role: 'LEARNER' | 'TUTOR' | 'ADMIN';
}

export function Navbar({ role }: NavbarProps) {
  const { user } = useUser();
  const pathname = usePathname();

  const navItems: Record<string, NavItem[]> = {
    LEARNER: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Book Session', href: '/sessions/book' },
    ],
    TUTOR: [
      { name: 'Dashboard', href: '/tutor/dashboard' },
    ],
    ADMIN: [
      { name: 'Dashboard', href: '/admin/dashboard' },
    ],
  };

  const userNavItems = navItems[role] || [];

  return (
    <nav className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="https://res.cloudinary.com/de8vvmpip/image/upload/v1767350961/logoESL_sfixb1.png"
                  alt="Englivo Logo"
                  className="h-8 w-auto"
                />
                <FontWeight
                  text="Englivo"
                  fontSize={28}
                  className="text-slate-900 dark:text-white"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {userNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === item.href
                    ? 'border-indigo-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <ThemeToggle />

            <div className="ml-3 relative">
              <Dropdown
                trigger={
                  <div className="flex items-center cursor-pointer">
                    <Avatar
                      src={user?.imageUrl}
                      alt={user?.fullName || 'User'}
                      size="sm"
                    />
                  </div>
                }
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <DropdownItem>
                  <Link href="/dashboard" className="block w-full text-left">
                    Dashboard
                  </Link>
                </DropdownItem>

                <DropdownItem>
                  <Link href="/sign-out" className="block w-full text-left">
                    Sign out
                  </Link>
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}