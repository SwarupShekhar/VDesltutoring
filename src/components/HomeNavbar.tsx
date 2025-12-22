'use client';

import { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Menu, X, ChevronDown, User, CreditCard, Info, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function HomeNavbar() {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Custom Navigation Logic
  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoaded && user) {
      router.push('/assessment');
    } else {
      router.push('/sign-in');
    }
  };

  const navLinks = [
    { label: 'Approach', href: '/#approach' },
    { label: 'Practice', href: '/assessment', onClick: handlePracticeClick }, // Custom logic applied via onClick
    { label: 'Pricing', href: '/pricing' },
    { label: 'About Us', href: '/about' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-gray-100 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            {/* LEFT: BRAND */}
            <div className="flex-shrink-0 cursor-pointer group" onClick={scrollToTop}>
              <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Natural Flow
              </h1>
              <p className="hidden lg:block text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1">
                Speak without translating
              </p>
            </div>

            {/* CENTER: NAVIGATION */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={link.onClick}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric dark:hover:text-electric transition-colors relative group cursor-pointer"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-electric transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="hidden md:flex items-center gap-6">
              <ThemeToggle />

              {isLoaded && user ? (
                // LOGGED IN STATE
                <div className="relative flex items-center gap-4">
                  <Link href="/dashboard">
                    <Button size="sm" className="rounded-full bg-electric text-white shadow-lg hover:shadow-electric/25">
                      Dashboard
                    </Button>
                  </Link>

                  <Dropdown
                    trigger={
                      <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <Avatar
                          src={user.imageUrl}
                          alt={user.fullName || 'User'}
                          size="sm"
                        />
                        <ChevronDown size={14} className="text-slate-500" />
                      </div>
                    }
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>

                    <DropdownItem>
                      <Link href="/dashboard" className="flex items-center gap-2 w-full">
                        <User size={14} /> Dashboard
                      </Link>
                    </DropdownItem>
                    <DropdownItem>
                      <Link href="/pricing" className="flex items-center gap-2 w-full">
                        <CreditCard size={14} /> Pricing
                      </Link>
                    </DropdownItem>
                    <DropdownItem>
                      <Link href="/about" className="flex items-center gap-2 w-full">
                        <Info size={14} /> About Us
                      </Link>
                    </DropdownItem>
                    <DropdownItem>
                      <SignOutButton>
                        <button className="flex items-center gap-2 w-full text-red-500 hover:text-red-600">
                          <LogOut size={14} /> Sign out
                        </button>
                      </SignOutButton>
                    </DropdownItem>
                  </Dropdown>
                </div>
              ) : (
                // LOGGED OUT STATE
                <div className="flex items-center gap-6">
                  <Link href="/sign-in" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric transition-colors">
                    Sign in
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-medium px-6">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-slate-900 dark:text-white p-2"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Natural Flow</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/5"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 text-center">
              <Link href={user ? "/assessment" : "/sign-in"} onClick={() => setMobileMenuOpen(false)}>
                <div className="bg-electric/10 text-electric py-4 rounded-xl font-medium text-lg">
                  {user ? 'Start Assessment' : 'Sign In to Practice'}
                </div>
              </Link>

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.onClick) {
                      link.onClick(e);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="text-xl font-serif text-slate-800 dark:text-slate-200 hover:text-electric transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="h-px bg-gray-100 dark:bg-white/10 w-full my-2" />

              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg text-slate-600 dark:text-slate-400">Dashboard</Link>
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg text-slate-600 dark:text-slate-400">Pricing</Link>
                  <SignOutButton>
                    <button className="text-lg text-red-500">Sign Out</button>
                  </SignOutButton>
                </>
              ) : (
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 dark:text-white">
                  Create Account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}