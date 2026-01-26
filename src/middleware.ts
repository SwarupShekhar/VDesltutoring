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
    '/api/live-practice(.*)', // Public stats for landing page
    '/blog',
    '/blog/(.*)',
    '/:locale/blog',
    '/:locale/blog/(.*)',
    '/sitemap.xml',
    '/robots.txt',
    '/googlee0719812a88d81a6.html',
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // Log client platform for debugging (optional, can be removed in production)
    const clientPlatform = req.headers.get('x-client') || 'web';
    if (pathname.startsWith('/api') && clientPlatform === 'app') {
        console.log(`[API] Mobile app request: ${req.method} ${pathname}`);
    }

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
        // Preserve query params
        newUrl.search = req.nextUrl.search;
        return NextResponse.redirect(newUrl, { status: 301 });
    }

    // 2. Authentication Logic
    const currentLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) || defaultLocale;

    if (isPublicRoute(req)) {
        // Allow access
        return NextResponse.next();
    } else {
        // Protect private routes (Pricing, Dashboard, Practice)
        // Explicitly redirect instead of using auth.protect() to avoid 500 errors on Edge
        const { userId, redirectToSignIn } = await auth();

        if (!userId) {
            return redirectToSignIn({ returnBackUrl: req.url });
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        // Added xml, txt, ico to exclusion list
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
