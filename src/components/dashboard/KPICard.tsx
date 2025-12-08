"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { chartAnimationDurations } from "@/lib/design-tokens/chart-config";

interface KPICardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * KPI Card Component - V2 Executive Style
 *
 * Harmonized with ProposalCard V2:
 * - Distinct colored header based on trend
 * - Glassmorphic body
 * - Shimmer effects
 * - Serif typography for values
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  // Determine status for styling
  const status = trend?.value
    ? trend.value > 0
      ? "positive"
      : trend.value < 0
        ? "negative"
        : "neutral"
    : "neutral";

  // Dynamic Styles based on status - Atelier Edition
  const getStatusStyles = () => {
    switch (status) {
      case "positive":
        return {
          headerBg:
            "linear-gradient(to bottom, var(--atelier-ink-positive-soft), transparent)",
          pillBg: "var(--atelier-ink-positive-soft)",
          pillText: "var(--financial-positive)",
          iconColor: "var(--financial-positive)",
        };
      case "negative":
        return {
          headerBg:
            "linear-gradient(to bottom, var(--atelier-ink-negative-soft), transparent)",
          pillBg: "var(--atelier-ink-negative-soft)",
          pillText: "var(--financial-negative)",
          iconColor: "var(--financial-negative)",
        };
      default:
        return {
          headerBg:
            "linear-gradient(to bottom, var(--atelier-stone-100), transparent)",
          pillBg: "var(--atelier-stone-200)",
          pillText: "var(--text-secondary)",
          iconColor: "var(--text-tertiary)",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "glass-card p-0 hover:shadow-2xl hover:scale-[1.02]", // V2 Base
        "animate-fade-in-up", // Entry animation
        className,
      )}
    >
      {/* Active Shimmer Border Gradient (on hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Header Section */}
      <div
        className="relative z-10 px-5 py-3 border-b border-white/5 flex items-center justify-between backdrop-blur-[2px]"
        style={{ background: styles.headerBg }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
            <Icon className="w-3.5 h-3.5" style={{ color: styles.iconColor }} />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.15em]">
            {title}
          </span>
        </div>

        {trend && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/5 tabular-nums"
            style={{
              backgroundColor: styles.pillBg,
              color: styles.pillText,
            }}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      {/* Body Section */}
      <div className="relative z-10 p-5">
        <div
          className={cn(
            "font-serif text-3xl font-light text-foreground leading-tight tracking-tight flex items-baseline truncate",
            status === "negative" && "text-[var(--financial-negative)]",
          )}
        >
          {typeof value === "string" &&
          !isNaN(parseFloat(value.replace(/[^0-9.-]+/g, ""))) ? (
            <CountUp
              end={parseFloat(value.replace(/[^0-9.-]+/g, ""))}
              duration={chartAnimationDurations.counter}
              prefix={
                value.includes("$") ? "$" : value.includes("SAR") ? "SAR " : ""
              }
              suffix={
                value.includes("%") ? "%" : value.includes("M") ? "M" : ""
              }
              decimals={value.includes(".") ? 1 : 0}
            />
          ) : (
            value
          )}
        </div>

        {subtitle && (
          <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5 opacity-80">
            {subtitle}
          </div>
        )}
      </div>

      {/* Footer Highlight */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-transparent to-transparent",
          status === "positive" && "via-[var(--financial-positive)]",
          status === "negative" && "via-[var(--financial-negative)]",
          status === "neutral" && "via-[var(--executive-accent)]",
        )}
      />
    </Card>
  );
}
