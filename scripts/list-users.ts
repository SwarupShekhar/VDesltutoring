
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Listing users...");
    const users = await prisma.users.findMany();
    console.table(users.map(u => ({ id: u.id, email: u.email, clerkId: u.clerkId })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
