import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://englivo.com";

  // Static routes (English)
  const englishRoutes = [
    {
      url: baseUrl,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/fluency-guide`,
      priority: 1.0,
      changeFrequency: "weekly" as const,
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
      changeFrequency: "weekly" as const,
    },
    {
      url: `${baseUrl}/ai-tutor`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/terms`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
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
      `${baseUrl}/${locale}/blog`,
      `${baseUrl}/${locale}/roadmap`,
      `${baseUrl}/${locale}/ai-tutor`,
      `${baseUrl}/${locale}/privacy`,
      `${baseUrl}/${locale}/terms`,
    ].map(url => ({
      url,
      priority: 0.8, // Slightly lower priority for localized versions
      changeFrequency: "weekly" as const,
    }))
  );

  const routes = [...englishRoutes, ...localizedRoutes];

  // Dynamic Blog Routes
  try {
    // Avoid hard build-time failure if DB env is missing in Vercel build
    if (!process.env.DATABASE_URL) {
      return routes;
    }

    // Lazy import so a missing/invalid DB config does not crash module load
    const { prisma } = await import("@/lib/prisma");

    const posts = await prisma.blog_posts.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes = posts.flatMap((post: { slug: string; updatedAt: Date }) => {
      // Clean slug: remove leading 'blog/' if it exists to avoid double prefix
      const cleanSlug = post.slug.startsWith("blog/")
        ? post.slug.replace("blog/", "")
        : post.slug;
      const englishUrl = {
        url: `${baseUrl}/blog/${cleanSlug}`,
        lastModified: post.updatedAt,
        priority: 0.7,
      };
      // Add localized URLs for each locale
      const localizedUrls = ["de", "fr", "es", "vi", "ja"].map(locale => ({
        url: `${baseUrl}/${locale}/blog/${cleanSlug}`,
        lastModified: post.updatedAt,
        priority: 0.6,
      }));
      return [englishUrl, ...localizedUrls];
    });

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error("Sitemap generation failed to fetch posts:", error);
    return routes;
  }
}
