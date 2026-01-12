
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Simulating a peer joining the queue...");

    // 1. Find or create a Test Bot user
    let testUser = await prisma.users.findFirst({
        where: { email: 'test-bot@englivo.com' }
    });

    if (!testUser) {
        console.log("Creating Test Bot user...");
        testUser = await prisma.users.create({
            data: {
                email: 'test-bot@englivo.com',
                full_name: 'Practice Bot',
                clerkId: 'test_bot_123',
                role: 'LEARNER'
            }
        });
    }

    // 2. Add to queue
    // First remove if already there
    await prisma.live_queue.deleteMany({
        where: { user_id: testUser.id }
    });

    await prisma.live_queue.create({
        data: {
            user_id: testUser.id,
            goal: "Practice Speaking",
            fluency_score: 80
        }
    });

    console.log(`Test Peer '${testUser.full_name}' added to queue!`);
    console.log("Go back to your browser, you should match in a few seconds.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
