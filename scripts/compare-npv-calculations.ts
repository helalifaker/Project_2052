import { prisma } from "./src/lib/prisma";
import Decimal from "decimal.js";

// Frontend NPV calculation (from src/lib/utils/financial.ts)
function calculateNPV_Frontend(
  cashFlows: Array<Decimal>,
  discountRate: Decimal,
): Decimal {
  return cashFlows.reduce<Decimal>((npv, cf, index) => {
    const cashFlow = new Decimal(cf);
    const discountFactor = discountRate.plus(1).pow(index);
    return npv.plus(cashFlow.dividedBy(discountFactor));
  }, new Decimal(0));
}

// Backend NPV calculation (from src/lib/engine/core/decimal-utils.ts)
function calculateNPV_Backend(
  cashFlows: Decimal[],
  discountRate: Decimal,
): Decimal {
  return cashFlows.reduce((npv, cashFlow, index) => {
    const discountFactor = discountRate.plus(1).pow(index);
    return npv.plus(cashFlow.dividedBy(discountFactor));
  }, new Decimal(0));
}

async function compareNPVCalculations() {
  try {
    const proposal = await prisma.leaseProposal.findFirst({
      where: {
        name: { contains: "Olayan", mode: "insensitive" },
        rentModel: "PARTNER_INVESTMENT",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        metrics: true,
        financials: true,
        contractPeriodYears: true,
      },
    });

    if (!proposal) {
      console.log("Proposal not found");
      return;
    }

    const systemConfig = await prisma.systemConfig.findFirst();
    const discountRate = new Decimal(systemConfig?.discountRate ?? 0.07);

    console.log("=".repeat(80));
    console.log("NPV CALCULATION COMPARISON");
    console.log("=".repeat(80));
    console.log("Proposal:", proposal.name);
    console.log("Discount Rate:", discountRate.toFixed(4));
    console.log("Contract Period:", proposal.contractPeriodYears, "years");

    const metrics = proposal.metrics as any;
    console.log("\n" + "=".repeat(80));
    console.log("STORED METRICS (from database)");
    console.log("=".repeat(80));
    console.log(
      "contractRentNPV:",
      (parseFloat(metrics.contractRentNPV) / 1e6).toFixed(2),
      "M",
    );
    console.log(
      "contractRentNPV (abs):",
      (Math.abs(parseFloat(metrics.contractRentNPV)) / 1e6).toFixed(2),
      "M",
    );

    // Get financials
    const financials = proposal.financials as any;

    if (!financials || !financials.periods) {
      console.log("\nERROR: No periods found in financials");
      return;
    }

    const periods = financials.periods as any[];
    console.log("\nTotal periods in database:", periods.length);

    // Filter to contract period (like frontend does)
    const contractPeriodYears = proposal.contractPeriodYears || 30;
    const startYear = 2028;
    const endYear = startYear + contractPeriodYears - 1;

    const contractPeriods = periods.filter(
      (p) => p.year >= startYear && p.year <= endYear,
    );
    console.log(
      "Contract periods (2028-" + endYear + "):",
      contractPeriods.length,
    );

    if (contractPeriods.length === 0) {
      console.log("\nERROR: No contract periods found!");
      return;
    }

    // Extract rent cash flows (as frontend does)
    const rentCashFlows = contractPeriods.map((p) => {
      const rent = p.statements?.profitLoss?.rentExpense;
      return new Decimal(rent || 0).neg(); // Negative for cost
    });

    console.log("\n" + "=".repeat(80));
    console.log("CASH FLOWS");
    console.log("=".repeat(80));
    console.log("First 5 rent values (M):");
    rentCashFlows.slice(0, 5).forEach((cf, i) => {
      console.log(`  Year ${startYear + i}: ${cf.dividedBy(1e6).toFixed(2)}M`);
    });

    console.log("\nLast 3 rent values (M):");
    rentCashFlows.slice(-3).forEach((cf, i) => {
      const year = endYear - 2 + i;
      console.log(`  Year ${year}: ${cf.dividedBy(1e6).toFixed(2)}M`);
    });

    // Calculate NPV using both methods
    const npvFrontend = calculateNPV_Frontend(rentCashFlows, discountRate);
    const npvBackend = calculateNPV_Backend(rentCashFlows, discountRate);

    console.log("\n" + "=".repeat(80));
    console.log("NPV CALCULATIONS");
    console.log("=".repeat(80));
    console.log(
      "Frontend NPV (abs):",
      npvFrontend.abs().dividedBy(1e6).toFixed(2),
      "M",
    );
    console.log(
      "Backend NPV (abs):",
      npvBackend.abs().dividedBy(1e6).toFixed(2),
      "M",
    );
    console.log(
      "Stored NPV (abs):",
      (Math.abs(parseFloat(metrics.contractRentNPV)) / 1e6).toFixed(2),
      "M",
    );

    console.log("\n" + "=".repeat(80));
    console.log("DISCREPANCY ANALYSIS");
    console.log("=".repeat(80));
    const diff1 = npvFrontend
      .abs()
      .minus(new Decimal(Math.abs(parseFloat(metrics.contractRentNPV))));
    const diff2 = npvBackend
      .abs()
      .minus(new Decimal(Math.abs(parseFloat(metrics.contractRentNPV))));

    console.log(
      "Frontend vs Stored:",
      diff1.dividedBy(1e6).toFixed(2),
      "M difference",
    );
    console.log(
      "Backend vs Stored:",
      diff2.dividedBy(1e6).toFixed(2),
      "M difference",
    );

    // Check if the issue is that the stored NPV was calculated with different periods
    const storedNPVAbs = Math.abs(parseFloat(metrics.contractRentNPV));
    const expectedNPV = 322_000_000; // User's expected value

    console.log("\n" + "=".repeat(80));
    console.log("EXPECTED VS ACTUAL");
    console.log("=".repeat(80));
    console.log("Expected (user):", (expectedNPV / 1e6).toFixed(2), "M");
    console.log("Actual (stored):", (storedNPVAbs / 1e6).toFixed(2), "M");
    console.log(
      "Difference:",
      ((storedNPVAbs - expectedNPV) / 1e6).toFixed(2),
      "M",
    );
    console.log(
      "Percentage difference:",
      (((storedNPVAbs - expectedNPV) / expectedNPV) * 100).toFixed(1),
      "%",
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

compareNPVCalculations();
