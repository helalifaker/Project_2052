import { prisma } from './src/lib/prisma';
import Decimal from 'decimal.js';

async function diagnoseRentNPV() {
  try {
    // Find the proposal
    const proposal = await prisma.leaseProposal.findFirst({
      where: {
        name: { contains: 'Olayan', mode: 'insensitive' },
        rentModel: 'PARTNER_INVESTMENT'
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        metrics: true,
        financials: true,
        contractPeriodYears: true,
      }
    });

    if (!proposal || !proposal.financials) {
      console.log('Proposal or financials not found');
      return;
    }

    const financials = proposal.financials as any;
    const periods = financials.periods as any[];
    const metrics = proposal.metrics as any;

    console.log('='.repeat(80));
    console.log('PROPOSAL:', proposal.name);
    console.log('Contract Period:', proposal.contractPeriodYears, 'years');
    console.log('='.repeat(80));

    console.log('\nSTORED METRICS:');
    console.log('- contractRentNPV:', metrics.contractRentNPV);
    console.log('- contractEbitdaNPV:', metrics.contractEbitdaNPV);
    console.log('- contractTotalRent:', metrics.contractTotalRent);
    console.log('- 30-year NPV:', metrics.npv);

    // Get system config
    const systemConfig = await prisma.systemConfig.findFirst();
    const discountRate = systemConfig?.discountRate ?? systemConfig?.wacc ?? systemConfig?.debtInterestRate ?? 0.08;

    console.log('\n' + '='.repeat(80));
    console.log('DISCOUNT RATE USED:', discountRate);
    console.log('='.repeat(80));

    // Extract rent cash flows for contract period
    const contractEndYear = metrics.contractEndYear || 2057;
    const contractStartYear = 2028; // Dynamic period starts

    console.log('\nCONTRACT PERIOD: 2028 -', contractEndYear);
    console.log('Number of years:', contractEndYear - contractStartYear + 1);

    // Extract rent values
    const rentCashFlows: { year: number; rent: number; pv: number }[] = [];
    let manualNPV = 0;
    let manualNPVAbs = 0;

    periods.forEach((period: any) => {
      const year = period.year;
      if (year >= contractStartYear && year <= contractEndYear) {
        const rent = parseFloat(period.statements?.profitLoss?.rentExpense || '0');
        const yearsFromStart = year - contractStartYear;
        const discountFactor = Math.pow(1 + Number(discountRate), yearsFromStart);
        const pvNegative = -rent / discountFactor; // Negative because rent is a cost
        const pvPositive = rent / discountFactor; // Positive (landlord perspective)

        manualNPV += pvNegative;
        manualNPVAbs += pvPositive;

        if (year <= 2032 || year >= contractEndYear - 2) {
          rentCashFlows.push({
            year,
            rent,
            pv: pvNegative
          });
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('RENT CASH FLOWS (first 5 & last 3 years)');
    console.log('='.repeat(80));
    rentCashFlows.forEach(({ year, rent, pv }) => {
      console.log(`Year ${year}: Rent = ${(rent/1e6).toFixed(2)}M, PV = ${(pv/1e6).toFixed(2)}M`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('NPV CALCULATION RESULTS');
    console.log('='.repeat(80));
    console.log('Manual NPV (negative, tenant perspective):', (manualNPV/1e6).toFixed(2), 'M');
    console.log('Manual NPV (positive, landlord perspective):', (manualNPVAbs/1e6).toFixed(2), 'M');
    console.log('Stored contractRentNPV:', (parseFloat(metrics.contractRentNPV)/1e6).toFixed(2), 'M');
    console.log('Difference:', ((manualNPV - parseFloat(metrics.contractRentNPV))/1e6).toFixed(2), 'M');

    console.log('\n' + '='.repeat(80));
    console.log('POSSIBLE INTERPRETATIONS');
    console.log('='.repeat(80));
    console.log('1. Absolute value (landlord perspective):', Math.abs(manualNPV/1e6).toFixed(2), 'M');
    console.log('2. EBITDA NPV (value created):', (parseFloat(metrics.contractEbitdaNPV)/1e6).toFixed(2), 'M');
    console.log('3. Net Tenant Surplus (EBITDA - Rent):', (parseFloat(metrics.contractNetTenantSurplus)/1e6).toFixed(2), 'M');

    // Try different discount rates to see if 322M is achievable
    console.log('\n' + '='.repeat(80));
    console.log('NPV AT DIFFERENT DISCOUNT RATES');
    console.log('='.repeat(80));

    for (const testRate of [0.05, 0.06, 0.07, 0.08, 0.10, 0.12]) {
      let testNPV = 0;
      periods.forEach((period: any) => {
        const year = period.year;
        if (year >= contractStartYear && year <= contractEndYear) {
          const rent = parseFloat(period.statements?.profitLoss?.rentExpense || '0');
          const yearsFromStart = year - contractStartYear;
          const discountFactor = Math.pow(1 + testRate, yearsFromStart);
          testNPV += rent / discountFactor;
        }
      });
      console.log(`Rate ${(testRate*100).toFixed(0)}%: ${(testNPV/1e6).toFixed(1)}M`);

      if (Math.abs(testNPV/1e6 - 322) < 10) {
        console.log(`   ^^^^ CLOSE TO 322M!`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseRentNPV();
