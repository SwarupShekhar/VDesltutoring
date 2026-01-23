
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function fixDbTypes() {
    console.log("🛠️ Attempting to manually cast user_id to UUID...");

    try {
        // 1. Cast the column
        // We use executeRawUnsafe because we are running DDL
        const count = await prisma.$executeRawUnsafe(`
            ALTER TABLE "user_fluency_profile" 
            ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;
        `);

        console.log(`✅ Success: Column type altered. (Result: ${count})`);

        // 2. Also ensure the foreign key constraint exists if we can? 
        // Actually, db push will add the constraint. We just needed the type to match.

    } catch (error: any) {
        if (error.message.includes("invalid input syntax for type uuid")) {
            console.error("❌ Failed: The table contains IDs that are not valid UUIDs. We cannot safely cast.");
            console.error("You may need to truncate the table or fix invalid IDs manually.");
        } else {
            console.error("❌ SQL Error:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

fixDbTypes();
