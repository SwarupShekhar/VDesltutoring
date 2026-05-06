'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AssignSessionTutorModal } from './AssignSessionTutorModal'
import { EvidenceViewer } from './EvidenceViewer'
import { 
    Calendar as CalendarIcon, 
    List as ListIcon, 
    ChevronLeft, 
    ChevronRight, 
    Download, 
    Radio, 
    User, 
    Video, 
    AlertCircle, 
    CalendarDays,
    X,
    Clock
} from 'lucide-react'

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
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    
    // Calendar view state
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const openAssignModal = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setAssignModalOpen(true);
    };

    // Combine all sessions for general operations (like live tracking and calendar mapping)
    const allSessions = useMemo(() => {
        return [...unassigned, ...upcoming, ...past]
    }, [unassigned, upcoming, past])

    // Find Live sessions (either explicitly LIVE or starting right now)
    const liveSessions = useMemo(() => {
        const now = new Date()
        return allSessions.filter(s => {
            if (s.status === 'LIVE') return true
            if (s.status === 'SCHEDULED') {
                const start = new Date(s.start_time)
                const end = new Date(s.end_time)
                return now >= start && now <= end
            }
            return false
        })
    }, [allSessions])

    // CSV Export for active tab sessions
    const handleExportSessions = () => {
        const activeSessions = 
            selectedTab === 'unassigned' ? unassigned : 
            selectedTab === 'upcoming' ? upcoming : past
        
        if (activeSessions.length === 0) return

        const headers = ['Session ID', 'Start Time', 'End Time', 'Status', 'Student Name', 'Student Email', 'Tutor Name']
        const rows = activeSessions.map(s => [
            s.id,
            new Date(s.start_time).toISOString(),
            new Date(s.end_time).toISOString(),
            s.status,
            s.student?.name || 'N/A',
            s.student?.email || 'N/A',
            s.tutor?.name || 'Unassigned'
        ])

        const csvContent = 'data:text/csv;charset=utf-8,' 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `sessions_${selectedTab}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Helper for rendering calendar math
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday
        
        const days = []
        // Blank spaces padding before month starts
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null)
        }
        // Actual days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(year, month, d))
        }
        
        return days
    }, [currentMonth])

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
        setSelectedDate(null)
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
        setSelectedDate(null)
    }

    const getStatusColorClass = (status: string, hasTutor: boolean) => {
        if (!hasTutor && status === 'SCHEDULED') return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200'
        
        switch (status) {
            case 'LIVE':
                return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40'
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
            case 'CANCELLED':
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            case 'NO_SHOW':
                return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
            default:
                return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40'
        }
    }

    // Filter sessions on a given date string (YYYY-MM-DD)
    const getSessionsForDate = (dateStr: string) => {
        return allSessions.filter(s => {
            const sDateStr = new Date(s.start_time).toISOString().split('T')[0]
            return sDateStr === dateStr
        })
    }

    // Sessions on selected calendar date
    const selectedDateSessions = useMemo(() => {
        if (!selectedDate) return []
        return getSessionsForDate(selectedDate)
    }, [selectedDate, allSessions])

    const renderSessionItem = (s: Session, showTutorAction: boolean = false) => {
        const isLive = s.status === 'LIVE' || (s.status === 'SCHEDULED' && new Date() >= new Date(s.start_time) && new Date() <= new Date(s.end_time))
        
        return (
            <div 
                key={s.id} 
                className="p-4 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-700"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">
                            {new Date(s.start_time).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        {isLive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-900/40 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                Live Now
                            </span>
                        )}
                    </div>
                    
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs uppercase font-semibold text-slate-400">Student:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">{s.student?.name}</span>
                        {s.student?.email && <span className="text-xs text-slate-400 opacity-80">({s.student.email})</span>}
                    </div>

                    <div className="text-sm flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs uppercase font-semibold text-slate-400">Tutor:</span>
                        {s.tutor ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <User className="w-3.5 h-3.5" /> {s.tutor.name}
                            </span>
                        ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg text-xs border border-amber-100 dark:border-amber-900/30">
                                <AlertCircle className="w-3 h-3 text-amber-500" /> Unassigned
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2.5">
                    <Badge className={`px-2.5 py-0.5 border text-xs font-bold rounded-lg ${getStatusColorClass(s.status, !!s.tutor)}`}>
                        {s.status}
                    </Badge>

                    {(!s.tutor && showTutorAction) && (
                        <Button 
                            id={`btn-assign-tutor-${s.id}`}
                            size="sm" 
                            onClick={() => openAssignModal(s.id)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow h-8 px-3"
                        >
                            Assign Tutor
                        </Button>
                    )}

                    {s.tutor && (
                        <EvidenceViewer sessionId={s.id} />
                    )}
                </div>
            </div>
        )
    }

    return (
        <Card className="shadow-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            
            {/* LIVE SESSIONS MONITORING */}
            {liveSessions.length > 0 && (
                <div className="bg-linear-to-r from-red-500/10 via-rose-500/15 to-red-500/10 border-b border-red-100 dark:border-red-950/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div>
                            <h4 className="text-sm font-black text-red-900 dark:text-red-300 uppercase tracking-wider flex items-center gap-1">
                                <Radio className="w-4 h-4" /> Live Operational Activity ({liveSessions.length})
                            </h4>
                            <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">
                                Active virtual classrooms are in progress right now. Monitoring system latency.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {liveSessions.slice(0, 3).map(s => (
                            <div key={s.id} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-red-200 dark:border-red-950 px-2.5 py-1 rounded-xl text-xs flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{s.student?.name}</span>
                                <span className="text-slate-400 font-normal">↔</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                    <User className="w-3 h-3" /> {s.tutor?.name || 'Unassigned'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TABBAR & VIEWS SELECTION */}
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Session Operations
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Coordinate learner bookings, re-assign classrooms, and export schedule files.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                            <button
                                id="btn-session-list-view"
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                <ListIcon className="w-3.5 h-3.5" />
                                List
                            </button>
                            <button
                                id="btn-session-calendar-view"
                                onClick={() => setViewMode('calendar')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Calendar
                            </button>
                        </div>

                        {/* Export Button */}
                        {viewMode === 'list' && (
                            <Button 
                                id="btn-export-sessions"
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportSessions}
                                className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-8 px-2.5 rounded-xl flex items-center gap-1"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="sr-only sm:not-sr-only text-xs">Export</span>
                            </Button>
                        )}
                    </div>
                </div>

                {viewMode === 'list' && (
                    <div className="flex gap-6 border-b border-transparent">
                        <button
                            id="tab-sessions-unassigned"
                            onClick={() => setSelectedTab('unassigned')}
                            className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'unassigned' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            🚨 Unassigned ({unassigned.length})
                        </button>
                        <button
                            id="tab-sessions-upcoming"
                            onClick={() => setSelectedTab('upcoming')}
                            className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'upcoming' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            ✅ Upcoming ({upcoming.length})
                        </button>
                        <button
                            id="tab-sessions-past"
                            onClick={() => setSelectedTab('past')}
                            className={`pb-4 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'past' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            📜 History ({past.length})
                        </button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-6">
                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        {selectedTab === 'unassigned' && (
                            unassigned.length > 0 ? (
                                <div className="space-y-3">
                                    {unassigned.map(s => renderSessionItem(s, true))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Clear backlog!</p>
                                    <p className="text-xs text-slate-400 mt-1">No unassigned tutoring sessions remain.</p>
                                </div>
                            )
                        )}

                        {selectedTab === 'upcoming' && (
                            upcoming.length > 0 ? (
                                <div className="space-y-3">
                                    {upcoming.map(s => renderSessionItem(s, false))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming sessions</p>
                                    <p className="text-xs text-slate-400 mt-1">Schedule is clear for the coming days.</p>
                                </div>
                            )
                        )}

                        {selectedTab === 'past' && (
                            past.length > 0 ? (
                                <div className="space-y-3">
                                    {past.map(s => renderSessionItem(s, false))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Archive empty</p>
                                    <p className="text-xs text-slate-400 mt-1">No past sessions recorded.</p>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    /* INTERACTIVE CALENDAR CONTAINER */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* THE MONTH GRID */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                                    {currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                                </h3>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <button 
                                        id="btn-calendar-prev"
                                        onClick={handlePrevMonth} 
                                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        id="btn-calendar-next"
                                        onClick={handleNextMonth} 
                                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-1.5 border-b border-slate-50 dark:border-slate-800">
                                <div>SUN</div>
                                <div>MON</div>
                                <div>TUE</div>
                                <div>WED</div>
                                <div>THU</div>
                                <div>FRI</div>
                                <div>SAT</div>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {calendarData.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl" />
                                    
                                    const dateStr = day.toISOString().split('T')[0]
                                    const daySessions = getSessionsForDate(dateStr)
                                    const isSelected = selectedDate === dateStr
                                    
                                    // Highlight today
                                    const isToday = new Date().toISOString().split('T')[0] === dateStr
                                    
                                    // Categories of sessions on this day
                                    const hasUnassigned = daySessions.some(s => !s.tutor)
                                    const hasLive = daySessions.some(s => s.status === 'LIVE')
                                    const hasScheduled = daySessions.some(s => s.status === 'SCHEDULED' && s.tutor)
                                    const hasCompleted = daySessions.some(s => s.status === 'COMPLETED')

                                    return (
                                        <button
                                            id={`calendar-day-${dateStr}`}
                                            key={dateStr}
                                            onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                            className={`aspect-square p-2 rounded-xl flex flex-col justify-between items-start border transition-all text-left group relative ${
                                                isSelected 
                                                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-500' 
                                                    : isToday
                                                        ? 'border-indigo-200 dark:border-indigo-900 bg-slate-50 dark:bg-slate-800 font-black'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {day.getDate()}
                                            </span>

                                            {/* Indicators dots for sessions */}
                                            {daySessions.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 mt-auto w-full">
                                                    {hasUnassigned && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Unassigned sessions" />}
                                                    {hasLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Live Sessions" />}
                                                    {hasScheduled && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Scheduled sessions" />}
                                                    {hasCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Completed sessions" />}
                                                    <span className="text-[9px] font-semibold text-slate-400 ml-auto group-hover:text-indigo-600">
                                                        x{daySessions.length}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* DETAIL SESSIONS DRAWER / SIDE BAR */}
                        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6">
                            {selectedDate ? (
                                <div className="space-y-4 animate-in slide-in-from-right-3 duration-300">
                                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {new Date(selectedDate).toLocaleDateString(locale, { dateStyle: 'long' })}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {selectedDateSessions.length} total sessions
                                            </p>
                                        </div>
                                        <button 
                                            id="btn-close-calendar-drawer"
                                            onClick={() => setSelectedDate(null)}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {selectedDateSessions.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {selectedDateSessions.map(s => renderSessionItem(s, true))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl">
                                            <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Zero activity scheduled</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Admins can adjust or assign entries.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[300px]">
                                    <CalendarIcon className="w-10 h-10 text-indigo-200 dark:text-indigo-950 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select Calendar Day</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] mx-auto">
                                        Click any highlighted day on the calendar grid to audit scheduling operations.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <AssignSessionTutorModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                sessionId={selectedSessionId}
            />
        </Card>
    )
}
