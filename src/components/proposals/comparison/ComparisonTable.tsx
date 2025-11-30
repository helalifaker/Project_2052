"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatMillions } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";
import { Check, TrendingDown, TrendingUp } from "lucide-react";

export type ProposalSummary = {
    id: string;
    name: string;
    developer: string | null;
    rentModel: string;
    contractPeriodYears?: number; // 25 or 30
    metrics?: {
        totalRent?: number;
        npv?: number;
        totalEbitda?: number;
        finalCash?: number;
    };
};

interface ComparisonTableProps {
    proposals: ProposalSummary[];
    deltaMode: boolean;
}

export function ComparisonTable({ proposals, deltaMode }: ComparisonTableProps) {
    if (proposals.length === 0) return null;

    const baseline = proposals[0];

    // Detect period mismatches
    const baselinePeriod = baseline.contractPeriodYears || 30;
    const hasPeriodMismatch = proposals.some(
        (p) => (p.contractPeriodYears || 30) !== baselinePeriod
    );

    // Helper to get values and determine winner
    const getRowData = (
        key: keyof NonNullable<ProposalSummary["metrics"]>,
        direction: "high" | "low" // high is better (NPV) or low is better (Rent)
    ) => {
        const values = proposals.map((p) => p.metrics?.[key] ?? 0);
        const bestValue = direction === "high" ? Math.max(...values) : Math.min(...values);

        return proposals.map((p, index) => {
            const val = p.metrics?.[key] ?? 0;
            const isBaseline = index === 0;
            const isWinner = val === bestValue;

            let displayValue = "";
            let isPositive = false; // for delta coloring

            if (deltaMode && !isBaseline) {
                const baselineVal = baseline.metrics?.[key] ?? 0;
                const diff = val - baselineVal;
                displayValue = (diff > 0 ? "+" : "") + formatMillions(diff);
                isPositive = diff > 0;
            } else {
                displayValue = formatMillions(val);
            }

            return {
                value: val,
                displayValue,
                isWinner,
                isPositive, // used for delta color
                isBaseline
            };
        });
    };

    const rentData = getRowData("totalRent", "low");
    const npvData = getRowData("npv", "high");
    const ebitdaData = getRowData("totalEbitda", "high");
    const cashData = getRowData("finalCash", "high");

    const renderCell = (
        data: { value: number; displayValue: string; isWinner: boolean; isPositive: boolean; isBaseline: boolean },
        inverseColor: boolean = false // if true, positive delta is BAD (e.g. higher rent)
    ) => {
        if (deltaMode && !data.isBaseline) {
            // Delta Styling
            const isGood = inverseColor ? !data.isPositive : data.isPositive;
            const colorClass = isGood ? "text-emerald-400" : "text-red-400";
            return <span className={cn("font-mono font-bold", colorClass)}>{data.displayValue}</span>;
        }

        // Normal Styling
        return (
            <div className="flex items-center gap-2">
                <span className={cn("font-mono", data.isWinner && "text-emerald-400 font-bold")}>
                    {data.displayValue}
                </span>
                {data.isWinner && !deltaMode && (
                    <Check className="h-3 w-3 text-emerald-400" />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Period Mismatch Warning */}
            {hasPeriodMismatch && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div className="space-y-1 flex-1">
                            <p className="text-sm font-semibold text-amber-200">
                                Mixed Contract Periods Detected
                            </p>
                            <p className="text-sm text-amber-100/80">
                                You are comparing proposals with different contract periods ({proposals.map(p => p.contractPeriodYears || 30).filter((v, i, a) => a.indexOf(v) === i).join(' vs ')} years).
                                Cumulative metrics (Total Rent, Total EBITDA, Final Cash) are not directly comparable across different time horizons.
                                Consider comparing proposals with the same contract period for accurate analysis.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-md border border-white/10 bg-slate-950/50 backdrop-blur">
                <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="w-[200px]">Metric</TableHead>
                        {proposals.map((p, i) => (
                            <TableHead key={p.id} className={cn("min-w-[150px]", i === 0 && "text-primary font-bold")}>
                                <div className="flex flex-col space-y-1">
                                    <span>{p.name}</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {i === 0 ? "(Baseline)" : p.rentModel}
                                    </span>
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Total Rent (Lower is better) */}
                    <TableRow className="hover:bg-slate-900/50 border-white/5">
                        <TableCell className="font-medium text-muted-foreground">
                            Total Rent ({baselinePeriod}Y)
                        </TableCell>
                        {rentData.map((d, i) => (
                            <TableCell key={i}>{renderCell(d, true)}</TableCell>
                        ))}
                    </TableRow>

                    {/* NPV (Higher is better) */}
                    <TableRow className="hover:bg-slate-900/50 border-white/5">
                        <TableCell className="font-medium text-muted-foreground">NPV</TableCell>
                        {npvData.map((d, i) => (
                            <TableCell key={i}>{renderCell(d, false)}</TableCell>
                        ))}
                    </TableRow>

                    {/* EBITDA (Higher is better) */}
                    <TableRow className="hover:bg-slate-900/50 border-white/5">
                        <TableCell className="font-medium text-muted-foreground">Total EBITDA</TableCell>
                        {ebitdaData.map((d, i) => (
                            <TableCell key={i}>{renderCell(d, false)}</TableCell>
                        ))}
                    </TableRow>

                    {/* Final Cash (Higher is better) */}
                    <TableRow className="hover:bg-slate-900/50 border-white/5">
                        <TableCell className="font-medium text-muted-foreground">Final Cash</TableCell>
                        {cashData.map((d, i) => (
                            <TableCell key={i}>{renderCell(d, false)}</TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
            </div>
        </div>
    );
}
