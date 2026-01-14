import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface BlockerAggregation {
    category: string;
    frequency: number;
    detectedWords: string[];
    upgrades: string[];
    explanation: string;
    targetLevel: string;
    currentLimit: string;
    lastDetected: Date;
}

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the requesting user is a tutor
        const tutor = await prisma.users.findUnique({
            where: { clerkId },
            include: { tutor_profiles: true }
        });

        if (!tutor || !tutor.tutor_profiles) {
            return NextResponse.json(
                { error: "Only tutors can access this endpoint" },
                { status: 403 }
            );
        }

        const studentId = params.userId;

        // Get student's current CEFR level (from most recent session)
        const student = await prisma.users.findUnique({
            where: { id: studentId },
            include: {
                student_profiles: true,
                live_session_summaries: {
                    orderBy: { created_at: "desc" },
                    take: 1
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Get micro-fixes from last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const microFixes = await prisma.live_micro_fixes.findMany({
            where: {
                user_id: studentId,
                created_at: {
                    gte: fourteenDaysAgo
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });

        // Aggregate by category
        const blockerMap = new Map<string, BlockerAggregation>();

        for (const fix of microFixes) {
            const key = `${fix.category}-${fix.target_level}`;

            // Type guard for JSON arrays
            const detectedWords = Array.isArray(fix.detected_words)
                ? (fix.detected_words as string[])
                : [];
            const upgrades = Array.isArray(fix.upgrades)
                ? (fix.upgrades as string[])
                : [];

            if (blockerMap.has(key)) {
                const existing = blockerMap.get(key)!;
                existing.frequency++;

                // Merge detected words (unique)
                const detectedSet = new Set([
                    ...existing.detectedWords,
                    ...detectedWords
                ]);
                existing.detectedWords = Array.from(detectedSet);

                // Update last detected
                if (fix.created_at > existing.lastDetected) {
                    existing.lastDetected = fix.created_at;
                }
            } else {
                blockerMap.set(key, {
                    category: fix.category,
                    frequency: 1,
                    detectedWords,
                    upgrades,
                    explanation: fix.explanation,
                    targetLevel: fix.target_level,
                    currentLimit: fix.current_limit,
                    lastDetected: fix.created_at
                });
            }
        }

        // Convert to array and sort by frequency
        const blockers = Array.from(blockerMap.values())
            .sort((a, b) => b.frequency - a.frequency);

        // Get top 2 blockers for session prep
        const topBlockers = blockers.slice(0, 2);

        return NextResponse.json({
            student: {
                id: student.id,
                name: student.full_name,
                currentLevel: "B1", // TODO: Get from actual CEFR profile when available
                targetLevel: topBlockers[0]?.targetLevel || "B2"
            },
            blockers,
            topBlockers,
            summary: {
                totalBlockers: blockers.length,
                totalDetections: blockers.reduce((sum, b) => sum + b.frequency, 0),
                mostFrequent: blockers[0]?.category || null,
                periodDays: 14
            }
        });
    } catch (error) {
        console.error("Error fetching CEFR blockers:", error);
        return NextResponse.json(
            { error: "Failed to fetch CEFR blockers" },
            { status: 500 }
        );
    }
}
