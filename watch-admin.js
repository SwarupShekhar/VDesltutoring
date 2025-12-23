
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EMAIL = 'swarupshekhar.vaidikedu@gmail.com';

async function main() {
    console.log(`Waiting for user ${EMAIL} to sign up...`);

    while (true) {
        const user = await prisma.users.findUnique({ where: { email: EMAIL } });

        if (user) {
            console.log('User found! Promoting to ADMIN...');
            await prisma.users.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
            console.log('SUCCESS: User is now ADMIN.');
            break;
        }

        // Wait 2 seconds before retry
        await new Promise(r => setTimeout(r, 2000));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
