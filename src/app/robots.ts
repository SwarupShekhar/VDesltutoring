
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://englivo.com";

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/api/live-practice/'],
            disallow: ['/dashboard/', '/admin/', '/api/', '/sign-in', '/sign-up'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
