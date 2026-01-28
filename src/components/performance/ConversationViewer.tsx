'use client';

import { cn } from '@/lib/utils';

interface ConversationLine {
    speaker: 'user' | 'peer';
    text: string;
    timestamp: string;
}

interface ConversationViewerProps {
    conversation: ConversationLine[];
}

export function ConversationViewer({ conversation }: ConversationViewerProps) {
    if (!conversation || conversation.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No conversation transcript available.
            </div>
        );
    }

    return (
        <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            {conversation.map((line, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "flex gap-3",
                        line.speaker === 'user' ? 'justify-end' : 'justify-start'
                    )}
                >
                    <div
                        className={cn(
                            "max-w-[70%] p-3 rounded-xl shadow-sm transition-all hover:shadow-md",
                            line.speaker === 'user'
                                ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                        )}
                    >
                        <span className={cn(
                            "text-xs block mb-1",
                            line.speaker === 'user'
                                ? 'text-blue-100'
                                : 'text-slate-500 dark:text-slate-400'
                        )}>
                            {line.timestamp}
                        </span>
                        <p className="text-sm leading-relaxed">{line.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
