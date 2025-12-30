import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
    var prisma: PrismaClient | undefined;
}

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
    global.prisma ??
    new PrismaClient({
        adapter,
        log: ["query", "error", "warn"],
    });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

export async function checkDbConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Prisma connected to database");
    } catch (error) {
        console.error("❌ Prisma failed to connect to database", error);
    }
}