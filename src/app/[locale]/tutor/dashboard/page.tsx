import { cookies } from 'next/headers'
import { SessionActions } from './SessionActions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  ArrowRight, 
  ChevronRight, 
  Bell, 
  Award, 
  Activity, 
  Video, 
  MessageSquare, 
  CheckSquare, 
  Sparkles, 
  TrendingUp, 
  Plus 
} from 'lucide-react'

import { getDashboardData } from '@/lib/data/dashboard';
import { DashboardError } from '@/components/DashboardError'

export default async function TutorDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  let sessions = [];
  let students = [];
  let blogStats = { total: 0, published: 0, submitted: 0, needs_rework: 0, drafts: 0 };
  let recentBlogs = [];
  let notifications = [];
  let error = null;

  try {
    const data = await getDashboardData('TUTOR');
    sessions = data.sessions || [];
    students = (data as any).students || [];
    blogStats = (data as any).blogStats || { total: 0, published: 0, submitted: 0, needs_rework: 0, drafts: 0 };
    recentBlogs = (data as any).recentBlogs || [];
    notifications = (data as any).notifications || [];
  } catch (err) {
    console.error("Tutor Dashboard fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  if (error) {
    return <DashboardError message={error} />
  }

  const now = Date.now()
  const upcomingSessions = sessions.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'LIVE')
  const completedCount = sessions.filter((s: any) => s.status === 'COMPLETED').length

  // CEFR color utility for gorgeous rendering
  const getCEFRColor = (level: string) => {
    const l = level.toUpperCase()
    if (l.startsWith('A')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400'
    if (l.startsWith('B')) return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400'
    if (l.startsWith('C')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400'
    return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/5 dark:text-slate-400'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 rounded-full dark:bg-indigo-500/5">
              Active Partner
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            Welcome back! <Sparkles className="text-indigo-500 animate-pulse" size={24} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is a complete overview of your classes, student metrics, and editorial workflow.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Today's Schedule</p>
          <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{new Date().toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upcoming Classes</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {upcomingSessions.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Scheduled next</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl text-indigo-500 shrink-0">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Students</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {students.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Distinct learners</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl text-emerald-500 shrink-0">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Completed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {completedCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Sessions taught</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40 rounded-2xl text-amber-500 shrink-0">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Articles</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {blogStats.published}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{blogStats.drafts} drafts in progress</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40 rounded-2xl text-rose-500 shrink-0">
            <BookOpen size={24} />
          </div>
        </div>
      </div>

      {/* Main Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Sessions & Students) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Sessions */}
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 p-6">
              <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-indigo-500" size={18} />
                Today & Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((s: any) => {
                    const start = new Date(s.start_time).getTime()
                    const diffMinutes = Math.round((start - now) / 60000)
                    const showActions = !['COMPLETED', 'NO_SHOW'].includes(s.status)

                    return (
                      <div key={s.id} className="p-4 border border-slate-100 dark:border-slate-800/60 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 transition-all duration-300 hover:border-indigo-500/20 dark:hover:border-indigo-400/20 hover:shadow-md hover:shadow-indigo-500/2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {new Date(s.start_time).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              Student: <span className="font-bold text-slate-800 dark:text-slate-200">{s.student?.name || 'Not assigned'}</span>
                            </div>
                          </div>
                          <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            s.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5' :
                            s.status === 'LIVE' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5 animate-pulse' :
                            s.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/5' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5'
                          }`}>{s.status}</Badge>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                          <div>
                            {!showActions && (
                              <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Session complete
                              </div>
                            )}

                            {showActions && diffMinutes > 15 && (
                              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                Awaiting session time
                              </div>
                            )}

                            {showActions && diffMinutes <= 15 && diffMinutes > -60 && (
                              <div className="flex flex-col gap-1.5">
                                {diffMinutes <= 0 ? (
                                  <div className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                    Session in progress
                                  </div>
                                ) : (
                                  <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Session starting soon
                                  </div>
                                )}
                                <Link href={`/tutor/sessions/${s.id}`} prefetch={false}>
                                  <Button className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/10 flex items-center gap-1.5">
                                    <Video size={12} />
                                    Join Session
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>

                          {showActions && (
                            <SessionActions
                              sessionId={s.id}
                              status={s.status}
                              startTime={s.start_time}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="text-slate-300 dark:text-slate-700 mx-auto" size={40} />
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-3">No upcoming sessions on your calendar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Students List */}
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 p-6">
              <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-indigo-500" size={18} />
                Your Assigned Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map((student: any) => (
                    <div key={student.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[150px]">
                          {student.email}
                        </div>
                        <div className="text-[10px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                          <Activity size={10} />
                          Remaining Credits: {student.credits}
                        </div>
                      </div>
                      <Badge className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-xl border shrink-0 ${getCEFRColor(student.cefr)}`}>
                        {student.cefr}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Users className="text-slate-300 dark:text-slate-700 mx-auto" size={40} />
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-3">No student profiles linked yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column (Editorial Queue & Notifications) */}
        <div className="space-y-8">
          {/* Quick Actions Panel */}
          <Card className="border-indigo-500/20 dark:border-indigo-800/40 bg-linear-to-br from-indigo-500/2 to-transparent shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black tracking-widest uppercase text-indigo-500 flex items-center gap-1.5">
                Quick Portal Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <Link href="/tutor/blog" className="flex items-center justify-between p-3.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">Blogging Hub</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Author articles & manage drafts</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Editorial Queue */}
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={18} />
                Recent Articles
              </CardTitle>
              <Link href="/tutor/blog" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                View Hub
                <ArrowRight size={12} />
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {recentBlogs.length > 0 ? (
                <div className="space-y-4">
                  {recentBlogs.map((b: any) => (
                    <div key={b.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {b.title}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{b.views.toLocaleString()} views</p>
                      </div>
                      <Badge className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-lg shrink-0 ${
                        b.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        b.status === 'submitted' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        b.status === 'needs_rework' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>{b.status === 'needs_rework' ? 'rework' : b.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">No blog posts drafted yet</p>
                  <Link href="/tutor/blog">
                    <Button size="sm" className="h-7 text-[10px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg mt-2.5">
                      Create Draft
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Notifications Feed */}
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 p-6">
              <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="text-indigo-500 animate-pulse" size={18} />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="p-3 bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {n.title}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1.5">
                        {new Date(n.created_at).toLocaleDateString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">No new unread notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}