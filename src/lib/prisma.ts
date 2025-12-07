import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// Only disable certificate verification for Supabase, which uses self-signed certs
const isSupabase = connectionString?.includes("supabase.co");
const requiresSSL = connectionString?.includes("sslmode=require");

// Strip sslmode for Supabase so we can supply a custom SSL config; leave other providers untouched
const connectionStringForPool = isSupabase
  ? connectionString?.replace(/[?&]sslmode=require/g, "")
  : connectionString;

const pool = new Pool({
  connectionString: connectionStringForPool,
  // Supabase uses self-signed certs; other providers validate certs by default
  ssl: isSupabase
    ? { rejectUnauthorized: false }
    : requiresSSL
      ? true
      : undefined,
  // Additional connection options for better reliability
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Only log errors in production to reduce overhead
    // In development, log queries for debugging
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
