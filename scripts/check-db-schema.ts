import { prisma } from "./src/lib/prisma.js";

async function check() {
  try {
    console.log("Checking database schema and data...\n");

    // Try to query a proposal with contractPeriodYears
    const proposal = await prisma.leaseProposal.findFirst({
      select: {
        id: true,
        name: true,
        contractPeriodYears: true,
        calculatedAt: true,
      },
    });

    console.log("✅ Database query successful");
    console.log("Sample proposal:", JSON.stringify(proposal, null, 2));

    // Count calculated proposals
    const count = await prisma.leaseProposal.count({
      where: { calculatedAt: { not: null } },
    });

    console.log("\nCalculated proposals count:", count);

    // Test the actual dashboard query
    console.log("\nTesting dashboard query...");
    const proposals = await prisma.leaseProposal.findMany({
      where: {
        calculatedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        developer: true,
        rentModel: true,
        metrics: true,
        financials: true,
        contractPeriodYears: true,
      },
      take: 1,
    });

    console.log("Dashboard query result:", proposals.length, "proposals");
    if (proposals.length > 0) {
      console.log(
        "First proposal contractPeriodYears:",
        proposals[0].contractPeriodYears,
      );
    }
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
