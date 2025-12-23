
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AssignSessionTutorModal } from './AssignSessionTutorModal'
import { EvidenceViewer } from './EvidenceViewer'

type Session = {
    id: string
    start_time: string
    end_time: string
    status: string
    student: { name: string; email: string }
    tutor?: { name: string }
}

interface SessionManagerProps {
    unassigned: Session[];
    upcoming: Session[];
    past: Session[];
    locale: string;
}

export function SessionManager({ unassigned, upcoming, past, locale }: SessionManagerProps) {
    const [selectedTab, setSelectedTab] = useState<'unassigned' | 'upcoming' | 'past'>('unassigned');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const openAssignModal = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setAssignModalOpen(true);
    };

    const renderSessionList = (sessions: Session[], type: 'unassigned' | 'upcoming' | 'past') => {
        if (sessions.length === 0) {
            return <div className="p-8 text-center text-gray-500">No sessions in this category.</div>
        }

        return (
            <div className="space-y-4">
                {sessions.map((s) => (
                    <div key={s.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex justify-between items-center transition-all hover:shadow-md">
                        <div>
                            <div className="font-medium text-lg">
                                {new Date(s.start_time).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="text-xs uppercase tracking-wide text-gray-500 mr-1">Student:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{s.student?.name}</span>
                                {s.student?.email && <span className="text-xs opacity-70 ml-1">({s.student.email})</span>}
                            </div>
                            <div className="text-sm mt-1">
                                {s.tutor ? (
                                    <span className="text-green-600 dark:text-green-400">Tutor: {s.tutor.name}</span>
                                ) : (
                                    <span className="text-red-500 font-bold bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs">NO TUTOR ASSIGNED</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={s.status === 'SCHEDULED' ? 'default' : 'secondary'}>{s.status}</Badge>

                            {type === 'unassigned' && (
                                <Button size="sm" onClick={() => openAssignModal(s.id)} className="bg-electric hover:bg-blue-600 text-white">
                                    Assign Tutor
                                </Button>
                            )}

                            {type !== 'unassigned' && (
                                <EvidenceViewer sessionId={s.id} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    };

    return (
        <Card>
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-0">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle>Session Operations</CardTitle>
                </div>
                <div className="flex gap-6">
                    <button
                        onClick={() => setSelectedTab('unassigned')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'unassigned' ? 'border-electric text-electric' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        🚨 Unassigned ({unassigned.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('upcoming')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'upcoming' ? 'border-electric text-electric' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        ✅ Upcoming ({upcoming.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('past')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'past' ? 'border-electric text-electric' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        📜 History ({past.length})
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {selectedTab === 'unassigned' && renderSessionList(unassigned, 'unassigned')}
                {selectedTab === 'upcoming' && renderSessionList(upcoming, 'upcoming')}
                {selectedTab === 'past' && renderSessionList(past, 'past')}
            </CardContent>

            <AssignSessionTutorModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                sessionId={selectedSessionId}
            />
        </Card>
    )
}
