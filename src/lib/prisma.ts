import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
    _primsa: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma._primsa ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma._primsa = prisma;