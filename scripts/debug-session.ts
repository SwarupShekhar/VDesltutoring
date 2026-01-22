import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const sessionId = "539d001f-e8d8-4ec8-a097-7ef830bb26b1";

    console.log(`Analyzing database for session ${sessionId}...`);

    const metrics = await prisma.live_metrics.findMany({
        where: { session_id: sessionId }
    });
    console.log(`Metrics found: ${metrics.length}`);
    console.log(metrics);

    const transcripts = await prisma.live_transcripts.findMany({
        where: { session_id: sessionId },
        take: 10
    });
    console.log(`Transcripts found (showing 10): ${transcripts.length}`);
    console.log(transcripts.map(t => t.text));

    const summary = await prisma.live_session_summary.findMany({
        where: { session_id: sessionId }
    });
    console.log(`Summaries found: ${summary.length}`);
    console.log(summary);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
