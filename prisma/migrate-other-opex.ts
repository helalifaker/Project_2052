/**
 * Migration Script: Fix otherOpexPercent Storage
 *
 * Problem: The percentage value (e.g., 0.10 for 10%) was incorrectly stored
 * in the `otherOpex` field instead of `otherOpexPercent`.
 *
 * Solution: Copy `otherOpex` values to `otherOpexPercent` and reset `otherOpex` to 0.
 *
 * Run with: npx tsx prisma/migrate-other-opex.ts
 */

import { prisma } from "../src/lib/prisma";
import Decimal from "decimal.js";

async function migrateOtherOpex() {
  console.log("🔄 Starting otherOpex migration...\n");

  try {
    // Get all proposals
    const proposals = await prisma.leaseProposal.findMany({
      select: {
        id: true,
        name: true,
        otherOpex: true,
        otherOpexPercent: true,
      },
    });

    console.log(`📊 Found ${proposals.length} proposals to migrate\n`);

    let migrated = 0;
    let skipped = 0;

    for (const proposal of proposals) {
      const currentOtherOpex = new Decimal(proposal.otherOpex);
      const currentOtherOpexPercent = proposal.otherOpexPercent
        ? new Decimal(proposal.otherOpexPercent)
        : null;

      // Check if migration is needed
      // If otherOpexPercent is already set and otherOpex is 0, skip
      if (
        currentOtherOpexPercent &&
        !currentOtherOpexPercent.isZero() &&
        currentOtherOpex.isZero()
      ) {
        console.log(
          `⏭️  Skipping "${proposal.name}" (ID: ${proposal.id}) - already migrated`
        );
        skipped++;
        continue;
      }

      // Check if otherOpex looks like a percentage (less than 1)
      // and otherOpexPercent is not set
      if (
        currentOtherOpex.lessThan(1) &&
        currentOtherOpex.greaterThan(0) &&
        (!currentOtherOpexPercent || currentOtherOpexPercent.isZero())
      ) {
        console.log(
          `🔄 Migrating "${proposal.name}" (ID: ${proposal.id}): ` +
            `otherOpex=${currentOtherOpex.toString()} → otherOpexPercent=${currentOtherOpex.toString()}`
        );

        await prisma.leaseProposal.update({
          where: { id: proposal.id },
          data: {
            otherOpexPercent: currentOtherOpex,
            otherOpex: new Decimal(0),
          },
        });

        migrated++;
      } else {
        console.log(
          `⏭️  Skipping "${proposal.name}" (ID: ${proposal.id}) - ` +
            `otherOpex=${currentOtherOpex.toString()}, otherOpexPercent=${currentOtherOpexPercent?.toString() ?? "null"}`
        );
        skipped++;
      }
    }

    console.log("\n✅ Migration complete!");
    console.log(`   Migrated: ${migrated} proposals`);
    console.log(`   Skipped: ${skipped} proposals`);
    console.log(
      "\n📢 Next step: Run recalculation for all proposals to regenerate financials."
    );
    console.log("   Use: npx tsx prisma/recalculate-all-proposals.ts");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateOtherOpex();
