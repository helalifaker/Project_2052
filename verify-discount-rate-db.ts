/**
 * Verify discount rate in SystemConfig and proposal metrics
 */

import { prisma } from './src/lib/prisma';

async function verify() {
  try {
    console.log('🔍 Checking SystemConfig...\n');

    const systemConfig = await prisma.systemConfig.findFirst({
      orderBy: { confirmedAt: 'desc' },
    });

    if (systemConfig) {
      console.log('SystemConfig:');
      console.log('  Discount Rate:', systemConfig.discountRate?.toString() ?? 'NOT SET');
      console.log('  Debt Interest Rate:', systemConfig.debtInterestRate.toString());
      console.log('  WACC:', (systemConfig as any).wacc?.toString() ?? 'NOT SET');
      console.log('  Confirmed At:', systemConfig.confirmedAt);
    } else {
      console.log('❌ No SystemConfig found!');
    }

    console.log('\n🔍 Checking proposal metrics...\n');

    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: 'b52be42f-71de-4d5e-8f47-3632592737fb' },
      select: {
        id: true,
        name: true,
        metrics: true,
        calculatedAt: true,
      },
    });

    if (proposal) {
      console.log('Proposal:', proposal.name);
      console.log('Calculated At:', proposal.calculatedAt);

      const metrics = proposal.metrics as any;
      if (metrics) {
        console.log('\nFull Period Metrics:');
        console.log('  Total Rent:', metrics.totalRent);
        console.log('  NPV:', metrics.npv ?? 'NOT SET');
        console.log('  Total EBITDA:', metrics.totalEbitda);

        console.log('\nContract Period Metrics:');
        console.log('  Contract Total Rent:', metrics.contractTotalRent ?? 'NOT SET');
        console.log('  Contract Rent NPV:', metrics.contractRentNPV ?? 'NOT SET');
        console.log('  Contract Total EBITDA:', metrics.contractTotalEbitda ?? 'NOT SET');
        console.log('  Contract End Year:', metrics.contractEndYear ?? 'NOT SET');
      } else {
        console.log('❌ No metrics found!');
      }
    } else {
      console.log('❌ Proposal not found!');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
