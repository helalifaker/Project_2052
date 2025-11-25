/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "dotenv";
config({ path: ".env.local" });

type Proposal = {
  id: string;
  name: string;
  developer: string | null;
  rentModel: string;
  metrics: unknown;
  financials: unknown;
};

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value !== null && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeFinancials = (financials: unknown) => {
  if (!Array.isArray(financials)) return [] as any[];
  return financials
    .map((p) => (typeof p === "object" && p !== null ? (p as any) : null))
    .filter((p): p is Record<string, unknown> => p !== null)
    .map((period) => ({
      year:
        typeof period.year === "number"
          ? period.year
          : parseNumber(period.year),
      profitLoss:
        period.profitLoss && typeof period.profitLoss === "object"
          ? (period.profitLoss as Record<string, unknown>)
          : undefined,
      cashFlow:
        period.cashFlow && typeof period.cashFlow === "object"
          ? (period.cashFlow as Record<string, unknown>)
          : undefined,
    }));
};

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  console.log("DATABASE_URL", process.env.DATABASE_URL?.slice(0, 30));
  const proposals = (await prisma.leaseProposal.findMany({
    where: { calculatedAt: { not: null } },
    select: {
      id: true,
      name: true,
      developer: true,
      rentModel: true,
      metrics: true,
      financials: true,
    },
  })) as Proposal[];
  console.log("Proposals", proposals.length);
  if (!proposals.length) return;
  let totalNPV = 0;
  let npvCount = 0;
  proposals.forEach((p) => {
    const metrics = p.metrics as Record<string, unknown> | null;
    if (!metrics) return;
    const npv = parseNumber(metrics.npv);
    if (npv) {
      totalNPV += npv;
      npvCount++;
    }
    const fin = normalizeFinancials(p.financials);
    if (fin.length === 0) console.log("empty financials for", p.id, p.name);
  });
  console.log("Avg NPV", npvCount ? totalNPV / npvCount : 0);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
});
/* eslint-disable @typescript-eslint/no-explicit-any */
