
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://englivo.com";

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/api/', '/sign-in', '/sign-up'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
