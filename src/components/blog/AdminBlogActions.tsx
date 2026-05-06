'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { approvePost, rejectPost } from '@/actions/blog'
import { useRouter } from 'next/navigation'

export function AdminBlogActions({ post }: { post: any }) {
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [notes, setNotes] = useState('')
    const router = useRouter()

    const handleApprove = async () => {
        setIsPending(true)
        try {
            const res = await approvePost(post.id)
            if (res.success) {
                setIsApproveModalOpen(false)
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert('Failed to approve post')
        } finally {
            setIsPending(false)
        }
    }

    const handleReject = async () => {
        if (!notes) return alert('Please provide feedback for the author.')
        setIsPending(true)
        try {
            const res = await rejectPost(post.id, notes)
            if (res.success) {
                setIsRejectModalOpen(false)
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert('Failed to reject post')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex gap-1">
            <button 
                onClick={() => setIsApproveModalOpen(true)}
                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="Approve & Publish"
            >
                <CheckCircle size={18} />
            </button>
            <button 
                onClick={() => setIsRejectModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                title="Reject & Request Changes"
            >
                <XCircle size={18} />
            </button>

            {/* Approve Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Blog Post">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Are you sure you want to approve and publish <strong>"{post.title}"</strong>? 
                        This post will become live on the public blog immediately.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            onClick={() => setIsApproveModalOpen(false)} 
                            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApprove} 
                            disabled={isPending}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                        >
                            {isPending && <Loader2 size={16} className="animate-spin" />}
                            Confirm & Publish
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Request Rework">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Feedback for Author</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Please improve the meta description and add more internal links..."
                            className="w-full h-40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            onClick={() => setIsRejectModalOpen(false)} 
                            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReject} 
                            disabled={isPending || !notes}
                            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
                        >
                            {isPending && <Loader2 size={16} className="animate-spin" />}
                            Send Feedback
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
