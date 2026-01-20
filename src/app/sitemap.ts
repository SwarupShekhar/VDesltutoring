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
            url: `${baseUrl}/how-it-works`,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/our-method`,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/methodology`,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            priority: 0.8, // Increased priority for blog hub
        }
    ];

    // Dynamic Blog Routes
    try {
        const posts = await prisma.blog_posts.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true }
        });

        const blogRoutes = posts.map((post: { slug: string; updatedAt: Date }) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            priority: 0.7,
        }));

        return [...routes, ...blogRoutes];
    } catch (error) {
        console.error("Sitemap generation failed to fetch posts:", error);
        return routes;
    }
}
