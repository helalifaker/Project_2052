import { prisma } from './src/lib/prisma';

const proposalId = 'b52be42f-71da-4d5e-8147-363259273f7b';

async function checkZakat() {
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: proposalId },
    select: {
      name: true,
      financials: true,
      calculatedAt: true
    }
  });

  if (!proposal) {
    console.error('Proposal not found!');
    process.exit(1);
  }

  console.log(`\n📋 Proposal: ${proposal.name}`);
  console.log(`📅 Calculated: ${proposal.calculatedAt}\n`);

  const financials = proposal.financials as any;

  console.log('📊 Financial Data Structure:');
  console.log(JSON.stringify(financials, null, 2).substring(0, 500));
  console.log('...\n');

  if (!financials) {
    console.error('❌ No financials object found!');
    process.exit(1);
  }

  // Check if financials is an array or object
  const periods = Array.isArray(financials) ? financials : (financials.periods || financials.allPeriods || []);

  if (periods.length === 0) {
    console.error('❌ No periods found!');
    console.log('Type:', typeof financials);
    console.log('Is Array:', Array.isArray(financials));
    console.log('Available keys:', Object.keys(financials));
    process.exit(1);
  }

  console.log(`📊 Total Periods: ${periods.length}\n`);

  // Check first 10 years
  console.log('📈 Zakat Values (SAR):');
  console.log('Year\tZakat\t\tEquity\t\tNon-Current Assets');
  console.log('----\t-----\t\t------\t\t------------------');

  for (let i = 0; i < Math.min(10, periods.length); i++) {
    const period = periods[i];
    const zakat = period.profitLoss?.zakatExpense;
    const equity = period.balanceSheet?.totalEquity;
    const nca = period.balanceSheet?.totalNonCurrentAssets;
    console.log(`${period.year}\t${zakat ?? 'N/A'}\t\t${equity ?? 'N/A'}\t\t${nca ?? 'N/A'}`);
  }

  await prisma.$disconnect();
}

checkZakat();
