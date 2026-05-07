import { getPublishedPosts } from "@/actions/blog";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { Metadata } from 'next';
import { constructCanonicalMetadata } from '@/lib/seo';
import { getDictionary, type Locale } from "@/i18n/getDictionary";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    // For blog pages, always use English as canonical since content is English-only
    // This prevents "Duplicate, Google chose different canonical" errors
    return {
        ...constructCanonicalMetadata('/blog', 'en'),
        title: 'English Fluency Insights, Tips & Guides | Englivo Blog',
        description: 'Explore actionable guides, professional communication tips, and expert language learning strategies designed to help you speak English faster and with confidence.',
    };
}

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function BlogListPage({ params }: PageProps) {
    const { locale } = await params;
    const posts = await getPublishedPosts();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="my-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Englivo <span className="text-blue-600">Blog</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Insights, tips, and updates on your journey to English fluency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => {
                        return (
                            <Link key={post.id} href={`/${locale}/blog/${post.slug.replace(/^blog\//, '')}`} className="group flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">

                                {post.cover && (
                                    <div className="aspect-video w-full relative overflow-hidden">
                                        {/* Simple img for now, verify next/image usage if needed but external URL might need config */}
                                        <Image
                                            src={post.cover}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                            {post.category || 'General'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                            <Calendar size={12} />
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    
                                    {post.excerpt && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all border-t border-slate-100 dark:border-slate-800">
                                        Read Article <ArrowRight size={16} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-24 text-slate-500">
                        <p className="text-lg">No articles published yet. Stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
