import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export type DashboardData = {
    credits?: number;
    sessions: any[]; // You can type this properly if you have shared types
    error?: string;
}

export async function getDashboardData(role: 'LEARNER' | 'TUTOR' | 'ADMIN'): Promise<DashboardData> {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await prisma.users.findUnique({
            where: { clerkId: userId },
            include: {
                student_profiles: { include: { users: true } },
                tutor_profiles: { include: { users: true } },
            },
        });

        if (!user) throw new Error("User not found");

        let sessions: any[] = [];
        let credits = 0;

        // Fetch Sessions based on Role
        if (role === 'LEARNER' && user.student_profiles) {
            credits = user.student_profiles.credits;
            sessions = await prisma.sessions.findMany({
                where: { student_id: user.student_profiles.id },
                include: {
                    tutor_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'desc' },
            });
        } else if (role === 'TUTOR' && user.tutor_profiles) {
            sessions = await prisma.sessions.findMany({
                where: { tutor_id: user.tutor_profiles.id },
                include: {
                    student_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'desc' },
            });
        } else if (role === 'ADMIN' && user.role === 'ADMIN') {
            // Admin Logic might need to be broader, but for dashboard usually we show ALL?
            // Or maybe reuse the existing logic in api/sessions?
            // The API route had a special case for ADMIN.
            sessions = await prisma.sessions.findMany({
                include: {
                    student_profiles: { include: { users: true } },
                    tutor_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'desc' },
                take: 50,
            });
        }

        // Format Sessions (Shared Logic from API)
        const formattedSessions = sessions.map((session) => {
            const studentProfile = 'student_profiles' in session ? (session as any).student_profiles : null
            const tutorProfile = 'tutor_profiles' in session ? (session as any).tutor_profiles : null

            return {
                id: session.id,
                start_time: session.start_time, // Keep snake_case if frontend expects it, or unify? 
                // The frontend currently uses snake_case: s.start_time
                // API returned CamelCase: startTime. 
                // WAIT. The Frontend code in page.tsx uses `s.start_time` (lines 91, 130).
                // The API route (Step 616) returned `startTime`!
                // This implies the frontend was ALREADY broken if it expected snake_case but API returned camelCase?
                // OR the frontend code I read in Step 552:
                // `new Date(s.start_time)`
                // If API returns `startTime`, then `s.start_time` is undefined.
                // SO THE FRONTEND WAS BROKEN ANYWAY for `start_time`.
                // BUT `status` worked?
                // Let's look at `s.tutor?.name`.
                // API returns `tutor: { name: ... }`.
                // Frontend uses `s.tutor?.name`. Matches.
                // I shoud return snake_case to match the frontend expectations, OR update frontend.
                // Updating frontend is better but risky if I miss spots.
                // I will return snake_case here to match what the frontend *tries* to read.
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
        console.error("Dashboard Service Error:", error);
        throw new Error("Failed to load dashboard data");
    }
}
