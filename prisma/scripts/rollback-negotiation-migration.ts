/**
 * Rollback Script: Undo Negotiation Migration v2.2
 *
 * This script reverses the migration by:
 * 1. Unlinking proposals from Negotiation entities
 * 2. Resetting purpose to SIMULATION
 * 3. Clearing offerNumber
 * 4. Optionally deleting created Negotiation entities
 *
 * Run with: npx tsx prisma/scripts/rollback-negotiation-migration.ts
 */

import { PrismaClient, ProposalPurpose } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting rollback of Negotiation migration v2.2...\n");

  // Step 1: Find all proposals linked to negotiations
  const linkedProposals = await prisma.leaseProposal.findMany({
    where: {
      negotiationId: { not: null },
    },
    select: {
      id: true,
      name: true,
      negotiationId: true,
      purpose: true,
      offerNumber: true,
    },
  });

  console.log(
    `Found ${linkedProposals.length} proposals linked to negotiations\n`,
  );

  if (linkedProposals.length === 0) {
    console.log(
      "No proposals to rollback. Checking for orphan negotiations...",
    );
  } else {
    // Step 2: Unlink proposals and reset to SIMULATION
    console.log("Unlinking proposals from negotiations...");

    const result = await prisma.leaseProposal.updateMany({
      where: {
        negotiationId: { not: null },
      },
      data: {
        negotiationId: null,
        purpose: ProposalPurpose.SIMULATION,
        offerNumber: null,
      },
    });

    console.log(`Unlinked ${result.count} proposals`);
  }

  // Step 3: Find negotiations that were auto-created by migration
  const migratedNegotiations = await prisma.negotiation.findMany({
    where: {
      notes: { contains: "Migrated from" },
    },
    select: {
      id: true,
      developer: true,
      property: true,
      _count: {
        select: { proposals: true },
      },
    },
  });

  console.log(
    `\nFound ${migratedNegotiations.length} negotiations created by migration`,
  );

  // Step 4: Delete negotiations with no linked proposals (safe to delete)
  let deleted = 0;
  for (const neg of migratedNegotiations) {
    if (neg._count.proposals === 0) {
      await prisma.negotiation.delete({
        where: { id: neg.id },
      });
      deleted++;
      console.log(`Deleted negotiation: ${neg.developer} / ${neg.property}`);
    } else {
      console.log(
        `Skipped negotiation (has ${neg._count.proposals} proposals): ${neg.developer} / ${neg.property}`,
      );
    }
  }

  // Step 5: Summary
  console.log("\n" + "=".repeat(60));
  console.log("ROLLBACK SUMMARY");
  console.log("=".repeat(60));
  console.log(`Proposals unlinked: ${linkedProposals.length}`);
  console.log(`Negotiations deleted: ${deleted}`);
  console.log(`Negotiations skipped: ${migratedNegotiations.length - deleted}`);

  console.log("\nRollback complete!");
}

main()
  .catch((e) => {
    console.error("Rollback failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
