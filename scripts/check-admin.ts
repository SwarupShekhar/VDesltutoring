
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });


import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkAdmin() {
    try {
        const admins = await prisma.users.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, clerkId: true, role: true, full_name: true }
        });

        console.log('👑 Admins found:', admins);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
