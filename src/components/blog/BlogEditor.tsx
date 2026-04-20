'use client'

import React, { useRef } from 'react'
import { 
    Bold, Italic, Link as LinkIcon, Image as ImageIcon, 
    List, ListOrdered, Quote, Code, 
    Type, Wand2, Sparkles
} from 'lucide-react'

interface BlogEditorProps {
    content: string
    onChange: (markdown: string) => void
    editable?: boolean
    mode?: 'visual' | 'markdown' | 'preview'
    onMagicScan?: () => void
    isScanning?: boolean
}

export default function BlogEditor({ 
    content, 
    onChange, 
    editable = true, 
    mode = 'markdown',
    onMagicScan,
    isScanning = false
}: BlogEditorProps) {
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

    if (mode === 'preview') return null // Handled externally in BlogEditorPage

    return (
        <div className="flex flex-col h-[70vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-3 bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-10 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-0.5 px-2">
                    <ToolbarButton icon={<Bold size={16} />} onClick={() => insertText('**', '**')} title="Bold" />
                    <ToolbarButton icon={<Italic size={16} />} onClick={() => insertText('*', '*')} title="Italic" />
                </div>
                
                <div className="w-px h-6 bg-slate-700 mx-1" />
                
                <div className="flex items-center gap-0.5 px-2">
                    <ToolbarButton icon={<span className="text-[10px] font-bold">H1</span>} onClick={() => insertText('# ')} title="Heading 1" />
                    <ToolbarButton icon={<span className="text-[10px] font-bold text-slate-500">H2</span>} onClick={() => insertText('## ')} title="Heading 2" />
                    <ToolbarButton icon={<span className="text-[10px] font-bold text-slate-500">H3</span>} onClick={() => insertText('### ')} title="Heading 3" />
                </div>

                <div className="w-px h-6 bg-slate-700 mx-1" />

                <div className="flex items-center gap-0.5 px-2">
                    <ToolbarButton icon={<List size={16} />} onClick={() => insertText('- ')} title="Bullet List" />
                </div>

                <div className="w-px h-6 bg-slate-700 mx-1" />

                <div className="flex items-center gap-0.5 px-2">
                    <ToolbarButton icon={<LinkIcon size={16} />} onClick={insertLink} title="Link" />
                </div>

                <div className="flex-1" />

                <button 
                    onClick={onMagicScan}
                    disabled={isScanning || !onMagicScan}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all group disabled:opacity-50"
                >
                    <Wand2 size={12} className={`${isScanning ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                    {isScanning ? 'Scanning...' : 'Magic Scan'}
                </button>

                <div className="w-px h-6 bg-slate-700 mx-1" />

                <ToolbarButton icon={<ImageIcon size={16} />} onClick={insertImage} title="Image" />
            </div>

            {/* Editor Area */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                disabled={!editable}
                className="flex-1 w-full p-10 font-mono text-base bg-transparent text-slate-200 focus:outline-none resize-none leading-relaxed custom-scrollbar selection:bg-blue-500/30"
                placeholder="# Your story starts here..."
                spellCheck={false}
            />

            <div className="flex items-center justify-between px-6 py-3 bg-slate-800/30 border-t border-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Sparkles size={10} className="text-blue-500" /> Markdown Active</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>Autosaved</span>
                </div>
                <div>{content.split(/\s+/).length} Words &bull; {content.length} Characters</div>
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
            className="p-2.5 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
        >
            {icon}
        </button>
    )
}

