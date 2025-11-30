import { prisma } from "./src/lib/prisma";
import Decimal from "decimal.js";

async function verifySavedRent() {
  try {
    console.log("=== Verifying Saved Rent Values ===\n");

    // Get the most recent Partner Investment proposal
    const proposal = await prisma.leaseProposal.findFirst({
      where: {
        rentModel: "PARTNER_INVESTMENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!proposal) {
      console.log("❌ No Partner Investment proposal found in database");
      return;
    }

    console.log("Proposal Details:");
    console.log(`  ID: ${proposal.id}`);
    console.log(`  Name: ${proposal.name}`);
    console.log(`  Developer: ${proposal.developer}`);
    console.log(
      `  Contract Period: ${proposal.contractPeriodYears || 30} years`,
    );
    console.log(`  Created: ${proposal.createdAt.toISOString()}`);
    console.log();

    // Extract rent parameters
    const rentParams = proposal.rentParams as any;
    console.log("Rent Parameters:");
    console.log(`  Land Size: ${rentParams.landSize} m²`);
    console.log(`  Land Price: ${rentParams.landPricePerSqm} SAR/m²`);
    console.log(`  BUA Size: ${rentParams.buaSize} m²`);
    console.log(
      `  Construction Cost: ${rentParams.constructionCostPerSqm} SAR/m²`,
    );
    console.log(
      `  Yield Rate: ${rentParams.yieldRate} (${new Decimal(rentParams.yieldRate).times(100).toFixed(2)}%)`,
    );
    console.log(
      `  Growth Rate: ${rentParams.growthRate} (${new Decimal(rentParams.growthRate).times(100).toFixed(2)}%)`,
    );
    console.log(`  Frequency: ${rentParams.frequency} year(s)`);
    console.log();

    // Calculate expected values
    const landCost = new Decimal(rentParams.landSize).times(
      rentParams.landPricePerSqm,
    );
    const constructionCost = new Decimal(rentParams.buaSize).times(
      rentParams.constructionCostPerSqm,
    );
    const totalInvestment = landCost.plus(constructionCost);
    const expectedBaseRent = totalInvestment.times(rentParams.yieldRate);

    console.log("Expected Investment:");
    console.log(`  Land Cost: ${landCost.toFixed(2)} SAR`);
    console.log(`  Construction Cost: ${constructionCost.toFixed(2)} SAR`);
    console.log(`  Total Investment: ${totalInvestment.toFixed(2)} SAR`);
    console.log(`  Expected Base Rent: ${expectedBaseRent.toFixed(2)} SAR`);
    console.log();

    // Extract financial data
    const financials = proposal.financials as any;

    if (!financials || !Array.isArray(financials)) {
      console.log("❌ No financial data found or invalid format");
      return;
    }

    console.log(`Financial Periods: ${financials.length} periods`);
    console.log();

    // Find the first dynamic period (2028)
    const dynamicPeriods = financials.filter((p: any) => p.year >= 2028);

    if (dynamicPeriods.length === 0) {
      console.log("❌ No dynamic period (2028+) found in financials");
      return;
    }

    console.log("Saved Rent Values (Dynamic Period 2028-2052):");
    console.log("Year\tSaved Rent (SAR)\tExpected Rent (SAR)\tMatch?");
    console.log("----\t----------------\t-------------------\t------");

    let allMatch = true;
    const baseYear = 2028;
    const contractPeriodYears = (proposal.contractPeriodYears as number) || 30;
    const endYear = baseYear + contractPeriodYears - 1;

    for (let year = baseYear; year <= Math.min(endYear, 2052); year++) {
      const period = financials.find((p: any) => p.year === year);

      if (!period) {
        console.log(`${year}\tMISSING\t\t\tN/A\t\t\t❌`);
        allMatch = false;
        continue;
      }

      const savedRent =
        period.revenue?.totalRentRevenue || period.revenue?.rent || "0";
      const savedRentDecimal = new Decimal(savedRent);

      // Calculate expected rent
      const yearsElapsed = year - baseYear;
      const growthFactor = new Decimal(1)
        .plus(rentParams.growthRate)
        .pow(yearsElapsed);
      const expectedRent = expectedBaseRent.times(growthFactor);

      const match = savedRentDecimal.equals(expectedRent);
      const matchIcon = match ? "✅" : "❌";

      if (!match) allMatch = false;

      console.log(
        `${year}\t${savedRentDecimal.toFixed(2).padStart(16)}\t${expectedRent.toFixed(2).padStart(19)}\t${matchIcon}`,
      );
    }

    console.log();
    if (allMatch) {
      console.log("✅ All rent values match expected calculations!");
    } else {
      console.log("❌ Some rent values do not match expected calculations");
    }

    // Show sample periods for debugging
    console.log("\n=== Sample Period Detail (Year 2028) ===");
    const firstPeriod = financials.find((p: any) => p.year === 2028);
    if (firstPeriod) {
      console.log(JSON.stringify(firstPeriod, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySavedRent();
