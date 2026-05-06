'use client'

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Plus, Pencil, Trash2, Eye, Send, AlertCircle, Clock, CheckCircle,
    MessageSquare, Copy, Search, ChevronDown, ChevronLeft, ChevronRight,
    BarChart2, BookOpen, Calendar, Sparkles, FileText, X, Check, Bell, Info,
    ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react"

interface NotificationItem {
    id: string
    title: string
    message: string
    is_read: boolean
    created_at: Date
}

interface TutorBlogDashboardProps {
    initialPosts: any[]
    initialNotifications: NotificationItem[]
    initialAuditLogs?: any[]
    unreadNotificationCount: number
    deletePostAction: (id: string) => Promise<{ success: boolean, error?: string }>
    submitForReviewAction: (id: string) => Promise<{ success: boolean, error?: string }>
    duplicatePostAction: (id: string) => Promise<{ success: boolean, id?: string, error?: string }>
    bulkDeletePostsAction: (ids: string[]) => Promise<{ success: boolean, count?: number, error?: string }>
    bulkSubmitAction: (ids: string[]) => Promise<{ success: boolean, count?: number, error?: string }>
    markNotificationReadAction: (id: string) => Promise<{ success: boolean }>
}

type TabType = 'all' | 'draft' | 'submitted' | 'needs_rework' | 'published'
type SortField = 'updatedAt' | 'title' | 'views' | 'status'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'calendar'

export function TutorBlogDashboard({
    initialPosts,
    initialNotifications,
    initialAuditLogs = [],
    unreadNotificationCount,
    deletePostAction,
    submitForReviewAction,
    duplicatePostAction,
    bulkDeletePostsAction,
    bulkSubmitAction,
    markNotificationReadAction
}: TutorBlogDashboardProps) {
    const router = useRouter()
    const [posts, setPosts] = useState(initialPosts)
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()

    // Views Mode Toggle
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    // Timeline and checklist modals
    const [activeHistoryPostId, setActiveHistoryPostId] = useState<string | null>(null)
    const [submitChecklistPost, setSubmitChecklistPost] = useState<any | null>(null)

    // Calendar Navigation State
    const today = new Date()
    const [calendarYear, setCalendarYear] = useState(today.getFullYear())
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth()) // 0-indexed

    // Sorting State
    const [sortField, setSortField] = useState<SortField>('updatedAt')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Template Selector State
    const [showTemplatesModal, setShowTemplatesModal] = useState(false)

    // Sync state if props change
    useEffect(() => {
        setPosts(initialPosts)
    }, [initialPosts])

    useEffect(() => {
        setNotifications(initialNotifications)
    }, [initialNotifications])

    // Pre-calculate statistics
    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        pending: posts.filter(p => p.status === 'submitted').length,
        rework: posts.filter(p => p.status === 'needs_rework').length,
        drafts: posts.filter(p => p.status === 'draft').length,
    }

    // Analytics calculations
    const draftRatio = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0
    const publishedPosts = posts.filter(p => p.status === 'published')
    const topPerforming = [...publishedPosts].sort((a, b) => b.views - a.views)[0] || null
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

    // Real views trend data - use actual view history if available, otherwise hide
    const viewsTrend = topPerforming && topPerforming.views > 0 ? null : null // Placeholder until view history is tracked

    // Turnaround time logic based on database fields
    const publishedWithReview = posts.filter(p => p.status === 'published' && p.submitted_at && p.reviewed_at)
    const avgTurnaround = publishedWithReview.length > 0
        ? (publishedWithReview.reduce((sum, p) => {
            const diffTime = Math.abs(new Date(p.reviewed_at).getTime() - new Date(p.submitted_at).getTime())
            return sum + (diffTime / (1000 * 60 * 60 * 24))
          }, 0) / publishedWithReview.length).toFixed(1)
        : "N/A"

    const getPostHistory = (postId: string) => {
        return initialAuditLogs.filter(log => log.resource_id === postId)
    }

    // Handlers
    const handleSingleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this draft?")) return
        startTransition(async () => {
            const res = await deletePostAction(id)
            if (res.success) {
                setPosts(prev => prev.filter(p => p.id !== id))
                setSelectedIds(prev => prev.filter(item => item !== id))
            } else {
                alert(res.error || "Failed to delete post")
            }
        })
    }

    const handleSingleSubmitTrigger = (post: any) => {
        setSubmitChecklistPost(post)
    }

    const handleSingleSubmitConfirm = async (id: string) => {
        startTransition(async () => {
            const res = await submitForReviewAction(id)
            if (res.success) {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'submitted', submitted_at: new Date() } : p))
            } else {
                alert(res.error || "Failed to submit post")
            }
        })
    }

    const handleDuplicate = async (id: string) => {
        startTransition(async () => {
            const res = await duplicatePostAction(id)
            if (res.success && res.id) {
                router.push(`/tutor/blog/edit/${res.id}`)
                router.refresh()
            } else {
                alert(res.error || "Failed to duplicate post")
            }
        })
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected drafts?`)) return
        startTransition(async () => {
            const res = await bulkDeletePostsAction(selectedIds)
            if (res.success) {
                setPosts(prev => prev.filter(p => !selectedIds.includes(p.id)))
                setSelectedIds([])
            } else {
                alert(res.error || "Failed to bulk delete posts")
            }
        })
    }

    const handleBulkSubmit = async () => {
        if (!confirm(`Are you sure you want to submit ${selectedIds.length} selected posts for review?`)) return
        startTransition(async () => {
            const res = await bulkSubmitAction(selectedIds)
            if (res.success) {
                setPosts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'submitted', submitted_at: new Date() } : p))
                setSelectedIds([])
            } else {
                alert(res.error || "Failed to bulk submit posts")
            }
        })
    }

    const handleDismissNotification = async (id: string) => {
        startTransition(async () => {
            const res = await markNotificationReadAction(id)
            if (res.success) {
                setNotifications(prev => prev.filter(n => n.id !== id))
            }
        })
    }

    // Checkbox managers
    const handleSelectAll = (checked: boolean, filteredItems: any[]) => {
        if (checked) {
            const validIds = filteredItems
                .filter(p => p.status === 'draft' || p.status === 'needs_rework') // only select deletable statuses
                .map(p => p.id)
            setSelectedIds(validIds)
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectRow = (checked: boolean, id: string) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id))
        }
    }

    // Process & Filter Data
    const processedPosts = posts.filter(post => {
        const matchesTab = activeTab === 'all' || post.status === activeTab
        const matchesSearch = 
            (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.category || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    }).sort((a, b) => {
        let valA = a[sortField]
        let valB = b[sortField]

        if (sortField === 'updatedAt') {
            valA = new Date(valA).getTime()
            valB = new Date(valB).getTime()
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase()
            valB = (valB || '').toLowerCase()
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    // Pagination calculations
    const totalItems = processedPosts.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const currentItems = processedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Calendar Calculations
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth)
    const firstDayIndex = getFirstDayOfMonth(calendarYear, calendarMonth)

    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1)
    const prevMonthCells = Array.from({ length: firstDayIndex }, (_, i) => prevMonthDays - firstDayIndex + i + 1)
    const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    
    const totalCells = prevMonthCells.length + currentMonthCells.length
    const nextMonthCellsNeeded = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    const nextMonthCells = Array.from({ length: nextMonthCellsNeeded }, (_, i) => i + 1)

    const handlePrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11)
            setCalendarYear(prev => prev - 1)
        } else {
            setCalendarMonth(prev => prev - 1)
        }
    }

    const handleNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0)
            setCalendarYear(prev => prev + 1)
        } else {
            setCalendarMonth(prev => prev + 1)
        }
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    // Post Template list
    const templates = [
        {
            title: "Lesson Recap Template",
            desc: "Review homework, record student progress, and compile key teaching notes.",
            icon: <BookOpen className="text-emerald-500" />,
            initData: {
                title: "Lesson Recap: [Student Name] - [Date]",
                slug: "lesson-recap-student-date",
                content: "# Lesson Recap: [Student Name] - [Date]\n\n## 🎯 Lesson Objectives\nBrief description of what we covered today...\n\n## 📝 Grammatical Corrections & Vocabulary\n- **Student error**: explanation...\n- **Key vocabulary**: definition & sentence example...\n\n## 🚀 Next Steps & Homework\nAssignments for next session..."
            }
        },
        {
            title: "Grammar Deep Dive Template",
            desc: "Break down complex grammatical concepts, tenses, or auxiliary verbs.",
            icon: <Sparkles className="text-indigo-500" />,
            initData: {
                title: "Grammar Deep Dive: How to Master [Concept]",
                slug: "grammar-deep-dive-master-concept",
                content: "# Grammar Deep Dive: How to Master [Concept]\n\n## 💡 Introduction\nExplain why this grammar rule is often confusing...\n\n## 🔍 Rules & Sentence Formula\nSentence construction formulas with examples...\n\n## ⚠️ Common Mistakes to Avoid\nHighlight standard mistakes made by non-native learners..."
            }
        },
        {
            title: "Vocabulary Vocabulary List",
            desc: "Curate professional, thematic vocabulary terms or business English idioms.",
            icon: <FileText className="text-orange-500" />,
            initData: {
                title: "Top 10 English Idioms for [Topic/Business]",
                slug: "top-10-english-idioms-topic",
                content: "# Top 10 English Idioms for [Topic/Business]\n\nUse these professional idioms to level up your English skills.\n\n### 1. [Idiom Name]\n- **Meaning**: Explanation...\n- **Example**: Sample sentence..."
            }
        },
        {
            title: "Student Success Story",
            desc: "Inspiring journey of a student achieving their speaking or IELTS band goal.",
            icon: <ChevronRight className="text-pink-500" />,
            initData: {
                title: "How [Student Name] Boosted Their Speaking Band in 30 Days",
                slug: "how-student-boosted-speaking-band",
                content: "# How [Student Name] Boosted Their Speaking Band in 30 Days\n\n## 🌟 Background\nIntroduce the student and their initial struggles...\n\n## 📈 Our Custom Methodology\nWhat targeted exercises or feedback loops we implemented...\n\n## 🏆 Results & Feedback\nThe amazing transformation and ultimate score details..."
            }
        }
    ]

    const handleCreateFromTemplate = async (templateData: any) => {
        setShowTemplatesModal(false)
        startTransition(async () => {
            const { createPost, checkSlugUniqueness } = await import('@/actions/blog')

            // Generate unique slug (checkSlugUniqueness already sanitizes)
            let cleanSlug = templateData.slug
            let isUnique = false
            let iterations = 0

            while (!isUnique) {
                const result = await checkSlugUniqueness(cleanSlug)
                if (result.isUnique) {
                    isUnique = true
                } else {
                    iterations++
                    cleanSlug = `${templateData.slug}-${iterations}`
                }
            }

            const res = await createPost(templateData.title, cleanSlug)
            if (res.success && res.id) {
                // Update with template content
                const { updatePost } = await import('@/actions/blog')
                await updatePost(res.id, { content: templateData.content })
                router.push(`/tutor/blog/edit/${res.id}`)
            } else {
                alert(res.error || "Failed to create post from template.")
            }
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                        Tutor Hub <Sparkles className="text-indigo-500 animate-pulse" size={24} />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Plan lessons, author articles, and manage your editorial queue.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowTemplatesModal(true)} 
                        className="bg-slate-900/5 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-900/10 dark:hover:bg-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm border border-slate-200/50 dark:border-slate-700"
                    >
                        <FileText size={18} />
                        Templates
                    </button>
                    <Link href="/tutor/blog/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 font-bold text-sm active:scale-95">
                        <Plus size={18} />
                        New Post
                    </Link>
                </div>
            </div>

            {/* Notification feedback section */}
            {notifications.filter(n => !n.is_read).length > 0 && (
                <div className="bg-orange-50/70 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 rounded-3xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-bold text-sm">
                                <Bell size={18} className="animate-bounce" />
                                Unresolved Admin Feedback & Notifications
                            </div>
                            <span className="text-xs font-black px-2.5 py-1 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-400 rounded-full">
                                {unreadNotificationCount} critical
                            </span>
                        </div>
                    <div className="divide-y divide-orange-100 dark:divide-orange-500/10">
                        {notifications.filter(n => !n.is_read).map(notif => (
                            <div key={notif.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{notif.title}</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{notif.message}</p>
                                    <div className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <button 
                                    onClick={() => handleDismissNotification(notif.id)}
                                    disabled={isPending}
                                    className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-lg text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors shrink-0"
                                    title="Acknowledge feedback"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ratio circular progress */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Published Ratio</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{draftRatio}%</div>
                        <p className="text-[10px] text-slate-400 mt-1">{stats.published} of {stats.total} posts live</p>
                    </div>
                    <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000" strokeDasharray={`${draftRatio}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-200">{draftRatio}%</div>
                    </div>
                </div>

                {/* Views sparkline */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Views Trend</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">+{totalViews.toLocaleString()}</div>
                        <p className="text-[10px] text-slate-400 mt-1">Total all-time views</p>
                    </div>
                    <div className="w-20 h-10 flex items-center justify-center shrink-0 text-xs text-slate-400 font-mono">
                        {totalViews > 0 ? '📈' : 'N/A'}
                    </div>
                </div>

                {/* Turnaround Time */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Turnaround Avg</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgTurnaround} Days</div>
                        <p className="text-[10px] text-slate-400 mt-1">Review to live speed</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl text-indigo-500 shrink-0">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Top Post Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Best Performer</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1.5 truncate pr-2">
                            {topPerforming ? topPerforming.title : "No Published Posts"}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{topPerforming ? `${topPerforming.views.toLocaleString()} views` : "Create some live content!"}</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40 rounded-2xl text-amber-500 shrink-0">
                        <BarChart2 size={24} />
                    </div>
                </div>
            </div>

            {/* Dashboard Content List Block */}
            <div className="space-y-6">
                {/* Filter and search controllers */}
                <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-slate-900/40 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-200/10 backdrop-blur-md">
                    {/* Real-time search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search drafts, topics, slugs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-200/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-200 placeholder-slate-500 transition-all"
                        />
                    </div>

                    {/* Interactive workflow tabs & View Mode Toggle */}
                    <div className="flex flex-wrap items-center justify-between xl:justify-end gap-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <TabButton active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setCurrentPage(1); }} label="All Content" count={stats.total} color="slate" />
                            <TabButton active={activeTab === 'draft'} onClick={() => { setActiveTab('draft'); setCurrentPage(1); }} label="Drafts" count={stats.drafts} color="zinc" />
                            <TabButton active={activeTab === 'submitted'} onClick={() => { setActiveTab('submitted'); setCurrentPage(1); }} label="Pending Review" count={stats.pending} color="blue" />
                            <TabButton active={activeTab === 'needs_rework'} onClick={() => { setActiveTab('needs_rework'); setCurrentPage(1); }} label="Needs Rework" count={stats.rework} color="orange" pulsing={stats.rework > 0} />
                            <TabButton active={activeTab === 'published'} onClick={() => { setActiveTab('published'); setCurrentPage(1); }} label="Live Articles" count={stats.published} color="emerald" />
                        </div>

                        {/* Visual Switch Toggle (Item 7 Calendar view toggle) */}
                        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-200/10">
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                List
                            </button>
                            <button 
                                onClick={() => setViewMode('calendar')} 
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Panel floating header */}
                {selectedIds.length > 0 && (
                    <div className="bg-indigo-600 text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl shadow-indigo-500/20 animate-in slide-in-from-top-4 duration-200">
                        <div className="flex items-center gap-3 text-sm font-bold">
                            <Info size={18} />
                            <span>{selectedIds.length} items selected for batch operations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleBulkSubmit}
                                disabled={isPending}
                                className="bg-white/15 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-colors"
                            >
                                Submit Selected
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={isPending}
                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-colors"
                            >
                                Delete Selected
                            </button>
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* LIST VIEW BLOCK */}
                {viewMode === 'list' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-5 text-left w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                                                checked={currentItems.length > 0 && currentItems.filter(p => p.status !== 'published').every(p => selectedIds.includes(p.id))}
                                                onChange={(e) => handleSelectAll(e.target.checked, currentItems)}
                                            />
                                        </th>
                                        <th
                                            className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5"
                                            onClick={() => {
                                                if (sortField === 'title') {
                                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                                                } else {
                                                    setSortField('title')
                                                    setSortOrder('asc')
                                                }
                                                setCurrentPage(1)
                                            }}
                                        >
                                            Metadata & Details
                                            <SortIndicator field="title" sortField={sortField} sortOrder={sortOrder} />
                                        </th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Status (Click to view timeline)
                                        </th>
                                        <th
                                            className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5"
                                            onClick={() => {
                                                if (sortField === 'updatedAt') {
                                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                                                } else {
                                                    setSortField('updatedAt')
                                                    setSortOrder('desc')
                                                }
                                                setCurrentPage(1)
                                            }}
                                        >
                                            Last Modified
                                            <SortIndicator field="updatedAt" sortField={sortField} sortOrder={sortOrder} />
                                        </th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {currentItems.map((post: any) => {
                                        // Calculate reading time & word count
                                        const wordCount = post.content ? post.content.split(/\s+/).length : 0
                                        const readingTime = Math.ceil(wordCount / 200)

                                        // Determine inactivity (> 7 days) for draft reminder badge
                                        const daysInactive = Math.round((new Date().getTime() - new Date(post.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
                                        const isInactiveDraft = post.status === 'draft' && daysInactive >= 7

                                        const isRowSelected = selectedIds.includes(post.id)

                                        return (
                                            <tr key={post.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all ${isRowSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}>
                                                <td className="px-6 py-6">
                                                    {post.status !== 'published' ? (
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                                                            checked={isRowSelected}
                                                            onChange={(e) => handleSelectRow(e.target.checked, post.id)}
                                                        />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-200/50 dark:border-slate-700">
                                                            <CheckCircle size={10} className="text-emerald-500" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-start gap-4">
                                                        {/* Cover image thumbnail (Priority 5) */}
                                                        <div className="shrink-0 w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700 relative group-hover:scale-105 transition-transform">
                                                            {post.cover ? (
                                                                <img src={post.cover} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FileText size={18} />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {post.title || 'Untitled Draft'}
                                                                </span>
                                                                
                                                                {/* Draft Inactivity Reminder alert (Priority 4) */}
                                                                {isInactiveDraft && (
                                                                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-amber-200/50 dark:border-amber-900/30">
                                                                        <AlertCircle size={10} /> Finish me!
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                                                                <span className="text-slate-500">/{post.slug}</span>
                                                                <span>•</span>
                                                                <span className="uppercase text-indigo-500 font-bold">{post.category || 'General'}</span>
                                                                <span>•</span>
                                                                <span>{wordCount} words ({readingTime} min read)</span>
                                                            </div>

                                                            {post.status === 'needs_rework' && post.review_notes && (
                                                                <div className="mt-2 text-xs bg-orange-50/70 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 p-2.5 rounded-xl border border-orange-100 dark:border-orange-500/10 flex gap-2 items-start">
                                                                    <MessageSquare size={14} className="mt-0.5 shrink-0" />
                                                                    <span>{post.review_notes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 relative">
                                                    {/* Clicking the badge shows interactive transition history (Item 14) */}
                                                    <div 
                                                        onClick={() => setActiveHistoryPostId(prev => prev === post.id ? null : post.id)}
                                                        className="cursor-pointer inline-block"
                                                        title="Click to view full workflow timeline"
                                                    >
                                                        <StatusBadge status={post.status} />
                                                    </div>

                                                    {activeHistoryPostId === post.id && (
                                                        <div className="absolute z-10 mt-2 left-6 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 text-left animate-in fade-in-50 zoom-in-95 duration-150">
                                                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4">
                                                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                                    <Clock size={12} className="text-indigo-500" /> Editorial Timeline
                                                                </span>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setActiveHistoryPostId(null); }} 
                                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                            <div className="relative border-l-2 border-indigo-500/30 pl-4 space-y-4">
                                                                {getPostHistory(post.id).map((log: any) => (
                                                                    <div key={log.id} className="relative text-[11px] leading-relaxed">
                                                                        <span className="absolute -left-[21px] mt-1.5 h-2 w-2 rounded-full bg-indigo-500 border border-white dark:border-slate-950"></span>
                                                                        <div className="font-bold text-slate-800 dark:text-slate-200">{log.action}</div>
                                                                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                                                    </div>
                                                                ))}
                                                                {getPostHistory(post.id).length === 0 && (
                                                                    <div className="text-xs text-slate-400 font-medium py-2">
                                                                        Initial draft created on {new Date(post.createdAt).toLocaleDateString()}. No status transitions recorded.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {new Date(post.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-6 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-1">
                                                        {/* Duplicate Action Button */}
                                                        <button 
                                                            onClick={() => handleDuplicate(post.id)}
                                                            disabled={isPending}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all disabled:opacity-50"
                                                            title="Duplicate Draft"
                                                        >
                                                            <Copy size={16} />
                                                        </button>

                                                        {post.status === 'published' && (
                                                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="View Published Article">
                                                                <Eye size={16} />
                                                            </Link>
                                                        )}

                                                        {(post.status === 'draft' || post.status === 'needs_rework') && (
                                                            <>
                                                                <Link href={`/tutor/blog/edit/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Edit Content">
                                                                    <Pencil size={16} />
                                                                </Link>
                                                                <button 
                                                                    onClick={() => handleSingleSubmitTrigger(post)}
                                                                    disabled={isPending}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all disabled:opacity-50"
                                                                    title="Submit with Quality Checklist"
                                                                >
                                                                    <Send size={16} />
                                                                </button>
                                                            </>
                                                        )}

                                                        {post.status !== 'published' && post.status !== 'submitted' && (
                                                            <button 
                                                                onClick={() => handleSingleDelete(post.id)}
                                                                disabled={isPending}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                                                                title="Delete Draft"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}

                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                                        <AlertCircle size={40} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No items found</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 mt-2">Create content or tweak filter search queries.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination control footer bar */}
                        {totalPages > 1 && (
                            <div className="bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-bold">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold">{totalItems}</span> items
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handlePageChange(idx + 1)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                currentPage === idx + 1
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* CALENDAR VIEW GRID (Item 7) */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-indigo-500" />
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">{monthNames[calendarMonth]} {calendarYear}</h3>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/20">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={() => { setCalendarMonth(today.getMonth()); setCalendarYear(today.getFullYear()); }} className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    Today
                                </button>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Header Row */}
                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/60">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>

                        {/* Month days cells layout */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Prev month fill-in cells */}
                            {prevMonthCells.map((day, idx) => (
                                <div key={`prev-${idx}`} className="bg-slate-50/40 dark:bg-slate-950/10 min-h-[100px] p-2 rounded-2xl border border-slate-100 dark:border-slate-800/50 opacity-30">
                                    <div className="text-xs font-bold text-slate-400 font-mono">{day}</div>
                                </div>
                            ))}

                            {/* Current month days cells */}
                            {currentMonthCells.map((day) => {
                                const cellDateString = new Date(calendarYear, calendarMonth, day).toDateString()
                                const cellPosts = posts.filter(p => new Date(p.updatedAt).toDateString() === cellDateString)
                                const isTodayCell = new Date().toDateString() === cellDateString

                                return (
                                    <div 
                                        key={`curr-${day}`} 
                                        className={`min-h-[110px] p-2 rounded-2xl border flex flex-col justify-between transition-all group ${
                                            isTodayCell 
                                            ? 'bg-indigo-50/30 dark:bg-indigo-950/15 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                                            : 'bg-slate-50/20 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-950/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-black font-mono w-5 h-5 rounded-full flex items-center justify-center ${isTodayCell ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-350'}`}>
                                                {day}
                                            </span>
                                            {cellPosts.length > 0 && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                            )}
                                        </div>

                                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[65px] scrollbar-thin">
                                            {cellPosts.map((post) => {
                                                const badgeStyle = post.status === 'published' 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                    : post.status === 'submitted' 
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'

                                                return (
                                                    <Link 
                                                        href={post.status === 'published' ? `/blog/${post.slug}` : `/tutor/blog/edit/${post.id}`} 
                                                        key={post.id} 
                                                        className={`block text-[9px] font-bold p-1 rounded-lg truncate hover:underline ${badgeStyle}`}
                                                        title={`${post.title} (${post.status})`}
                                                    >
                                                        {post.title || "Untitled"}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                             })}

                            {/* Next month pad cell cells */}
                            {nextMonthCells.map((day, idx) => (
                                <div key={`next-${idx}`} className="bg-slate-50/40 dark:bg-slate-950/10 min-h-[100px] p-2 rounded-2xl border border-slate-100 dark:border-slate-800/50 opacity-30">
                                    <div className="text-xs font-bold text-slate-400 font-mono">{day}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quality Checklist Submit Modal (Item 12) */}
            {submitChecklistPost && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="text-indigo-500 animate-pulse" size={18} /> Submission Readiness
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review your content checklist before submitting to the admin.</p>
                            </div>
                            <button 
                                onClick={() => setSubmitChecklistPost(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Score progress circle banner */}
                            <div className="flex items-center gap-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/30">
                                <div className="relative w-16 h-16 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000" strokeDasharray={`${calculateSEOScore(submitChecklistPost)}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800 dark:text-white">
                                        {calculateSEOScore(submitChecklistPost)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Readiness Score: {calculateSEOScore(submitChecklistPost)}%</div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {calculateSEOScore(submitChecklistPost) >= 85 
                                            ? "Outstanding SEO standing! Ready for publish."
                                            : "A solid score. Ensure metadata is populated for perfect search results."}
                                    </p>
                                </div>
                            </div>

                            {/* Checklist Criteria Items */}
                            <div className="space-y-2.5">
                                <ChecklistItem 
                                    checked={(submitChecklistPost.title || "").length >= 10} 
                                    label="Compelling title length (min 10 characters)" 
                                    help={`Current: ${(submitChecklistPost.title || "").length} characters`}
                                />
                                <ChecklistItem 
                                    checked={(submitChecklistPost.meta_description || "").length >= 50} 
                                    label="SEO meta description (min 50 characters)" 
                                    help={submitChecklistPost.meta_description ? `Current: ${submitChecklistPost.meta_description.length} characters` : 'No meta description configured'}
                                />
                                <ChecklistItem 
                                    checked={!!submitChecklistPost.cover} 
                                    label="Cover media file thumbnail" 
                                    help={submitChecklistPost.cover ? 'Image cover active' : 'No thumbnail found'}
                                />
                                <ChecklistItem 
                                    checked={!!submitChecklistPost.focal_keyword} 
                                    label="Focal focus keyword setup" 
                                    help={submitChecklistPost.focal_keyword ? `Target word: "${submitChecklistPost.focal_keyword}"` : 'No keyword set'}
                                />
                                <ChecklistItem 
                                    checked={submitChecklistPost.content ? submitChecklistPost.content.split(/\s+/).length >= 200 : false} 
                                    label="Lesson/post depth (min 200 words)" 
                                    help={`Current count: ${submitChecklistPost.content ? submitChecklistPost.content.split(/\s+/).length : 0} words`}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <button 
                                onClick={() => setSubmitChecklistPost(null)}
                                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                Back to Editor
                            </button>
                            <button 
                                onClick={() => {
                                    const postId = submitChecklistPost.id
                                    setSubmitChecklistPost(null)
                                    handleSingleSubmitConfirm(postId)
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Send size={14} /> Confirm Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Templates Selection modal */}
            {showTemplatesModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Choose a Blog Template</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select from our pre-defined layouts to speed up lesson and content authoring.</p>
                            </div>
                            <button 
                                onClick={() => setShowTemplatesModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleCreateFromTemplate(tmpl.initData)}
                                    disabled={isPending}
                                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-white dark:hover:bg-slate-950/80 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left flex gap-4 items-start active:scale-[0.98]"
                                >
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                                        {tmpl.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{tmpl.title}</div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tmpl.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setShowTemplatesModal(false)}
                                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ChecklistItem({ checked, label, help }: { checked: boolean, label: string, help: string }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                checked 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
                {checked ? <Check size={12} className="stroke-3" /> : <X size={12} className="stroke-3" />}
            </div>
            <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{help}</div>
            </div>
        </div>
    )
}

function calculateSEOScore(post: any) {
    if (!post) return 0
    let score = 0
    if ((post.title || '').length >= 10) score += 20
    if ((post.meta_description || '').length >= 50) score += 20
    if (post.cover) score += 20
    if (post.focal_keyword) score += 20
    
    const wordCount = post.content ? post.content.split(/\s+/).length : 0
    if (wordCount >= 200) score += 20
    
    return score
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
            )}
        </button>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, classes: string }> = {
        published: { label: 'Live', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        submitted: { label: 'In Review', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        needs_rework: { label: 'Needs Rework', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
        draft: { label: 'Draft', classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    }

    const { label, classes } = config[status] || config.draft;

    return (
        <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${classes}`}>
            {label}
        </span>
    )
}

function SortIndicator({ field, sortField, sortOrder }: { field: SortField, sortField: SortField, sortOrder: SortOrder }) {
    if (sortField !== field) {
        return <ArrowUpDown size={12} className="text-slate-400" />
    }
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />
}
