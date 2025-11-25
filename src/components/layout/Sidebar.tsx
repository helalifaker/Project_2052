"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Database,
  Building2,
  GitCompare,
  LogOut,
  LucideIcon,
  Loader2,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Negotiations",
    href: "/negotiations",
    icon: GitCompare,
  },
  {
    title: "Proposals",
    href: "/proposals",
    icon: FileText,
  },
  {
    title: "Compare",
    href: "/proposals/compare",
    icon: GitCompare,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Configuration",
    href: "/admin/config",
    icon: Settings,
  },
  {
    title: "Transition Setup",
    href: "/admin/transition",
    icon: Settings,
  },
  {
    title: "Historical Data",
    href: "/admin/historical",
    icon: Database,
  },
  {
    title: "CapEx Module",
    href: "/admin/capex",
    icon: Building2,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, loading, signOut } = useAuthContext();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">CapEx Advisor</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section - Only visible to ADMIN users */}
          {!loading && isAdmin && (
            <div className="pt-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </h3>
              <div className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {user?.name?.substring(0, 2).toUpperCase() || "CA"}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium">
                    {user?.name || "CapEx User"}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user?.role?.toLowerCase() || "User"}
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
                )}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
