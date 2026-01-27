
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkSessionUsers() {
    const ids = [
        'cdb73b53-8eb7-4182-9218-7f372436555d',
        '2743f6b8-1843-496a-83be-3623dc6dbdc7'
    ];

    const users = await prisma.users.findMany({
        where: { id: { in: ids } }
    });

    console.log("--- Participants of Today's Session ---");
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Name: ${u.full_name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Last Login: ${u.last_login}`);
        console.log("-----------------------------------");
    });
}

checkSessionUsers()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
