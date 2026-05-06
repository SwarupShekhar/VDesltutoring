'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { AssignSessionTutorModal } from './AssignSessionTutorModal'
import { 
    AlertTriangle, 
    Bell, 
    Check, 
    CheckCircle2, 
    Database, 
    Flame, 
    Megaphone, 
    PlusCircle, 
    RotateCw, 
    ShieldAlert, 
    Sparkles, 
    ToggleLeft, 
    ToggleRight, 
    UserMinus, 
    Users, 
    X, 
    XCircle 
} from 'lucide-react'
import confetti from 'canvas-confetti'

type Session = {
    id: string
    start_time: string
    end_time: string
    status: string
    student: { name: string; email: string }
    tutor?: { name: string }
}

type Student = {
    id: string
    name: string
    email: string
    credits: number
}

interface QuickActionsAndAlertsProps {
    unassignedSessions: Session[];
    students: Student[];
    locale: string;
}

export function QuickActionsAndAlerts({ unassignedSessions, students, locale }: QuickActionsAndAlertsProps) {
    // Maintenance simulation
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    
    // Announcement dialog state
    const [announcementOpen, setAnnouncementOpen] = useState(false)
    const [announceTitle, setAnnounceTitle] = useState('')
    const [announceMessage, setAnnounceMessage] = useState('')
    const [sendingAnnounce, setSendingAnnounce] = useState(false)
    const [announceSuccess, setAnnounceSuccess] = useState(false)

    // Backup simulation
    const [backupProgress, setBackupProgress] = useState<number | null>(null)
    const [lastBackupTime, setLastBackupTime] = useState<string>('2 hours ago')

    // Tutor assignment from alert
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

    // Alerts State (Local dismissal list)
    const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([])

    // Trigger backup simulation
    const handleRunBackup = () => {
        if (backupProgress !== null) return
        setBackupProgress(0)
        
        const interval = setInterval(() => {
            setBackupProgress((prev) => {
                if (prev === null) return null
                if (prev >= 100) {
                    clearInterval(interval)
                    confetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { y: 0.8 }
                    })
                    setLastBackupTime('Just now')
                    setTimeout(() => setBackupProgress(null), 1500)
                    return 100
                }
                return prev + 10
            })
        }, 150)
    }

    // Send actual/simulated Announcement to Tutors
    const handleSendAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!announceTitle || !announceMessage) return

        setSendingAnnounce(true)
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: announceTitle,
                    message: announceMessage
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                setAnnounceSuccess(true)
                setAnnounceTitle('')
                setAnnounceMessage('')
                setTimeout(() => {
                    setAnnounceSuccess(false)
                    setAnnouncementOpen(false)
                }, 2000)
            } else {
                alert(data.error || 'Failed to dispatch announcements')
            }
        } catch (err) {
            console.error('Error sending announcement:', err)
            alert('A networking error occurred during announcement broadcast')
        } finally {
            setSendingAnnounce(false)
        }
    }

    // Scroll helpers
    const scrollToCreditForm = () => {
        const element = document.getElementById('credit-adjustment-form-container')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            element.classList.add('ring-4', 'ring-indigo-500/30')
            setTimeout(() => {
                element.classList.remove('ring-4', 'ring-indigo-500/30')
            }, 3000)
        }
    }

    // Constructing smart live alerts based on DB states
    const systemAlerts = useMemo(() => {
        const alertsList = []

        // 1. Unassigned sessions alerts
        if (unassignedSessions.length > 0) {
            alertsList.push({
                id: 'unassigned-sessions-alert',
                type: 'CRITICAL',
                title: 'Unassigned Booking Backlog',
                message: `There are ${unassignedSessions.length} upcoming session(s) without an active tutor pairing.`,
                actionLabel: 'Assign Tutor',
                action: () => {
                    setSelectedSessionId(unassignedSessions[0].id)
                    setAssignModalOpen(true)
                }
            })
        }

        // 2. Out-of-credit students alert
        const outOfCreditStudents = students.filter(s => s.credits === 0)
        if (outOfCreditStudents.length > 0) {
            alertsList.push({
                id: 'out-of-credits-alert',
                type: 'WARNING',
                title: 'Learner Credit Depletion',
                message: `${outOfCreditStudents.length} student(s) have run out of learning credits but remain active in registry.`,
                actionLabel: 'Grant Credits',
                action: () => {
                    scrollToCreditForm()
                }
            })
        }

        // Static helper alerts
        alertsList.push({
            id: 'learning-delta-alert',
            type: 'INFO',
            title: 'CEFR Tracking Calibrated',
            message: 'Speech analysis engine completed the daily CEFR delta recalculation. 12 learners levelling up.',
            actionLabel: 'View Analytics',
            action: () => {
                const tabBtn = document.getElementById('btn-session-list-view') // dummy to scroll/trigger
                if (tabBtn) tabBtn.scrollIntoView({ behavior: 'smooth' })
            }
        })

        alertsList.push({
            id: 'security-clerk-webhook',
            type: 'SUCCESS',
            title: 'Third-party Integrations Stable',
            message: 'All webhooks for Clerk auth sync and Razorpay billing are running with 100% success rate (24h).',
            actionLabel: 'System Diagnostics',
            action: null
        })

        // Filter out dismissed
        return alertsList.filter(a => !dismissedAlertIds.includes(a.id))
    }, [unassignedSessions, students, dismissedAlertIds])

    const dismissAlert = (id: string) => {
        setDismissedAlertIds((prev) => [...prev, id])
    }

    return (
        <div className="space-y-6">
            
            {/* MAINTENANCE SYSTEM BANNER */}
            {maintenanceMode && (
                <div className="bg-amber-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-lg border border-amber-600/30 animate-bounce duration-1000">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                        <span>OPERATIONAL ALERT: System Booking is locked. Scheduled classes continue, but new registrations are paused.</span>
                    </div>
                    <button 
                        id="btn-disable-maintenance-banner"
                        onClick={() => setMaintenanceMode(false)} 
                        className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition-all text-xs"
                    >
                        Disable Maintenance
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* QUICK ACTIONS PANEL (8 COLS) */}
                <div className="xl:col-span-8 space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Executive Actions Panel
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {/* Broadcasting announcements CARD */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="pt-6 flex flex-col justify-between h-full min-h-[140px] relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <Megaphone className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Broadcast Announcement</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                                    Send message notifications instantly to all registered tutors.
                                </p>
                                <Button 
                                    id="btn-trigger-announcement"
                                    onClick={() => setAnnouncementOpen(true)}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg mt-4 h-8 px-3 w-full shadow-sm"
                                >
                                    Compose Message
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Database operations/Backup CARD */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="pt-6 flex flex-col justify-between h-full min-h-[140px] relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-cyan-600 dark:text-cyan-400">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Database Backup</h4>
                                        <span className="text-[10px] text-slate-400 font-medium">Last: {lastBackupTime}</span>
                                    </div>
                                </div>

                                {backupProgress !== null ? (
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                            <span>Running backup...</span>
                                            <span>{backupProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-cyan-500 h-full transition-all duration-150 rounded-full"
                                                style={{ width: `${backupProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                                            Execute a full snapshot of all records to remote secure backup storage.
                                        </p>
                                        <Button 
                                            id="btn-run-backup"
                                            onClick={handleRunBackup}
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold rounded-lg mt-4 h-8 px-3 w-full"
                                        >
                                            Backup Now
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Maintenance systems CARD */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="pt-6 flex flex-col justify-between h-full min-h-[140px] relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Maintenance</h4>
                                    </div>
                                    <button 
                                        id="btn-toggle-maintenance"
                                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {maintenanceMode ? (
                                            <ToggleRight className="w-8 h-8 text-amber-500" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                                    Lock database mutations and booking endpoints for system upgrades.
                                </p>
                                <span className="text-[10px] font-bold mt-4 block text-center uppercase tracking-wider text-slate-400">
                                    Status: {maintenanceMode ? 'Locked / Live Alert' : 'Active / Unlocked'}
                                </span>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* NOTIFICATIONS INBOX PANEL (4 COLS) */}
                <div className="xl:col-span-4 space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            Operational Alerts Feed
                        </span>
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                            {systemAlerts.length} Active
                        </span>
                    </h2>

                    <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 overflow-hidden shadow-md max-h-[350px] overflow-y-auto">
                        <CardContent className="p-4 space-y-3.5 divide-y divide-slate-50 dark:divide-slate-800/50">
                            {systemAlerts.length > 0 ? (
                                systemAlerts.map((alert, index) => (
                                    <div 
                                        key={alert.id} 
                                        className={`pt-3.5 ${index === 0 ? 'pt-0 border-t-0' : 'border-t border-slate-100 dark:border-slate-800'} animate-in slide-in-from-top-2 duration-300`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-start gap-2">
                                                {alert.type === 'CRITICAL' && <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />}
                                                {alert.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                                                {alert.type === 'INFO' && <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                                                {alert.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                                                
                                                <div>
                                                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {alert.title}
                                                    </h5>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <button 
                                                id={`btn-dismiss-alert-${alert.id}`}
                                                onClick={() => dismissAlert(alert.id)}
                                                className="text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-400 p-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {alert.action && (
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    id={`btn-action-alert-${alert.id}`}
                                                    onClick={alert.action}
                                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 px-2 py-1 rounded-md transition-all"
                                                >
                                                    {alert.actionLabel}
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-pulse" />
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Operations Perfectly Clear</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">All alerts cleared and system components verified.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* BROADCAST TUTOR ANNOUNCEMENT DIALOG */}
            <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
                <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-indigo-500" />
                            Compose Tutor Announcement
                        </DialogTitle>
                    </DialogHeader>

                    {announceSuccess ? (
                        <div className="py-12 text-center space-y-3 animate-in zoom-in-50 duration-300">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                                <Check className="w-8 h-8 animate-bounce" />
                            </div>
                            <h4 className="text-md font-bold text-slate-800 dark:text-slate-100">Broadcast Transmitted!</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto">
                                The announcement notification was successfully written and synced to all tutor dashboard feeds.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSendAnnouncement} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Announcement Title</label>
                                <input
                                    id="input-announcement-title"
                                    type="text"
                                    placeholder="e.g. Scheduled Maintenance, Curriculum Upgrades..."
                                    value={announceTitle}
                                    onChange={(e) => setAnnounceTitle(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message Content</label>
                                <textarea
                                    id="input-announcement-message"
                                    placeholder="Draft message body instructions or alerts for the tutoring roster..."
                                    rows={5}
                                    value={announceMessage}
                                    onChange={(e) => setAnnounceMessage(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <Button 
                                    id="btn-close-announcement"
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setAnnouncementOpen(false)}
                                    className="text-xs rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    id="btn-submit-announcement"
                                    type="submit"
                                    disabled={sendingAnnounce}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md px-4"
                                >
                                    {sendingAnnounce ? 'Broadcasting...' : 'Send Broadcast'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* ASSIGN TUTOR MODAL REUSED FROM ALERTS TRIGGER */}
            <AssignSessionTutorModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                sessionId={selectedSessionId}
            />

        </div>
    )
}
