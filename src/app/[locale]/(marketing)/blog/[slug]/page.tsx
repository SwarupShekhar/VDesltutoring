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

// 1. Shared lookup logic to ensure consistency between Metadata and Rendering
async function resolvePost(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    // Standard lookup
    let post = await getPublishedPostBySlug(decodedSlug);
    // Legacy fallback
    if (!post && !decodedSlug.startsWith('blog/')) {
        post = await getPublishedPostBySlug(`blog/${decodedSlug}`);
    }
    return { post, decodedSlug };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    try {
        const { post } = await resolvePost(slug);
        
        if (!post) {
            return { title: "Article Not Found | Englivo Blog" };
        }

        const cleanSlug = post.slug.replace(/^blog\//, '');
        const title = post.title || "Untitled Article";
        const description = post.excerpt || "Practical English fluency insights for professionals.";

        return {
            title,
            description,
            ...constructCanonicalMetadata(`/blog/${cleanSlug}`, locale)
        }
    } catch (e) {
        return { title: "Englivo Blog" };
    }
}

import { BlogSchema } from "@/components/seo/BlogSchema";
import { ShareButtons } from "@/components/blog/ShareButtons";

export const revalidate = 3600;

export default async function BlogPostPage({ params }: PageProps) {
    const { slug, locale } = await params;
    
    try {
        const { post, decodedSlug } = await resolvePost(slug);

        if (!post) {
            console.error(`[BlogError] Post not found: "${decodedSlug}"`);
            notFound();
        }

        // Canonical Healing
        const cleanSlug = post.slug.replace(/^blog\//, '');
        if (decodedSlug !== cleanSlug) {
            redirect(`/${locale}/blog/${cleanSlug}`);
        }

        // Safe Preview Map Building
        let previewMap: Record<string, any> = {};
        const content = post.content || "";
        const internalBlogLinkRegex = /\[.*?\]\((\/(?:[a-z]{2}\/)?blog\/([^)#\s]+))/g;
        const matches = [...content.matchAll(internalBlogLinkRegex)];
        const linkedSlugs = matches.map(m => m[2].replace(/^\/|\/$/g, '')).filter(Boolean);

        if (linkedSlugs.length > 0) {
            try {
                const previews = await prisma.blog_posts.findMany({
                    where: { slug: { in: Array.from(new Set(linkedSlugs)) }, status: 'published' },
                    select: { slug: true, title: true, cover: true, excerpt: true, category: true }
                });
                previews.forEach(p => { previewMap[p.slug] = p; });
            } catch (err) {
                console.warn("[BlogPreviewError] Non-critical failure fetching previews:", err);
            }
        }

        const relatedPosts = Array.isArray((post as any).related_posts) ? (post as any).related_posts : [];

        return (
            <article className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
                <BlogSchema post={post} slug={cleanSlug} locale={locale} />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8">
                        <ArrowLeft size={16} className="mr-2" /> Back to Blog
                    </Link>

                    <header className="mb-8">
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recent'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {Math.ceil(content.split(/\s+/).length / 200)} min read
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                            {post.title}
                        </h1>
                        {post.cover && (
                            <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-xl mb-8">
                                <Image src={post.cover} alt={post.title || "Blog Image"} fill priority className="object-cover" />
                            </div>
                        )}
                    </header>

                    <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
                        <TableOfContents content={content} />
                        <div className="my-12" />
                        <MarkdownRenderer content={content} previewMap={previewMap} locale={locale} />
                        <ShareButtons title={post.title || ""} url={`https://englivo.com/${locale}/blog/${cleanSlug}`} postId={post.id} />
                        <RelatedPosts posts={relatedPosts} locale={locale} />
                    </div>
                </div>
            </article>
        )
    } catch (error: any) {
        // Universal Next.js Signal Passthrough
        if (error?.digest?.includes('NEXT_NOT_FOUND') || error?.digest?.includes('NEXT_REDIRECT')) throw error;
        if (error?.message?.includes('NEXT_REDIRECT') || error?.message?.includes('NEXT_NOT_FOUND')) throw error;

        console.error("[BlogCriticalError] Unhandled page crash:", error);
        notFound();
    }
}
