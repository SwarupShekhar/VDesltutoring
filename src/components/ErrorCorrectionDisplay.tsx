import React from 'react'

interface Correction {
    original: string
    corrected: string
    type: 'grammar' | 'vocabulary' | 'fluency'
}

interface ErrorCorrectionDisplayProps {
    corrections: Correction[]
}

export function ErrorCorrectionDisplay({ corrections }: ErrorCorrectionDisplayProps) {
    if (!corrections || corrections.length === 0) {
        return null
    }

    return (
        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Quick Corrections
                </span>
            </div>
            <div className="space-y-2">
                {corrections.map((correction, index) => (
                    <div key={index} className="text-sm leading-relaxed">
                        <span className="line-through text-red-500/80 dark:text-red-400/80 font-medium">
                            {correction.original}
                        </span>
                        {' → '}
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                            {correction.corrected}
                        </span>
                        <span className="ml-2 text-xs text-slate-400 dark:text-gray-500 italic">
                            ({correction.type})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
