'use client'

import { useState } from 'react'
import { 
    Layout, 
    Type, 
    Image as ImageIcon, 
    Hash, 
    Calendar, 
    Search, 
    FileText, 
    ChevronDown, 
    ChevronUp,
    Zap,
    CheckCircle2,
    AlertCircle,
    Info,
    Share2,
    Target
} from 'lucide-react'
import { SocialPreview } from './SocialPreview'
import { SEOHealthScore } from './SEOHealthScore'
import { useSEOHealth } from '@/hooks/useSEOHealth'

interface SettingsSidebarProps {
    data: {
        title: string
        slug: string
        cover: string
        seoTitle: string
        metaDescription: string
        excerpt: string
        category: string
        focalKeyword: string
        altText: string
        publishedAt: Date | null
        views?: number
        slugError?: string | null
    }
    update: (updates: Partial<SettingsSidebarProps['data']>) => void
    content: string
    onContentChange?: (content: string) => void
    suggestions?: any[]
    revisions?: any[]
    internalLinks?: any[]
    categories?: any[]
    onRollback?: (revision: any) => void
}

export function SettingsSidebar({ data, update, content, onContentChange, suggestions = [], revisions = [], internalLinks = [], categories = [], onRollback }: SettingsSidebarProps) {
    const [activeTab, setActiveTab] = useState<'settings' | 'links'>('settings')
    const [linkSearch, setLinkSearch] = useState('')
    const [linkCategory, setLinkCategory] = useState('all')
    const [showSEO, setShowSEO] = useState(false)
    const [showSocialPreview, setShowSocialPreview] = useState(false)
    const [showRevisions, setShowRevisions] = useState(false)
    const seo = useSEOHealth(content, {
        title: data.seoTitle || data.title,
        metaDescription: data.metaDescription,
        focalKeyword: data.focalKeyword,
        altText: data.altText,
        slug: data.slug
    })

    return (
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
                {/* Header */}
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-800 mb-6">
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Metadata
                    </button>
                    <button 
                        onClick={() => setActiveTab('links')}
                        className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'links' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Links
                    </button>
                </div>

                {activeTab === 'settings' ? (
                    <div className="space-y-8">

                {/* Section: Title & Identity */}
                <div className="space-y-4">
                    <SidebarSection icon={<Type size={14} />} label="Title">
                        <input 
                            type="text"
                            value={data.title}
                            onChange={(e) => update({ title: e.target.value })}
                            className="sidebar-input"
                            placeholder="Enter blog title..."
                        />
                    </SidebarSection>

                    <SidebarSection icon={<ImageIcon size={14} />} label="Cover Media">
                        <div className="space-y-3">
                            <div className="relative group">
                                <input 
                                    type="text"
                                    value={data.cover}
                                    onChange={(e) => update({ cover: e.target.value })}
                                    className="sidebar-input pr-10"
                                    placeholder="Cloudinary / Image Link"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <CheckCircle2 size={16} className={data.cover ? "text-blue-500" : ""} />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Accessibility (Alt Text)</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={data.altText}
                                        onChange={(e) => update({ altText: e.target.value })}
                                        className="sidebar-input text-xs"
                                        placeholder="Describe the image..."
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-bold hover:bg-indigo-500/20">
                                        Suggestion
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600 flex items-center gap-1">
                                    <Info size={10} /> Pro-tip: Use "cover image" to improve accessibility.
                                </p>
                            </div>
                        </div>
                    </SidebarSection>
                </div>

                {/* Section: Metadata */}
                <div className="grid grid-cols-2 gap-4">
                    <SidebarSection icon={<Hash size={14} />} label="Category">
                        <select 
                            value={data.category}
                            onChange={(e) => update({ category: e.target.value })}
                            className="sidebar-input text-xs"
                        >
                            <option value="General">General</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </SidebarSection>
                    <SidebarSection icon={<Calendar size={14} />} label="Publish Date">
                         <input 
                            type="datetime-local"
                            value={data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : ''}
                            onChange={(e) => update({ publishedAt: new Date(e.target.value) })}
                            className="sidebar-input text-[10px]"
                        />
                    </SidebarSection>
                </div>

                {/* Excerpt */}
                <SidebarSection icon={<FileText size={14} />} label="Excerpt">
                    <div className="relative">
                        <textarea 
                            value={data.excerpt}
                            onChange={(e) => update({ excerpt: e.target.value })}
                            className="sidebar-input h-24 resize-none text-xs"
                            placeholder="Short description for blog cards..."
                        />
                        <div className="absolute right-2 bottom-2 text-[9px] text-slate-500">
                            {data.excerpt.length}/200
                        </div>
                    </div>
                </SidebarSection>

                {/* Slug */}
                <SidebarSection icon={<Search size={14} />} label="URL Slug">
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">/</span>
                                <input 
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => update({ slug: e.target.value })}
                                    className={`sidebar-input pl-6 text-xs ${data.slugError ? 'border-rose-500/50 focus:ring-rose-500/50' : ''}`}
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                            <button 
                                onClick={() => update({ slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold uppercase transition-colors"
                            >
                                Generate
                            </button>
                        </div>
                        {data.slugError && (
                            <p className="text-[9px] text-rose-500 flex items-center gap-1">
                                <AlertCircle size={10} /> {data.slugError}
                            </p>
                        )}
                    </div>
                </SidebarSection>

                {/* SEO Health Section */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <SEOHealthScore 
                        score={seo.score} 
                        checks={seo.checks} 
                    />

                    <div className="p-1 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lifetime Views</span>
                            <span className="text-xs font-black text-white">{data.views || 0}</span>
                        </div>
                    </div>

                    {/* SEO Detailed Toggle */}
                    <button 
                        onClick={() => setShowSEO(!showSEO)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-blue-400 hover:bg-blue-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <Search size={14} /> SEO SETTINGS
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            {showSEO ? 'Hide' : 'Show'}
                            {showSEO ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                    </button>

                    {showSEO && (
                        <div className="space-y-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SEO Title</label>
                                    <span className={`text-[9px] font-bold ${data.seoTitle.length > 60 ? 'text-rose-500' : 'text-slate-500'}`}>
                                        {data.seoTitle.length}/60
                                    </span>
                                </div>
                                <input 
                                    type="text"
                                    value={data.seoTitle}
                                    onChange={(e) => update({ seoTitle: e.target.value })}
                                    className="sidebar-input text-xs"
                                    placeholder="Custom title for Google"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta Description</label>
                                    <span className={`text-[9px] font-bold ${data.metaDescription.length > 160 ? 'text-rose-500' : 'text-slate-500'}`}>
                                        {data.metaDescription.length}/160
                                    </span>
                                </div>
                                <textarea 
                                    value={data.metaDescription}
                                    onChange={(e) => update({ metaDescription: e.target.value })}
                                    className="sidebar-input text-xs h-20 resize-none"
                                    placeholder="Custom description..."
                                />
                            </div>

                            {/* Google Preview */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <span className="text-[9px] font-bold text-slate-600 uppercase">Google Preview:</span>
                                <div className="p-4 bg-white rounded-xl space-y-1.5 shadow-inner">
                                    <div className="text-[#1a0dab] text-lg font-normal leading-tight hover:underline cursor-pointer truncate">
                                        {data.seoTitle || data.title || 'Page Title'}
                                    </div>
                                    <div className="text-[#202124] text-xs font-normal truncate opacity-70 leading-none">
                                        https://englivo.com › blog › {data.slug || 'slug'}
                                    </div>
                                    <div className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                                        {data.metaDescription || 'Add a meta description to see how your post will look in Google Search results...'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Preview Toggle */}
                    <button 
                        onClick={() => setShowSocialPreview(!showSocialPreview)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <Share2 size={14} /> SOCIAL PREVIEW
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            {showSocialPreview ? 'Hide' : 'Show'}
                            {showSocialPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                    </button>

                    {showSocialPreview && (
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
                            <SocialPreview 
                                title={data.seoTitle || data.title}
                                description={data.metaDescription}
                                cover={data.cover}
                                slug={data.slug}
                            />
                        </div>
                    )}
                </div>

                {/* Revision History */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <button 
                        onClick={() => setShowRevisions(!showRevisions)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <Calendar size={14} /> REVISION HISTORY
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            {revisions.length} Snapshots
                            {showRevisions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                    </button>

                    {showRevisions && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            {revisions.length === 0 ? (
                                <p className="text-[10px] text-slate-600 text-center py-4">No revisions found yet.</p>
                            ) : (
                                revisions.map((rev, i) => (
                                    <div key={rev.id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl group hover:border-indigo-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-slate-200">
                                                {new Date(rev.createdAt).toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-slate-600 font-mono">#{rev.id.slice(0, 4)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">{rev.title || 'Untitled'}</p>
                                        <button 
                                            onClick={() => onRollback?.(rev)}
                                            className="w-full py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all active:scale-95"
                                        >
                                            Restore Version
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Internal Linking Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                                <Zap size={14} /> Magic Scan
                            </div>
                            <button 
                                onClick={() => {
                                    let newContent = content;
                                    suggestions.forEach(s => {
                                        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                        const regex = new RegExp(`(?<!\\[)${escapeRegex(s.keyword)}(?!\\]|\\(|\\w)`, 'i');
                                        newContent = newContent.replace(regex, `[${s.keyword}](${s.url})`);
                                    });
                                    if (onContentChange) onContentChange(newContent);
                                }}
                                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
                            >
                                Bulk Apply
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Grouped by category */}
                            {Array.from(new Set(suggestions.map(s => s.category))).map(cat => (
                                <div key={cat as string} className="space-y-2">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">{cat as string}</div>
                                    <div className="space-y-2">
                                        {suggestions.filter(s => s.category === cat).slice(0, 10).map((s, i) => (
                                            <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl group hover:bg-blue-500/10 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="text-[10px] text-blue-300 font-bold mb-0.5 flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                                                            Found {s.matchCount} mentions
                                                        </div>
                                                        <div className="text-xs text-white font-medium">{s.keyword}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                                            const regex = new RegExp(`(?<!\\[)${escapeRegex(s.keyword)}(?!\\]|\\(|\\w)`, 'i');
                                                            const newContent = content.replace(regex, `[${s.keyword}](${s.url})`);
                                                            if (onContentChange) onContentChange(newContent);
                                                        }}
                                                        className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-[9px] font-bold uppercase transition-all"
                                                    >
                                                        Insert
                                                    </button>
                                                </div>
                                                <div className="text-[9px] text-slate-500 font-mono truncate">{s.url}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text"
                                    placeholder="Search link database..."
                                    className="sidebar-input pl-9 text-xs"
                                    value={linkSearch}
                                    onChange={(e) => setLinkSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {['all', 'navigation', 'blog', 'course', 'resource'].map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setLinkCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${linkCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {internalLinks
                                .filter(l => {
                                    const matchesSearch = l.keyword.toLowerCase().includes(linkSearch.toLowerCase()) || l.url.toLowerCase().includes(linkSearch.toLowerCase())
                                    const matchesCat = linkCategory === 'all' || l.category === linkCategory
                                    return matchesSearch && matchesCat
                                })
                                .map((l, i) => {
                                    const isAlreadyLinked = content.toLowerCase().includes(`](${l.url.toLowerCase()})`) || content.toLowerCase().includes(`](${l.url.toLowerCase()} `)
                                    return (
                                        <button 
                                            key={i}
                                            onClick={() => {
                                                if (onContentChange) {
                                                    const markdown = `[${l.keyword}](${l.url})`
                                                    // Simple append at the end or if we had editor ref we could insert at cursor
                                                    // Spec: "inserts [keyword](url) at cursor position in editor"
                                                    // Since we don't have direct ref to editor here, we might need to handle this in BlogEditor
                                                    // For now, I'll use a hack or just emit a custom event
                                                    const event = new CustomEvent('insert-markdown', { detail: markdown })
                                                    window.dispatchEvent(event)
                                                }
                                            }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${isAlreadyLinked ? 'opacity-40 border-slate-800 bg-slate-900/30' : 'border-slate-800 bg-slate-900 hover:border-blue-500/50 hover:bg-blue-500/5'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-white">{l.keyword}</span>
                                                <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded font-black uppercase">{l.category}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono truncate">{l.url}</div>
                                        </button>
                                    )
                                })
                            }
                            {internalLinks.length === 0 && (
                                <p className="text-[10px] text-slate-600 text-center py-8 italic">No internal links found in database.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}

function SidebarSection({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {icon} {label}
            </div>
            {children}
        </div>
    )
}
