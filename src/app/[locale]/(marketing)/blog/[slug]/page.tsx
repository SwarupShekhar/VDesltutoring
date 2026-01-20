import { getPublishedPostBySlug } from "@/actions/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { RelatedFromPillar } from '@/components/blog/RelatedFromPillar';

interface PageProps {
    params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPublishedPostBySlug(slug)

    if (!post) {
        return {
            title: "Article Not Found | Englivo Blog",
        }
    }

    return {
        title: `${post.title} | Englivo Blog`,
        description: `Read ${post.title} on Englivo.`, // Improve if we store summary/excerpt
        openGraph: {
            images: post.cover ? [post.cover] : [],
        }
    }
}

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

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: post.cover ? [post.cover] : [],
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        author: [{
            '@type': 'Person',
            name: 'Swarup Shekhar',
            url: 'https://englivo.com/about'
        }]
    }

    return (
        <article className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-8 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Blog
                </Link>

                <header className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <Calendar size={14} />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                        {post.title}
                    </h1>
                    {post.cover && (
                        <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden shadow-xl mb-8">
                            {/* External image handling needed or allow all domains */}
                            <img
                                src={post.cover}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </header>

                <article className="prose prose-lg prose-indigo dark:prose-invert max-w-3xl mx-auto px-4">
                    <MarkdownRenderer content={post.content} />
                    <RelatedFromPillar />
                </article>
            </div>
        </article>
    )
}
