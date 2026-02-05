import { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma'; // Correct DB import

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://englivo.com";

    // Static routes
    const routes = [
        {
            url: baseUrl,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/fluency-guide`,
            priority: 1.0,
            changeFrequency: 'weekly' as const,
        },
        {
            url: `${baseUrl}/how-it-works`,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/method`,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/pricing`,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            priority: 0.8, // Increased priority for blog hub
        },
        {
            url: `${baseUrl}/roadmap`,
            priority: 0.9,
            changeFrequency: 'weekly' as const,
        },
        {
            url: `${baseUrl}/live-practice`,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ai-tutor`,
            priority: 0.9,
        }
    ];

    // Dynamic Blog Routes
    try {
        const posts = await prisma.blog_posts.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true }
        });

        const blogRoutes = posts.map((post: { slug: string; updatedAt: Date }) => {
            // Clean slug: remove leading 'blog/' if it exists to avoid double prefix
            const cleanSlug = post.slug.startsWith('blog/') ? post.slug.replace('blog/', '') : post.slug;
            return {
                url: `${baseUrl}/blog/${cleanSlug}`,
                lastModified: post.updatedAt,
                priority: 0.7,
            };
        });

        return [...routes, ...blogRoutes];
    } catch (error) {
        console.error("Sitemap generation failed to fetch posts:", error);
        return routes;
    }
}
