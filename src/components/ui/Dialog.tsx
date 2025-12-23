
'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <DialogContext.Provider value={{ onOpenChange }}>
                    {children}
                </DialogContext.Provider>
            )}
        </AnimatePresence>
    )
}

const DialogContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({})

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    const { onOpenChange } = React.useContext(DialogContext)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onOpenChange?.(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${className}`}
            >
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </motion.div>
        </div>
    )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>
            {children}
        </div>
    )
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h2>
    )
}
