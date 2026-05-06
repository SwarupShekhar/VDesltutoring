'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, User, Search, CheckCircle, Clock, AlertCircle, MessageSquare, FileText } from "lucide-react"
import { AdminBlogActions } from "./AdminBlogActions"

interface AdminBlogTableProps {
    initialPosts: any[]
    deletePostAction: (id: string) => Promise<{ success: boolean, error?: string }>
}

type TabType = 'all' | 'published' | 'submitted' | 'needs_rework' | 'draft'

export function AdminBlogTable({ initialPosts, deletePostAction }: AdminBlogTableProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [isPending, startTransition] = useTransition()

    // Counts for badges
    const counts = {
        all: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        submitted: posts.filter(p => p.status === 'submitted').length,
        needs_rework: posts.filter(p => p.status === 'needs_rework').length,
        draft: posts.filter(p => p.status === 'draft').length,
    }

    // Filtering logic
    const filteredPosts = posts.filter(post => {
        const matchesTab = activeTab === 'all' || post.status === activeTab
        const matchesSearch = 
            (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.author?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return
        startTransition(async () => {
            const res = await deletePostAction(id)
            if (res.success) {
                setPosts(prev => prev.filter(p => p.id !== id))
            } else {
                alert(res.error || "Failed to delete post")
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Search & Tabs Controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-200/10 backdrop-blur-md">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by title, author, slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-200/10 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-200 placeholder-slate-500 transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    <TabButton 
                        active={activeTab === 'all'} 
                        onClick={() => setActiveTab('all')} 
                        label="All" 
                        count={counts.all} 
                        color="slate" 
                    />
                    <TabButton 
                        active={activeTab === 'submitted'} 
                        onClick={() => setActiveTab('submitted')} 
                        label="Pending Review" 
                        count={counts.submitted} 
                        color="blue" 
                        pulsing={counts.submitted > 0}
                    />
                    <TabButton 
                        active={activeTab === 'needs_rework'} 
                        onClick={() => setActiveTab('needs_rework')} 
                        label="Rework" 
                        count={counts.needs_rework} 
                        color="orange" 
                    />
                    <TabButton 
                        active={activeTab === 'published'} 
                        onClick={() => setActiveTab('published')} 
                        label="Published" 
                        count={counts.published} 
                        color="emerald" 
                    />
                    <TabButton 
                        active={activeTab === 'draft'} 
                        onClick={() => setActiveTab('draft')} 
                        label="Drafts" 
                        count={counts.draft} 
                        color="zinc" 
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Author & Content</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engagement</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredPosts.map((post: any) => (
                                <tr key={post.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                {post.author?.profile_image_url ? (
                                                    <img src={post.author.profile_image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {post.title || 'Untitled Post'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{post.author?.full_name || 'System'}</span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">/{post.slug}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <StatusBadge status={post.status} />
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">{post.views.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Views</div>
                                    </td>
                                    <td className="px-6 py-6 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-1">
                                            {post.status === 'submitted' && (
                                                <div className="flex items-center pr-2 mr-2 border-r border-slate-200 dark:border-slate-800">
                                                    <AdminBlogActions post={post} />
                                                </div>
                                            )}
                                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                                                <Eye size={18} />
                                            </Link>
                                            <Link href={`/admin/blog/edit/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                                                <Pencil size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                disabled={isPending}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPosts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                                <AlertCircle size={40} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No items found</h3>
                                                <p className="text-slate-500 dark:text-slate-400 mt-2">No blog posts match the selected filters or search query.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function TabButton({ 
    active, 
    onClick, 
    label, 
    count, 
    color, 
    pulsing 
}: { 
    active: boolean
    onClick: () => void
    label: string
    count: number
    color: 'slate' | 'blue' | 'orange' | 'emerald' | 'zinc'
    pulsing?: boolean
}) {
    const activeColors = {
        slate: 'bg-slate-800 text-white border-slate-700',
        blue: 'bg-blue-600/10 text-blue-400 border-blue-500/20',
        orange: 'bg-orange-600/10 text-orange-400 border-orange-500/20',
        emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20',
        zinc: 'bg-zinc-800 text-slate-300 border-zinc-700'
    }

    const badgeColors = {
        slate: 'bg-slate-800 text-slate-400 border-slate-700',
        blue: 'bg-blue-500 text-white',
        orange: 'bg-orange-500 text-white',
        emerald: 'bg-emerald-500 text-white',
        zinc: 'bg-zinc-800 text-slate-400 border-zinc-700'
    }

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all relative ${
                active 
                ? activeColors[color] 
                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200'
            }`}
        >
            {label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-transparent ${
                active ? badgeColors[color] : 'bg-slate-950/40 text-slate-500 border-slate-800/40'
            }`}>
                {count}
            </span>
            {pulsing && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
            )}
        </button>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, classes: string }> = {
        published: { label: 'Live', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        submitted: { label: 'Review Queue', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        needs_rework: { label: 'Reworking', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
        draft: { label: 'Draft', classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    }

    const { label, classes } = config[status] || config.draft;

    return (
        <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${classes}`}>
            {label}
        </span>
    )
}
