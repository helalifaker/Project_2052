"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ContextBarProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function ContextBar({
  breadcrumbs,
  actions,
  className,
}: ContextBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between px-6 transition-all duration-300",
        "bg-background/40 backdrop-blur-xl border-b border-white/5", // Enhanced Glassmorphism
        "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent", // Prism Border
        className,
      )}
    >
      <div className="flex items-center gap-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={index} className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(isLast && "font-medium text-foreground")}>
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="mx-2 h-4 w-4" />}
              </div>
            );
          })}
        </nav>

        {/* Global Market Context (Terminal Header) */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-muted-foreground border-l border-white/10 pl-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">●</span>
            <span>CPI: 2.1%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">●</span>
            <span>SAR/USD: 3.75</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">●</span>
            <span>Market: Stable</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
