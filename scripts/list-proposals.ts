/**
 * List all proposals
 */

import { prisma } from "./src/lib/prisma";

async function listProposals() {
  try {
    const proposals = await prisma.leaseProposal.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        rentModel: true,
        calculatedAt: true,
        updatedAt: true,
        metrics: true,
      },
      take: 10,
    });

    console.log(`Found ${proposals.length} proposals:\n`);

    for (const p of proposals) {
      console.log("─".repeat(80));
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Rent Model: ${p.rentModel}`);
      console.log(`Updated At: ${p.updatedAt}`);
      console.log(`Calculated At: ${p.calculatedAt ?? "NOT CALCULATED"}`);

      const metrics = p.metrics as any;
      if (metrics) {
        console.log("\nMetrics:");
        console.log(
          `  Contract Total Rent: ${metrics.contractTotalRent ?? "NOT SET"}`,
        );
        console.log(
          `  Contract Rent NPV: ${metrics.contractRentNPV ?? "NOT SET"}`,
        );
        console.log(
          `  Contract Total EBITDA: ${metrics.contractTotalEbitda ?? "NOT SET"}`,
        );
      }
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listProposals();
