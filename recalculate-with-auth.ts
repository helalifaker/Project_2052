/**
 * Recalculate proposal directly via Prisma (bypassing authentication)
 */

import { prisma } from './src/lib/prisma';
import { calculateFinancialProjections } from './src/lib/engine';
import { reconstructCalculationInput, type ProposalRecord } from './src/lib/proposals/reconstruct-calculation-input';
import Decimal from 'decimal.js';
import type { Prisma } from '@prisma/client';

const proposalId = 'b52be42f-71da-4d5e-8147-363259273f7b';

async function recalculate() {
  try {
    console.log(`🔄 Recalculating proposal ${proposalId}...\n`);

    // Fetch proposal
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: proposalId },
      include: { assets: true },
    });

    if (!proposal) {
      console.error('❌ Proposal not found!');
      process.exit(1);
    }

    console.log(`📋 Proposal: ${proposal.name}`);
    console.log(`📅 Last calculated: ${proposal.calculatedAt}\n`);

    // Reconstruct calculation input
    console.log('🔧 Reconstructing calculation input...');
    const input = await reconstructCalculationInput(proposal as ProposalRecord);

    console.log(`\n📊 System Config:`);
    console.log(`  Discount Rate: ${input.systemConfig.discountRate?.toString() ?? 'NOT SET'}`);
    console.log(`  WACC: ${input.systemConfig.wacc?.toString() ?? 'NOT SET'}`);
    console.log(`  Debt Interest Rate: ${input.systemConfig.debtInterestRate.toString()}`);

    // Calculate which rate will be used
    const effectiveRate = input.systemConfig.discountRate ??
                         input.systemConfig.wacc ??
                         input.systemConfig.debtInterestRate;
    console.log(`  Effective NPV Rate: ${effectiveRate.toString()} (${effectiveRate.times(100).toString()}%)\n`);

    // Run calculation
    console.log('💰 Running calculation engine...');
    const startTime = performance.now();
    const result = await calculateFinancialProjections(input);
    const calcTime = performance.now() - startTime;

    console.log(`✅ Calculation completed in ${calcTime.toFixed(2)}ms\n`);

    // Show new metrics
    console.log('📈 New Metrics:');
    console.log(`  Contract Total Rent: ${result.metrics.contractTotalRent.toString()}`);
    console.log(`  Contract Rent NPV: ${result.metrics.contractRentNPV.toString()}`);
    console.log(`  Contract Total EBITDA: ${result.metrics.contractTotalEbitda.toString()}`);
    console.log(`  Contract End Year: ${result.metrics.contractEndYear}\n`);

    // Serialize metrics
    function serializeObject(obj: unknown): unknown {
      if (obj instanceof Decimal) {
        return obj.toString();
      }
      if (Array.isArray(obj)) {
        return obj.map(serializeObject);
      }
      if (obj !== null && typeof obj === 'object') {
        const serialized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          serialized[key] = serializeObject(value);
        }
        return serialized;
      }
      return obj;
    }

    const serializedMetrics = serializeObject(result.metrics);
    const serializedPeriods = result.periods.map((p) => ({
      ...p,
      profitLoss: serializeObject(p.profitLoss),
      balanceSheet: serializeObject(p.balanceSheet),
      cashFlow: serializeObject(p.cashFlow),
    }));

    // Update proposal
    console.log('💾 Updating proposal in database...');
    await prisma.leaseProposal.update({
      where: { id: proposalId },
      data: {
        financials: serializedPeriods as unknown as Prisma.InputJsonValue,
        metrics: serializedMetrics as unknown as Prisma.InputJsonValue,
        calculatedAt: new Date(),
      },
    });

    console.log('✅ Recalculation complete!\n');
    console.log('🎯 Expected NPV (shown in UI):');
    console.log(`  ${result.metrics.contractRentNPV.abs().dividedBy(1_000_000).toDecimalPlaces(1).toString()}M`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

recalculate();
