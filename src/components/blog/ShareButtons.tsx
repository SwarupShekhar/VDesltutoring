'use client'

import React from 'react'
import { Twitter, Linkedin, Facebook, Link as LinkIcon, Share2 } from 'lucide-react'
import { trackShare } from '@/actions/blog'

interface ShareButtonsProps {
    title: string
    url: string
    postId: string
}

export function ShareButtons({ title, url, postId }: ShareButtonsProps) {
    const handleShare = async (platform: string) => {
        // Track share event asynchronously
        trackShare(postId, platform).catch(console.error)

        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        }

        if (platform === 'copy') {
            navigator.clipboard.writeText(url)
            alert('Link copied to clipboard!')
            return
        }

        window.open(shareUrls[platform], '_blank')
    }

    return (
        <div className="flex flex-col items-center gap-4 py-12 border-t border-slate-100 dark:border-slate-800 mt-12">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Share2 size={14} /> Share this article
            </div>
            <div className="flex items-center gap-2">
                <SocialButton icon={<Twitter size={18} />} onClick={() => handleShare('twitter')} color="hover:bg-[#1DA1F2]" />
                <SocialButton icon={<Linkedin size={18} />} onClick={() => handleShare('linkedin')} color="hover:bg-[#0077b5]" />
                <SocialButton icon={<Facebook size={18} />} onClick={() => handleShare('facebook')} color="hover:bg-[#4267B2]" />
                <SocialButton icon={<LinkIcon size={18} />} onClick={() => handleShare('copy')} color="hover:bg-slate-700" />
            </div>
        </div>
    )
}

function SocialButton({ icon, onClick, color }: { icon: React.ReactNode, onClick: () => void, color: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-all hover:text-white ${color} hover:scale-110 active:scale-95`}
        >
            {icon}
        </button>
    )
}
