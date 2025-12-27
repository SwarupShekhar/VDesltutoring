import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export type DashboardData = {
    credits?: number;
    sessions: any[];
    students?: any[];
    unassignedSessions?: any[];
    scheduledSessions?: any[];
    pastSessions?: any[];
    aiSessions?: any[];
    error?: string;
}

export async function getDashboardData(role: 'LEARNER' | 'TUTOR' | 'ADMIN'): Promise<DashboardData> {
    try {
        console.log(`[DashboardService] Fetching data for role: ${role}`);
        const { userId } = await auth();
        console.log(`[DashboardService] Auth userId: ${userId}`);

        if (!userId) throw new Error("Unauthorized: No userId from auth()");

        let user = await prisma.users.findUnique({
            where: { clerkId: userId },
            include: {
                student_profiles: { include: { users: true } },
                tutor_profiles: { include: { users: true } },
            },
        });

        // SELF-HEALING: If user missing in DB but exists in Clerk, create them.
        if (!user) {
            console.warn(`[DashboardService] User ${userId} not found in DB. Attempting self-healing...`);
            const clerkUser = await currentUser();

            if (!clerkUser) {
                console.error(`[DashboardService] Failed to fetch Clerk user details for ${userId}`);
                throw new Error("User not found in database and failed to sync from Clerk");
            }

            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User';

            console.log(`[DashboardService] Creating user record for ${email}`);

            // Transaction to create User + Student Profile (default role)
            user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.users.create({
                    data: {
                        clerkId: userId,
                        email: email,
                        full_name: fullName,
                        role: 'LEARNER', // Default to Learner
                        is_active: true,
                    }
                });

                await tx.student_profiles.create({
                    data: {
                        user_id: newUser.id,
                        credits: 10, // Default free credits
                        learning_goals: "Getting started",
                    }
                });

                return await tx.users.findUnique({
                    where: { id: newUser.id },
                    include: {
                        student_profiles: { include: { users: true } },
                        tutor_profiles: { include: { users: true } },
                    }
                });
            });

            // If still null (shouldn't happen), throw
            if (!user) throw new Error("Failed to create user record");
            console.log(`[DashboardService] Self-healing successful. User created: ${user.id}`);
        }

        console.log(`[DashboardService] User found: ${user.id}, Role: ${user.role}, Active: ${user.is_active}`);

        let sessions: any[] = [];
        let credits = 0;

        // Fetch Sessions based on Role
        if (role === 'LEARNER') {
            // ENHANCED SELF-HEALING: If User exists but Profile missing
            if (!user.student_profiles) {
                console.warn(`[DashboardService] Role is LEARNER but no student_profile found for user ${user.id}. Creating one...`);
                const newProfile = await prisma.student_profiles.create({
                    data: {
                        user_id: user.id,
                        credits: 10, // Grant default credits
                        learning_goals: "Getting started",
                    }
                });
                // Attach to current user object to proceed without refetch
                user.student_profiles = { ...newProfile, users: user };
            }

            credits = user.student_profiles.credits;
            console.log(`[DashboardService] Fetching sessions for Student Profile: ${user.student_profiles!.id} (Credits: ${credits})`);

            sessions = await prisma.sessions.findMany({
                where: { student_id: user.student_profiles!.id },
                include: {
                    tutor_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'desc' },
            });

            // RETROACTIVE FIX: If 0 credits and 0 history, grant 10 credits (for users caught in the bug)
            if (credits === 0 && sessions.length === 0) {
                console.log(`[DashboardService] User has 0 credits and 0 sessions. Applying retroactive welcome bonus.`);
                await prisma.student_profiles.update({
                    where: { id: user.student_profiles!.id },
                    data: { credits: 10 }
                });
                credits = 10;
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
            console.log(`[DashboardService] Fetching Ops Center data for ADMIN`);

            // 1. Fetch Students
            // 1. Fetch Students (Exclude Admins and Tutors to keep registry clean)
            const students = await prisma.student_profiles.findMany({
                where: {
                    users: {
                        role: 'LEARNER'
                    }
                },
                include: { users: true },
                orderBy: { users: { full_name: 'asc' } }
            });

            // 2. Fetch Sessions for partitioning
            const allSessions = await prisma.sessions.findMany({
                include: {
                    student_profiles: { include: { users: true } },
                    tutor_profiles: { include: { users: true } },
                },
                orderBy: { start_time: 'asc' }, // Ascending for upcoming timeline
                // take: 100, // Removed limit to see full ops picture
            });

            // 3. Partition and Auto-expire
            const now = new Date();
            const unassignedSessions: any[] = [];
            const scheduledSessions: any[] = [];
            const pastSessions: any[] = [];

            // DEBUG: Inspect specific inconsistent sessions
            // REMOVED: Since auto-assignment is disabled, SCHEDULED + No Tutor is now a valid state.
            // if (sess.status === 'SCHEDULED' && !sess.tutor_id) { ... }
            for (const sess of allSessions) {
                const startTime = new Date(sess.start_time);
                const isPast = startTime < now;

                if (isPast || sess.status === 'COMPLETED' || sess.status === 'CANCELLED' || sess.status === 'NO_SHOW') {
                    // Completed, Cancelled, No-show OR Past Scheduled sessions go to history
                    // Auto-expire logic: If status is still SCHEDULED but time is past, treat as completed/expired
                    // In a real system, we might update the DB here or have a cron job.
                    // For "Operations Center" visibility, we put them in pastSessions.
                    pastSessions.push(sess);
                } else {
                    // Future sessions
                    if (!sess.tutor_id) {
                        unassignedSessions.push(sess);
                    } else {
                        scheduledSessions.push(sess);
                    }
                }
            }


            // Return expanded data structure for Admin Ops
            sessions = allSessions; // Keep legacy flat list for compatibility if needed

            // Format nested lists
            const formatSess = (list: any[]) => list.map((session) => {
                const studentProfile = session.student_profiles;
                const tutorProfile = session.tutor_profiles;
                return {
                    id: session.id,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    status: session.status || 'SCHEDULED',
                    livekit_room_id: session.livekit_room_id,
                    meeting_link: session.meeting_link,
                    student: studentProfile ? { id: studentProfile.id, name: studentProfile.users?.full_name, email: studentProfile.users?.email } : null,
                    tutor: tutorProfile ? { id: tutorProfile.id, name: tutorProfile.users?.full_name } : null,
                }
            });

            return {
                credits: 0,
                sessions: formatSess(sessions), // Legacy support
                // New Ops Fields
                students: students.map(s => ({
                    id: s.id,
                    name: s.users?.full_name,
                    email: s.users?.email,
                    credits: s.credits
                })),
                unassignedSessions: formatSess(unassignedSessions),
                scheduledSessions: formatSess(scheduledSessions),
                pastSessions: formatSess(pastSessions).reverse() // Show most recent past first
            } as any; // Cast to any to bypass strict type for now until type def is updated

        } else {
            console.warn(`[DashboardService] Role mismatch or unauthorized access. Request Role: ${role}, User Role: ${user.role}`);
        }

        console.log(`[DashboardService] Found ${sessions.length} sessions.`);

        // Format Sessions (Shared Legacy Logic for Learner/Tutor)
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

        // Fetch AI Sessions for Learner
        let formattedAiSessions: any[] = [];
        if (role === 'LEARNER') {
            const aiSessions = await prisma.ai_chat_sessions.findMany({
                where: { user_id: user.id },
                orderBy: { started_at: 'desc' },
                take: 10,
                select: {
                    id: true,
                    started_at: true,
                    feedback_summary: true
                }
            });

            formattedAiSessions = aiSessions.map(s => ({
                id: s.id,
                date: s.started_at,
                report: s.feedback_summary ? JSON.parse(s.feedback_summary) : null
            }));
        }

        return { credits, sessions: formattedSessions, aiSessions: formattedAiSessions };

    } catch (error) {
        console.error("[DashboardService] Critical Error:", error);
        throw error;
    }
}
