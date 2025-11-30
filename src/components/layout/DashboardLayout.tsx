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
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
            {/* Background Mesh Gradient (Sahara Twilight) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/40 via-background to-background" />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />

            <Sidebar />

            {/* Main Content Area - Pushed by Sidebar width (w-64 by default) */}
            <div className="relative z-10 flex min-h-screen flex-col pl-64 transition-all duration-300 ease-in-out">
                <ContextBar breadcrumbs={breadcrumbs} actions={actions} />

                <main className="flex-1 p-6 overflow-x-hidden">
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
