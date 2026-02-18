import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create a singleton PrismaClient instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
    // Prisma 7.x requires a driver adapter
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // Use type assertion for the new Prisma 7.x API
    const client = new (PrismaClient as unknown as new (options: { adapter: PrismaPg }) => PrismaClient)({
        adapter,
    });

    return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
