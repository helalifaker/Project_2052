"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { getProposalColor } from "@/lib/design-tokens/chart-colors";
import { getAxisProps, chartAnimation } from "@/lib/design-tokens/chart-config";

interface RentTrajectoryData {
  proposalId: string;
  proposalName: string;
  developer: string;
  rentModel: string;
  data: Array<{ year: number; rent: number }>;
  isWinner: boolean;
}

interface ExecutiveRentChartProps {
  data: RentTrajectoryData[];
}

type ChartPoint = {
  year: number;
} & Record<string, number>;

type ProposalLookup = Record<
  string,
  { proposalName: string; rentModel: string; isWinner: boolean; color: string }
>;

/**
 * Premium Tooltip
 *
 * Styled per finance-frontend-designer skill:
 * - Rounded corners, subtle shadow
 * - Uppercase label
 * - Tabular figures for values
 */
const ExecutiveTooltip = ({
  active,
  payload,
  label,
  lookup,
}: TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
  lookup: ProposalLookup;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="px-4 py-3 rounded-xl shadow-2xl border"
      style={{
        background: "var(--executive-card)",
        borderColor: "var(--executive-border)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.15em] mb-3"
        style={{ color: "var(--executive-text-secondary)" }}
      >
        Year {label}
      </p>
      <div className="space-y-2">
        {payload
          .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
          .map((entry, index) => {
            const info = entry.dataKey
              ? lookup[entry.dataKey.toString()]
              : undefined;

            return (
              <div
                key={String(entry.dataKey ?? entry.name ?? index)}
                className="flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: info?.color || entry.color }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--executive-text-secondary)" }}
                  >
                    {info?.proposalName ?? entry.name}
                  </span>
                  {info?.isWinner && (
                    <span
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--executive-accent-subtle)",
                        color: "var(--executive-accent)",
                      }}
                    >
                      Winner
                    </span>
                  )}
                </div>
                <span
                  className="text-sm font-medium tabular-nums"
                  style={{ color: "var(--executive-text)" }}
                >
                  {formatSAR(Number(entry.value ?? 0) * 1_000_000)}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

/**
 * Format SAR with compact notation
 */
const formatSAR = (value: number): string => {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Executive Rent Trajectory Chart
 *
 * Premium visualization following finance-frontend-designer skill:
 * - No gridlines (data speaks for itself)
 * - Gradient fills for area emphasis
 * - Whisper-quiet axes
 * - Integrated legend
 * - Smooth animations
 */
export function ExecutiveRentChart({ data }: ExecutiveRentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="executive-chart-container">
        <h3 className="executive-chart-title">Rent Trajectory</h3>
        <p className="executive-chart-subtitle">Annual rent expense over 30 years</p>
        <div
          className="h-[400px] flex items-center justify-center"
          style={{ color: "var(--executive-text-tertiary)" }}
        >
          <p>No rent data available</p>
        </div>
      </div>
    );
  }

  // Transform data for recharts
  const allYears = Array.from(
    new Set(data.flatMap((p) => p.data.map((d) => d.year)))
  ).sort((a, b) => a - b);

  // Sample every 2 years for cleaner visualization
  const sampledYears = allYears.filter((_, idx) => idx % 2 === 0);

  const chartData: ChartPoint[] = sampledYears.map((year) => {
    const point: ChartPoint = { year };
    data.forEach((proposal) => {
      const yearData = proposal.data.find((d) => d.year === year);
      if (yearData) {
        point[proposal.proposalId] = yearData.rent / 1_000_000;
      }
    });
    return point;
  });

  // Build lookup with colors from design tokens
  const proposalLookup: ProposalLookup = {};
  data.forEach((proposal, index) => {
    proposalLookup[proposal.proposalId] = {
      proposalName: proposal.proposalName,
      rentModel: proposal.rentModel,
      isWinner: proposal.isWinner,
      color: getProposalColor(index),
    };
  });

  // Sort proposals so winner is rendered last (on top)
  const sortedData = [...data].sort((a, b) =>
    a.isWinner ? 1 : b.isWinner ? -1 : 0
  );

  return (
    <div className="executive-chart-container">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="executive-chart-title">Rent Trajectory</h3>
          <p className="text-sm" style={{ color: "var(--executive-text-secondary)" }}>
            Annual rent expense comparison across proposals
          </p>
        </div>

        {/* Period badge */}
        <div
          className="px-3 py-1.5 rounded-full text-xs"
          style={{
            background: "var(--executive-accent-subtle)",
            color: "var(--executive-accent)",
          }}
        >
          30-Year Projection
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            {/* Gradient definitions */}
            <defs>
              {sortedData.map((proposal, _index) => {
                const color = getProposalColor(data.indexOf(proposal));
                return (
                  <linearGradient
                    key={proposal.proposalId}
                    id={`gradient-${proposal.proposalId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={color}
                      stopOpacity={proposal.isWinner ? 0.3 : 0.15}
                    />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* No CartesianGrid - data speaks for itself */}

            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--executive-text-tertiary)",
                fontSize: 11,
              }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--executive-text-tertiary)",
                fontSize: 11,
              }}
              tickFormatter={(value) => `${value.toFixed(0)}M`}
              dx={-10}
              width={50}
            />

            <Tooltip
              content={<ExecutiveTooltip lookup={proposalLookup} />}
              cursor={{
                stroke: "var(--executive-accent)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.5,
              }}
            />

            {/* Areas - rendered in order so winner is on top */}
            {sortedData.map((proposal) => {
              const color = getProposalColor(data.indexOf(proposal));
              return (
                <Area
                  key={proposal.proposalId}
                  type="monotone"
                  dataKey={proposal.proposalId}
                  stroke={color}
                  strokeWidth={proposal.isWinner ? 2.5 : 1.5}
                  fill={`url(#gradient-${proposal.proposalId})`}
                  animationDuration={chartAnimation.duration}
                  animationEasing={chartAnimation.easing}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Integrated Legend */}
      <div
        className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t"
        style={{ borderColor: "var(--executive-border)" }}
      >
        {data.map((proposal, index) => {
          const color = getProposalColor(index);
          return (
            <div key={proposal.proposalId} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--executive-text)" }}
                >
                  {proposal.proposalName}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--executive-text-tertiary)" }}
                >
                  {proposal.rentModel.replace(/_/g, " ")}
                </span>
                {proposal.isWinner && (
                  <span
                    className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "var(--executive-accent-muted)",
                      color: "var(--executive-accent)",
                    }}
                  >
                    Winner
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
