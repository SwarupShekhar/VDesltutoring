
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Cleaning up zombie sessions...");

    // 1. Delete empty 'ended' sessions that have no metrics/transcripts/summaries
    // This cleans up the noise "Found 1 ended sessions without summaries"
    const result = await prisma.live_sessions.deleteMany({
        where: {
            status: 'ended',
            summaries: { none: {} }, // No summary
            metrics: { none: {} },   // No metrics recorded
            transcripts: { none: {} } // No transcripts
        }
    });

    console.log(`Deleted ${result.count} empty/zombie sessions.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
