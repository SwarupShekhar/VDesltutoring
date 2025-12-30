'use client';

import { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Menu, X, ChevronDown, User, CreditCard, Info, LogOut, ShieldAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BubbleText } from '@/components/BubbleText';

export function HomeNavbar({ dict, locale }: { dict: any; locale: string }) {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const t = dict || {};
  const locales = ['en', 'de', 'fr', 'es', 'vi', 'ja'];

  useEffect(() => {
    async function fetchRole() {
      if (user) {
        try {
          const res = await fetch('/api/me');
          if (res.ok) {
            const data = await res.json();
            console.log("HomeNavbar /api/me response:", data);
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      }
    }
    fetchRole();
  }, [user]);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = newLocale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${newLocale}`);
    }
  };

  // Custom Navigation Logic
  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoaded && user) {
      router.push(`/${locale}/practice`);
    } else {
      router.push(`/${locale}/sign-in`);
    }
  };

  const navLinks = [
    { label: t.approach || 'Our Method', href: `/${locale}/method` },
    { label: t.howItWorks || 'How It Works', href: `/${locale}/how-it-works` },
    { label: t.practice || 'Practice', href: `/${locale}/practice`, onClick: handlePracticeClick },
    { label: t.pricing || 'Pricing', href: `/${locale}/pricing` },
    { label: t.about || 'About Us', href: `/${locale}/about` },
    // Add Dashboard if logged in (Client-side check via user)
    ...(user ? [
      { label: 'AI Tutor', href: '/ai-tutor' },
      { label: t.dashboard || 'Dashboard', href: `/${locale}/dashboard` }
    ] : []),
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
            <Link href={`/${locale}`} className="flex-shrink-0 cursor-pointer group" onClick={scrollToTop}>
              <BubbleText />
              <p className="hidden lg:block text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1">
                {t.brandSubtitle || 'Speak without translating'}
              </p>
            </Link>

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
              {/* Language Switcher Desktop */}
              <div className="border-r border-gray-200 dark:border-white/10 pr-4">
                <LanguageSelector currentLocale={locale} />
              </div>

              <ThemeToggle />

              {isLoaded && user ? (
                <Dropdown
                  trigger={
                    <button className="focus:outline-none">
                      <Avatar src={user.imageUrl} alt={user.fullName || 'User'} size="sm" className="border-2 border-transparent hover:border-electric transition-colors" />
                    </button>
                  }
                  align="right"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    <p className="text-xs text-electric font-bold mt-1">{userRole}</p>
                  </div>

                  {userRole === 'ADMIN' && (
                    <DropdownItem onClick={() => router.push(`/${locale}/admin/dashboard`)} className="flex items-center gap-2 text-electric font-medium">
                      <ShieldAlert size={16} />
                      Admin Dashboard
                    </DropdownItem>
                  )}

                  <DropdownItem onClick={() => router.push(`/${locale}/dashboard`)} className="flex items-center gap-2">
                    <User size={16} />
                    {t.dashboard || 'Dashboard'}
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push(`/${locale}/pricing`)} className="flex items-center gap-2">
                    <CreditCard size={16} />
                    {t.pricing || 'Pricing'}
                  </DropdownItem>
                  <div className="h-px bg-gray-50 dark:bg-white/5 my-1" />
                  <SignOutButton>
                    <DropdownItem className="text-red-500 hover:text-red-600 flex items-center gap-2">
                      <LogOut size={16} />
                      {t.signOut || 'Sign Out'}
                    </DropdownItem>
                  </SignOutButton>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href={`/${locale}/sign-in`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {t.signIn || 'Sign In'}
                  </Link>
                  <Link href={`/${locale}/sign-up`}>
                    <Button size="sm" className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-medium px-6">
                      {t.getStarted || 'Get Started'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <div className="md:hidden flex items-center gap-4">
              <span className="text-xs font-bold uppercase text-electric">{locale}</span>
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
              <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Natural Fluency</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/5"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 text-center">
              {/* Mobile Language Switcher */}
              {/* Mobile Language Switcher */}
              <div className="flex justify-center mb-8">
                <LanguageSelector currentLocale={locale} align="center" />
              </div>

              <Link href={user ? `/${locale}/practice` : `/${locale}/sign-in`} onClick={() => setMobileMenuOpen(false)}>
                <div className="bg-electric/10 text-electric py-4 rounded-xl font-medium text-lg">
                  {user ? (t.startReflection || 'Start Reflection') : (t.signInToPractice || 'Sign In to Practice')}
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
                  {userRole === 'ADMIN' && (
                    <Link href={`/${locale}/admin/dashboard`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-electric">Admin Dashboard</Link>
                  )}
                  <Link href={`/${locale}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="text-lg text-slate-600 dark:text-slate-400">{t.dashboard || 'Dashboard'}</Link>
                  <Link href={`/${locale}/pricing`} onClick={() => setMobileMenuOpen(false)} className="text-lg text-slate-600 dark:text-slate-400">{t.pricing || 'Pricing'}</Link>
                  <SignOutButton>
                    <button className="text-lg text-red-500 w-full">{t.signOut || 'Sign Out'}</button>
                  </SignOutButton>
                </>
              ) : (
                <Link href={`/${locale}/sign-up`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 dark:text-white">
                  {t.createAccount || 'Create Account'}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}