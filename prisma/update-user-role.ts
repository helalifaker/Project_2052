import { config } from "dotenv";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Load .env.local file
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ Error: DATABASE_URL environment variable is not set.");
  console.error("   Please ensure your .env.local file contains DATABASE_URL");
  process.exit(1);
}

// Only disable certificate verification for Supabase, which uses self-signed certs
const isSupabase = connectionString.includes("supabase.co");
const requiresSSL = connectionString.includes("sslmode=require");

// Strip sslmode for Supabase so we can supply a custom SSL config; leave other providers untouched
const connectionStringForPool = isSupabase
  ? connectionString.replace(/[?&]sslmode=require/g, "")
  : connectionString;

const pool = new Pool({
  connectionString: connectionStringForPool,
  // Supabase uses self-signed certs; other providers validate certs by default
  ssl: isSupabase
    ? { rejectUnauthorized: false }
    : requiresSSL
      ? true
      : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Script to update a user's role to ADMIN
 * 
 * Usage:
 *   npx tsx prisma/update-user-role.ts <email>
 *   npx tsx prisma/update-user-role.ts --list  (list all users)
 */

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("\n📋 Users in database:");
  console.log("=" .repeat(80));
  
  if (users.length === 0) {
    console.log("  No users found in database.");
    return;
  }

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
  });

  console.log("\n" + "=".repeat(80));
}

async function updateUserRole(email: string) {
  console.log(`\n🔧 Updating user role for: ${email}`);

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    console.error(`\n❌ Error: User with email "${email}" not found.`);
    console.log("\nUse --list to see all available users.");
    process.exit(1);
  }

  // Check if already admin
  if (user.role === Role.ADMIN) {
    console.log(`\n✅ User "${user.name}" (${user.email}) already has ADMIN role.`);
    return;
  }

  // Update role to ADMIN
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      role: Role.ADMIN,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`\n✅ Successfully updated user role to ADMIN!`);
  console.log(`   Name: ${updatedUser.name}`);
  console.log(`   Email: ${updatedUser.email}`);
  console.log(`   Role: ${updatedUser.role}`);
  console.log(`   ID: ${updatedUser.id}`);
}

async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
      console.log("\n📝 Update User Role Script");
      console.log("=".repeat(50));
      console.log("\nUsage:");
      console.log("  npx tsx prisma/update-user-role.ts <email>     Update user role to ADMIN");
      console.log("  npx tsx prisma/update-user-role.ts --list      List all users");
      console.log("\nExamples:");
      console.log("  npx tsx prisma/update-user-role.ts user@example.com");
      console.log("  npx tsx prisma/update-user-role.ts --list");
      process.exit(0);
    }

    if (args[0] === "--list" || args[0] === "-l") {
      await listUsers();
    } else {
      const email = args[0];
      await updateUserRole(email);
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

