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
    type: "LIVE_PRACTICE" | "BOOK_COACH" | "ATTEMPT_TRIAL";
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

        // Get user with ALL session summaries and their metrics
        const user = await prisma.users.findUnique({
            where: { clerkId },
            include: {
                student_profiles: true,
                user_fluency_profile: true,
                live_session_summaries: {
                    include: {
                        session: {
                            include: {
                                metrics: true,
                                _count: {
                                    select: { transcripts: true }
                                }
                            }
                        }
                    },
                    orderBy: { created_at: "desc" }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has been assessed
        const fluencyProfile = (user as any).user_fluency_profile;
        const hasBeenAssessed = !!fluencyProfile;

        if (!hasBeenAssessed) {
            // Return unassessed state
            return NextResponse.json({
                assessed: false,
                message: "Take your first assessment to see your path"
            });
        }

        // Get assessment data (The single source of truth)
        const effectiveScore = fluencyProfile.fluency_score;
        const cefrFromProfile = fluencyProfile.cefr_level as CEFRLevel;

        let currentLevel: CEFRLevel = "A1";
        let minScore = 0;
        let maxScore = 20;

        // If CEFR is explicitly set in profile, use it as the base
        if (cefrFromProfile) {
            currentLevel = cefrFromProfile;
            // Set bounds for progress calculation within this level
            if (currentLevel === "C2") { minScore = 95; maxScore = 100; }
            else if (currentLevel === "C1") { minScore = 80; maxScore = 95; }
            else if (currentLevel === "B2") { minScore = 60; maxScore = 80; }
            else if (currentLevel === "B1") { minScore = 40; maxScore = 60; }
            else if (currentLevel === "A2") { minScore = 20; maxScore = 40; }
            else { minScore = 0; maxScore = 20; }
        } else {
            // Derived from score
            if (effectiveScore >= 95) { currentLevel = "C2"; minScore = 95; maxScore = 100; }
            else if (effectiveScore >= 80) { currentLevel = "C1"; minScore = 80; maxScore = 95; }
            else if (effectiveScore >= 60) { currentLevel = "B2"; minScore = 60; maxScore = 80; }
            else if (effectiveScore >= 40) { currentLevel = "B1"; minScore = 40; maxScore = 60; }
            else if (effectiveScore >= 20) { currentLevel = "A2"; minScore = 20; maxScore = 40; }
            else { currentLevel = "A1"; minScore = 0; maxScore = 20; }
        }

        const targetLevel = nextCEFR(currentLevel);

        if (!targetLevel) {
            // Already at max level
            return NextResponse.json({
                currentLevel,
                targetLevel: currentLevel,
                persona: getCEFRPersona(currentLevel),
                progress: 1.0,
                gates: { thinking: 1.0, expression: 1.0, fluency: 1.0 },
                blockers: [],
                nextActions: [
                    { type: "LIVE_PRACTICE", label: "Practice Live", recommended: true }
                ]
            });
        }

        // Get data from last 14 days for blockers & gates
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Fetch micro-fixes (lexical blockers)
        const microFixes = await prisma.live_micro_fixes.findMany({
            where: {
                user_id: user.id,
                created_at: { gte: fourteenDaysAgo }
            }
        });

        // Fetch recent session summaries
        const sessionSummaries = await prisma.live_session_summary.findMany({
            where: {
                user_id: user.id,
                created_at: { gte: fourteenDaysAgo }
            },
            orderBy: { created_at: "desc" },
            take: 5
        });

        // Calculate gates relative to current level's range
        const gates = calculateGates(microFixes, sessionSummaries, minScore, maxScore);

        // Calculate overall progress as weighted average of gates
        // Weighting: 40% Thinking, 40% Expression, 20% Fluency
        let progress = (gates.thinking * 0.4) + (gates.expression * 0.4) + (gates.fluency * 0.2);

        // Aggregate blockers
        const blockers = aggregateBlockers(microFixes);

        // Determine next actions
        const nextActions = determineNextActions(gates, progress, blockers.length, targetLevel);

        return NextResponse.json({
            currentLevel,
            targetLevel,
            persona: getCEFRPersona(currentLevel),
            progress: Math.round(progress * 100) / 100, // Round to 2 decimals
            gates: {
                thinking: Math.round(gates.thinking * 100) / 100,
                expression: Math.round(gates.expression * 100) / 100,
                fluency: Math.round(gates.fluency * 100) / 100
            },
            blockers,
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

function calculateGates(
    microFixes: any[],
    sessionSummaries: any[],
    minScore: number,
    maxScore: number
): CEFRGates {
    // If no recent sessions, we cannot assume progress beyond the baseline.
    if (sessionSummaries.length === 0) {
        return { thinking: 0, expression: 0, fluency: 0 };
    }

    // 1. Fluency Gate: Based on recent fluency scores relative to the current level range
    const avgFluency = sessionSummaries.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessionSummaries.length;
    // Calculate progress within the [minScore, maxScore] window
    const fluency = Math.min(1.0, Math.max(0, (avgFluency - minScore) / (maxScore - minScore)));

    // 2. Thinking Gate: Proxied by overall fluency/confidence consistency
    // If fluency is high but confidence varies, thinking might be the bottleneck.
    const avgConfidence = sessionSummaries.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / sessionSummaries.length;
    let thinking = (fluency * 0.7) + (Math.min(1.0, avgConfidence / maxScore) * 0.3);

    // 3. Expression Gate: Penalty based for lexical blockers detected
    const uniqueBlockers = new Set(microFixes.map(f => f.category));
    const blockerCount = uniqueBlockers.size;

    // Start with the baseline fluency and subtract for specific blockers
    let expression = Math.max(0, fluency - (blockerCount * 0.1));

    // If we have sessions but NO blockers, at least match current fluency level
    if (blockerCount === 0) expression = Math.max(expression, fluency);

    return {
        thinking: Math.min(1.0, Math.max(0, thinking)),
        expression: Math.min(1.0, Math.max(0, expression)),
        fluency
    };
}

function aggregateBlockers(microFixes: any[]): Blocker[] {
    // Group by category and count frequency
    const categoryMap = new Map<string, {
        count: number;
        detectedWords: Set<string>;
        upgrades: Set<string>;
        explanation: string;
    }>();

    for (const fix of microFixes) {
        const category = fix.category;
        if (!categoryMap.has(category)) {
            categoryMap.set(category, {
                count: 0,
                detectedWords: new Set(),
                upgrades: new Set(),
                explanation: fix.explanation
            });
        }

        const entry = categoryMap.get(category)!;
        entry.count++;

        // Add detected words
        if (Array.isArray(fix.detected_words)) {
            (fix.detected_words as string[]).forEach(w => entry.detectedWords.add(w));
        }

        // Add upgrades
        if (Array.isArray(fix.upgrades)) {
            (fix.upgrades as string[]).forEach(w => entry.upgrades.add(w));
        }
    }

    // Convert to array and sort by frequency
    const blockers: Blocker[] = Array.from(categoryMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 2) // Top 2
        .map(([type, data]) => ({
            type,
            overused: Array.from(data.detectedWords).slice(0, 5),
            needed: Array.from(data.upgrades).slice(0, 5),
            reason: data.explanation
        }));

    return blockers;
}

function determineNextActions(
    gates: CEFRGates,
    progress: number,
    blockerCount: number,
    targetLevel: CEFRLevel
): NextAction[] {
    const actions: NextAction[] = [];

    // Live Practice - recommended if expression is low
    actions.push({
        type: "LIVE_PRACTICE",
        label: "Practice Live",
        recommended: gates.expression < 0.5
    });

    // Book Coach - recommended if there are blockers
    actions.push({
        type: "BOOK_COACH",
        label: "Book a Coach",
        recommended: blockerCount > 0
    });

    // Attempt Trial - unlocked if progress > 80%
    actions.push({
        type: "ATTEMPT_TRIAL",
        label: `Attempt ${targetLevel} Trial`,
        locked: progress <= 0.8,
        recommended: progress > 0.8
    });

    return actions;
}
