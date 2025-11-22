import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Default SystemConfig
  const config = await prisma.systemConfig.create({
    data: {
      zakatRate: new Prisma.Decimal(0.025),
      debtInterestRate: new Prisma.Decimal(0.05),
      depositInterestRate: new Prisma.Decimal(0.02),
      minCashBalance: new Prisma.Decimal(1000000),
    },
  });
  console.log("✓ Created SystemConfig:", config.id);

  // Test Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@projectzeta.com" },
    update: {},
    create: {
      email: "admin@projectzeta.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("✓ Created Admin User:", admin.email);

  console.log("\n✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
