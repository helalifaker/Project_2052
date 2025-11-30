import { prisma } from "../src/lib/prisma";
import { calculateFinancialProjections } from "../src/lib/engine";
import {
  reconstructCalculationInput,
  type ProposalRecord,
} from "../src/lib/proposals/reconstruct-calculation-input";
import Decimal from "decimal.js";

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

async function debug() {
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: "b52be42f-71da-4d5e-8147-363259273f7b" },
    include: { assets: true },
  });

  const input = await reconstructCalculationInput(proposal as ProposalRecord);
  const result = await calculateFinancialProjections(input);
  const year2028 = result.periods.find((p) => p.year === 2028);

  console.log("\n=== Before Serialization ===");
  console.log("otherOpex:", year2028?.profitLoss.otherOpex.toString());
  console.log("rentExpense:", year2028?.profitLoss.rentExpense.toString());

  // Serialize it using same method as recalculate-single-proposal.ts
  const serializedPeriods = result.periods.map((period) => ({
    ...period,
    profitLoss: serializeObject(period.profitLoss),
    balanceSheet: serializeObject(period.balanceSheet),
    cashFlow: serializeObject(period.cashFlow),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug file, using any for serialized data
  const serialized2028 = serializedPeriods.find((p: any) => p.year === 2028);
  console.log("\n=== After Full Serialization ===");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug file, using any for serialized data
  console.log("otherOpex:", (serialized2028 as any)?.profitLoss?.otherOpex);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Debug file, using any for serialized data
  console.log("rentExpense:", (serialized2028 as any)?.profitLoss?.rentExpense);

  // Check if there are other properties on the period
  console.log("\n=== Period keys ===");
  console.log(Object.keys(year2028 || {}));
}

debug().catch(console.error);
