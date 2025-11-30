import { prisma } from "./src/lib/prisma";

const proposalId = "b52be42f-71da-4d5e-8147-363259273f7b";

async function checkAllZakat() {
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

  console.log("\n📊 Zakat Values for Sample Years:");
  console.log("=".repeat(80));
  console.log("Year    | Zakat (SAR)      | Zakat (M SAR)");
  console.log("-".repeat(80));

  // Check sample years
  const sampleYears = [2025, 2028, 2030, 2040, 2050, 2057];
  for (const year of sampleYears) {
    const period = periods.find((p: any) => p.year === year);
    if (period) {
      const zakat = period.profitLoss?.zakatExpense || 0;
      const zakatMillions = (parseFloat(zakat) / 1000000).toFixed(1);
      console.log(`${year}   | ${String(zakat).padEnd(16)} | ${zakatMillions}`);
    }
  }

  await prisma.$disconnect();
}

checkAllZakat();
