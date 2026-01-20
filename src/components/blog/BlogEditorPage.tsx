'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BlogEditor from '@/components/blog/BlogEditor'
import { useTransition } from 'react'
import { Loader2, ArrowLeft, Save, Globe } from 'lucide-react'
import Link from 'next/link'
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

interface EditorPageProps {
    initialData?: {
        id: string
        title: string
        slug: string
        content: string
        status: string
        cover: string | null
    }
    onSave: (data: any) => Promise<{ success: boolean, error?: string, id?: string }>
}

export default function BlogEditorPage({ initialData, onSave }: EditorPageProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [title, setTitle] = useState(initialData?.title || '')
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [content, setContent] = useState(initialData?.content || '')
    const [status, setStatus] = useState(initialData?.status || 'draft')
    const [cover, setCover] = useState(initialData?.cover || '')
    const [isPreview, setIsPreview] = useState(false)

    const handleSave = async () => {
        if (!title || !slug) return

        startTransition(async () => {
            const res = await onSave({
                title,
                slug,
                content,
                status,
                cover
            })

            if (res.success) {
                router.push('/admin/blog')
                router.refresh()
            } else {
                alert(res.error)
            }
        })
    }

    const generateSlug = () => {
        const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        setSlug(s)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Edit Post' : 'New Post'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPreview
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        {isPreview ? 'Back to Editor' : 'Preview'}
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save
                    </button>
                </div>
            </div>

            {isPreview ? (
                <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="max-w-3xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                                {title || 'Untitled Post'}
                            </h1>
                            {cover && (
                                <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden shadow-xl mb-8">
                                    <img
                                        src={cover}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </header>

                        <article className="prose prose-lg prose-indigo dark:prose-invert max-w-3xl mx-auto px-4">
                            <MarkdownRenderer content={content} />
                        </article>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => !slug && generateSlug()}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Post title..."
                                />
                            </div>
                            <BlogEditor content={content} onChange={setContent} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="post-url-slug"
                                    />
                                    <button
                                        onClick={generateSlug}
                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Auto-generate from title"
                                    >
                                        <Globe size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                                <input
                                    type="text"
                                    value={cover}
                                    onChange={(e) => setCover(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
