'use client'

import { useState } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import { backfillRelatedPosts } from '@/actions/blog'

export function RecomputeButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [count, setCount] = useState<number | null>(null)

    const handleRecompute = async () => {
        if (!window.confirm("Recompute all blog relationships? This will iterate through all published posts.")) return;
        
        setStatus('loading')
        try {
            const result = await backfillRelatedPosts()
            if (result.success) {
                setCount(result.count)
                setStatus('success')
                setTimeout(() => setStatus('idle'), 5000)
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error("Backfill failed:", error)
            setStatus('error')
        }
    }

    return (
        <button 
            onClick={handleRecompute}
            disabled={status === 'loading'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                status === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {status === 'loading' ? <RefreshCw size={16} className="animate-spin" /> : 
             status === 'success' ? <Check size={16} /> :
             status === 'error' ? <AlertCircle size={16} /> :
             <RefreshCw size={16} />}
            
            {status === 'loading' ? 'Computing...' : 
             status === 'success' ? `Linked ${count} posts` :
             status === 'error' ? 'Failed' :
             'Recompute Relations'}
        </button>
    )
}
