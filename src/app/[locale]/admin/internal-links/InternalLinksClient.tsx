'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Filter, Loader2, Save, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { createInternalLink, updateInternalLink, deleteInternalLink } from '@/actions/internal-links'

interface InternalLink {
    id: string
    keyword: string
    url: string
    category: string
    isActive: boolean
    updatedAt: Date
}

export default function InternalLinksClient({ initialLinks }: { initialLinks: InternalLink[] }) {
    const [links, setLinks] = useState(initialLinks)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [editingLink, setEditingLink] = useState<InternalLink | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        keyword: '',
        url: '',
        category: 'navigation',
        isActive: true
    })

    const categories = ['navigation', 'blog', 'course', 'resource', 'landing']

    const filteredLinks = links.filter(link => {
        const matchesSearch = link.keyword.toLowerCase().includes(search.toLowerCase()) || 
                             link.url.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleOpenModal = (link?: InternalLink) => {
        if (link) {
            setEditingLink(link)
            setFormData({
                keyword: link.keyword,
                url: link.url,
                category: link.category,
                isActive: link.isActive
            })
        } else {
            setEditingLink(null)
            setFormData({
                keyword: '',
                url: '',
                category: 'navigation',
                isActive: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            if (editingLink) {
                const res = await updateInternalLink(editingLink.id, formData)
                if (res.success) {
                    setLinks(links.map(l => l.id === editingLink.id ? { ...l, ...formData, updatedAt: new Date() } : l))
                    setIsModalOpen(false)
                } else {
                    alert(res.error)
                }
            } else {
                const res = await createInternalLink(formData)
                if (res.success && res.id) {
                    setLinks([{ ...formData, id: res.id, updatedAt: new Date() }, ...links])
                    setIsModalOpen(false)
                } else {
                    alert(res.error)
                }
            }
        } catch (error) {
            console.error("Action error:", error)
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this internal link?")) return
        
        try {
            const res = await deleteInternalLink(id)
            if (res.success) {
                setLinks(links.filter(l => l.id !== id))
            } else {
                alert(res.error)
            }
        } catch (error) {
            console.error("Delete error:", error)
        }
    }

    const handleToggleActive = async (link: InternalLink) => {
        try {
            const newStatus = !link.isActive
            const res = await updateInternalLink(link.id, { isActive: newStatus })
            if (res.success) {
                setLinks(links.map(l => l.id === link.id ? { ...l, isActive: newStatus } : l))
            }
        } catch (error) {
            console.error("Toggle error:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Internal Link Database</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    Add Link
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Search keywords or URLs..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">Keyword</th>
                            <th className="px-6 py-4 text-left">Target URL</th>
                            <th className="px-6 py-4 text-left">Category</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredLinks.map((link) => (
                            <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-slate-900 dark:text-white">{link.keyword}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{link.url}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase">
                                        {link.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button 
                                        onClick={() => handleToggleActive(link)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${link.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${link.isActive ? 'left-5.5' : 'left-0.5'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            onClick={() => handleOpenModal(link)}
                                            className="text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(link.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLinks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No internal links found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingLink ? 'Edit Internal Link' : 'Add Internal Link'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Keyword</label>
                        <input 
                            required
                            type="text"
                            placeholder="e.g. IELTS"
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.keyword}
                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">This will be the anchor text for the link.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Target URL</label>
                        <input 
                            required
                            type="text"
                            placeholder="e.g. /courses/ielts-masterclass"
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Relative paths (/...) or absolute URLs.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                        <select 
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input 
                            type="checkbox"
                            id="is_active"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-600 dark:text-slate-400">Active (Enables in Magic Scan)</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-500 hover:text-slate-400 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingLink ? 'Save Changes' : 'Create Link'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
