import { cookies } from 'next/headers'
import { getDashboardData } from '@/lib/data/dashboard';
import { DashboardError } from '@/components/DashboardError'
import { DashboardTabs } from './DashboardTabs'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  let dashboardData: any = {};
  let error = null;

  try {
    dashboardData = await getDashboardData('ADMIN');
  } catch (err) {
    console.error("Admin Dashboard fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  if (error) {
    return <DashboardError message={error} />
  }

  const { students = [], unassignedSessions = [], scheduledSessions = [], pastSessions = [] } = dashboardData;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Learning Intelligence Center</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Transforming tutoring data into educational outcomes.</p>
      </div>

      <DashboardTabs
        students={students}
        unassignedSessions={unassignedSessions}
        scheduledSessions={scheduledSessions}
        pastSessions={pastSessions}
        locale={locale}
      />
    </div>
  )
}