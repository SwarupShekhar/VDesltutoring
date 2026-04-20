'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Editor Error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center bg-rose-500/5 border border-rose-500/10 rounded-[3rem]">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Editor Preview Crashed</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            There was an error rendering the markdown preview. This is usually caused by malformed syntax.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
          >
            <RefreshCw size={14} /> Try Reloading Preview
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
