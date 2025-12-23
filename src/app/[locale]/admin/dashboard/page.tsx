import { cookies } from 'next/headers'
import { getDashboardData } from '@/lib/data/dashboard';
import { DashboardError } from '@/components/DashboardError'
import { StudentList } from './StudentList'
import { SessionManager } from './SessionManager'
import { CreditAdjustmentForm } from './CreditAdjustmentForm'
// TutorAssignmentForm is now largely redundant for primary tutors, but we can keep it or remove it if session assignment is preferred.
// Keeping it for now as "Primary Tutor Assignment"
import { TutorAssignmentForm } from './TutorAssignmentForm'

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
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Operations Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage students, assign tutors, and monitor sessions.</p>
        </div>
      </div>

      {/* 1. Critical Operations: Sessions */}
      <section>
        <SessionManager
          unassigned={unassignedSessions}
          upcoming={scheduledSessions}
          past={pastSessions}
          locale={locale}
        />
      </section>

      {/* 2. Management: Students */}
      <section>
        <StudentList students={students} />
      </section>

      {/* 3. Utility Tools */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreditAdjustmentForm />
        {/* TutorAssignmentForm removed as Primary Tutor feature is deprecated */}
      </section>
    </div>
  )
}