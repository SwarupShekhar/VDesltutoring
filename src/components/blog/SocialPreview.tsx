'use client'

import React from 'react'

interface SocialPreviewProps {
    title: string
    description: string
    cover: string
    slug: string
}

export function SocialPreview({ title, description, cover, slug }: SocialPreviewProps) {
    return (
        <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Facebook Preview:</span>
                <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-sm border border-[#ced0d4]">
                    {cover && (
                        <div className="aspect-[1.91/1] w-full relative">
                            <img src={cover} alt="FB Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-3 border-t border-[#ced0d4]">
                        <div className="text-[11px] text-[#65676b] uppercase font-bold tracking-tight mb-0.5">ENGLIVO.COM</div>
                        <div className="text-base font-bold text-[#050505] leading-tight mb-1 line-clamp-2">
                            {title || 'Article Title'}
                        </div>
                        <div className="text-sm text-[#65676b] line-clamp-1">
                            {description || 'Add a meta description to see how your post will look on Facebook...'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">X (Twitter) Preview:</span>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#e1e8ed] shadow-sm">
                    {cover && (
                        <div className="aspect-[1.91/1] w-full relative">
                            <img src={cover} alt="X Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-3">
                        <div className="text-[13px] text-[#5b7083] mb-0.5">englivo.com</div>
                        <div className="text-sm font-bold text-[#0f1419] mb-1 line-clamp-1">{title || 'Article Title'}</div>
                        <div className="text-sm text-[#5b7083] line-clamp-2 leading-snug">
                            {description || 'Add a meta description to see how your post will look on X...'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">LinkedIn Preview:</span>
                <div className="bg-white rounded-xl overflow-hidden border border-[#d0d5dd] shadow-sm">
                    {cover && (
                        <div className="aspect-[1.91/1] w-full relative">
                            <img src={cover} alt="LinkedIn Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-3 bg-[#f3f6f8]">
                        <div className="text-sm font-semibold text-[#000000e6] leading-tight mb-1 line-clamp-2">
                            {title || 'Article Title'}
                        </div>
                        <div className="text-[11px] text-[#00000099]">englivo.com</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
