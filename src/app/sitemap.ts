import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { PAGES_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { Page } from "@/types/sanity";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://englivo.com";
  const lastModified = new Date();

  // Static routes (English)
  const englishRoutes = [
    { url: baseUrl, priority: 1.0, lastModified },
    { url: `${baseUrl}/fluency-guide`, priority: 1.0, changeFrequency: "weekly" as const, lastModified },
    { url: `${baseUrl}/how-it-works`, priority: 0.9, lastModified },
    { url: `${baseUrl}/method`, priority: 0.9, lastModified },
    { url: `${baseUrl}/about`, priority: 0.8, lastModified },
    { url: `${baseUrl}/pricing`, priority: 0.8, lastModified },
    { url: `${baseUrl}/faq`, priority: 0.7, lastModified },
    { url: `${baseUrl}/blog`, priority: 0.8, lastModified },
    { url: `${baseUrl}/ai-tutor`, priority: 0.9, lastModified },
    { url: `${baseUrl}/privacy`, priority: 0.7, changeFrequency: "monthly" as const, lastModified },
    { url: `${baseUrl}/terms`, priority: 0.7, changeFrequency: "monthly" as const, lastModified },
  ];

  // Localized routes for non-English locales
  const localizedRoutes = ["de", "fr", "es", "vi", "ja"].flatMap(locale =>
    [
      `${baseUrl}/${locale}`,
      `${baseUrl}/${locale}/fluency-guide`,
      `${baseUrl}/${locale}/how-it-works`,
      `${baseUrl}/${locale}/method`,
      `${baseUrl}/${locale}/about`,
      `${baseUrl}/${locale}/pricing`,
      `${baseUrl}/${locale}/faq`,
      `${baseUrl}/${locale}/blog`,
      `${baseUrl}/${locale}/ai-tutor`,
      `${baseUrl}/${locale}/privacy`,
      `${baseUrl}/${locale}/terms`,
    ].map(url => ({
      url,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified,
    }))
  );

  let allRoutes = [...englishRoutes, ...localizedRoutes];

  // Dynamic Blog Routes
  try {
    if (process.env.DATABASE_URL) {
      const { prisma } = await import("@/lib/prisma");
      const posts = await prisma.blog_posts.findMany({
        where: { status: "published" },
        select: { slug: true, updatedAt: true },
      });

      const blogRoutes = posts.map((post) => {
        const cleanSlug = post.slug.startsWith("blog/")
          ? post.slug.replace("blog/", "")
          : post.slug;
        return {
          url: `${baseUrl}/blog/${cleanSlug}`,
          lastModified: post.updatedAt,
          priority: 0.7,
        };
      });
      allRoutes = [...allRoutes, ...blogRoutes];
    }
  } catch (error) {
    console.error("Sitemap generation failed to fetch posts:", error);
  }

  // Dynamic Sanity Pages
  try {
    type SanityPageSlug = { slug: string; language: string; _updatedAt: string }
    const sanityPages = await client.fetch<SanityPageSlug[]>(PAGES_SLUGS_QUERY);
    const sanityRoutes = sanityPages.map((page) => ({
      url: page.language === 'en' 
        ? `${baseUrl}/p/${page.slug}` 
        : `${baseUrl}/${page.language}/p/${page.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: new Date(page._updatedAt),
    }));
    allRoutes = [...allRoutes, ...sanityRoutes];
  } catch (e) {
    console.error("Sitemap failed to fetch Sanity pages:", e);
  }

  return allRoutes;
}
