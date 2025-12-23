
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

type Tutor = {
    id: string
    name: string
    email: string
}

interface AssignSessionTutorModalProps {
    sessionId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AssignSessionTutorModal({ sessionId, isOpen, onClose }: AssignSessionTutorModalProps) {
    const [tutors, setTutors] = useState<Tutor[]>([])
    const [selectedTutorId, setSelectedTutorId] = useState('')
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            fetchTutors();
        }
    }, [isOpen]);

    async function fetchTutors() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/tutors');
            const json = await res.json();
            console.log('[AssignModal] Raw Tutor API Response:', json);

            // Handle both structure variations just in case
            const tutorList = Array.isArray(json) ? json : (json.data || []);
            console.log('[AssignModal] Parsed Tutor List:', tutorList);

            if (res.ok) {
                setTutors(tutorList);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleAssign() {
        if (!sessionId || !selectedTutorId) return;

        setAssigning(true);
        try {
            const res = await fetch(`/api/admin/sessions/${sessionId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tutorId: selectedTutorId })
            });

            if (res.ok) {
                router.refresh(); // Refresh server data
                onClose();
            } else {
                alert('Failed to assign tutor');
            }
        } catch (e) {
            console.error(e);
            alert('Error assigning tutor');
        } finally {
            setAssigning(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] text-black dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle>Assign Tutor to Session</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {loading ? (
                        <p>Loading tutors...</p>
                    ) : (
                        <div className="space-y-4">
                            <select
                                className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                                value={selectedTutorId}
                                onChange={(e) => setSelectedTutorId(e.target.value)}
                            >
                                <option value="">Select a tutor...</option>
                                {tutors.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <Button
                                onClick={handleAssign}
                                disabled={!selectedTutorId || assigning}
                                className="w-full bg-electric text-white hover:bg-electric/90"
                            >
                                {assigning ? 'Assigning...' : 'Confirm Assignment'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
