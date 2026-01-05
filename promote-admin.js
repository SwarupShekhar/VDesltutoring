
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'swarupshekhar.vaidikedu@gmail.com';
    const updatedUser = await prisma.users.update({
        where: { email },
        data: { role: 'ADMIN' },
    });
    console.log('Updated User to ADMIN:', updatedUser);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
