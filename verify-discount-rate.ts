import { prisma } from './src/lib/prisma';

async function main() {
  const config = await prisma.systemConfig.findFirst();

  if (!config) {
    console.log('❌ No SystemConfig found');
    return;
  }

  console.log('✅ SystemConfig found:');
  console.log('  Zakat Rate:', config.zakatRate.toString());
  console.log('  Debt Interest Rate:', config.debtInterestRate.toString());
  console.log('  Deposit Interest Rate:', config.depositInterestRate.toString());
  console.log('  Discount Rate:', config.discountRate.toString());
  console.log('  Min Cash Balance:', config.minCashBalance.toString());
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
