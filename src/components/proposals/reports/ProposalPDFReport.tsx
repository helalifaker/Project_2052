/**
 * Proposal PDF Report Component
 * =============================
 * Hidden component for capturing charts to include in PDF exports.
 * Styled with inline styles for compatibility with modern-screenshot.
 */

import { Proposal } from "@/lib/types/proposal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { pdfColors } from "./pdfColorConstants";

interface ProposalPDFReportProps {
  proposal: Proposal;
  id: string;
}

interface FinancialYear {
  year: number;
  profitLoss?: {
    rentExpense?: string | number;
    totalRevenue?: string | number;
  };
}

export function ProposalPDFReport({ proposal, id }: ProposalPDFReportProps) {
  const financials = (proposal.financials as FinancialYear[] | undefined) || [];

  // Extract rent trajectory data
  const rentTrajectoryData = financials.map((f) => ({
    year: f.year,
    rent: f.profitLoss?.rentExpense
      ? Number(f.profitLoss.rentExpense) / 1_000_000
      : 0,
  }));

  // Find key periods
  const contractStart = 2028;
  const contractEnd =
    2028 +
    ((proposal as { contractPeriodYears?: number }).contractPeriodYears || 30) -
    1;

  // Calculate average rent for reference line
  const contractRents = rentTrajectoryData
    .filter((d) => d.year >= contractStart && d.year <= contractEnd)
    .map((d) => d.rent);
  const avgRent =
    contractRents.length > 0
      ? contractRents.reduce((a, b) => a + b, 0) / contractRents.length
      : 0;

  return (
    <div
      id={id}
      style={{
        width: "900px",
        height: "500px",
        position: "absolute",
        top: "-10000px",
        left: "-10000px",
        backgroundColor: pdfColors.background,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: `2px solid ${pdfColors.border}`,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: pdfColors.heading,
              margin: "0 0 4px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Rent Trajectory Analysis
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: pdfColors.body,
              margin: 0,
            }}
          >
            {contractStart} - {contractEnd} | {proposal.rentModel || "N/A"}{" "}
            Model
          </p>
        </div>
        <div
          style={{
            textAlign: "right",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: pdfColors.muted,
              margin: "0 0 2px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Average Annual Rent
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: pdfColors.accent,
              margin: 0,
            }}
          >
            {avgRent.toFixed(1)}M SAR
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div
        style={{
          height: "380px",
          width: "100%",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={rentTrajectoryData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={pdfColors.accent} stopOpacity={0.4} />
                <stop offset="50%" stopColor={pdfColors.accent} stopOpacity={0.15} />
                <stop offset="95%" stopColor={pdfColors.accent} stopOpacity={0} />
              </linearGradient>
              <filter id="shadow" height="130%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor={pdfColors.accent}
                  floodOpacity="0.15"
                />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={pdfColors.border}
              strokeOpacity={0.8}
            />

            <XAxis
              dataKey="year"
              tick={{
                fill: pdfColors.body,
                fontSize: 11,
                fontWeight: 500,
              }}
              axisLine={{ stroke: pdfColors.axis }}
              tickLine={{ stroke: pdfColors.axis }}
              tickFormatter={(value) => {
                // Show every 5 years plus start/end
                if (
                  value === 2023 ||
                  value === 2028 ||
                  value % 5 === 0 ||
                  value === 2053
                ) {
                  return value.toString();
                }
                return "";
              }}
            />

            <YAxis
              tick={{
                fill: pdfColors.body,
                fontSize: 11,
                fontWeight: 500,
              }}
              axisLine={{ stroke: pdfColors.axis }}
              tickLine={{ stroke: pdfColors.axis }}
              tickFormatter={(value) => `${value.toFixed(0)}M`}
              domain={["dataMin - 5", "dataMax + 5"]}
            />

            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(2)}M SAR`,
                "Rent",
              ]}
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{
                backgroundColor: pdfColors.tooltipBg,
                border: `1px solid ${pdfColors.tooltipBorder}`,
                borderRadius: "8px",
                boxShadow: pdfColors.tooltipShadow,
                padding: "10px 14px",
              }}
              labelStyle={{
                color: pdfColors.heading,
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: pdfColors.accent,
                fontWeight: 500,
              }}
            />

            {/* Contract start reference line */}
            <ReferenceLine
              x={2028}
              stroke={pdfColors.info}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Contract Start",
                position: "top",
                fill: pdfColors.info,
                fontSize: 10,
                fontWeight: 500,
              }}
            />

            {/* Average rent reference line */}
            <ReferenceLine
              y={avgRent}
              stroke={pdfColors.muted}
              strokeDasharray="8 4"
              strokeWidth={1}
            />

            <Area
              type="monotone"
              dataKey="rent"
              stroke={pdfColors.accent}
              strokeWidth={3}
              fill="url(#rentGradient)"
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 6,
                fill: pdfColors.accent,
                stroke: pdfColors.background,
                strokeWidth: 2,
              }}
              style={{ filter: "url(#shadow)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Period Indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: pdfColors.muted,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: pdfColors.body }}>
            Historical (2023-2024)
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: pdfColors.body,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: pdfColors.body }}>
            Transition (2025-2027)
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: pdfColors.accent,
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: pdfColors.body }}>
            Contract Period (2028+)
          </span>
        </div>
      </div>
    </div>
  );
}
