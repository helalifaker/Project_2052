import { prisma } from "./src/lib/prisma";

async function verifyNAV() {
  const proposals = await prisma.leaseProposal.findMany({
    select: {
      id: true,
      name: true,
      contractPeriodYears: true,
      metrics: true,
    },
  });

  console.log("\n📊 NAV Verification Report\n");
  console.log("=".repeat(80));

  for (const proposal of proposals) {
    const metrics = proposal.metrics as any;

    console.log(`\n📝 Proposal: ${proposal.name}`);
    console.log(
      `   Contract Period: ${proposal.contractPeriodYears || 30} years`,
    );
    console.log(
      `   NAV: ${metrics?.contractNAV ? `${(metrics.contractNAV / 1_000_000).toFixed(2)}M SAR` : "NOT FOUND"}`,
    );
    console.log(
      `   EBITDA NPV: ${metrics?.contractEbitdaNPV ? `${(metrics.contractEbitdaNPV / 1_000_000).toFixed(2)}M SAR` : "NOT FOUND"}`,
    );
    console.log(
      `   Annualized EBITDA: ${metrics?.contractAnnualizedEbitda ? `${(metrics.contractAnnualizedEbitda / 1_000_000).toFixed(2)}M SAR/year` : "NOT FOUND"}`,
    );
    console.log(
      `   Annualized Rent: ${metrics?.contractAnnualizedRent ? `${(metrics.contractAnnualizedRent / 1_000_000).toFixed(2)}M SAR/year` : "NOT FOUND"}`,
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Verification complete!\n");

  await prisma.$disconnect();
}

verifyNAV().catch(console.error);
