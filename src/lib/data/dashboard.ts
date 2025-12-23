import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export type DashboardData = {
    credits?: number;
    sessions: any[]; // You can type this properly if you have shared types
    error?: string;
}

export async function getDashboardData(role: 'LEARNER' | 'TUTOR' | 'ADMIN'): Promise<DashboardData> {
    try {
        console.log(`[DashboardService] Fetching data for role: ${role}`);
        const { userId } = await auth();
        console.log(`[DashboardService] Auth userId: ${userId}`);

        if (!userId) throw new Error("Unauthorized: No userId from auth()");

        const user = await prisma.users.findUnique({
            where: { clerkId: userId },
            include: {
                student_profiles: { include: { users: true } },
                tutor_profiles: { include: { users: true } },
            },
        });

        if (!user) {
            console.error(`[DashboardService] User not found in DB for clerkId: ${userId}`);
            throw new Error("User not found in database");
        }

        console.log(`[DashboardService] User found: ${user.id}, Role: ${user.role}, Active: ${user.is_active}`);

        let sessions: any[] = [];
        let credits = 0;

        // Fetch Sessions based on Role
        if (role === 'LEARNER') {
            if (!user.student_profiles) {
                console.warn(`[DashboardService] Role is LEARNER but no student_profile found for user ${user.id}`);
            } else {
                credits = user.student_profiles.credits;
                console.log(`[DashboardService] Fetching sessions for Student Profile: ${user.student_profiles.id} (Credits: ${credits})`);
                sessions = await prisma.sessions.findMany({
                    where: { student_id: user.student_profiles.id },
                    include: {
                        tutor_profiles: { include: { users: true } },
                    },
                    orderBy: { start_time: 'desc' },
                });
            }
        } else if (role === 'TUTOR') {
            if (!user.tutor_profiles) {
                console.warn(`[DashboardService] Role is TUTOR but no tutor_profile found for user ${user.id}`);
            } else {
                console.log(`[DashboardService] Fetching sessions for Tutor Profile: ${user.tutor_profiles.id}`);
                sessions = await prisma.sessions.findMany({
                    where: { tutor_id: user.tutor_profiles.id },
                    include: {
                        student_profiles: { include: { users: true } },
                    },
                    orderBy: { start_time: 'desc' },
                });
            }
        } else if (role === 'ADMIN' && user.role === 'ADMIN') {
            console.log(`[DashboardService] Fetching ALL sessions for ADMIN`);
            sessions = await prisma.sessions.findMany({
                include: {
                    student_profiles: { include: { users: true } },
                    tutor_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'desc' },
                take: 50,
            });
        } else {
            console.warn(`[DashboardService] Role mismatch or unauthorized access. Request Role: ${role}, User Role: ${user.role}`);
        }

        console.log(`[DashboardService] Found ${sessions.length} sessions.`);

        // Format Sessions (Shared Logic from API)
        const formattedSessions = sessions.map((session) => {
            const studentProfile = 'student_profiles' in session ? (session as any).student_profiles : null
            const tutorProfile = 'tutor_profiles' in session ? (session as any).tutor_profiles : null

            return {
                id: session.id,
                start_time: session.start_time,
                end_time: session.end_time,
                status: session.status || 'SCHEDULED',
                livekit_room_id: session.livekit_room_id,
                meeting_link: session.meeting_link,
                student: studentProfile ? {
                    id: studentProfile.id,
                    name: studentProfile.users?.full_name,
                } : null,
                tutor: tutorProfile ? {
                    id: tutorProfile.id,
                    name: tutorProfile.users?.full_name,
                } : null,
            }
        });

        return { credits, sessions: formattedSessions };

    } catch (error) {
        console.error("[DashboardService] Critical Error:", error);
        throw error;
    }
}
