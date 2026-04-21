import { getPublishedPostBySlug } from "@/actions/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { constructCanonicalMetadata } from '@/lib/seo';
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { RelatedFromPillar } from '@/components/blog/RelatedFromPillar';
import { TableOfContents } from "@/components/blog/TableOfContents";

interface PageProps {
    params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params
    const decodedSlug = decodeURIComponent(slug);

    // Try to get the post, handling potential prefix issues similarly to the component
    let post = await getPublishedPostBySlug(decodedSlug)
    if (!post) {
        post = await getPublishedPostBySlug(`blog/${decodedSlug}`);
    }

    if (!post) {
        return {
            title: "Article Not Found | Englivo Blog",
        }
    }

    const title = post.title;
    const description = "Practical English fluency insights for professionals. Learn to speak naturally without translating.";
    const url = `https://englivo.com/${locale}/blog/${slug}`;
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
        // keywords: post.keywords, // Assuming keywords might be added to schema later, currently not in Prisma model
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
        ...constructCanonicalMetadata(`/blog/${slug}`, locale)
    }
}

import { BlogSchema } from "@/components/seo/BlogSchema";
import { ShareButtons } from "@/components/blog/ShareButtons";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPostPage({ params }: PageProps) {
    const { slug, locale } = await params
    console.log(`[BlogParamDebug] Slug raw: "${slug}", Locale: "${locale}"`);

    const decodedSlug = decodeURIComponent(slug);
    console.log(`[BlogParamDebug] Decoded Slug: "${decodedSlug}"`);

    let post = await getPublishedPostBySlug(decodedSlug)

    if (!post) {
        console.log(`[BlogDebug] Clean slug not found. Trying with 'blog/' prefix...`);
        post = await getPublishedPostBySlug(`blog/${decodedSlug}`);
    }

    if (!post) {
        console.error(`[BlogError] Post not found for slug: "${decodedSlug}" (nor with prefix)`);
        notFound()
    }

    return (
        <article className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
            <BlogSchema post={post} slug={decodedSlug} locale={locale} />
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
                            {Math.ceil(post.content.split(/\s+/).filter(Boolean).length / 200)} min read
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                        {post.title}
                    </h1>
                    {post.cover && (
                        <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-xl mb-8">
                            {/* External image handling needed or allow all domains */}
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
                    <TableOfContents content={post.content} />
                    <div className="my-12" />
                    <MarkdownRenderer content={post.content} />
                    <ShareButtons title={post.title} url={`https://englivo.com/${locale}/blog/${slug}`} postId={post.id} />
                    <RelatedFromPillar />
                </article>
            </div>
        </article>
    )
}
