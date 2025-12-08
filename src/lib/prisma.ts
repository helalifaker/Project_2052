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

const isDevelopment = process.env.NODE_ENV !== "production";

const pool = new Pool({
  connectionString: connectionStringForPool,
  // Supabase uses self-signed certs; other providers validate certs by default
  ssl: isSupabase
    ? { rejectUnauthorized: false }
    : requiresSSL
      ? true
      : undefined,
  // Pool configuration optimized for reliability
  // Development uses larger pool to handle hot reloading and concurrent requests
  max: isDevelopment ? 20 : 10,
  // Longer idle timeout prevents stale connection issues after brief inactivity
  idleTimeoutMillis: isDevelopment ? 60000 : 30000,
  // Longer connection timeout prevents premature failures under load
  connectionTimeoutMillis: isDevelopment ? 15000 : 10000,
});

// IMPORTANT: Handle connection pool errors to prevent silent failures
// This catches errors on idle clients which can indicate connection issues
pool.on("error", (err) => {
  console.error("[Prisma Pool] Unexpected error on idle client:", err.message);
  // Log the full error in development for debugging
  if (isDevelopment) {
    console.error("[Prisma Pool] Full error:", err);
  }
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Log configuration:
    // - Production: errors only
    // - Development: errors and warnings (not queries - reduces I/O overhead)
    // - Set DEBUG_PRISMA=true for full query logging when needed
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : process.env.DEBUG_PRISMA === "true"
          ? ["query", "error", "warn"]
          : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
