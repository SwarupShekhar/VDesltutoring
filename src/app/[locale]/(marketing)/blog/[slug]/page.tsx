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
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPublishedPostBySlug(decodedSlug);

    if (!post) {
        return {};
    }

    // For blog posts, always use English as canonical since content is English-only
    // This prevents "Duplicate, Google chose different canonical" errors
    return {
        ...constructCanonicalMetadata(`/blog/${post.slug.replace(/^blog\//, '')}`, 'en'),
        title: post.title,
        description: post.excerpt || post.meta_description || `${post.title} - Learn English with Englivo`,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.meta_description,
            images: post.cover ? [{ url: post.cover, alt: post.title }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.meta_description,
            images: post.cover ? [post.cover] : [],
        },
    };
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



import { BlogSchema } from "@/components/seo/BlogSchema";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { BlogCTACard } from '@/components/blog/BlogCTACard';

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
            const redirectPath = locale === 'en' ? `/blog/${cleanSlug}` : `/${locale}/blog/${cleanSlug}`;
            redirect(redirectPath);
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

        const displayContent = content.replace(/^# [^\n]*\n?/, '')

        return (
            <article className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
                <BlogSchema post={post} slug={cleanSlug} locale={locale} />

                {/* Above fold: full width */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8">
                        <ArrowLeft size={16} className="mr-2" /> Back to Blog
                    </Link>

                    <header className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-4">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recent'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {Math.ceil(content.split(/\s+/).length / 200)} min read
                            </span>
                            {post.category && (
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                                    {post.category}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="text-lg text-slate-500 italic max-w-2xl mx-auto">
                                {post.excerpt}
                            </p>
                        )}
                    </header>

                    {post.cover && (
                        <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-xl mb-12">
                            <Image src={post.cover} alt={post.title || 'Blog Image'} fill priority className="object-cover" />
                        </div>
                    )}
                </div>

                {/* 3-column layout below cover */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[220px_1fr_280px] lg:gap-10">

                        {/* Left sidebar: sticky INDEX + CTA link */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-28 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Index</p>
                                    <TableOfContents content={displayContent} variant="sidebar" />
                                </div>
                                <Link
                                    href={`/${locale}/pricing`}
                                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    Book Free Trial →
                                </Link>
                            </div>
                        </aside>

                        {/* Center: article content */}
                        <div className="min-w-0">
                            <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
                                <MarkdownRenderer content={displayContent} previewMap={previewMap} locale={locale} />
                            </div>
                            <BlogCTACard variant="bottom" />
                            <ShareButtons title={post.title || ''} url={`https://englivo.com/${locale}/blog/${cleanSlug}`} postId={post.id} />
                            <RelatedPosts posts={relatedPosts} locale={locale} />
                        </div>

                        {/* Right sidebar: sticky CTA card + compendium */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-28 space-y-6">
                                <BlogCTACard variant="sidebar" />
                                {relatedPosts.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Compendium</p>
                                        <div className="space-y-4">
                                            {relatedPosts.slice(0, 3).map((rp: any, i: number) => (
                                                <Link
                                                    key={i}
                                                    href={`/${locale}/blog/${rp.slug}`}
                                                    className="flex gap-3 group"
                                                >
                                                    {rp.cover && (
                                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                                                            <Image src={rp.cover} alt={rp.title || ''} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        {rp.category && (
                                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                                {rp.category}
                                                            </span>
                                                        )}
                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                                            {rp.title}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

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
