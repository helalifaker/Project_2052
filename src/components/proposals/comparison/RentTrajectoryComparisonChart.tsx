"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
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
 * Rent Trajectory Comparison Chart
 *
 * Displays rent trajectory for multiple proposals over 30 years
 *
 * Features:
 * - Multiple proposals on one line chart (up to 5)
 * - Different colors for each proposal
 * - Winner highlighted with thicker line
 * - X-axis: Years (1-30)
 * - Y-axis: Rent in Millions (M)
 * - Interactive legend
 * - Responsive design
 */

export interface ProposalData {
  id: string;
  name: string;
  developer?: string;
  rentModel: string;
  financials: {
    years: Array<{
      year: number;
      rent: number;
    }>;
  };
  metrics?: {
    totalRent?: number;
    npv?: number;
  };
}

interface RentTrajectoryComparisonChartProps {
  proposals: ProposalData[];
  winnerId?: string; // ID of the winning proposal (highlighted)
  className?: string;
}

// Color palette for proposals (max 5 colors)
const PROPOSAL_COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
];

const toNumber = (value: unknown): number => Number(value ?? 0);

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">Year {label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div
            key={String(entry.dataKey ?? entry.name ?? index)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-mono font-semibold">
              {formatMillions(toNumber(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function RentTrajectoryComparisonChart({
  proposals,
  winnerId,
  className,
}: RentTrajectoryComparisonChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];

    // Get all years (1-30)
    const years = Array.from({ length: 30 }, (_, i) => i + 1);

    // Create data points for each year
    return years.map((year) => {
      const dataPoint: any = { year };

      proposals.forEach((proposal) => {
        const yearData = proposal.financials?.years?.find(
          (y) => y.year === year + 2024, // Years stored as 2025-2054
        );
        const proposalLabel = proposal.developer || proposal.name;
        dataPoint[proposalLabel] = yearData ? yearData.rent / 1_000_000 : 0; // Convert to millions for display
      });

      return dataPoint;
    });
  }, [proposals]);

  // Get proposal labels
  const proposalLabels = useMemo(() => {
    return proposals.map((p) => p.developer || p.name);
  }, [proposals]);

  // Handle empty state
  if (!proposals || proposals.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Rent Trajectory Comparison (30 Years)
          </h3>
          <div className="h-80 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
            No proposals selected
          </div>
        </div>
      </Card>
    );
  }

  // Find winner data
  const winnerProposal = proposals.find((p) => p.id === winnerId);
  const winnerLabel = winnerProposal
    ? winnerProposal.developer || winnerProposal.name
    : null;

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Rent Trajectory Comparison (30 Years)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="year"
              label={{
                value: "Year",
                position: "insideBottom",
                offset: -5,
              }}
              className="text-xs"
            />
            <YAxis
              label={{
                value: "Rent (Millions SAR)",
                angle: -90,
                position: "insideLeft",
              }}
              className="text-xs"
              tickFormatter={(value) => `${value.toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
              formatter={(value) => {
                const isWinner = value === winnerLabel;
                return (
                  <span className={isWinner ? "font-bold" : ""}>
                    {value}
                    {isWinner && " ⭐"}
                  </span>
                );
              }}
            />
            {proposalLabels.map((label, index) => {
              const isWinner = label === winnerLabel;
              return (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stroke={PROPOSAL_COLORS[index % PROPOSAL_COLORS.length]}
                  strokeWidth={isWinner ? 3 : 2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name={label}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/**
 * Example usage:
 *
 * <RentTrajectoryComparisonChart
 *   proposals={[
 *     {
 *       id: "1",
 *       name: "Proposal A",
 *       developer: "Developer A",
 *       rentModel: "Fixed",
 *       financials: {
 *         years: [
 *           { year: 2025, rent: 5000000 },
 *           { year: 2026, rent: 5500000 },
 *           // ... more years
 *         ]
 *       },
 *       metrics: { totalRent: 150000000, npv: 50000000 }
 *     },
 *     // ... more proposals
 *   ]}
 *   winnerId="1"
 * />
 */
