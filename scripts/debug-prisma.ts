import 'dotenv/config';
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("--- Debugging Users Table Columns ---")
    try {
        // 1. Inspect Columns using raw SQL
        const columns = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'user_fluency_profile', 'student_profiles', 'tutor_profiles')
      ORDER BY table_name, column_name;
    `
        console.log("DB Columns:", JSON.stringify(columns, null, 2));

        // 2. Try findFirst using Prisma
        console.log("\n--- Trying findFirst ---")
        const user = await prisma.users.findFirst()
        console.log("findFirst result:", user)

        if (user && user.clerkId) {
            console.log("\n--- Trying findUnique by clerkId + Includes ---")
            const byId = await prisma.users.findUnique({
                where: { clerkId: user.clerkId },
                include: {
                    student_profiles: true,
                    tutor_profiles: true,
                    user_fluency_profile: true
                }
            })
            console.log("findUnique result:", byId ? "Found with Relations" : "Not Found")
        }

    } catch (e) {
        console.error("DEBUG SCRIPT ERROR:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
