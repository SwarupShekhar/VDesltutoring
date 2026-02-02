'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { FontWeight } from '@/components/font-weight';
import Image from 'next/image';

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
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const safePath = (path: string) => {
    if (locale === 'en') {
      return path.startsWith('/') ? path : `/${path}`;
    }
    return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const navItems: Record<string, NavItem[]> = {
    LEARNER: [
      { name: 'Dashboard', href: safePath('/dashboard') },
      { name: 'Live Practice', href: safePath('/live-practice') },
      { name: 'Book Session', href: safePath('/sessions/book') },
      { name: 'Blog', href: safePath('/blog') },
    ],
    TUTOR: [
      { name: 'Dashboard', href: safePath('/tutor/dashboard') },
    ],
    ADMIN: [
      { name: 'Dashboard', href: safePath('/admin/dashboard') },
    ],
  };

  const userNavItems = navItems[role] || [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200 dark:border-slate-800 transition-colors duration-500" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={safePath('/')} className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <Image
                    src="https://res.cloudinary.com/de8vvmpip/image/upload/v1767350961/logoESL_sfixb1.png"
                    alt="Englivo Logo"
                    fill
                    sizes="32px"
                    priority
                    className="object-contain"
                  />
                </div>
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
                  <Link href={safePath('/dashboard')} className="block w-full text-left">
                    Dashboard
                  </Link>
                </DropdownItem>

                <SignOutButton>
                  <DropdownItem className="text-red-600 dark:text-red-400">
                    Sign out
                  </DropdownItem>
                </SignOutButton>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}