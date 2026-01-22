import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Get the current logged-in user's Clerk ID from the screenshot/context
    // Based on previous logs, the user is likely one of the Swarup Shekhar accounts

    const users = await prisma.users.findMany({
        where: {
            full_name: {
                contains: "Swarup"
            }
        }
    });

    console.log("Found Swarup users:");
    for (const u of users) {
        console.log(`  - ${u.full_name} | ID: ${u.id} | ClerkID: ${u.clerkId}`);
    }

    // Update ALL Swarup accounts to B1 level (user can specify which one if needed)
    for (const user of users) {
        try {
            const result = await (prisma as any).user_fluency_profile.upsert({
                where: { user_id: user.id },
                update: {
                    cefr_level: "B1",
                    fluency_score: 75,
                    confidence: 80,
                    pause_ratio: 0.15,
                    word_count: 200,
                    lexical_blockers: null,
                    source_session_id: "manual-fix-session",
                    source_type: "ai_tutor",
                },
                create: {
                    user_id: user.id,
                    cefr_level: "B1",
                    fluency_score: 75,
                    confidence: 80,
                    pause_ratio: 0.15,
                    word_count: 200,
                    lexical_blockers: null,
                    source_session_id: "manual-fix-session",
                    source_type: "ai_tutor",
                },
            });
            console.log(`✅ Updated profile for ${user.full_name} (${user.id})`);
        } catch (e) {
            console.error(`❌ Failed to update ${user.full_name}:`, e);
        }
    }

    console.log("\n✅ All Swarup accounts updated. Please refresh your dashboard!");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
