'use client'

import React, { useState, useRef } from 'react'
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote, Code, Heading1, Heading2 } from 'lucide-react'

interface BlogEditorProps {
    content: string
    onChange: (markdown: string) => void
    editable?: boolean
}

export default function BlogEditor({ content, onChange, editable = true }: BlogEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selectedText = text.substring(start, end)

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)

        onChange(newText)

        // Defer cursor update to allow react render
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, end + before.length)
        }, 0)
    }

    const insertImage = () => {
        const url = window.prompt('Image URL')
        if (url) {
            insertText(`![Image Description](${url})`)
        }
    }

    const insertLink = () => {
        const url = window.prompt('URL')
        if (url) {
            insertText('[Link Text](', `${url})`)
        }
    }

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-sm flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="border-b border-slate-200 dark:border-slate-800 p-2 flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <ToolbarButton icon={<Heading1 size={18} />} onClick={() => insertText('# ')} title="Heading 1" />
                <ToolbarButton icon={<Heading2 size={18} />} onClick={() => insertText('## ')} title="Heading 2" />
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
                <ToolbarButton icon={<Bold size={18} />} onClick={() => insertText('**', '**')} title="Bold" />
                <ToolbarButton icon={<Italic size={18} />} onClick={() => insertText('*', '*')} title="Italic" />
                <ToolbarButton icon={<Code size={18} />} onClick={() => insertText('`', '`')} title="Code" />
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
                <ToolbarButton icon={<Quote size={18} />} onClick={() => insertText('> ')} title="Blockquote" />
                <ToolbarButton icon={<List size={18} />} onClick={() => insertText('- ')} title="Bullet List" />
                <ToolbarButton icon={<ListOrdered size={18} />} onClick={() => insertText('1. ')} title="Numbered List" />
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
                <ToolbarButton icon={<LinkIcon size={18} />} onClick={insertLink} title="Link" />
                <ToolbarButton icon={<ImageIcon size={18} />} onClick={insertImage} title="Image" />
            </div>

            {/* Editor */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                disabled={!editable}
                className="flex-1 w-full p-6 font-mono text-sm sm:text-base bg-slate-50 dark:bg-slate-950 dark:text-slate-300 focus:outline-none resize-none leading-relaxed"
                placeholder="# Start writing your story..."
                spellCheck={false}
            />

            <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs text-slate-500 flex justify-between">
                <span>Markdown Supported</span>
                <span>{content.length} chars</span>
            </div>
        </div>
    )
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title?: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            type="button"
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
        >
            {icon}
        </button>
    )
}
