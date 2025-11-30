import Decimal from "decimal.js";

/**
 * Test script to verify Partner Investment rent calculation
 * Based on user screenshot parameters:
 * - Land: 10,000 m² × 5,000 SAR/m² = SAR 50,000,000
 * - Construction: 20,000 m² × 2,500 SAR/m² = SAR 50,000,000
 * - Total Investment: SAR 100,000,000
 * - Yield Rate: 9%
 * - Growth: 2% every 1 year
 * - Contract Period: 25 years (2028-2052)
 */

type D = Decimal;

interface PartnerInvestmentParams {
  landSize: D;
  landPricePerSqm: D;
  buaSize: D;
  constructionCostPerSqm: D;
  yieldRate: D;
  growthRate: D;
  frequency: number;
}

function calculatePartnerInvestmentRent(
  currentYear: number,
  baseYear: number,
  params: PartnerInvestmentParams,
): D {
  const frequency = params.frequency || 1;
  const growthRate = params.growthRate || new Decimal(0);

  // Calculate total investment
  const landCost = params.landSize.times(params.landPricePerSqm);
  const constructionCost = params.buaSize.times(params.constructionCostPerSqm);
  const totalInvestment = landCost.plus(constructionCost);

  // Calculate base rent (investment × yield rate)
  const baseRent = totalInvestment.times(params.yieldRate);

  // Apply growth
  const yearsElapsed = Math.max(
    0,
    Math.floor((currentYear - baseYear) / frequency),
  );
  const growthFactor = new Decimal(1).plus(growthRate).pow(yearsElapsed);

  return baseRent.times(growthFactor);
}

async function testRentCalculation() {
  console.log("=== Partner Investment Rent Calculation Test ===\n");

  // Parameters from user screenshot
  const params: PartnerInvestmentParams = {
    landSize: new Decimal(10000), // 10,000 m²
    landPricePerSqm: new Decimal(5000), // 5,000 SAR/m²
    buaSize: new Decimal(20000), // 20,000 m²
    constructionCostPerSqm: new Decimal(2500), // 2,500 SAR/m²
    yieldRate: new Decimal(0.09), // 9%
    growthRate: new Decimal(0.02), // 2%
    frequency: 1, // Every 1 year
  };

  // Calculate components
  const landCost = params.landSize.times(params.landPricePerSqm);
  const constructionCost = params.buaSize.times(params.constructionCostPerSqm);
  const totalInvestment = landCost.plus(constructionCost);
  const baseRent = totalInvestment.times(params.yieldRate);

  console.log("Investment Breakdown:");
  console.log(
    `  Land Cost: ${landCost.toFixed(2)} SAR (${params.landSize} m² × ${params.landPricePerSqm} SAR/m²)`,
  );
  console.log(
    `  Construction Cost: ${constructionCost.toFixed(2)} SAR (${params.buaSize} m² × ${params.constructionCostPerSqm} SAR/m²)`,
  );
  console.log(`  Total Investment: ${totalInvestment.toFixed(2)} SAR`);
  console.log();

  console.log("Rent Calculation:");
  console.log(`  Yield Rate: ${params.yieldRate.times(100).toFixed(2)}%`);
  console.log(`  Base Rent (Year 1): ${baseRent.toFixed(2)} SAR`);
  console.log(
    `  Growth Rate: ${params.growthRate.times(100).toFixed(2)}% per ${params.frequency} year(s)`,
  );
  console.log();

  console.log("Expected Rent Values:");
  console.log(`  Year 1 (2028): ${baseRent.toFixed(2)} SAR`);
  console.log();

  console.log("Calculated Rent per Year (25-year contract: 2028-2052):");
  console.log("Year\tRent (SAR)\t\tGrowth Factor");
  console.log("----\t----------\t\t-------------");

  const baseYear = 2028;
  for (let year = 2028; year <= 2052; year++) {
    const rent = calculatePartnerInvestmentRent(year, baseYear, params);
    const yearsElapsed = year - baseYear;
    const growthFactor = new Decimal(1)
      .plus(params.growthRate)
      .pow(yearsElapsed);
    console.log(
      `${year}\t${rent.toFixed(2).padStart(18)}\t${growthFactor.toFixed(6)}`,
    );
  }

  console.log();
  console.log("Verification:");
  const year1Rent = calculatePartnerInvestmentRent(2028, 2028, params);
  const year5Rent = calculatePartnerInvestmentRent(2032, 2028, params);
  const year10Rent = calculatePartnerInvestmentRent(2037, 2028, params);
  const year25Rent = calculatePartnerInvestmentRent(2052, 2028, params);

  console.log(
    `  Year 1 (2028): ${year1Rent.toFixed(2)} SAR (should be ${baseRent.toFixed(2)})`,
  );
  console.log(`  Year 5 (2032): ${year5Rent.toFixed(2)} SAR (4 years growth)`);
  console.log(
    `  Year 10 (2037): ${year10Rent.toFixed(2)} SAR (9 years growth)`,
  );
  console.log(
    `  Year 25 (2052): ${year25Rent.toFixed(2)} SAR (24 years growth)`,
  );
  console.log();

  // Verification checks
  const checksPass = year1Rent.equals(baseRent);
  if (checksPass) {
    console.log(
      "✅ Calculation verified - Year 1 rent matches expected base rent",
    );
  } else {
    console.log("❌ Error - Year 1 rent does not match expected base rent");
    console.log(`   Expected: ${baseRent.toFixed(2)}`);
    console.log(`   Got: ${year1Rent.toFixed(2)}`);
  }
}

testRentCalculation();
