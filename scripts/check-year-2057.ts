import { prisma } from "./src/lib/prisma";

const proposalId = "b52be42f-71da-4d5e-8147-363259273f7b";

async function checkYear2057() {
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: proposalId },
    select: { name: true, financials: true },
  });

  if (!proposal) {
    console.error("Proposal not found!");
    process.exit(1);
  }

  const financials = proposal.financials as any;
  const periods = Array.isArray(financials)
    ? financials
    : financials.periods || financials.allPeriods || [];

  const year2057 = periods.find((p: any) => p.year === 2057);

  if (!year2057) {
    console.error("Year 2057 not found!");
    process.exit(1);
  }

  console.log("\n📊 Year 2057 Analysis:");
  console.log("=".repeat(60));

  const zakat = year2057.profitLoss?.zakatExpense;
  const equity = year2057.balanceSheet?.totalEquity;
  const nca = year2057.balanceSheet?.totalNonCurrentAssets;
  const ebt = year2057.profitLoss?.ebt;

  console.log(`Zakat Expense:         ${zakat} SAR`);
  console.log(`Equity:                ${equity} SAR`);
  console.log(`Non-Current Assets:    ${nca} SAR`);
  console.log(`EBT:                   ${ebt} SAR`);

  if (equity && nca) {
    const zakatBase = parseFloat(equity) - parseFloat(nca);
    const expectedZakat = zakatBase * 0.025;
    console.log("\n📐 Expected Calculation:");
    console.log(`Zakat Base = ${equity} - ${nca}`);
    console.log(`           = ${zakatBase.toFixed(2)} SAR`);
    console.log(`Expected Zakat = ${zakatBase.toFixed(2)} × 2.5%`);
    console.log(`               = ${expectedZakat.toFixed(2)} SAR`);
    console.log(`\nActual Zakat:   ${zakat} SAR`);
    console.log(
      `Difference:     ${(parseFloat(zakat) - expectedZakat).toFixed(2)} SAR`,
    );
  }

  await prisma.$disconnect();
}

checkYear2057();
