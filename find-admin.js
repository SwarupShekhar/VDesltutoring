
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'swarupshekhar.vaidikedu@gmail.com';
    const user = await prisma.users.findUnique({
        where: { email },
    });
    console.log('Found User:', user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
