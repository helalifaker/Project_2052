"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  ExecutiveCard,
  ExecutiveCardContent,
} from "@/components/ui/executive-card";

interface ExecutiveKPICardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  /** Optional accent color override */
  accentColor?: string;
}

/**
 * Executive KPI Card
 *
 * Premium, board-level KPI display following Executive Luxury design:
 * - Generous whitespace (p-8)
 * - Large, light-weight typography (text-5xl font-light)
 * - Subtle accent line on hover
 * - Warm copper accent instead of generic blue
 * - Tabular figures for number alignment
 */
export const ExecutiveKPICard = memo(function ExecutiveKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  accentColor,
}: ExecutiveKPICardProps) {
  return (
    <ExecutiveCard
      className={cn(
        "group relative transition-all duration-500 hover:border-[var(--executive-accent)]",
        className,
      )}
      style={
        accentColor
          ? ({ "--card-accent": accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <ExecutiveCardContent className="p-5 lg:p-6">
        {/* Optional icon - subtle, top right */}
        {Icon && (
          <div className="absolute top-5 right-5 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <Icon
              className="w-6 h-6"
              style={{ color: accentColor || "var(--executive-accent)" }}
            />
          </div>
        )}

        {/* Label */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--executive-text-secondary)] mb-3">
          {title}
        </p>

        {/* Value - The star of the show */}
        <div className="text-3xl lg:text-4xl font-light tracking-tight tabular-nums text-[var(--executive-text)]">
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-[var(--executive-text-tertiary)] mt-4 max-w-[200px]">
            {subtitle}
          </p>
        )}

        {/* Trend indicator */}
        {trend !== undefined && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 text-sm",
              trend.value >= 0
                ? "text-[var(--executive-positive)]"
                : "text-[var(--executive-negative)]",
            )}
          >
            <span className="text-lg">{trend.value >= 0 ? "↑" : "↓"}</span>
            <span className="tabular-nums font-medium">
              {trend.value > 0 ? "+" : ""}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            {trend.label && (
              <span className="text-[var(--executive-text-tertiary)]">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {/* Subtle accent line on hover */}
        <div
          className="absolute bottom-0 left-8 right-8 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          style={{ backgroundColor: accentColor || "var(--executive-accent)" }}
        />
      </ExecutiveCardContent>
    </ExecutiveCard>
  );
});

/**
 * Executive KPI Grid
 *
 * Wrapper for consistent KPI card layouts
 */
export const ExecutiveKPIGrid = memo(function ExecutiveKPIGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
});
