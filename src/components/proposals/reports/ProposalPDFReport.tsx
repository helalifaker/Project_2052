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
        backgroundColor: "#ffffff",
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
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1e293b",
              margin: "0 0 4px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Rent Trajectory Analysis
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
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
              color: "#94a3b8",
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
              color: "#A68B5B",
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
                <stop offset="5%" stopColor="#A68B5B" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#A68B5B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A68B5B" stopOpacity={0} />
              </linearGradient>
              <filter id="shadow" height="130%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#A68B5B"
                  floodOpacity="0.15"
                />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
              strokeOpacity={0.8}
            />

            <XAxis
              dataKey="year"
              tick={{
                fill: "#64748b",
                fontSize: 11,
                fontWeight: 500,
              }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
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
                fill: "#64748b",
                fontSize: 11,
                fontWeight: 500,
              }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
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
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "10px 14px",
              }}
              labelStyle={{
                color: "#1e293b",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "#A68B5B",
                fontWeight: 500,
              }}
            />

            {/* Contract start reference line */}
            <ReferenceLine
              x={2028}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Contract Start",
                position: "top",
                fill: "#3b82f6",
                fontSize: 10,
                fontWeight: 500,
              }}
            />

            {/* Average rent reference line */}
            <ReferenceLine
              y={avgRent}
              stroke="#94a3b8"
              strokeDasharray="8 4"
              strokeWidth={1}
            />

            <Area
              type="monotone"
              dataKey="rent"
              stroke="#A68B5B"
              strokeWidth={3}
              fill="url(#rentGradient)"
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#A68B5B",
                stroke: "#ffffff",
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
              backgroundColor: "#94a3b8",
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: "#64748b" }}>
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
              backgroundColor: "#64748b",
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: "#64748b" }}>
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
              backgroundColor: "#A68B5B",
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Contract Period (2028+)
          </span>
        </div>
      </div>
    </div>
  );
}
