"use client";

import { Card } from "@/components/ui/card";
import { BaseLineChart } from "@/components/charts/BaseLineChart";
import { getProposalColor } from "@/lib/design-tokens/chart-colors";
import { formatMillions } from "@/lib/utils/financial";
import type { TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

interface RentTrajectoryData {
  proposalId: string;
  proposalName: string;
  developer: string;
  rentModel: string;
  data: Array<{ year: number; rent: number }>;
  isWinner: boolean;
}

interface RentTrajectoryChartProps {
  data: RentTrajectoryData[];
}

type ChartPoint = {
  year: number;
} & Record<string, number>;

type TooltipLookup = Record<
  string,
  { proposalName: string; isWinner: boolean }
>;

const RentTrajectoryTooltip = ({
  active,
  payload,
  label,
  proposalLookup,
}: TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
  proposalLookup: TooltipLookup;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl border p-3 shadow-floating"
      style={{
        backgroundColor: "hsl(var(--color-background))",
        borderColor: "hsl(24 6% 83%)",
        minWidth: "180px",
      }}
    >
      {/* Label */}
      <div className="text-xs uppercase tracking-wider font-semibold mb-2 pb-2 border-b border-border">
        Year {label}
      </div>

      {/* Values */}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const lookup = entry.dataKey
            ? proposalLookup[entry.dataKey.toString()]
            : undefined;

          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? index)}
              className="flex items-center justify-between gap-3"
            >
              {/* Name with color indicator */}
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {lookup?.proposalName ?? entry.name}
                  {lookup?.isWinner && " ★"}
                </span>
              </div>

              {/* Value */}
              <span className="font-semibold tabular-nums text-xs">
                SAR {formatMillions(Number(entry.value ?? 0) * 1_000_000)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Chart 1: Rent Trajectory
 *
 * Line chart showing rent over 30 years for all proposals
 * Winner highlighted with thicker line
 */
export function RentTrajectoryChart({ data }: RentTrajectoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Rent Trajectory Over Time
        </h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No rent data available</p>
        </div>
      </Card>
    );
  }

  // Transform data for recharts
  // Get all unique years
  const allYears = Array.from(
    new Set(data.flatMap((p) => p.data.map((d) => d.year))),
  ).sort((a, b) => a - b);

  // Sample every 2 years for better readability
  const sampledYears = allYears.filter((_, idx) => idx % 2 === 0);

  // Create chart data
  const chartData: ChartPoint[] = sampledYears.map((year) => {
    const point: ChartPoint = { year };
    data.forEach((proposal) => {
      const yearData = proposal.data.find((d) => d.year === year);
      if (yearData) {
        point[proposal.proposalId] = yearData.rent / 1_000_000; // Convert to millions
      }
    });
    return point;
  });

  const proposalLookup: TooltipLookup = data.reduce((acc, proposal) => {
    acc[proposal.proposalId] = {
      proposalName: proposal.proposalName,
      isWinner: proposal.isWinner,
    };
    return acc;
  }, {} as TooltipLookup);

  // Prepare series configuration for BaseLineChart
  const series = data.map((proposal, index) => ({
    dataKey: proposal.proposalId,
    name: proposal.proposalName,
    color: getProposalColor(index),
    strokeWidth: proposal.isWinner ? 3 : 2,
  }));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        <BaseLineChart
          data={chartData}
          series={series}
          xAxisKey="year"
          yAxisFormatter={(value) => `${value.toFixed(1)}M`}
          tooltipContent={
            <RentTrajectoryTooltip proposalLookup={proposalLookup} />
          }
          showLegend={false} // Using custom legend below
          height={300}
        />
      </div>

      {/* Custom Legend with Rent Model and Winner indicator */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-border shrink-0">
        {data.map((proposal, index) => (
          <div key={proposal.proposalId} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getProposalColor(index) }}
            />
            <span className="text-sm">
              {proposal.proposalName} ({proposal.rentModel})
            </span>
            {proposal.isWinner && (
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: "hsl(var(--color-financial-positive))",
                  color: "white",
                }}
              >
                Winner
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
