import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'
import Image from 'next/image'

interface MarkdownRendererProps {
    content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const components: Components = {
        // Styled Tables with horizontal scroll
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
        img: ({ node, ...props }) => {
            const isFullWidth = props.alt?.toLowerCase().includes('full width')
            return (
                <span className="block my-8">
                    <span className={`block relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 ${isFullWidth ? 'w-full' : 'max-w-full'}`}>
                        <img
                            {...props}
                            className="w-full h-auto object-cover"
                            alt={props.alt || ''}
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
            // Check if it's likely a CTA (custom metric logic could go here, but styling universally professional first)
            return (
                <blockquote className="not-italic border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 px-6 py-4 rounded-r-lg my-8 text-slate-700 dark:text-slate-300 shadow-sm" {...props}>
                    {children}
                </blockquote>
            )
        },

        // Links
        a: ({ node, ...props }) => (
            <a className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline decoration-2 underline-offset-2 transition-colors" {...props} />
        ),

        // Headings
        h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-6" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4" {...props} />,

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
            {content}
        </ReactMarkdown>
    )
}
