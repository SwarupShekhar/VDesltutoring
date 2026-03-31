import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { nextCEFR, getCEFRPersona, getCEFRGoal } from "@/lib/cefr-helpers";
import type { CEFRLevel } from "@/lib/cefr-lexical-triggers";

interface CEFRGates {
    thinking: number;
    expression: number;
    fluency: number;
}

interface Blocker {
    type: string;
    overused: string[];
    needed: string[];
    reason: string;
}

interface NextAction {
    type: "BOOK_COACH" | "ATTEMPT_TRIAL" | "AI_TUTOR";
    label: string;
    recommended?: boolean;
    locked?: boolean;
}

export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { clerkId },
            include: {
                student_profiles: true,
                user_fluency_profile: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const fluencyProfile = (user as any).user_fluency_profile;
        const hasBeenAssessed = !!fluencyProfile;

        if (!hasBeenAssessed) {
            return NextResponse.json({
                assessed: false,
                message: "Take your first assessment to see your path"
            });
        }

        const effectiveScore = fluencyProfile.fluency_score;
        const cefrFromProfile = fluencyProfile.cefr_level as CEFRLevel;

        let currentLevel: CEFRLevel = "A1";
        let minScore = 0;
        let maxScore = 20;

        if (cefrFromProfile) {
            currentLevel = cefrFromProfile;
            if (currentLevel === "C2") { minScore = 95; maxScore = 100; }
            else if (currentLevel === "C1") { minScore = 80; maxScore = 95; }
            else if (currentLevel === "B2") { minScore = 60; maxScore = 80; }
            else if (currentLevel === "B1") { minScore = 40; maxScore = 60; }
            else if (currentLevel === "A2") { minScore = 20; maxScore = 40; }
            else { minScore = 0; maxScore = 20; }
        } else {
            if (effectiveScore >= 95) { currentLevel = "C2"; minScore = 95; maxScore = 100; }
            else if (effectiveScore >= 80) { currentLevel = "C1"; minScore = 80; maxScore = 95; }
            else if (effectiveScore >= 60) { currentLevel = "B2"; minScore = 60; maxScore = 80; }
            else if (effectiveScore >= 40) { currentLevel = "B1"; minScore = 40; maxScore = 60; }
            else if (effectiveScore >= 20) { currentLevel = "A2"; minScore = 20; maxScore = 40; }
            else { currentLevel = "A1"; minScore = 0; maxScore = 20; }
        }

        const targetLevel = nextCEFR(currentLevel);

        if (!targetLevel) {
            return NextResponse.json({
                currentLevel,
                targetLevel: currentLevel,
                persona: getCEFRPersona(currentLevel),
                progress: 1.0,
                gates: { thinking: 1.0, expression: 1.0, fluency: 1.0 },
                blockers: [],
                nextActions: [
                    { type: "AI_TUTOR", label: "Practice with AI Tutor", recommended: true }
                ]
            });
        }

        // Calculate progress based on fluency score position within current level range
        const fluency = Math.min(1.0, Math.max(0, (effectiveScore - minScore) / (maxScore - minScore)));
        const gates: CEFRGates = { thinking: fluency, expression: fluency, fluency };

        const progress = (gates.thinking * 0.4) + (gates.expression * 0.4) + (gates.fluency * 0.2);

        const nextActions: NextAction[] = [
            {
                type: "AI_TUTOR",
                label: "Practice with AI Tutor",
                recommended: true
            },
            {
                type: "BOOK_COACH",
                label: "Book a Coach",
                recommended: false
            },
            {
                type: "ATTEMPT_TRIAL",
                label: `Attempt ${targetLevel} Trial`,
                locked: progress <= 0.8,
                recommended: progress > 0.8
            }
        ];

        return NextResponse.json({
            currentLevel,
            targetLevel,
            persona: getCEFRPersona(currentLevel),
            progress: Math.round(progress * 100) / 100,
            gates: {
                thinking: Math.round(gates.thinking * 100) / 100,
                expression: Math.round(gates.expression * 100) / 100,
                fluency: Math.round(gates.fluency * 100) / 100
            },
            blockers: [],
            nextActions
        });
    } catch (error) {
        console.error("Error fetching CEFR path:", error);
        return NextResponse.json(
            { error: "Failed to fetch CEFR path" },
            { status: 500 }
        );
    }
}
