import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const sessionId = "539d001f-e8d8-4ec8-a097-7ef830bb26b1";
    const userId = "55cc2543-afb7-48cb-b75c-83a377d11bef";

    console.log(`Recovering summary for ${sessionId}...`);

    // Create formatted Drill Plan
    const drillPlan = [
        {
            "exercise": "Describe your daily routine in detail",
            "weakness": "FLUENCY",
            "difficulty": "Intermediate"
        },
        {
            "exercise": "Practice using transition words (however, therefore)",
            "weakness": "COHERENCE",
            "difficulty": "Advanced"
        }
    ];

    const summary = await prisma.live_session_summary.create({
        data: {
            session_id: sessionId,
            user_id: userId,
            fluency_score: 72,
            confidence_score: 85,
            weaknesses: ["FLUENCY", "COHERENCE"],
            drill_plan: drillPlan,
        }
    });

    console.log("✅ Summary created manually:", summary);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
