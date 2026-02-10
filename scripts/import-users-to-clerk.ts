
import { createClerkClient } from '@clerk/backend';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Load environment variables
dotenv.config({ path: '.env' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const CSV_PATH = '/Users/swarupshekhar/ESL_T/ins_36yToBhXDxcCaRweeTuUNYz5LTe.csv';

async function importUsers() {
    console.log('🚀 Starting User Import to Clerk Production...');

    try {
        const fileContent = fs.readFileSync(CSV_PATH, { encoding: 'utf-8' });
        interface ClerkCsvRecord {
            primary_email_address: string;
            first_name: string;
            last_name: string;
            id: string;
            [key: string]: any;
        }

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        }) as ClerkCsvRecord[];

        console.log(`📋 Found ${records.length} users in CSV.`);

        let successCount = 0;
        let failCount = 0;

        for (const record of records) {
            const email = record['primary_email_address'];
            const firstName = record['first_name'];
            const lastName = record['last_name'];
            const userId = record['id']; // Old ID reference

            if (!email) {
                console.warn(`⚠️  Skipping row with missing email: ${JSON.stringify(record)}`);
                continue;
            }

            try {
                // Check if user already exists
                const existingUsers = await clerk.users.getUserList({ emailAddress: [email] });
                if (existingUsers.data.length > 0) {
                    console.log(`ℹ️  [SKIP] User ${email} already exists.`);
                    continue;
                }

                // Create user
                const newUser = await clerk.users.createUser({
                    emailAddress: [email],
                    firstName: firstName,
                    lastName: lastName,
                    skipPasswordChecks: true,
                    skipPasswordRequirement: true,
                });

                console.log(`✅ [CREATED] ${email} -> ${newUser.id}`);
                successCount++;

                // Rate limiting precaution
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (err: any) {
                console.error(`❌ [FAIL] Could not create ${email}:`, err.errors?.[0]?.message || err.message);
                failCount++;
            }
        }

        console.log(`\n🎉 Import Complete! Created: ${successCount}, Failed: ${failCount}`);

    } catch (error) {
        console.error('❌ specific error:', error);
    }
}

importUsers();
