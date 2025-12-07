"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContextBar } from "@/components/layout/ContextBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  breadcrumbs = [],
  actions,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-executive font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Sidebar />

      {/* Main Content Area - Pushed by Sidebar width (w-64 by default) */}
      <div className="relative z-10 flex min-h-screen flex-col pl-64 transition-all duration-300 ease-in-out">
        <ContextBar breadcrumbs={breadcrumbs} actions={actions} />

        <main className="flex-1 p-8 overflow-x-hidden">
          <div
            key={pathname}
            className="mx-auto max-w-[1600px] page-transition-enter"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
