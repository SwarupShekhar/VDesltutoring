'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function JoinSessionPage() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState<any>(null);

    useEffect(() => {
        async function joinSession() {
            try {
                const res = await fetch(`/api/sessions/${id}/join`, {
                    method: 'POST',
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to join session');
                }

                setSessionData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            joinSession();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Connecting to secure classroom...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="max-w-md w-full border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Unable to Join</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">{error}</p>
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to Class</h1>
                <p className="text-gray-400 mb-8">
                    Room: {sessionData?.roomName}
                </p>

                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 mb-8">
                    <p className="text-sm text-yellow-500 mb-2">Video Component Not Installed</p>
                    <p className="text-xs text-gray-500 font-mono break-all">{sessionData?.token}</p>
                </div>

                <Link href="/dashboard">
                    <Button variant="secondary">
                        <ArrowLeft className="mr-2" size={16} /> Leave
                    </Button>
                </Link>
            </div>
        </div>
    );
}
