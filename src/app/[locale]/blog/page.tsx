import { getPublishedPosts } from "@/actions/blog";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog - English Learning Tips | Englivo",
    description: "Read the latest articles on English learning, fluency tips, and the Englivo methodology.",
}

export default async function BlogListPage() {
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
                    {posts.map((post: any) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            {post.cover && (
                                <div className="aspect-[16/9] w-full relative overflow-hidden">
                                    {/* Simple img for now, verify next/image usage if needed but external URL might need config */}
                                    <img
                                        src={post.cover}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    <Calendar size={14} />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors">
                                    {post.title}
                                </h2>
                                <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                                    Read Article <ArrowRight size={16} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
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
