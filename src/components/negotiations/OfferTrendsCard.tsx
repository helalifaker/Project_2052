"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { chartColors } from "@/lib/design-tokens/chart-colors";
import { chartAnimation } from "@/lib/design-tokens/chart-config";
import { formatMillions } from "@/lib/utils/financial";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type ProposalOrigin = "OUR_OFFER" | "THEIR_COUNTER";

/**
 * Offer data with metrics for trend analysis
 */
export interface OfferTrendData {
  id: string;
  name: string;
  offerNumber: number;
  origin: ProposalOrigin;
  metrics: {
    totalRent?: number | string;
    contractRentNPV?: number | string;
    totalEbitda?: number | string;
    finalCash?: number | string;
    contractNAV?: number | string;
  } | null;
}

/**
 * Metric configuration for the trends display
 */
interface TrendMetric {
  key: keyof NonNullable<OfferTrendData["metrics"]>;
  label: string;
  shortLabel: string;
  direction: "high" | "low";
  color: string;
}

/**
 * Chart group configuration
 */
interface ChartGroup {
  title: string;
  direction: "high" | "low";
  metrics: { key: string; label: string; color: string }[];
}

/**
 * OfferTrendsCard Props
 */
export interface OfferTrendsCardProps {
  offers: OfferTrendData[];
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * The 5 key metrics to track in offer trends
 */
const TREND_METRICS: TrendMetric[] = [
  {
    key: "totalRent",
    label: "Total Rent",
    shortLabel: "Total",
    direction: "low",
    color: chartColors.negative,
  },
  {
    key: "contractRentNPV",
    label: "NPV Rent",
    shortLabel: "NPV",
    direction: "low",
    color: chartColors.warning,
  },
  {
    key: "totalEbitda",
    label: "EBITDA",
    shortLabel: "EBITDA",
    direction: "high",
    color: chartColors.positive,
  },
  {
    key: "finalCash",
    label: "Cash Flow",
    shortLabel: "Cash",
    direction: "high",
    color: chartColors.proposalB,
  },
  {
    key: "contractNAV",
    label: "NAV",
    shortLabel: "NAV",
    direction: "high",
    color: chartColors.proposalA,
  },
];

/**
 * Chart groups for the 3 mini-charts
 */
const CHART_GROUPS: ChartGroup[] = [
  {
    title: "Rent",
    direction: "low",
    metrics: [
      { key: "totalRent", label: "Total", color: chartColors.negative },
      { key: "contractRentNPV", label: "NPV", color: chartColors.warning },
    ],
  },
  {
    title: "EBITDA",
    direction: "high",
    metrics: [
      { key: "totalEbitda", label: "EBITDA", color: chartColors.positive },
    ],
  },
  {
    title: "NAV",
    direction: "high",
    metrics: [
      { key: "contractNAV", label: "NAV", color: chartColors.proposalA },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely parse a metric value to a number.
 */
function parseMetricValue(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

/**
 * Sort and filter offers for trend analysis
 */
function prepareOfferData(offers: OfferTrendData[]): OfferTrendData[] {
  return offers
    .filter((o) => o.offerNumber != null && o.metrics != null)
    .sort((a, b) => a.offerNumber - b.offerNumber);
}

/**
 * Transform offers into chart-ready data format
 * Note: NPV Rent is stored as negative (cash outflow), but we display as positive for consistency
 */
function transformToChartData(
  offers: OfferTrendData[],
  metrics: TrendMetric[],
): Record<string, unknown>[] {
  return offers.map((offer) => {
    const dataPoint: Record<string, unknown> = {
      offerNumber: offer.offerNumber,
      offerLabel: `#${offer.offerNumber}`,
      origin: offer.origin,
    };

    metrics.forEach((metric) => {
      let value = parseMetricValue(offer.metrics?.[metric.key]);

      // For rent metrics (direction: 'low'), ensure positive values for chart display
      // NPV Rent is stored as negative (outflow), so we take absolute value
      if (metric.direction === "low") {
        value = Math.abs(value);
      }

      dataPoint[metric.key] = value;
    });

    return dataPoint;
  });
}

interface DeltaResult {
  value: number;
  delta: number;
  deltaPercent: number;
  isPositive: boolean;
  isImproved: boolean;
}

/**
 * Calculate delta between two values
 */
function calculateDelta(
  current: number,
  previous: number,
  direction: "high" | "low",
): DeltaResult {
  const delta = current - previous;
  const deltaPercent = previous !== 0 ? (delta / Math.abs(previous)) * 100 : 0;
  const isPositive = delta > 0;
  const isImproved =
    direction === "high" ? isPositive : !isPositive && delta !== 0;

  return { value: current, delta, deltaPercent, isPositive, isImproved };
}

/**
 * Format delta value with sign and color class
 */
function formatDelta(
  delta: number,
  isImproved: boolean,
): {
  text: string;
  colorClass: string;
} {
  const absValue = Math.abs(delta);
  const formatted = formatMillions(absValue);
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";

  return {
    text: `${sign}${formatted}M`,
    colorClass:
      delta === 0
        ? "text-muted-foreground"
        : isImproved
          ? "text-[var(--atelier-ink-positive)]"
          : "text-[var(--atelier-ink-negative)]",
  };
}

/**
 * Format Y-axis value in millions
 */
function formatYAxis(value: number): string {
  const millions = value / 1_000_000;
  if (Math.abs(millions) >= 1000) {
    return `${(millions / 1000).toFixed(0)}B`;
  }
  return `${millions.toFixed(0)}M`;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Overall trend indicator showing improvement direction
 */
function TrendIndicator({
  isImproved,
  percentChange,
}: {
  isImproved: boolean | null;
  percentChange: number;
}) {
  if (percentChange === 0) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">No change</span>
      </div>
    );
  }

  const Icon = isImproved ? TrendingUp : TrendingDown;
  const colorClass = isImproved
    ? "text-[var(--atelier-ink-positive)]"
    : "text-[var(--atelier-ink-negative)]";

  return (
    <div className={cn("flex items-center gap-1.5", colorClass)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">
        {percentChange > 0 ? "+" : ""}
        {percentChange.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * Mini trend indicator for each chart
 */
function MiniTrendIndicator({
  firstValue,
  lastValue,
  direction,
}: {
  firstValue: number;
  lastValue: number;
  direction: "high" | "low";
}) {
  if (firstValue === 0) return null;

  const delta = lastValue - firstValue;
  const percentChange = (delta / Math.abs(firstValue)) * 100;
  const isImproved = direction === "high" ? delta > 0 : delta < 0;

  if (Math.abs(percentChange) < 0.1) return null;

  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  const colorClass = isImproved
    ? "text-[var(--atelier-ink-positive)]"
    : "text-[var(--atelier-ink-negative)]";

  return (
    <div className={cn("flex items-center gap-1", colorClass)}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">
        {percentChange > 0 ? "+" : ""}
        {percentChange.toFixed(0)}%
      </span>
    </div>
  );
}

/**
 * Custom tooltip for mini charts
 */
function MiniChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-popover border border-border rounded-md shadow-md p-2 text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {formatMillions(entry.value)}M
        </p>
      ))}
    </div>
  );
}

/**
 * Mini bar chart for a single metric group
 */
const MiniTrendChart = React.memo(function MiniTrendChart({
  title,
  data,
  group,
}: {
  title: string;
  data: Record<string, unknown>[];
  group: ChartGroup;
}) {
  // Calculate trend for the primary metric
  const primaryKey = group.metrics[0].key;
  const firstValue = parseMetricValue(data[0]?.[primaryKey]);
  const lastValue = parseMetricValue(data[data.length - 1]?.[primaryKey]);

  // For bar charts, we need to determine bar colors based on improvement
  const getBarColor = (value: number, index: number, metricColor: string) => {
    // Use the metric's base color with slight opacity variation for distinction
    return metricColor;
  };

  return (
    <div className="flex flex-col">
      {/* Header with title and trend */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <MiniTrendIndicator
          firstValue={firstValue}
          lastValue={lastValue}
          direction={group.direction}
        />
      </div>

      {/* Bar Chart */}
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="offerLabel"
              tick={{ fontSize: 10, fill: chartColors.axis }}
              axisLine={{ stroke: chartColors.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: chartColors.axis }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={45}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<MiniChartTooltip />} />
            {group.metrics.map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.label}
                fill={metric.color}
                radius={[4, 4, 0, 0]}
                animationDuration={chartAnimation.duration}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(
                      parseMetricValue(entry[metric.key]),
                      index,
                      metric.color,
                    )}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1">
        {group.metrics.map((metric) => (
          <div key={metric.key} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Table showing metrics comparison with deltas
 */
const TrendsTable = React.memo(function TrendsTable({
  offers,
  metrics,
}: {
  offers: OfferTrendData[];
  metrics: TrendMetric[];
}) {
  const firstOffer = offers[0];
  const lastOffer = offers[offers.length - 1];
  const needsScroll = offers.length > 4;

  return (
    <div className={cn(needsScroll && "overflow-x-auto", "-mx-6 px-6")}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[100px] font-medium text-xs uppercase tracking-wider text-muted-foreground">
              Metric
            </TableHead>
            {offers.map((offer) => (
              <TableHead key={offer.id} className="min-w-[80px] text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-semibold tabular-nums">
                    #{offer.offerNumber}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={
                      offer.origin === "OUR_OFFER"
                        ? {
                            backgroundColor:
                              "color-mix(in srgb, var(--atelier-chart-proposal-b) 15%, transparent)",
                            color: "var(--atelier-chart-proposal-b)",
                          }
                        : {
                            backgroundColor: "var(--atelier-craft-gold-soft)",
                            color: "var(--accent-gold)",
                          }
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {offer.origin === "OUR_OFFER" ? "Us" : "Them"}
                  </span>
                </div>
              </TableHead>
            ))}
            <TableHead className="min-w-[100px] text-center">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Delta
                </span>
                <span className="text-[10px] text-muted-foreground">
                  First → Last
                </span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => {
            const firstValue = parseMetricValue(
              firstOffer.metrics?.[metric.key],
            );
            const lastValue = parseMetricValue(lastOffer.metrics?.[metric.key]);
            const deltaResult = calculateDelta(
              lastValue,
              firstValue,
              metric.direction,
            );
            const { text: deltaText, colorClass } = formatDelta(
              deltaResult.delta,
              deltaResult.isImproved,
            );

            return (
              <TableRow key={metric.key} className="hover:bg-muted/30">
                <TableCell className="font-medium text-sm py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    {metric.label}
                  </div>
                </TableCell>
                {offers.map((offer) => {
                  const value = parseMetricValue(offer.metrics?.[metric.key]);
                  return (
                    <TableCell
                      key={offer.id}
                      className="text-center font-mono text-sm py-2"
                    >
                      {formatMillions(value)}M
                    </TableCell>
                  );
                })}
                <TableCell
                  className={cn(
                    "text-center font-mono text-sm font-semibold py-2",
                    colorClass,
                  )}
                >
                  {deltaText}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * OfferTrendsCard - Shows how financial metrics evolve across negotiation offers
 *
 * Features:
 * - 3 mini-charts (Rent, EBITDA, NAV) with independent Y-axes
 * - Comparison table with delta indicators (first → last offer)
 * - Compact card design matching Atelier aesthetic
 *
 * @example
 * <OfferTrendsCard offers={negotiation.proposals} />
 */
export function OfferTrendsCard({ offers, className }: OfferTrendsCardProps) {
  // Prepare and validate offer data
  const sortedOffers = useMemo(() => prepareOfferData(offers), [offers]);

  // Transform for chart display
  const chartData = useMemo(
    () => transformToChartData(sortedOffers, TREND_METRICS),
    [sortedOffers],
  );

  // Calculate overall NAV change for header indicator
  const navChange = useMemo(() => {
    if (sortedOffers.length < 2) return { isImproved: null, percentChange: 0 };

    const firstNav = parseMetricValue(sortedOffers[0].metrics?.contractNAV);
    const lastNav = parseMetricValue(
      sortedOffers[sortedOffers.length - 1].metrics?.contractNAV,
    );

    if (firstNav === 0) return { isImproved: null, percentChange: 0 };

    const percentChange = ((lastNav - firstNav) / Math.abs(firstNav)) * 100;
    const isImproved = percentChange > 0;

    return { isImproved, percentChange };
  }, [sortedOffers]);

  // Edge case: Not enough offers for trend
  if (sortedOffers.length < 2) {
    return (
      <Card className={cn("bg-muted/30 border-dashed", className)}>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add more offers to see trends
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Trends require at least 2 offers with calculated metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Edge case: Some offers missing data
  const hasPartialData = sortedOffers.length !== offers.length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Offer Trends
          </CardTitle>
          <TrendIndicator
            isImproved={navChange.isImproved}
            percentChange={navChange.percentChange}
          />
        </div>
        {hasPartialData && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {offers.length - sortedOffers.length} offer(s) pending calculation
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3 Mini Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHART_GROUPS.map((group) => (
            <MiniTrendChart
              key={group.title}
              title={group.title}
              data={chartData}
              group={group}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Table Section */}
        <TrendsTable offers={sortedOffers} metrics={TREND_METRICS} />
      </CardContent>
    </Card>
  );
}

export default OfferTrendsCard;
