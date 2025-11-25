"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatMillions } from "@/lib/utils/financial";
import { Card } from "@/components/ui/card";

/**
 * Cost Breakdown Comparison Chart
 *
 * Stacked bar chart comparing cost breakdown across proposals
 *
 * Features:
 * - Stacked bars showing: Rent, Staff Salaries, Other OpEx
 * - One bar per proposal
 * - Consistent colors for each cost category
 * - Y-axis: Total cost in Millions (M)
 * - Interactive legend
 * - Winner highlighting (border)
 * - Responsive design
 */

export interface ProposalCostData {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  financials?: {
    years: Array<{
      year: number;
      rent: number;
      staffSalaries: number;
      otherOpEx: number;
    }>;
  };
  metrics?: {
    totalRent?: number;
  };
}

interface CostBreakdownComparisonChartProps {
  proposals: ProposalCostData[];
  winnerId?: string; // ID of the winning proposal (highlighted)
  className?: string;
}

// Consistent colors for cost categories
const COST_COLORS = {
  rent: "#3b82f6", // blue-500 - Primary cost
  staffSalaries: "#10b981", // green-500 - Staff costs
  otherOpEx: "#f59e0b", // amber-500 - Other operating expenses
};

// Custom tooltip component
const toNumber = (value: unknown): number => Number(value ?? 0);

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Calculate total
  const total = payload.reduce((sum, entry) => sum + toNumber(entry.value), 0);

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div
            key={String(entry.dataKey ?? entry.name ?? index)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-mono font-semibold">
              {formatMillions(toNumber(entry.value) * 1_000_000)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t mt-2">
          <span className="font-semibold">Total:</span>
          <span className="font-mono font-bold">
            {formatMillions(total * 1_000_000)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function CostBreakdownComparisonChart({
  proposals,
  winnerId,
  className,
}: CostBreakdownComparisonChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];

    return proposals.map((proposal) => {
      const proposalLabel = proposal.developer || proposal.name;

      // Calculate totals across all 30 years
      let totalRent = 0;
      let totalStaffSalaries = 0;
      let totalOtherOpEx = 0;

      if (proposal.financials?.years) {
        proposal.financials.years.forEach((yearData) => {
          totalRent += yearData.rent || 0;
          totalStaffSalaries += yearData.staffSalaries || 0;
          totalOtherOpEx += yearData.otherOpEx || 0;
        });
      }

      return {
        name: proposalLabel,
        proposalId: proposal.id,
        rentModel: proposal.rentModel,
        // Convert to millions for display
        Rent: totalRent / 1_000_000,
        "Staff Salaries": totalStaffSalaries / 1_000_000,
        "Other OpEx": totalOtherOpEx / 1_000_000,
        total: (totalRent + totalStaffSalaries + totalOtherOpEx) / 1_000_000,
      };
    });
  }, [proposals]);

  // Handle empty state
  if (!proposals || proposals.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Cost Breakdown Comparison (30 Years Total)
          </h3>
          <div className="h-80 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
            No proposals selected
          </div>
        </div>
      </Card>
    );
  }

  // Find winner
  const winnerProposal = proposals.find((p) => p.id === winnerId);
  const winnerLabel = winnerProposal
    ? winnerProposal.developer || winnerProposal.name
    : null;

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Cost Breakdown Comparison (30 Years Total)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total costs broken down by category: Rent, Staff Salaries, and Other
            Operating Expenses
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              className="text-xs"
              tick={(props) => {
                const { x, y, payload } = props;
                const isWinner = payload.value === winnerLabel;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={16}
                    textAnchor="end"
                    fill={isWinner ? "#000" : "#666"}
                    fontWeight={isWinner ? "bold" : "normal"}
                    fontSize={12}
                    transform={`rotate(-45, ${x}, ${y})`}
                  >
                    {payload.value}
                    {isWinner && " ⭐"}
                  </text>
                );
              }}
            />
            <YAxis
              label={{
                value: "Total Cost (Millions SAR)",
                angle: -90,
                position: "insideLeft",
              }}
              className="text-xs"
              tickFormatter={(value) => `${value.toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="square" />
            <Bar
              dataKey="Rent"
              stackId="cost"
              fill={COST_COLORS.rent}
              name="Rent"
            />
            <Bar
              dataKey="Staff Salaries"
              stackId="cost"
              fill={COST_COLORS.staffSalaries}
              name="Staff Salaries"
            />
            <Bar
              dataKey="Other OpEx"
              stackId="cost"
              fill={COST_COLORS.otherOpEx}
              name="Other OpEx"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-semibold">Proposal</th>
                <th className="pb-2 font-semibold text-right">Rent</th>
                <th className="pb-2 font-semibold text-right">
                  Staff Salaries
                </th>
                <th className="pb-2 font-semibold text-right">Other OpEx</th>
                <th className="pb-2 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((data) => {
                const isWinner = data.name === winnerLabel;
                return (
                  <tr
                    key={data.proposalId}
                    className={`border-b ${isWinner ? "bg-muted/50 font-semibold" : ""}`}
                  >
                    <td className="py-2">
                      {data.name}
                      {isWinner && " ⭐"}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {formatMillions(data.Rent * 1_000_000)}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {formatMillions(data["Staff Salaries"] * 1_000_000)}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {formatMillions(data["Other OpEx"] * 1_000_000)}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold">
                      {formatMillions(data.total * 1_000_000)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

/**
 * Example usage:
 *
 * <CostBreakdownComparisonChart
 *   proposals={[
 *     {
 *       id: "1",
 *       name: "Proposal A",
 *       developer: "Developer A",
 *       rentModel: "Fixed",
 *       financials: {
 *         years: [
 *           { year: 2025, rent: 5000000, staffSalaries: 2000000, otherOpEx: 1000000 },
 *           { year: 2026, rent: 5500000, staffSalaries: 2100000, otherOpEx: 1050000 },
 *           // ... more years
 *         ]
 *       }
 *     },
 *     // ... more proposals
 *   ]}
 *   winnerId="1"
 * />
 */
