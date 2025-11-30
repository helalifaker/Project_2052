
import { describe, it, expect } from 'vitest';
import { calculateProfitLoss } from './periods/dynamic';
import { Decimal } from 'decimal.js';
import {
    SystemConfiguration,
    WorkingCapitalRatios,
    DynamicPeriodInput,
    RentModel,
    DepreciationMethod
} from './core/types';

describe('Dynamic Period Reproduction', () => {
    it('should calculate revenue correctly for 1900 students and 40k fee', () => {
        const year = 2028;
        const input: DynamicPeriodInput = {
            year,
            enrollment: {
                rampUpEnabled: false,
                rampUpStartYear: 2028,
                rampUpEndYear: 2028,
                rampUpTargetStudents: 1900,
                steadyStateStudents: 1900,
            },
            curriculum: {
                ibProgramEnabled: false,
                nationalCurriculumFee: new Decimal(40000),
                nationalTuitionGrowthRate: new Decimal(0),
                nationalTuitionGrowthFrequency: 1,
            },
            staff: {
                fixedStaffCost: new Decimal(0),
                variableStaffCostPerStudent: new Decimal(0),
            },
            rentModel: 'FIXED_ESCALATION',
            rentParams: {
                baseRent: new Decimal(1000000),
                growthRate: new Decimal(0),
                frequency: 1,
            },
            otherOpexPercent: new Decimal(0.006265664160401004), // 500,000 / 79,800,000 ≈ 0.6266% (calculated from total revenue including other revenue)
            capexConfig: {
                categories: [
                    {
                        id: "cat-building",
                        type: "BUILDING",
                        name: "Building",
                        usefulLife: 20,
                    },
                ],
                historicalState: {
                    grossPPE2024: new Decimal(0),
                    accumulatedDepreciation2024: new Decimal(0),
                    annualDepreciation: new Decimal(0),
                    remainingToDepreciate: new Decimal(0),
                },
                transitionCapex: [],
                virtualAssets: [],
            },
        };

        const systemConfig: SystemConfiguration = {
            zakatRate: new Decimal(0.025),
            debtInterestRate: new Decimal(0.05),
            depositInterestRate: new Decimal(0.03),
            minCashBalance: new Decimal(1000000),
        };

        const workingCapitalRatios: WorkingCapitalRatios = {
            arPercent: new Decimal(0),
            prepaidPercent: new Decimal(0),
            apPercent: new Decimal(0),
            accruedPercent: new Decimal(0),
            deferredRevenuePercent: new Decimal(0),
            otherRevenueRatio: new Decimal(0.05), // 5% other income
            locked: false,
            calculatedFrom2024: true,
        };

        const pl = calculateProfitLoss(
            year,
            input,
            systemConfig,
            workingCapitalRatios,
            new Decimal(0), // priorDebt
            new Decimal(0), // priorCash
            new Decimal(0)  // zakatExpense (not relevant for this test)
        );

        console.log('Tuition Revenue:', pl.tuitionRevenue.toString());
        console.log('Total Revenue:', pl.totalRevenue.toString());
        console.log('Rent Expense:', pl.rentExpense.toString());
        console.log('Other OpEx:', pl.otherOpex.toString());

        // Expected: 1900 * 40000 = 76,000,000
        expect(pl.tuitionRevenue.toNumber()).toBe(76000000);

        // Expected Rent: 1,000,000
        expect(pl.rentExpense.toNumber()).toBe(1000000);

        // Expected Other OpEx: calculated as percentage of total revenue
        // Total revenue = 76,000,000 (tuition) + 3,800,000 (other @ 5%) = 79,800,000
        // Other OpEx = 79,800,000 * 0.006265664 ≈ 500,000
        expect(pl.otherOpex.toNumber()).toBeCloseTo(500000, -2);
    });
});
