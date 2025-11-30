import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

/**
 * Historical Financial Data for 2023-2024
 * All amounts in SAR
 */

interface HistoricalEntry {
  year: number;
  statementType: string;
  lineItem: string;
  amount: number;
}

const historicalData: HistoricalEntry[] = [
  // =====================
  // PROFIT AND LOSS - 2023
  // =====================
  { year: 2023, statementType: "P&L", lineItem: "Tuition French Cur.", amount: 55819340 },
  { year: 2023, statementType: "P&L", lineItem: "Tuition IB", amount: 0 },
  { year: 2023, statementType: "P&L", lineItem: "Other Income", amount: 4373210 },
  { year: 2023, statementType: "P&L", lineItem: "Salaries and Related Costs", amount: -28460183 },
  { year: 2023, statementType: "P&L", lineItem: "School Rent", amount: -7939656 },
  { year: 2023, statementType: "P&L", lineItem: "Others expenses", amount: -21816348 },
  { year: 2023, statementType: "P&L", lineItem: "Depreciation and Amortization", amount: -2360301 },
  { year: 2023, statementType: "P&L", lineItem: "Interest income", amount: 382960 },
  { year: 2023, statementType: "P&L", lineItem: "Interest expenses", amount: 0 },

  // =====================
  // PROFIT AND LOSS - 2024
  // =====================
  { year: 2024, statementType: "P&L", lineItem: "Tuition French Cur.", amount: 65503278 },
  { year: 2024, statementType: "P&L", lineItem: "Tuition IB", amount: 0 },
  { year: 2024, statementType: "P&L", lineItem: "Other Income", amount: 5015995 },
  { year: 2024, statementType: "P&L", lineItem: "Salaries and Related Costs", amount: -29874321 },
  { year: 2024, statementType: "P&L", lineItem: "School Rent", amount: -7631145 },
  { year: 2024, statementType: "P&L", lineItem: "Others expenses", amount: -29830920 },
  { year: 2024, statementType: "P&L", lineItem: "Depreciation and Amortization", amount: -3612073 },
  { year: 2024, statementType: "P&L", lineItem: "Interest income", amount: 432479 },
  { year: 2024, statementType: "P&L", lineItem: "Interest expenses", amount: 0 },

  // =====================
  // BALANCE SHEET - 2023
  // =====================
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Cash on Hand and in Bank", amount: 21580604 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Accounts Receivable & others", amount: 9429976 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Tangible & Intangible Assets, Gross", amount: 66811686 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Less: Acc. Dep. Amortization", amount: -39926077 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Accounts Payable", amount: 3023457 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Deferred Income", amount: 21986734 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Provisions", amount: 21535293 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Retain earning", amount: 9717196 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Net Result", amount: -978 },
  { year: 2023, statementType: "BALANCE_SHEET", lineItem: "Equity", amount: 9716218 },

  // =====================
  // BALANCE SHEET - 2024
  // =====================
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Cash on Hand and in Bank", amount: 18250072 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Accounts Receivable & others", amount: 14301148 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Tangible & Intangible Assets, Gross", amount: 79763893 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Less: Acc. Dep. Amortization", amount: -43538150 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Accounts Payable", amount: 4087609 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Deferred Income", amount: 23726112 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Provisions", amount: 31149512 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Retain earning", amount: 9715232 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Net Result", amount: 3292 },
  { year: 2024, statementType: "BALANCE_SHEET", lineItem: "Equity", amount: 9718524 },

  // =====================
  // CASH FLOW - 2023
  // =====================
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Net Result", amount: -978 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Accounts Receivable - net", amount: 2495481 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Prepaid & Other Receivables", amount: 33000 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Loans and Advances", amount: -151750 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Intangible Assets, Net", amount: -74285 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Accounts Payable", amount: -957221 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Accrued Expenses", amount: 1443365 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Deferred Income", amount: 1025429 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Provisions", amount: 6356309 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Depreciation", amount: 2002633 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Adjustements", amount: 0 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Additions of Fixed Assets", amount: -10890160 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Increase (Decrease) in General Fund Balance", amount: -310995 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Net Cash Flows for the Year", amount: 970828 },
  { year: 2023, statementType: "CASH_FLOW", lineItem: "Cash at Beginning of Year", amount: 20609776 },

  // =====================
  // CASH FLOW - 2024
  // =====================
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Net Result", amount: 3292 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Accounts Receivable - net", amount: -4871172 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Prepaid & Other Receivables", amount: 1501 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Loans and Advances", amount: 45750 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Intangible Assets, Net", amount: -450182 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Accounts Payable", amount: 1064152 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Accrued Expenses", amount: -1587140 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Deferred Income", amount: 1739978 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Provisions", amount: 9614219 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Depreciation", amount: 3145274 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Adjustements", amount: 0 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Additions of Fixed Assets", amount: -12035226 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Increase (Decrease) in General Fund Balance", amount: -978 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Net Cash Flows for the Year", amount: -3330532 },
  { year: 2024, statementType: "CASH_FLOW", lineItem: "Cash at Beginning of Year", amount: 21580604 },
];

async function main() {
  console.log("Updating historical data...\n");

  // First, delete all existing historical data to ensure clean state
  const deleteResult = await prisma.historicalData.deleteMany({});
  console.log(`Deleted ${deleteResult.count} existing historical records\n`);

  // Insert all historical data using upsert
  let created = 0;
  let updated = 0;

  for (const entry of historicalData) {
    const result = await prisma.historicalData.upsert({
      where: {
        year_statementType_lineItem: {
          year: entry.year,
          statementType: entry.statementType,
          lineItem: entry.lineItem,
        },
      },
      update: {
        amount: new Prisma.Decimal(entry.amount),
        confirmed: true,
        updatedAt: new Date(),
      },
      create: {
        year: entry.year,
        statementType: entry.statementType,
        lineItem: entry.lineItem,
        amount: new Prisma.Decimal(entry.amount),
        confirmed: true,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`\n✓ Created ${created} new records`);
  console.log(`✓ Updated ${updated} existing records`);
  console.log(`✓ Total records: ${historicalData.length}`);

  // Verify the data by counting records per statement type and year
  console.log("\n--- Verification ---");

  const summary = await prisma.historicalData.groupBy({
    by: ["year", "statementType"],
    _count: { id: true },
  });

  console.log("\nRecords by Year and Statement Type:");
  for (const row of summary) {
    console.log(`  ${row.year} ${row.statementType}: ${row._count.id} items`);
  }

  console.log("\n✅ Historical data updated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
