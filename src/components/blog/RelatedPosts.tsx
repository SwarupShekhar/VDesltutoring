import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface RelatedPostPreview {
    slug: string
    title: string
    cover: string | null
    excerpt: string | null
    category: string | null
}

interface RelatedPostsProps {
    posts: RelatedPostPreview[]
    locale: string
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null

    return (
        <section className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related Lessons</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Deepen your understanding with these selected articles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(0, 3).map((post) => (
                    <Link 
                        key={post.slug} 
                        href={`/${locale}/blog/${post.slug}`}
                        className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                        {post.cover && (
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                    src={post.cover}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {post.category && (
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                                            {post.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="p-5 flex flex-col grow">
                            {!post.cover && post.category && (
                                <span className="inline-block mb-3 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded self-start">
                                    {post.category}
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3 line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 grow">
                                {post.excerpt}
                            </p>
                            <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:gap-2 transition-all">
                                Read Article
                                <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
