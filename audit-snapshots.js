
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const learners = await prisma.users.findMany({
        where: { role: 'LEARNER' },
        include: {
            fluency_snapshots: {
                orderBy: { created_at: 'desc' }
            }
        }
    });

    console.log('Total Learners:', learners.length);
    learners.forEach(l => {
        console.log(`User: ${l.email} (${l.id})`);
        console.log(`  Snapshots: ${l.fluency_snapshots.length}`);
        l.fluency_snapshots.forEach(s => {
            console.log(`    - ${s.created_at.toISOString()}: WPM=${s.wpm}, Pron=${s.pronunciation}`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
