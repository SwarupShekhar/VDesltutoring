'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BlogEditor from '@/components/blog/BlogEditor'
import { Loader2, ArrowLeft, Save, Globe, Eye, Code, FileText, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { SEOHealthScore } from './SEOHealthScore'
import { SettingsSidebar } from './SettingsSidebar'
import { magicScanContent } from '@/actions/intelligence'
import { getBlogRevisions } from '@/actions/blog'
import { EditorErrorBoundary } from './EditorErrorBoundary'

interface EditorPageProps {
    initialData?: {
        id: string
        title: string
        slug: string
        content: string
        status: string
        cover: string | null
        seo_title: string | null
        meta_description: string | null
        excerpt: string | null
        category: string | null
        focal_keyword: string | null
        alt_text: string | null
        published_at: Date | null
    }
    onSave: (data: any) => Promise<{ success: boolean, error?: string, id?: string }>
}

export default function BlogEditorPage({ initialData, onSave }: EditorPageProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    // Core State
    const [title, setTitle] = useState(initialData?.title || '')
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [content, setContent] = useState(initialData?.content || '')
    const [status, setStatus] = useState(initialData?.status || 'draft')
    
    // Metadata State
    const [cover, setCover] = useState(initialData?.cover || '')
    const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '')
    const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '')
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
    const [category, setCategory] = useState(initialData?.category || '')
    const [focalKeyword, setFocalKeyword] = useState(initialData?.focal_keyword || '')
    const [altText, setAltText] = useState(initialData?.alt_text || '')
    const [publishedAt, setPublishedAt] = useState<Date | null>(initialData?.published_at || null)

    // Intelligence State
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [revisions, setRevisions] = useState<any[]>([])

    // UI View State
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [viewMode, setViewMode] = useState<'visual' | 'markdown' | 'preview'>('markdown')

    // Automatically detect title from H1 in real-time
    useEffect(() => {
        const h1Match = content.match(/^#\s+(.+)$/m)
        if (h1Match && h1Match[1] !== title) {
            setTitle(h1Match[1].trim())
        }
    }, [content, title])

    const handleMagicScan = async () => {
        if (!initialData?.id || !content) return;
        
        setIsScanning(true);
        try {
            const result = await magicScanContent(initialData.id, content);
            if (result.success && result.suggestions) {
                setSuggestions(result.suggestions);
            }
        } catch (err) {
            console.error("Scan error:", err);
        } finally {
            setIsScanning(false);
        }
    };

    const fetchRevisions = async () => {
        if (!initialData?.id) return;
        const revs = await getBlogRevisions(initialData.id);
        setRevisions(revs);
    };

    useEffect(() => {
        fetchRevisions();
    }, [initialData?.id]);

    const handleRollback = (rev: any) => {
        if (confirm("Restore this version? current unsaved changes will be lost.")) {
            setTitle(rev.title || '');
            setContent(rev.content || '');
            if (rev.metadata) {
                const meta = rev.metadata as any;
                if (meta.cover !== undefined) setCover(meta.cover);
                if (meta.seo_title !== undefined) setSeoTitle(meta.seo_title);
                if (meta.meta_description !== undefined) setMetaDescription(meta.meta_description);
                if (meta.focal_keyword !== undefined) setFocalKeyword(meta.focal_keyword);
            }
        }
    };

    // Autosave Effect
    useEffect(() => {
        if (!content || content === initialData?.content) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 2000);

        return () => clearTimeout(timer);
    }, [content, title, slug, cover, seoTitle, metaDescription, excerpt, category, focalKeyword, altText]);

    const handleSave = async (overrideStatus?: string) => {
        const finalStatus = overrideStatus || status
        if (!title || !slug) {
            alert("Title and Slug are required.")
            return
        }

        setIsSaving(true);
        startTransition(async () => {
            const res = await onSave({
                title,
                slug,
                content,
                status: finalStatus,
                cover,
                seo_title: seoTitle,
                meta_description: metaDescription,
                excerpt,
                category,
                focal_keyword: focalKeyword,
                alt_text: altText,
                published_at: publishedAt
            })

            if (res.success) {
                setLastSaved(new Date());
                fetchRevisions();
                if (!initialData) {
                    router.push('/admin/blog')
                }
                router.refresh()
            } else {
                alert(res.error)
            }
            setIsSaving(false);
        })
    }

    const toggleStatus = async () => {
        const newStatus = status === 'published' ? 'draft' : 'published'
        setStatus(newStatus)
        await handleSave(newStatus)
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
            {/* Top Navigation / Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
                        <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white leading-tight">Edit Blog Post</h1>
                        <p className="text-xs text-slate-500">You have full access to all blogs</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                        {status === 'published' ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                        {status}
                    </div>

                    <button 
                        onClick={toggleStatus}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            status === 'published'
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                        }`}
                    >
                        {status === 'published' ? (
                            <><XCircle size={16} /> Unpublish</>
                        ) : (
                            <><Globe size={16} /> Publish Post 🚀</>
                        )}
                    </button>

                    <div className="h-4 w-px bg-slate-800" />

                    {/* View Switcher */}
                    <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                        <TabButton 
                            active={viewMode === 'visual'} 
                            onClick={() => setViewMode('visual')} 
                            icon={<Eye size={16} />} 
                            label="Visual" 
                        />
                        <TabButton 
                            active={viewMode === 'markdown'} 
                            onClick={() => setViewMode('markdown')} 
                            icon={<Code size={16} />} 
                            label="Markdown" 
                        />
                        <TabButton 
                            active={viewMode === 'preview'} 
                            onClick={() => setViewMode('preview')} 
                            icon={<Eye size={16} />} 
                            label="Preview" 
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            {isSaving ? (
                                <span className="text-[10px] text-blue-500 font-bold animate-pulse">AUTOSAVING...</span>
                            ) : lastSaved ? (
                                <span className="text-[10px] text-slate-500 font-medium italic">Saved {lastSaved.toLocaleTimeString()}</span>
                            ) : null}
                        </div>
                        <button
                            onClick={() => handleSave()}
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                {/* Editor Surface */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     <div className="max-w-4xl mx-auto py-12 px-6">
                        {viewMode === 'preview' ? (
                            <div className="bg-white dark:bg-slate-950 p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                                <header className="mb-8">
                                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                                        {title || 'Untitled Post'}
                                    </h1>
                                    {cover && (
                                        <div className="aspect-21/9 w-full relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                                            <Image src={cover} alt={title} fill className="object-cover" />
                                        </div>
                                    )}
                                </header>
                                <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-blue-400">
                                    <EditorErrorBoundary>
                                        <MarkdownRenderer content={content} />
                                    </EditorErrorBoundary>
                                </article>
                            </div>
                        ) : (
                            <BlogEditor 
                                content={content} 
                                onChange={setContent} 
                                mode={viewMode}
                                onMagicScan={handleMagicScan}
                                isScanning={isScanning}
                            />
                        )}
                    </div>
                </div>

                {/* Settings Sidebar */}
                <SettingsSidebar 
                    data={{
                        title, slug, cover, seoTitle, metaDescription, 
                        excerpt, category, focalKeyword, altText, publishedAt
                    }}
                    update={(updates: any) => {
                        if (updates.title !== undefined) setTitle(updates.title)
                        if (updates.slug !== undefined) setSlug(updates.slug)
                        if (updates.cover !== undefined) setCover(updates.cover)
                        if (updates.seoTitle !== undefined) setSeoTitle(updates.seoTitle)
                        if (updates.metaDescription !== undefined) setMetaDescription(updates.metaDescription)
                        if (updates.excerpt !== undefined) setExcerpt(updates.excerpt)
                        if (updates.category !== undefined) setCategory(updates.category)
                        if (updates.focalKeyword !== undefined) setFocalKeyword(updates.focalKeyword)
                        if (updates.altText !== undefined) setAltText(updates.altText)
                        if (updates.publishedAt !== undefined) setPublishedAt(updates.publishedAt)
                    }}
                    content={content}
                    suggestions={suggestions}
                    revisions={revisions}
                    onRollback={handleRollback}
                />
            </main>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
