'use client';

import { Button } from '@/components/ui/Button';
import { RefreshCcw } from 'lucide-react';

export function DashboardError({ message, retryLabel }: { message: string, retryLabel?: string }) {
    return (
        <div className="p-12 text-center bg-card rounded-xl border border-destructive/20 shadow-sm">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
                {retryLabel || "Retry"}
            </Button>
        </div>
    );
}
