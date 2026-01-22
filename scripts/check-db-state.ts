
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("--- Users ---");
    const users = await prisma.users.findMany();
    for (const u of users) {
        console.log(`User: ${u.full_name} | ID: ${u.id} | ClerkID: ${u.clerkId}`);
    }

    console.log("\n--- Fluency Profiles ---");
    const profiles = await (prisma as any).user_fluency_profile.findMany();
    console.log(`Found ${profiles.length} profiles.`);
    for (const p of profiles) {
        console.log(`Profile UserID: ${p.user_id} | Level: ${p.cefr_level} | Score: ${p.fluency_score}`);
    }

    console.log("\n--- Matching ---");
    for (const u of users) {
        const p = profiles.find((prof: any) => prof.user_id === u.id);
        if (p) {
            console.log(`[MATCH] User ${u.full_name} has profile!`);
        } else {
            console.log(`[MISSING] User ${u.full_name} (${u.id}) has NO profile.`);
            // internal check: is there a profile with the CLERK ID?
            const pClerk = profiles.find((prof: any) => prof.user_id === u.clerkId);
            if (pClerk) {
                console.log(`   -> CRITICAL: Found profile using CLERK ID (${u.clerkId}) instead of UUID!`);
            }
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
