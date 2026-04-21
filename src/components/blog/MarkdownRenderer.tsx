import React from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

import { HoverPreviewLink } from './HoverPreviewLink'

// Server-safe sanitizer: strips script/iframe/etc. without needing jsdom or
// isomorphic-dompurify (which was causing ERR_REQUIRE_ESM on Vercel).
// react-markdown already protects against XSS by never rendering raw HTML,
// so this is a lightweight extra guard for content stored in the DB.
function sanitizeContent(content: string): string {
    if (typeof window !== 'undefined' && typeof DOMPurify !== 'undefined') {
        // Client-side: use native DOMPurify if loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).DOMPurify?.sanitize?.(content) ?? content
    }
    // Server-side: strip dangerous tags with a simple regex guard.
    // react-markdown never outputs raw HTML, so this is defence-in-depth only.
    return content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<embed[^>]*>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
}

interface RelatedPostPreview {
    slug: string
    title: string
    cover: string | null
    excerpt: string | null
    category: string | null
}

interface MarkdownRendererProps {
    content: string
    previewMap?: Record<string, RelatedPostPreview>
    locale?: string
}

export function MarkdownRenderer({ content, previewMap, locale }: MarkdownRendererProps) {
    const sanitizedContent = sanitizeContent(content)

    const components: Components = {
        // ... standard components ...
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="w-full text-sm text-left border-collapse" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" {...props} />
        ),
        th: ({ node, ...props }) => (
            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs" {...props} />
        ),
        tr: ({ node, ...props }) => (
            <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-950 dark:even:bg-slate-900/50" {...props} />
        ),
        td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400" {...props} />
        ),

        // Images with captions
        img: ({ node, src: rawSrc, ...props }) => {
            const isFullWidth = props.alt?.toLowerCase().includes('full width')
            const imageSrc = typeof rawSrc === 'string' ? rawSrc : ''
            
            if (!imageSrc) return null

            return (
                <span className="block my-8">
                    <span className={`block relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 ${isFullWidth ? 'w-full' : 'max-w-full'}`}>
                        <Image
                            src={imageSrc}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                            alt={props.alt || ''}
                            unoptimized={true} // Allow any external domains in markdown content
                            style={{ margin: 0 }} // Override prose margin
                        />
                    </span>
                    {props.alt && (
                        <span className="block text-center text-sm text-slate-500 italic mt-3">
                            {props.alt}
                        </span>
                    )}
                </span>
            )
        },

        // Blockquotes (CTA Style or Standard)
        blockquote: ({ node, children, ...props }) => {
            return (
                <blockquote className="not-italic border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 px-6 py-4 rounded-r-lg my-8 text-slate-700 dark:text-slate-300 shadow-sm" {...props}>
                    {children}
                </blockquote>
            )
        },

        // Links: Intercept relative links and prevent double-blog prefixing
        a: ({ node, ...props }) => {
            let href = props.href || ''
            
            // 1. Resolve relative links that mistakenly omit the leading slash
            if (href.startsWith('blog/')) {
                href = '/' + href
            }
            
            // 2. Clear out accidental double-prefixing
            if (href.includes('/blog/blog/')) {
                href = href.replace('/blog/blog/', '/blog/')
            }

            // 3. Detect slug for hover preview
            // Match /blog/slug-name but ignore query params or fragments for lookup
            const slugMatch = href.match(/\/blog\/([^?#]+)/)
            const slug = slugMatch ? slugMatch[1].replace(/^\/|\/$/g, '') : null
            const preview = slug && previewMap ? previewMap[slug] : undefined

            if (preview) {
                return (
                    <HoverPreviewLink href={href} preview={preview} locale={locale}>
                        {props.children}
                    </HoverPreviewLink>
                )
            }

            return (
                <a 
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline decoration-2 underline-offset-2 transition-colors" 
                    {...props} 
                    href={href}
                />
            )
        },

        // Headings
        h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-6" {...props} />,
        h2: ({ node, ...props }) => {
            const text = props.children?.toString() || ''
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            return <h2 id={id} className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2" {...props} />
        },
        h3: ({ node, ...props }) => {
            const text = props.children?.toString() || ''
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            return <h3 id={id} className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4" {...props} />
        },

        // Lists
        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-2 my-6 text-slate-700 dark:text-slate-300" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-2 my-6 text-slate-700 dark:text-slate-300" {...props} />,
        li: ({ node, ...props }) => <li className="pl-2" {...props} />
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {sanitizedContent}
        </ReactMarkdown>
    )
}
