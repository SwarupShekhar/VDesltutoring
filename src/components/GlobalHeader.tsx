'use client';

import { usePathname } from 'next/navigation';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';

export const GlobalHeader = ({ dict }: { dict: any }) => {
    const pathname = usePathname();

    // Do not render the global header on the homepage
    // Check for /en, /de, etc. (exactly 2 lowercase letters after slash, optionally trailing slash)
    const isHomePage = pathname === '/' || /^\/[a-z]{2}\/?$/.test(pathname);

    if (isHomePage) {
        return null;
    }

    const t = dict || { signIn: 'Sign In', createAccount: 'Sign Up' };

    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
                <SignInButton>
                    <button className="text-sm font-medium hover:text-primary transition-colors">
                        {t.signIn}
                    </button>
                </SignInButton>
                <SignUpButton>
                    <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer text-white">
                        {t.createAccount}
                    </button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </header>
    );
};
