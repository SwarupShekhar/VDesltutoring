import { getPublishedPostBySlug } from "@/actions/blog";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { constructCanonicalMetadata } from '@/lib/seo';
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params
    const decodedSlug = decodeURIComponent(slug);

    try {
        // Try standard lookup first
        let post = await getPublishedPostBySlug(decodedSlug)
        
        // Legacy support in metadata as well
        if (!post && !decodedSlug.startsWith('blog/')) {
            post = await getPublishedPostBySlug(`blog/${decodedSlug}`);
        }

        if (!post) {
            return {
                title: "Article Not Found | Englivo Blog",
            }
        }

        const title = post.title;
        const description = post.excerpt || "Practical English fluency insights for professionals. Learn to speak naturally without translating.";
        const cleanSlug = post.slug.replace(/^blog\//, '');
        const url = `https://englivo.com/${locale}/blog/${cleanSlug}`;
        const images = post.cover ? [
            {
                url: post.cover,
                width: 1200,
                height: 630,
                alt: title,
            }
        ] : [
            {
                url: "https://englivo.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Englivo Blog",
            }
        ];

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: url,
                images: images,
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: title,
                description: description,
                images: images.map(img => img.url),
            },
            ...constructCanonicalMetadata(`/blog/${cleanSlug}`, locale)
        }
    } catch (e) {
        console.error("[BlogMetadataError] Metadata generation failed:", e);
        return {
            title: "Englivo Blog",
        }
    }
}

import { BlogSchema } from "@/components/seo/BlogSchema";
import { ShareButtons } from "@/components/blog/ShareButtons";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPostPage({ params }: PageProps) {
    const { slug, locale } = await params
    const decodedSlug = decodeURIComponent(slug);

    try {
        // 1. Primary lookup: Clean slug (Standard)
        let post = await getPublishedPostBySlug(decodedSlug)

        // 2. Legacy lookup: Try with prefix if standard fails (e.g. from old external links)
        if (!post && !decodedSlug.startsWith('blog/')) {
            post = await getPublishedPostBySlug(`blog/${decodedSlug}`);
        }

        if (!post) {
            console.error(`[BlogError] Post not found: "${decodedSlug}"`);
            notFound()
        }

        // 3. Canonical Healing: If URL is dirty but post was found, redirect to clean URL
        // This ensures SEO authority consolidates on the clean path.
        const cleanSlug = post.slug.replace(/^blog\//, '');
        if (decodedSlug !== cleanSlug) {
            const redirectPath = `/${locale}/blog/${cleanSlug}`;
            console.log(`[BlogRedirect] Healing URL from "${decodedSlug}" to "${cleanSlug}"`);
            redirect(redirectPath);
        }

        // --- Intelligence 2.0: Build Preview Map for internal links ---
        const content = post.content || "";
        const internalBlogLinkRegex = /\[.*?\]\((\/(?:[a-z]{2}\/)?blog\/([^)#\s]+))/g;
        const matches = [...content.matchAll(internalBlogLinkRegex)];
        const linkedSlugs = Array.from(new Set(matches.map(m => m[2].replace(/^\/|\/$/g, ''))));

        let previewMap: Record<string, any> = {};
        if (linkedSlugs.length > 0) {
            try {
                const previews = await prisma.blog_posts.findMany({
                    where: { 
                        slug: { in: linkedSlugs },
                        status: 'published'
                    },
                    select: {
                        slug: true,
                        title: true,
                        cover: true,
                        excerpt: true,
                        category: true
                    }
                });
                previews.forEach(p => {
                    previewMap[p.slug] = p;
                });
            } catch (previewError) {
                console.error("[BlogPreviewError] Failed to fetch internal link previews:", previewError);
                // Allow page to render without previews rather than crashing
            }
        }
        // -----------------------------------------------------------

        return (
            <article className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
                <BlogSchema post={post} slug={cleanSlug} locale={locale} />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-8 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Blog
                    </Link>

                    <header className="mb-8">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {Math.ceil((post.content || "").split(/\s+/).filter(Boolean).length / 200)} min read
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                            {post.title}
                        </h1>
                        {post.cover && (
                            <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-xl mb-8">
                                <Image
                                    src={post.cover}
                                    alt={post.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </header>

                    <article className="prose prose-lg prose-indigo dark:prose-invert max-w-3xl mx-auto px-4">
                        <TableOfContents content={post.content || ""} />
                        <div className="my-12" />
                        <MarkdownRenderer content={post.content || ""} previewMap={previewMap} locale={locale} />
                        <ShareButtons title={post.title} url={`https://englivo.com/${locale}/blog/${cleanSlug}`} postId={post.id} />
                        <RelatedPosts posts={((post as any).related_posts as any) || []} locale={locale} />
                    </article>
                </div>
            </article>
        )
    } catch (error) {
        // Next.js internal errors must be rethrown
        if ((error as any).digest?.includes('NEXT_NOT_FOUND')) throw error;
        if ((error as any).digest?.includes('NEXT_REDIRECT')) throw error;
        
        console.error("[BlogCriticalError] Render failure:", error);
        // Fallback to 404 for unrecoverable errors in post lookup
        notFound();
    }
}
