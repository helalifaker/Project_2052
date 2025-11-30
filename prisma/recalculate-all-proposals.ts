/**
 * Bulk Recalculate All Proposals
 *
 * This script recalculates all existing proposals to update them with the
 * new data structure that includes separate tuitionRevenue, otherRevenue,
 * and interestIncome fields.
 *
 * Usage: npx tsx prisma/recalculate-all-proposals.ts
 */

import { prisma } from '../src/lib/prisma';
import { calculateFinancialProjections } from '../src/lib/engine';
import { reconstructCalculationInput, type ProposalRecord } from '../src/lib/proposals/reconstruct-calculation-input';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

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

async function recalculateAllProposals() {
  console.log('🔄 Starting bulk recalculation of all proposals...\n');

  // Get all proposals
  const proposals = await prisma.leaseProposal.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${proposals.length} proposals to recalculate\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const proposal of proposals) {
    try {
      console.log(`Processing: ${proposal.name} (${proposal.id})`);

      // Reconstruct calculation input from proposal
      const input = await reconstructCalculationInput(proposal as ProposalRecord);

      // Run calculation
      const result = await calculateFinancialProjections(input);

      // Serialize results
      const serializedPeriods = result.periods.map((period) => ({
        ...period,
        profitLoss: serializeObject(period.profitLoss),
        balanceSheet: serializeObject(period.balanceSheet),
        cashFlow: serializeObject(period.cashFlow),
      }));

      const serializedMetrics = serializeObject(result.metrics);

      // Update proposal with new results
      await prisma.leaseProposal.update({
        where: { id: proposal.id },
        data: {
          financials: serializedPeriods as unknown as Prisma.InputJsonValue,
          metrics: serializedMetrics as unknown as Prisma.InputJsonValue,
          calculatedAt: new Date(),
        },
      });

      // Verify the update
      const historical2024 = result.periods.find(p => p.year === 2024);
      console.log(`  ✅ Success - 2024 interestIncome: ${historical2024?.profitLoss.interestIncome.toString()}, otherRevenue: ${historical2024?.profitLoss.otherRevenue.toString()}`);
      successCount++;

    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Recalculation complete!`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

recalculateAllProposals().catch(console.error);
