
import { PrismaClient } from '@prisma/client';
import { reconstructCalculationInput } from './src/lib/proposals/reconstruct-calculation-input';
import { calculateFinancialProjections } from './src/lib/engine';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

async function main() {
    const proposalId = 'b52be42f-71da-4d5e-8147-363259273f7b';

    console.log(`Fetching proposal ${proposalId}...`);
    const proposal = await prisma.leaseProposal.findUnique({
        where: { id: proposalId },
        include: { assets: true },
    });

    if (!proposal) {
        console.error('Proposal not found');
        return;
    }

    console.log('Reconstructing input...');
    const input = await reconstructCalculationInput(proposal);

    console.log('Running calculation...');
    const result = await calculateFinancialProjections(input);

    // Check 2028 values
    const p2028 = result.periods.find(p => p.year === 2028);
    if (p2028) {
        console.log('--- 2028 Results ---');
        console.log('Revenue:', p2028.profitLoss.totalRevenue.toString());
        console.log('  Tuition French:', p2028.profitLoss.tuitionRevenue.toString());
        console.log('  Other Income:', p2028.profitLoss.otherRevenue.toString());
        console.log('Expenses:', p2028.profitLoss.totalOpex.toString());
        console.log('  Rent:', p2028.profitLoss.rentExpense.toString());
        console.log('  Other OpEx:', p2028.profitLoss.otherOpex.toString());
        console.log('Depreciation:', p2028.profitLoss.depreciation.toString());
    } else {
        console.error('Year 2028 not found in results');
    }

    console.log('Updating database...');
    // Serialize results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug/utility file, using any for serialization
    const serializeObject = (obj: any): any => {
        if (obj instanceof Decimal) return obj.toString();
        if (Array.isArray(obj)) return obj.map(serializeObject);
        if (obj !== null && typeof obj === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug/utility file, using any for serialization
            const serialized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                serialized[key] = serializeObject(value);
            }
            return serialized;
        }
        return obj;
    };

    const serializedResult = {
        periods: result.periods.map(p => ({
            ...p,
            profitLoss: serializeObject(p.profitLoss),
            balanceSheet: serializeObject(p.balanceSheet),
            cashFlow: serializeObject(p.cashFlow),
        })),
        metrics: serializeObject(result.metrics),
        validation: serializeObject(result.validation),
        performance: result.performance,
        calculatedAt: result.calculatedAt.toISOString(),
    };

    await prisma.leaseProposal.update({
        where: { id: proposalId },
        data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug/utility file, using any for serialized data
            financials: serializedResult.periods as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug/utility file, using any for serialized data
            metrics: serializedResult.metrics as any,
            calculatedAt: new Date(),
        },
    });

    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
