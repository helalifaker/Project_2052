"use client";

import { Card } from "@/components/ui/card";
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
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">Year {label}</p>
        {payload.map((entry, index) => {
          const lookup = entry.dataKey
            ? proposalLookup[entry.dataKey.toString()]
            : undefined;
          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? index)}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">
                {lookup?.proposalName ?? entry.name}:
              </span>
              <span>
                {formatMillions(Number(entry.value ?? 0) * 1_000_000)}
              </span>
              {lookup?.isWinner && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Winner
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
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

  // Colors for different proposals
  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
  ];

  const proposalLookup: TooltipLookup = data.reduce((acc, proposal) => {
    acc[proposal.proposalId] = {
      proposalName: proposal.proposalName,
      isWinner: proposal.isWinner,
    };
    return acc;
  }, {} as TooltipLookup);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Rent Trajectory Over Time</h3>
          <p className="text-sm text-muted-foreground">
            Annual rent expense comparison across all proposals (30 years)
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                label={{ value: "Year", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis
                label={{
                  value: "Rent (Millions SAR)",
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-xs"
                tickFormatter={(value) => `${value.toFixed(1)}M`}
              />
              <Tooltip
                content={
                  <RentTrajectoryTooltip proposalLookup={proposalLookup} />
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => {
                  const proposal = data.find((p) => p.proposalId === value);
                  return proposal
                    ? `${proposal.proposalName}${proposal.isWinner ? " (Winner)" : ""}`
                    : value;
                }}
              />
              {data.map((proposal, index) => (
                <Line
                  key={proposal.proposalId}
                  type="monotone"
                  dataKey={proposal.proposalId}
                  stroke={colors[index % colors.length]}
                  strokeWidth={proposal.isWinner ? 3 : 2}
                  dot={false}
                  name={proposal.proposalId}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with Winner indicator */}
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          {data.map((proposal, index) => (
            <div key={proposal.proposalId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm">
                {proposal.proposalName} ({proposal.rentModel})
              </span>
              {proposal.isWinner && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                  Winner
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
