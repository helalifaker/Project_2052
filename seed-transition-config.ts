import { prisma } from './src/lib/prisma';
import Decimal from 'decimal.js';

async function seedTransitionConfig() {
  try {
    console.log('Checking for existing TransitionConfig...');

    const existing = await prisma.transitionConfig.findFirst();

    if (existing) {
      console.log('✅ TransitionConfig already exists:');
      console.log('   2025 Students:', existing.year2025Students);
      console.log('   2026 Students:', existing.year2026Students);
      console.log('   2027 Students:', existing.year2027Students);
      console.log('   Rent Growth:', existing.rentGrowthPercent, '%');
      return;
    }

    console.log('Creating default TransitionConfig...');

    const config = await prisma.transitionConfig.create({
      data: {
        year2025Students: 800,
        year2025AvgTuition: new Decimal(30000),
        year2026Students: 850,
        year2026AvgTuition: new Decimal(31500),
        year2027Students: 900,
        year2027AvgTuition: new Decimal(33000),
        rentGrowthPercent: new Decimal(5.0),
      },
    });

    console.log('\n✅ TransitionConfig created successfully!');
    console.log('   ID:', config.id);
    console.log('   2025:', config.year2025Students, 'students @', config.year2025AvgTuition.toString(), 'SAR');
    console.log('   2026:', config.year2026Students, 'students @', config.year2026AvgTuition.toString(), 'SAR');
    console.log('   2027:', config.year2027Students, 'students @', config.year2027AvgTuition.toString(), 'SAR');
    console.log('   Rent Growth:', config.rentGrowthPercent.toString(), '% from 2024');
    console.log('\nℹ️  You can now configure transition periods at: /admin/transition');

  } catch (error) {
    console.error('\n❌ Error seeding TransitionConfig:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTransitionConfig();
