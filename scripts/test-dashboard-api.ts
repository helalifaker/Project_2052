import { prisma } from "./src/lib/prisma.js";
import Decimal from "decimal.js";
import { calculateNPV } from "./src/lib/utils/financial.js";

async function testDashboardAPI() {
  try {
    console.log("Testing dashboard API logic...\n");

    // Fetch SystemConfig for discount rate
    console.log("1. Fetching SystemConfig...");
    const systemConfig = await prisma.systemConfig.findFirst({
      orderBy: { confirmedAt: "desc" as any },
    });
    const discountRate = systemConfig?.debtInterestRate || new Decimal(0.05);
    console.log("   Discount rate:", discountRate.toString());

    // Fetch all calculated proposals
    console.log("\n2. Fetching proposals...");
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
    });
    console.log("   Found proposals:", proposals.length);

    if (proposals.length === 0) {
      console.log("   No proposals found!");
      return;
    }

    // Test contract period KPI calculation
    console.log("\n3. Testing KPI calculation...");
    const proposal = proposals[0];
    console.log("   Proposal:", proposal.name);
    console.log("   Contract period years:", proposal.contractPeriodYears);

    // Test financials normalization
    console.log("\n4. Testing financials normalization...");
    const financials = proposal.financials as any;
    console.log("   Financials type:", typeof financials);
    console.log("   Is array:", Array.isArray(financials));
    if (Array.isArray(financials) && financials.length > 0) {
      console.log("   First period keys:", Object.keys(financials[0]));
    }

    // Test contract period filtering
    console.log("\n5. Testing contract period filtering...");
    const contractPeriodYears = proposal.contractPeriodYears || 30;
    const endYear = 2028 + contractPeriodYears - 1;
    console.log("   End year:", endYear);

    const contractPeriods = Array.isArray(financials)
      ? financials.filter((p: any) => p.year >= 2028 && p.year <= endYear)
      : [];
    console.log("   Contract periods:", contractPeriods.length);

    // Test CapEx query
    console.log("\n6. Testing CapEx query...");
    const capexSum = await prisma.capExAsset.aggregate({
      where: {
        proposalId: { in: proposals.map((p) => p.id) },
        purchaseYear: { gte: 2028 },
      },
      _sum: { purchaseAmount: true },
    });
    console.log(
      "   CapEx sum:",
      capexSum._sum.purchaseAmount?.toString() || "0",
    );

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardAPI();
