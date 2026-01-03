export type MissionType =
    | "FLOW"
    | "CONFIDENCE"
    | "ENDURANCE"
    | "CALM"
    | "STORY"
    | "FLUENCY"; // NEW: Data-driven fluency missions

export interface DailyMission {
    id: string;
    type: MissionType;
    title: string;
    description: string;
    goal: MissionGoal;
}

export type MissionGoal =
    | { flow: number }
    | { stars: number }
    | { turns: number }
    | { maxFillers: number; turns: number }
    | { minWords: number }
    | { cumulativeFluency: number }; // NEW: Requires total fluency score >= value

export interface MissionProgress {
    flow: number;
    stars: number;
    turns: number;
    fillers: number;
    words: number;
    cumulativeFluency: number; // NEW: Tracks cumulative fluency score
}

const MISSIONS: DailyMission[] = [
    {
        id: "flow",
        type: "FLOW",
        title: "Flow Builder",
        description: "Speak smoothly without long pauses.",
        goal: { flow: 70 }
    },
    {
        id: "confidence",
        type: "CONFIDENCE",
        title: "Confident Voice",
        description: "Earn stars by speaking boldly.",
        goal: { stars: 10 }
    },
    {
        id: "endurance",
        type: "ENDURANCE",
        title: "Speaking Streak",
        description: "Speak multiple times without stopping.",
        goal: { turns: 6 }
    },
    {
        id: "calm",
        type: "CALM",
        title: "Calm Speaker",
        description: "Speak clearly with fewer fillers.",
        goal: { maxFillers: 2, turns: 5 }
    },
    {
        id: "story",
        type: "STORY",
        title: "Story Mode",
        description: "Speak in full, connected thoughts.",
        goal: { minWords: 60 }
    },
    {
        id: "fluency",
        type: "FLUENCY",
        title: "Fluency Challenge",
        description: "Maintain high fluency across multiple turns.",
        goal: { cumulativeFluency: 3.5 } // Requires ~6 turns at 0.6 avg or ~7 at 0.5
    }
];

// Rotate missions by day so everyone gets a different one
export function getTodayMission(): DailyMission {
    const index = new Date().getDate() % MISSIONS.length;
    return MISSIONS[index];
}

// Core evaluator — used by Practice page
export function evaluateMission(
    mission: DailyMission,
    progress: MissionProgress
): boolean {
    const goal = mission.goal;

    if ("flow" in goal) {
        return progress.flow >= goal.flow;
    }

    if ("stars" in goal) {
        return progress.stars >= goal.stars;
    }

    if ("maxFillers" in goal) {
        // We know it has both, but TS needs help even with the check order sometimes
        // Actually, just checking maxFillers first is enough to distinguish it from the pure { turns } type if we used discriminated unions properly.
        // But since types overlap on 'turns', we must handle the more specific one (maxFillers + turns) first.
        const g = goal as { maxFillers: number; turns: number };
        return (
            progress.fillers <= g.maxFillers &&
            progress.turns >= g.turns
        );
    }

    if ("turns" in goal) {
        return progress.turns >= goal.turns;
    }

    if ("minWords" in goal) {
        const g = goal as unknown as { minWords: number };
        return progress.words >= g.minWords;
    }

    // NEW: Cumulative fluency score evaluation
    if ("cumulativeFluency" in goal) {
        return progress.cumulativeFluency >= goal.cumulativeFluency;
    }

    return false;
}