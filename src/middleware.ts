import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const locales = ["en", "de", "fr", "es", "vi", "ja"];
const defaultLocale = "en";

// Define public routes (accessible without login)
// English routes are at root level (no /en prefix)
// Other languages use locale prefix (/de, /fr, /es, /vi, /ja)
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/about',
    '/method',
    '/how-it-works',
    '/assessment',
    '/blog',
    '/blog/(.*)',
    '/fluency-guide',
    '/roadmap',
    '/tutors',
    '/pricing',
    '/practice', // Public practice page
    '/live-practice', // Public live practice page
    '/sessions/book', // Public booking page
    '/:locale', // For non-English locales
    '/:locale/sign-in(.*)',
    '/:locale/sign-up(.*)',
    '/:locale/about',
    '/:locale/method',
    '/:locale/how-it-works',
    '/:locale/assessment',
    '/:locale/blog',
    '/:locale/blog/(.*)',
    '/:locale/fluency-guide',
    '/:locale/roadmap',
    '/:locale/tutors',
    '/:locale/pricing',
    '/:locale/sessions/book', // Public booking page
    '/api/webhooks(.*)', // Webhooks must be public
    '/api/livekit/token', // Handle auth in route handler for JSON response
    '/api/live-practice(.*)', // Public stats for landing page
    '/sitemap.xml',
    '/robots.txt',
    '/googlee0719812a88d81a6.html',
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 0. EXPLICIT SEO EXCLUSIONS (Avoid any redirects for bots)
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|discordbot|applebot|sitechecker|crawler|spider|robot|crawling/i.test(userAgent);

    if (
        pathname === '/sitemap.xml' ||
        pathname === '/robots.txt' ||
        pathname === '/favicon.ico' ||
        pathname.includes('googlee0719812a88d81a6') ||
        (isBot && pathname === '/')
    ) {
        // For bots on the root, we'll let it fall through to the rewrite or next
        // But we avoid any 308 redirects for them here.
        if (pathname === '/' && !isBot) {
            // regular flow continues below
        } else if (pathname !== '/') {
            return NextResponse.next();
        }
    }

    // Log client platform for debugging
    const clientPlatform = req.headers.get('x-client') || 'web';
    if (pathname.startsWith('/api') && clientPlatform === 'app') {
        console.log(`[API] Mobile app request: ${req.method} ${pathname}`);
    }

    // 1. i18n Routing Logic
    // NEW APPROACH: English content is served at root (no /en prefix)
    // Other languages use locale prefix (/de, /fr, /es, /vi, /ja)

    // Check if pathname has a non-English locale
    const nonDefaultLocales = locales.filter(l => l !== defaultLocale); // ["de", "fr", "es", "vi", "ja"]
    const hasNonDefaultLocale = nonDefaultLocales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // Check if pathname has the default locale (en)
    const hasDefaultLocale = pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`;

    // Exclude API, internal files, static files from i18n handling
    const isIgnoredPath = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.');

    // If URL has /en, redirect to remove it (e.g., /en/practice -> /practice)
    if (hasDefaultLocale && !isIgnoredPath) {
        const pathWithoutLocale = pathname.replace(`/${defaultLocale}`, '') || '/';
        const newUrl = new URL(pathWithoutLocale, req.url);
        newUrl.search = req.nextUrl.search;
        return NextResponse.redirect(newUrl, { status: 308 });
    }

    // If URL has no locale prefix and is not a non-default locale, rewrite to /en internally
    if (!hasNonDefaultLocale && !hasDefaultLocale && !isIgnoredPath) {
        // Use a strictly clean path for the internal rewrite to avoid trailing slash issues
        const cleanPath = pathname === '/' ? '' : pathname;
        const rewriteUrl = new URL(`/${defaultLocale}${cleanPath}`, req.url);
        rewriteUrl.search = req.nextUrl.search;
        return NextResponse.rewrite(rewriteUrl);
    }


    // 2. Authentication Logic
    const currentLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) || defaultLocale;

    if (isPublicRoute(req)) {
        return NextResponse.next();
    } else {
        // Protect private routes
        const { userId, redirectToSignIn } = await auth();

        if (!userId) {
            // For API routes, return JSON 401 instead of HTML redirect
            // This is critical for mobile apps that expect JSON responses
            if (pathname.startsWith('/api/')) {
                console.log(`[Auth] Unauthorized API request: ${req.method} ${pathname}`);
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'Authentication required' },
                    { status: 401 }
                );
            }
            return redirectToSignIn({ returnBackUrl: req.url });
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
