/**
 * Seed script for default CapEx Categories
 *
 * Creates the 4 standard CAPEX categories matching the CapExCategoryType enum.
 * Run with: npx tsx prisma/seed-capex-categories.ts
 */

import { PrismaClient, CapExCategoryType } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.DIRECT_URL,
    },
  },
});

const DEFAULT_CATEGORIES = [
  {
    type: CapExCategoryType.IT_EQUIPMENT,
    name: "IT Equipment",
    usefulLife: 5,
    reinvestFrequency: null,
    reinvestAmount: null,
  },
  {
    type: CapExCategoryType.FURNITURE,
    name: "Furniture",
    usefulLife: 10,
    reinvestFrequency: null,
    reinvestAmount: null,
  },
  {
    type: CapExCategoryType.EDUCATIONAL_EQUIPMENT,
    name: "Educational Equipment",
    usefulLife: 7,
    reinvestFrequency: null,
    reinvestAmount: null,
  },
  {
    type: CapExCategoryType.BUILDING,
    name: "Building",
    usefulLife: 40,
    reinvestFrequency: null,
    reinvestAmount: null,
  },
];

async function main() {
  console.log("🌱 Seeding default CapEx categories...\n");

  let created = 0;
  let updated = 0;

  for (const category of DEFAULT_CATEGORIES) {
    // Upsert each category (create or update)
    const result = await prisma.capExCategory.upsert({
      where: { type: category.type },
      update: {
        name: category.name,
        usefulLife: category.usefulLife,
        // Don't override reinvestFrequency/reinvestAmount if already set
      },
      create: {
        type: category.type,
        name: category.name,
        usefulLife: category.usefulLife,
        reinvestFrequency: category.reinvestFrequency,
        reinvestAmount: category.reinvestAmount,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      console.log(`  ✅ Created: ${result.name} (${result.usefulLife} years)`);
      created++;
    } else {
      console.log(`  🔄 Updated: ${result.name} (${result.usefulLife} years)`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total categories: ${DEFAULT_CATEGORIES.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
