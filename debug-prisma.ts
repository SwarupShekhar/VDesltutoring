
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log("Prisma keys:", Object.keys(prisma));

// Also try to verify if the property exists via 'in'
const key = 'user_fluency_profile';
if (key in prisma) {
    console.log(`Key '${key}' EXISTS`);
} else {
    console.log(`Key '${key}' DOES NOT EXIST`);
}

// Check for camelCase
const key2 = 'userFluencyProfile';
if (key2 in prisma) {
    console.log(`Key '${key2}' EXISTS`);
}

// Check properties via dmmf
const dmmf = (prisma as any)._dmmf;
if (dmmf && dmmf.datamodel) {
    console.log("Models:", dmmf.datamodel.models.map((m: any) => m.name));
}
