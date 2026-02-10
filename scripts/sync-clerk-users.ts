
import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });



import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });


async function syncUsers() {
    console.log('🔄 Starting User Synchronization...');

    try {
        // 1. Fetch all users from Clerk Production
        // Note: limit is 500 max per request. If you have more, we need pagination.
        const clerkUserList = await clerk.users.getUserList({ limit: 500 });
        console.log(`✅ Fetched ${clerkUserList.data.length} users from Clerk.`);

        for (const clerkUser of clerkUserList.data) {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const newClerkId = clerkUser.id;

            if (!email) {
                console.warn(`⚠️  Skipping Clerk user ${newClerkId} (No email found)`);
                continue;
            }

            // 2. Find user in Neon DB by email
            const dbUser = await prisma.users.findUnique({
                where: { email: email },
            });

            if (dbUser) {
                if (dbUser.clerkId === newClerkId) {
                    console.log(`✅ [SKIP] ${email} already synced.`);
                } else {
                    // 3. Update Clerk ID in DB
                    console.log(`🔄 [UPDATE] Syncing ${email}: ${dbUser.clerkId} -> ${newClerkId}`);

                    await prisma.users.update({
                        where: { email: email },
                        data: { clerkId: newClerkId },
                    });
                }
            } else {
                console.log(`ℹ️  [MISSING] ${email} exists in Clerk but not in DB.`);
            }
        }

        console.log('🎉 Synchronization Complete!');
    } catch (error) {
        console.error('❌ Error syncing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncUsers();
