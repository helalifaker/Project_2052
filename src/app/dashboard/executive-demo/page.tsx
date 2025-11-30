"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { KPICard } from "@/components/financial/KPICard";

/**
 * Executive Dashboard Demo
 *
 * Above-the-fold design with sidebar + hero banner
 * Premium aesthetics for board-level decision support
 */

// Compact Chart - optimized height for above-the-fold
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockRentData = [
  {
    proposalId: "prop-1",
    proposalName: "Al Rajhi",
    rentModel: "FIXED_ESCALATION",
    isWinner: true,
    data: Array.from({ length: 31 }, (_, i) => ({
      year: 2023 + i,
      rent: 50_000_000 * Math.pow(1.03, i),
    })),
  },
  {
    proposalId: "prop-2",
    proposalName: "Kingdom",
    rentModel: "REVENUE_SHARE",
    isWinner: false,
    data: Array.from({ length: 31 }, (_, i) => ({
      year: 2023 + i,
      rent: 45_000_000 + i * 3_000_000,
    })),
  },
  {
    proposalId: "prop-3",
    proposalName: "SEDCO",
    rentModel: "PARTNER_INVESTMENT",
    isWinner: false,
    data: Array.from({ length: 31 }, (_, i) => ({
      year: 2023 + i,
      rent: 55_000_000 * Math.pow(1.025, i),
    })),
  },
];

const COLORS = ["#c9a86c", "#6b8e7a", "#8b7355"];

export default function ExecutiveDemoPage() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  // Transform data for chart
  const allYears = Array.from({ length: 16 }, (_, i) => 2023 + i * 2);
  const chartData = allYears.map((year) => {
    const point: Record<string, number> = { year };
    mockRentData.forEach((p) => {
      const d = p.data.find((x) => x.year === year);
      if (d) point[p.proposalId] = d.rent / 1_000_000;
    });
    return point;
  });

  return (
    <div className={isDark ? "dark" : ""}>
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Executive Demo" },
      ]}
      actions={
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-[var(--executive-card)] border border-[var(--executive-border)]
                     hover:border-[var(--executive-accent)]/40 transition-colors"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          {isDark ? "Light" : "Dark"}
        </button>
      }
    >
      <div className="space-y-4">
        {/* Compact Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          {/* Background glow */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-1/4 w-64 h-32 bg-[var(--executive-accent)] rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(201, 168, 108, 0.2)" }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "var(--executive-accent)" }} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--executive-accent)] mb-0.5">
                  Finance Frontend Designer Skill
                </p>
                <h1 className="text-lg font-light text-white">
                  Executive Luxury Dashboard
                </h1>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:gap-3"
              style={{
                background: "var(--executive-accent)",
                color: "#1a1a1a",
              }}
            >
              Compare with Original
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Main Grid - KPIs + Chart Above the Fold */}
        <div className="grid grid-cols-12 gap-4">
          {/* KPI Cards - Left Column (narrower) */}
          <div className="col-span-3 grid grid-cols-1 gap-3">
            <KPICard
              title="Total Rent (30Y)"
              value="SAR 2.4B"
              trend={{ value: 3.2, label: "vs budget" }}
              icon={DollarSign}
              size="compact"
            />
            <KPICard
              title="Average NPV"
              value="SAR 847M"
              trend={{ value: 12.5, label: "vs baseline" }}
              icon={TrendingUp}
              size="compact"
            />
            <KPICard
              title="Average IRR"
              value="14.2%"
              trend={{ value: -0.8, label: "vs target" }}
              icon={BarChart3}
              size="compact"
            />
            <KPICard
              title="Payback"
              value="8.4 yrs"
              icon={Calendar}
              size="compact"
            />
          </div>

          {/* Main Chart - Right Column */}
          <div
            className="col-span-9 p-5 rounded-xl border"
            style={{
              background: "var(--executive-card)",
              borderColor: "var(--executive-border)",
            }}
          >
            {/* Chart Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-[var(--executive-text)]">
                  Rent Trajectory
                </h2>
                <p className="text-xs text-[var(--executive-text-tertiary)]">
                  30-year projection across all proposals
                </p>
              </div>
              {/* Inline Legend */}
              <div className="flex items-center gap-4">
                {mockRentData.map((p, i) => (
                  <div key={p.proposalId} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: COLORS[i] }}
                    />
                    <span className="text-[11px] text-[var(--executive-text-secondary)]">
                      {p.proposalName}
                    </span>
                    {p.isWinner && (
                      <span
                        className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--executive-accent-subtle)",
                          color: "var(--executive-accent)",
                        }}
                      >
                        Winner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chart - Compact Height */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {mockRentData.map((p, i) => (
                      <linearGradient
                        key={p.proposalId}
                        id={`grad-${p.proposalId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={COLORS[i]} stopOpacity={p.isWinner ? 0.3 : 0.15} />
                        <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>

                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--executive-text-tertiary)", fontSize: 10 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--executive-text-tertiary)", fontSize: 10 }}
                    tickFormatter={(v) => `${v.toFixed(0)}M`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--executive-card)",
                      border: "1px solid var(--executive-border)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--executive-text-secondary)",
                      marginBottom: "4px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}M SAR`, ""]}
                    labelFormatter={(label) => `Year ${label}`}
                  />

                  {mockRentData.map((p, i) => (
                    <Area
                      key={p.proposalId}
                      type="monotone"
                      dataKey={p.proposalId}
                      stroke={COLORS[i]}
                      strokeWidth={p.isWinner ? 2 : 1.5}
                      fill={`url(#grad-${p.proposalId})`}
                      name={p.proposalName}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar - Quick Glance */}
        <div
          className="p-3 rounded-xl border flex items-center justify-between"
          style={{
            background: "var(--executive-card)",
            borderColor: "var(--executive-border)",
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-[var(--executive-text-tertiary)]">
                Period
              </span>
              <p className="text-xs font-medium tabular-nums text-[var(--executive-text)]">
                2023 → 2053
              </p>
            </div>
            <div className="w-px h-4 bg-[var(--executive-border)]" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-[var(--executive-text-tertiary)]">
                Discount
              </span>
              <p className="text-xs font-medium tabular-nums text-[var(--executive-text)]">8.0%</p>
            </div>
            <div className="w-px h-4 bg-[var(--executive-border)]" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-[var(--executive-text-tertiary)]">
                Currency
              </span>
              <p className="text-xs font-medium text-[var(--executive-text)]">SAR</p>
            </div>
          </div>
          <div className="text-[10px] text-[var(--executive-text-tertiary)]">
            Updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </DashboardLayout>
    </div>
  );
}
