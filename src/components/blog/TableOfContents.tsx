'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
    id: string
    text: string
    level: number
}

interface TableOfContentsProps {
    content: string
    variant?: 'inline' | 'sidebar'
}

export function TableOfContents({ content, variant = 'inline' }: TableOfContentsProps) {
    const [toc, setToc] = useState<TOCItem[]>([])

    useEffect(() => {
        const lines = content.split('\n')
        const items: TOCItem[] = []

        lines.forEach(line => {
            const h3Match = line.match(/^###\s+(.+)$/)
            const h2Match = line.match(/^##\s+(.+)$/)

            if (h2Match) {
                const text = h2Match[1].trim()
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                items.push({ id, text, level: 2 })
            } else if (h3Match) {
                const text = h3Match[1].trim()
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                items.push({ id, text, level: 3 })
            }
        })

        setToc(items)
    }, [content])

    if (toc.length === 0) return null

    const linkList = (
        <ul className="space-y-2 border-l border-slate-200 dark:border-slate-700 ml-2">
            {toc.map((item, i) => (
                <li
                    key={i}
                    className={`${item.level === 3 ? 'ml-4' : '-ml-px'} border-l border-transparent hover:border-blue-500`}
                >
                    <a
                        href={`#${item.id}`}
                        className={`block py-1 px-3 text-sm transition-colors ${
                            item.level === 2
                                ? 'font-bold text-slate-700 dark:text-slate-300'
                                : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                        }`}
                        onClick={(e) => {
                            e.preventDefault()
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        {item.text}
                    </a>
                </li>
            ))}
        </ul>
    )

    if (variant === 'sidebar') {
        return linkList
    }

    return (
        <nav className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 not-prose mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Table of Contents</h4>
            {linkList}
        </nav>
    )
}
