/**
 * Data Migration Script: Migrate Existing Proposals to Negotiation System v2.2
 *
 * This script migrates existing proposals to the new Negotiation entity system:
 *
 * 1. Find proposals with developer+property set (legacy negotiation context)
 * 2. Create Negotiation entity for each unique developer+property pair
 * 3. Link proposals to their Negotiation
 * 4. Set purpose = NEGOTIATION for linked proposals
 * 5. Set offerNumber based on negotiationRound
 * 6. Proposals without developer+property remain as SIMULATION
 *
 * Run with: npx tsx prisma/scripts/migrate-existing-proposals.ts
 */

import {
  PrismaClient,
  NegotiationStatus,
  ProposalPurpose,
} from "@prisma/client";

const prisma = new PrismaClient();

interface GroupedProposals {
  developer: string;
  property: string;
  proposals: {
    id: string;
    name: string;
    negotiationRound: number;
    createdBy: string;
    createdAt: Date;
    origin: string;
    status: string;
  }[];
}

async function main() {
  console.log("Starting migration to Negotiation system v2.2...\n");

  // Step 1: Find all proposals with developer+property set
  const proposalsWithNegotiationContext = await prisma.leaseProposal.findMany({
    where: {
      AND: [
        { developer: { not: null } },
        { property: { not: null } },
        { developer: { not: "" } },
        { property: { not: "" } },
      ],
    },
    select: {
      id: true,
      name: true,
      developer: true,
      property: true,
      negotiationRound: true,
      createdBy: true,
      createdAt: true,
      origin: true,
      status: true,
      negotiationId: true,
    },
    orderBy: [
      { developer: "asc" },
      { property: "asc" },
      { negotiationRound: "asc" },
    ],
  });

  console.log(
    `Found ${proposalsWithNegotiationContext.length} proposals with developer+property set`,
  );

  // Filter out proposals already linked to a negotiation
  const proposalsToMigrate = proposalsWithNegotiationContext.filter(
    (p) => !p.negotiationId,
  );

  console.log(
    `${proposalsToMigrate.length} proposals need migration (not already linked)\n`,
  );

  if (proposalsToMigrate.length === 0) {
    console.log("No proposals to migrate. Exiting.");
    return;
  }

  // Step 2: Group proposals by developer+property
  const groupedMap = new Map<string, GroupedProposals>();

  for (const proposal of proposalsToMigrate) {
    const key = `${proposal.developer}|${proposal.property}`;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        developer: proposal.developer!,
        property: proposal.property!,
        proposals: [],
      });
    }

    groupedMap.get(key)!.proposals.push({
      id: proposal.id,
      name: proposal.name,
      negotiationRound: proposal.negotiationRound,
      createdBy: proposal.createdBy,
      createdAt: proposal.createdAt,
      origin: proposal.origin,
      status: proposal.status,
    });
  }

  console.log(
    `Found ${groupedMap.size} unique developer+property combinations\n`,
  );

  // Step 3: Create negotiations and link proposals
  let negotiationsCreated = 0;
  let proposalsLinked = 0;
  const errors: string[] = [];

  for (const [key, group] of groupedMap) {
    console.log(`\n--- Processing: ${group.developer} / ${group.property} ---`);
    console.log(`   ${group.proposals.length} proposals in this group`);

    try {
      // Sort proposals by negotiationRound to determine createdBy (use earliest proposal's creator)
      const sortedProposals = [...group.proposals].sort(
        (a, b) => a.negotiationRound - b.negotiationRound,
      );
      const firstProposal = sortedProposals[0];

      // Check if negotiation already exists for this developer+property
      let negotiation = await prisma.negotiation.findUnique({
        where: {
          developer_property: {
            developer: group.developer,
            property: group.property,
          },
        },
      });

      if (!negotiation) {
        // Create new negotiation
        negotiation = await prisma.negotiation.create({
          data: {
            developer: group.developer,
            property: group.property,
            status: NegotiationStatus.ACTIVE,
            notes: `Migrated from ${group.proposals.length} existing proposal(s)`,
            createdBy: firstProposal.createdBy,
          },
        });
        negotiationsCreated++;
        console.log(`   Created Negotiation: ${negotiation.id}`);
      } else {
        console.log(`   Negotiation already exists: ${negotiation.id}`);
      }

      // Link each proposal to the negotiation
      for (const proposal of sortedProposals) {
        await prisma.leaseProposal.update({
          where: { id: proposal.id },
          data: {
            negotiationId: negotiation.id,
            purpose: ProposalPurpose.NEGOTIATION,
            offerNumber: proposal.negotiationRound, // Use existing round as offer number
          },
        });
        proposalsLinked++;
        console.log(
          `   Linked proposal: ${proposal.name} (Round ${proposal.negotiationRound} -> Offer #${proposal.negotiationRound})`,
        );
      }
    } catch (error) {
      const errorMsg = `Error processing ${key}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(`   ERROR: ${errorMsg}`);
    }
  }

  // Step 4: Summary
  console.log("\n" + "=".repeat(60));
  console.log("MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Negotiations created: ${negotiationsCreated}`);
  console.log(`Proposals linked: ${proposalsLinked}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nErrors encountered:");
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  // Step 5: Verify proposals without negotiation context remain as SIMULATION
  const simulationProposals = await prisma.leaseProposal.count({
    where: {
      OR: [
        { developer: null },
        { developer: "" },
        { property: null },
        { property: "" },
      ],
      negotiationId: null,
      purpose: ProposalPurpose.SIMULATION,
    },
  });

  console.log(
    `\nProposals without negotiation context (remain SIMULATION): ${simulationProposals}`,
  );

  console.log("\nMigration complete!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
