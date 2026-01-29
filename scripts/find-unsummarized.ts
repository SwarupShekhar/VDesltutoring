
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Searching for ended sessions without summaries...");
    const sessions = await prisma.live_sessions.findMany({
        where: {
            status: 'ended',
            summaries: { none: {} }
        },
        include: {
            metrics: true,
            _count: {
                select: { transcripts: true }
            }
        }
    });

    console.log(`Found ${sessions.length} sessions.`);

    for (const s of sessions) {
        console.log("--------------------------------------------------");
        console.log(`ID: ${s.id}`);
        console.log(`Room: ${s.room_name}`);
        console.log(`Ended: ${s.ended_at}`);
        console.log(`Transcript Count: ${s._count.transcripts}`);
        console.log(`Metrics Count: ${s.metrics.length}`);

        // Auto-delete to save time
        if (s._count.transcripts === 0 && s.metrics.length === 0) {
            console.log(`DELETING empty session ${s.id}...`);
            await prisma.live_sessions.delete({ where: { id: s.id } });
            console.log("Deleted.");
        } else {
            console.log(`Session ${s.id} has data. Keeping for inspection.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
