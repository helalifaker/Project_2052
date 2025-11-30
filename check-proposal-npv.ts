import { prisma } from './src/lib/prisma';

async function checkProposalNPV() {
  try {
    // Find the "Olayan_30y - Partner" proposal
    const proposal = await prisma.leaseProposal.findFirst({
      where: {
        name: {
          contains: 'Olayan',
          mode: 'insensitive'
        },
        rentModel: 'PARTNER_INVESTMENT'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        rentModel: true,
        metrics: true,
        financials: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!proposal) {
      console.log('Proposal not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('PROPOSAL FOUND');
    console.log('='.repeat(80));
    console.log('ID:', proposal.id);
    console.log('Name:', proposal.name);
    console.log('Model:', proposal.rentModel);
    console.log('Created:', proposal.createdAt);
    console.log('Updated:', proposal.updatedAt);
    console.log('\n' + '='.repeat(80));
    console.log('METRICS (what the card displays)');
    console.log('='.repeat(80));
    console.log(JSON.stringify(proposal.metrics, null, 2));

    // Check if financials contain aggregated metrics
    if (proposal.financials) {
      const financials = proposal.financials as any;

      console.log('\n' + '='.repeat(80));
      console.log('FINANCIALS - AGGREGATED METRICS');
      console.log('='.repeat(80));

      if (financials.aggregated) {
        console.log('Total Rent (30y):', financials.aggregated.totalRent);
        console.log('NPV:', financials.aggregated.npv);
        console.log('Total EBITDA:', financials.aggregated.totalEbitda);
      }

      // Check contract period metrics
      if (financials.contractPeriod) {
        console.log('\n' + '='.repeat(80));
        console.log('CONTRACT PERIOD METRICS');
        console.log('='.repeat(80));
        console.log('Total Rent (Contract):', financials.contractPeriod.totalRent);
        console.log('NPV (Contract):', financials.contractPeriod.npv);
        console.log('Total EBITDA (Contract):', financials.contractPeriod.totalEbitda);
        console.log('Contract End Year:', financials.contractPeriod.contractEndYear);
      }

      // Check if there's rent data in the periods
      const periods = financials.periods as any[];
      if (periods && periods.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('SAMPLE PERIODS (first 5 years)');
        console.log('='.repeat(80));

        periods.slice(0, 5).forEach((period: any) => {
          console.log(`Year ${period.year}:`, {
            rent: period.statements?.profitLoss?.rent,
            revenue: period.statements?.profitLoss?.revenue,
          });
        });

        // Calculate NPV manually to verify
        console.log('\n' + '='.repeat(80));
        console.log('MANUAL NPV CALCULATION CHECK');
        console.log('='.repeat(80));

        let manualNPV = 0;
        const discountRate = 0.10; // Assuming 10% discount rate

        periods.forEach((period: any) => {
          const year = period.year;
          const rent = parseFloat(period.statements?.profitLoss?.rent || '0');
          const discountFactor = 1 / Math.pow(1 + discountRate, year - 2023);
          const presentValue = rent * discountFactor;
          manualNPV += presentValue;

          if (year <= 2028) {
            console.log(`Year ${year}: Rent=${rent.toFixed(0)}, PV=${presentValue.toFixed(0)}`);
          }
        });

        console.log('\nManual NPV (10% discount):', (manualNPV / 1_000_000).toFixed(1), 'M');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProposalNPV();
