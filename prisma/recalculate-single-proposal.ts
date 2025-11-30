/**
 * Recalculate a Single Proposal
 *
 * Usage: npx tsx prisma/recalculate-single-proposal.ts <proposal-id>
 */

import { prisma } from "../src/lib/prisma";
import { calculateFinancialProjections } from "../src/lib/engine";
import {
  reconstructCalculationInput,
  type ProposalRecord,
} from "../src/lib/proposals/reconstruct-calculation-input";
import { Prisma } from "@prisma/client";
import Decimal from "decimal.js";

/**
 * Recursively serialize object, converting Decimal to number for JSON storage
 */
function serializeObject(obj: unknown): unknown {
  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeObject(value);
    }
    return serialized;
  }

  return obj;
}

async function recalculateProposal(proposalId: string) {
  console.log(`🔄 Recalculating proposal: ${proposalId}\n`);

  try {
    // Fetch proposal
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
      include: { assets: true },
    });

    if (!proposal) {
      console.error(`❌ Proposal not found: ${proposalId}`);
      process.exit(1);
    }

    console.log(`📋 Found proposal: "${proposal.name}"`);
    console.log(`   Rent Model: ${proposal.rentModel}`);
    console.log(`   otherOpex: ${proposal.otherOpex}`);
    console.log(`   otherOpexPercent: ${proposal.otherOpexPercent}\n`);

    // Reconstruct calculation input
    console.log("📊 Reconstructing calculation input...");
    const input = await reconstructCalculationInput(proposal as ProposalRecord);

    // Log the input to verify otherOpexPercent is being used
    console.log(
      `   Dynamic otherOpex: ${input.dynamicPeriodConfig.otherOpex?.toString()}`
    );
    console.log(
      `   Dynamic otherOpexPercent: ${input.dynamicPeriodConfig.otherOpexPercent?.toString()}\n`
    );

    // Run calculation
    console.log("⚙️  Running calculation engine...");
    const result = await calculateFinancialProjections(input);

    // Serialize result for database - explicitly serialize ALL properties
    // to avoid issues with spread operator and Decimal objects
    const serializedPeriods = result.periods.map((period) => ({
      year: period.year,
      periodType: period.periodType,
      profitLoss: serializeObject(period.profitLoss),
      balanceSheet: serializeObject(period.balanceSheet),
      cashFlow: serializeObject(period.cashFlow),
      calculatedAt: period.calculatedAt,
      iterationsRequired: period.iterationsRequired,
      converged: period.converged,
      balanceSheetBalanced: period.balanceSheetBalanced,
      cashFlowReconciled: period.cashFlowReconciled,
    }));

    const serializedMetrics = serializeObject(result.metrics);

    // Update proposal in database
    console.log("💾 Saving updated financials...");
    await prisma.leaseProposal.update({
      where: { id: proposalId },
      data: {
        financials: serializedPeriods as unknown as Prisma.InputJsonValue,
        metrics: serializedMetrics as unknown as Prisma.InputJsonValue,
        calculatedAt: new Date(),
      },
    });

    // Log sample results from dynamic period
    const year2028 = result.periods.find((p) => p.year === 2028);
    const year2029 = result.periods.find((p) => p.year === 2029);

    if (year2028) {
      console.log("\n📈 Sample Results (2028 - First Dynamic Year):");
      console.log(`   Total Revenue: ${year2028.profitLoss.totalRevenue.toFixed(2)}`);
      console.log(`   Rent Expense: ${year2028.profitLoss.rentExpense.toFixed(2)}`);
      console.log(`   Other OpEx: ${year2028.profitLoss.otherOpex.toFixed(2)}`);
      console.log(`   Depreciation: ${year2028.profitLoss.depreciation.toFixed(2)}`);
      console.log(`   Net Income: ${year2028.profitLoss.netIncome.toFixed(2)}`);
    }

    if (year2029) {
      console.log("\n📈 Sample Results (2029):");
      console.log(`   Total Revenue: ${year2029.profitLoss.totalRevenue.toFixed(2)}`);
      console.log(`   Rent Expense: ${year2029.profitLoss.rentExpense.toFixed(2)}`);
      console.log(`   Other OpEx: ${year2029.profitLoss.otherOpex.toFixed(2)}`);
      console.log(`   Net Income: ${year2029.profitLoss.netIncome.toFixed(2)}`);
    }

    console.log("\n✅ Recalculation complete!");
    console.log("   Refresh the browser to see updated financial statements.");
  } catch (error) {
    console.error("❌ Recalculation failed:", error);
    process.exit(1);
  }
}

// Get proposal ID from command line
const proposalId = process.argv[2];
if (!proposalId) {
  console.error("Usage: npx tsx prisma/recalculate-single-proposal.ts <proposal-id>");
  process.exit(1);
}

recalculateProposal(proposalId);
