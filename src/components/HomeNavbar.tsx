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
import { Menu, X, ChevronDown, User, CreditCard, Info, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BubbleText } from '@/components/BubbleText';
import { GetStartedButton } from '@/components/GetStartedButton';
import { FontWeight } from '@/components/font-weight';
import Image from 'next/image';

export function HomeNavbar({ dict, locale }: { dict: any; locale: string }) {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const t = dict || {};
  const locales = ['en', 'de', 'fr', 'es', 'vi', 'ja'];

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    // Get current path segments
    const segments = pathname.split('/').filter(Boolean); // Remove empty strings

    // Check if first segment is a locale
    const firstSegment = segments[0];
    const isFirstSegmentLocale = locales.includes(firstSegment);

    let newPath = '';

    if (isFirstSegmentLocale) {
      // Replace existing locale
      if (newLocale === 'en') {
        // Remove locale prefix for English
        newPath = '/' + segments.slice(1).join('/');
      } else {
        // Replace locale with new one
        segments[0] = newLocale;
        newPath = '/' + segments.join('/');
      }
    } else {
      // No current locale (implies 'en' or root)
      if (newLocale === 'en') {
        // Stay as is (already English/root)
        newPath = pathname;
      } else {
        // Add new locale prefix
        newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
      }
    }

    router.push(newPath || '/');
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
    { label: t.approach || 'Our Method', href: locale === 'en' ? '/method' : `/${locale}/method` },
    { label: 'Fluency Guide', href: locale === 'en' ? '/fluency-guide' : `/${locale}/fluency-guide` }, // Added Fluency Guide
    { label: t.howItWorks || 'How It Works', href: locale === 'en' ? '/how-it-works' : `/${locale}/how-it-works` },
    { label: t.practice || 'Practice', href: locale === 'en' ? '/practice' : `/${locale}/practice`, onClick: handlePracticeClick },
    { label: t.pricing || 'Pricing', href: locale === 'en' ? '/pricing' : `/${locale}/pricing` },
    { label: t.about || 'About Us', href: locale === 'en' ? '/about' : `/${locale}/about` },
    { label: t.blog || 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` }, // Added Blog
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-gray-100 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">

            {/* LEFT: BRAND */}
            <Link href={`/${locale}`} className="flex-shrink-0 cursor-pointer group flex items-center gap-3" onClick={scrollToTop}>
              <div className="relative h-10 w-10">
                <Image
                  src="https://res.cloudinary.com/de8vvmpip/image/upload/v1767350961/logoESL_sfixb1.png"
                  alt="Englivo Logo"
                  fill
                  sizes="40px"
                  priority
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <FontWeight
                  text="Englivo"
                  fontSize={32}
                  className="text-slate-900 dark:text-white"
                />
                <p className="hidden lg:block text-[10px] text-slate-500 dark:text-slate-400 font-sans tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 left-0 whitespace-nowrap">
                  {t.brandSubtitle || 'Speak without translating'}
                </p>
              </div>
            </Link>

            {/* CENTER: NAVIGATION */}
            <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
              <Link href={`/${locale}/method`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric dark:hover:text-electric transition-colors relative group">
                {t.approach || 'Method'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-electric transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link href={`/${locale}/practice`} onClick={handlePracticeClick} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric dark:hover:text-electric transition-colors relative group">
                {t.practice || 'Practice'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-electric transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link href={`/${locale}/pricing`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric dark:hover:text-electric transition-colors relative group">
                {t.pricing || 'Pricing'}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-electric transition-all duration-300 group-hover:w-full" />
              </Link>

              {/* Resources Dropdown */}
              <Dropdown
                trigger={
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-electric dark:hover:text-electric transition-colors group">
                    {t.resources || 'Resources'}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                }
                align="center"
              >
                <div className="p-1 min-w-[200px]">
                  <DropdownItem onClick={() => router.push(`/${locale}/fluency-guide`)}>
                    Fluency Guide
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push(`/${locale}/how-it-works`)}>
                    {t.howItWorks || 'How It Works'}
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push(`/${locale}/blog`)}>
                    {t.blog || 'Blog'}
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push(`/${locale}/about`)}>
                    {t.about || 'About Us'}
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="hidden md:flex items-center gap-6">
              {/* Settings Group */}
              <div className="flex items-center gap-4 border-r border-gray-200 dark:border-white/10 pr-6">
                <LanguageSelector currentLocale={locale} />
                <ThemeToggle />
              </div>

              {/* Hydration safe rendering */}
              {(!isMounted || !isLoaded) ? (
                // Loading state / Server matching state (render a neutral skeleton)
                // This matches what the server renders (since isMounted is false on server)
                // and what the client renders on first pass (isMounted starts false)
                <div className="flex items-center gap-4">
                  <div className="w-16 h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>
              ) : user ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-electric transition-colors"
                  >
                    {t.dashboard || 'Dashboard'}
                  </Link>
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

                    <DropdownItem onClick={() => router.push('/ai-tutor')} className="flex items-center gap-2">
                      <Sparkles size={16} />
                      AI Tutor
                    </DropdownItem>

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
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href={`/${locale}/sign-in`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {t.signIn || 'Sign In'}
                  </Link>
                  <Link href={`/${locale}/sign-up`}>
                    <GetStartedButton text={t.getStarted || 'Get Started'} />
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSelector currentLocale={locale} />
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
      </nav >

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {
          mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8">
                    <Image
                      src="https://res.cloudinary.com/de8vvmpip/image/upload/v1767350961/logoESL_sfixb1.png"
                      alt="Englivo Logo"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <FontWeight
                    text="Englivo"
                    fontSize={24}
                    className="text-slate-900 dark:text-white"
                  />
                </div>
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
          )
        }
      </AnimatePresence >
    </>
  );
}