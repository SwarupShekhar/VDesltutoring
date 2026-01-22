import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking for ANY recent transcripts...");
    const recentTranscripts = await prisma.live_transcripts.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5
    });
    console.log(`Found ${recentTranscripts.length} recent transcripts.`);
    console.log(recentTranscripts);

    console.log("\nChecking for ANY recent metrics...");
    const recentMetrics = await prisma.live_metrics.findMany({
        orderBy: { updated_at: 'desc' },
        take: 5
    });
    console.log(`Found ${recentMetrics.length} recent metrics.`);
    console.log(recentMetrics);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
