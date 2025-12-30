import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const locales = ["en", "de", "fr", "es", "vi", "ja"];
const defaultLocale = "en";

// Define public routes (accessible without login)
// Note: We need to match both root and localized paths
const isPublicRoute = createRouteMatcher([
    '/',
    '/:locale',
    '/:locale/sign-in(.*)',
    '/:locale/sign-up(.*)',
    '/sign-in(.*)', // for redirect handling
    '/sign-up(.*)',
    '/:locale/about',
    '/:locale/method',
    '/:locale/how-it-works',
    '/:locale/assessment', // Assessment might be public? User didn't specify, but often is.
    '/api/webhooks(.*)', // Webhooks must be public
    '/api/livekit/token', // Handle auth in route handler for JSON response
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 1. i18n Routing Logic
    // Check if we need to redirect to a locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Exclude API, internal files, static files from i18n redirection
    // (The matcher config handles most, but double check for logic safety)
    const isIgnoredPath = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/ai-tutor');

    if (pathnameIsMissingLocale && !isIgnoredPath) {
        const locale = defaultLocale;
        const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);
        // Preserve query params
        newUrl.search = req.nextUrl.search;
        return NextResponse.redirect(newUrl);
    }

    // 2. Authentication Logic
    if (isPublicRoute(req)) {
        // Allow access
        return NextResponse.next();
    } else {
        // Protect private routes
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
