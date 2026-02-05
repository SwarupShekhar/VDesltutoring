import { Metadata } from 'next';

export const locales = ['en', 'de', 'fr', 'es', 'vi', 'ja'];
export const baseUrl = 'https://englivo.com';

/**
 * Constructs metadata with correct self-referencing canonical tags and hreflang alternates.
 * 
 * @param path - The path of the page (e.g., '/method', '/pricing', '/blog/my-post'). 
 *               Should start with "/" if not empty. Use "" or "/" for homepage.
 * @param currentLocale - The current locale code (e.g., 'en', 'de').
 * @returns Metadata object with alternates configured.
 */
export function constructCanonicalMetadata(
    path: string,
    currentLocale: string
): Metadata {
    // Normalize path: ensure it doesn't end with slash unless it's just '/'
    // and handle the homepage case.
    const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');

    // Canonical URL for the current page
    // If English: https://englivo.com/method
    // If German: https://englivo.com/de/method
    const canonicalUrl = currentLocale === 'en'
        ? `${baseUrl}${cleanPath}`
        : `${baseUrl}/${currentLocale}${cleanPath}`;

    // Generate language alternates (hreflang)
    const languages: Record<string, string> = {
        'x-default': `${baseUrl}${cleanPath}`, // Default to English version
    };

    locales.forEach(locale => {
        if (locale === 'en') {
            languages[locale] = `${baseUrl}${cleanPath}`;
        } else {
            languages[locale] = `${baseUrl}/${locale}${cleanPath}`;
        }
    });

    return {
        alternates: {
            canonical: canonicalUrl,
            languages: languages
        },
        robots: 'index, follow'
    };
}
