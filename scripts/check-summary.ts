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

    console.log(`Checking for Live Session Summary...`);
    console.log(`Session: ${sessionId}`);
    console.log(`User: ${userId}`);

    const summary = await prisma.live_session_summary.findUnique({
        where: {
            session_id_user_id: {
                session_id: sessionId,
                user_id: userId
            }
        }
    });

    if (summary) {
        console.log("✅ Summary FOUND!");
        console.log(summary);
    } else {
        console.log("❌ Summary NOT found.");
        // Check if session exists at least
        const session = await prisma.live_sessions.findUnique({ where: { id: sessionId } });
        console.log("Session exists?", !!session);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
