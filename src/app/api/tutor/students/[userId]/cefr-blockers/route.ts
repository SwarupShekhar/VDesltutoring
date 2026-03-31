import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

        const student = await prisma.users.findUnique({
            where: { id: studentId },
            include: { student_profiles: true }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({
            student: {
                id: student.id,
                name: student.full_name,
                currentLevel: "B1",
                targetLevel: "B2"
            },
            blockers: [],
            topBlockers: [],
            summary: {
                totalBlockers: 0,
                totalDetections: 0,
                mostFrequent: null,
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
