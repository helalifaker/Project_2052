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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useUIStore, useUIStoreHydration } from "@/lib/stores/ui-store";

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
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, loading, signOut } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  useUIStoreHydration();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out",
        "bg-background/80 backdrop-blur-md border-border shadow-sm", // Improved visibility
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="Go to dashboard"
            >
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-lg font-bold">CapEx Advisor</span>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/"
              className="flex justify-center w-full"
              aria-label="Go to dashboard"
            >
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto focus-ring-enhanced"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-2"
          aria-label="Primary navigation menu"
        >
          {/* Main Navigation */}
          <div className="space-y-1" role="list">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring-enhanced",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                  aria-label={item.title}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      {item.title}
                      {item.badge && (
                        <span
                          className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                          aria-label={`${item.badge} notifications`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {!loading && isAdmin && (
            <div className="pt-4">
              {!collapsed && (
                <h3
                  className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  id="admin-section-heading"
                >
                  Administration
                </h3>
              )}
              <div
                className="space-y-1"
                role="list"
                aria-labelledby={
                  collapsed ? undefined : "admin-section-heading"
                }
              >
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="listitem"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring-enhanced",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        collapsed && "justify-center px-2",
                      )}
                      aria-label={item.title}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      {!collapsed && item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div
          className="border-t border-border p-2"
          role="region"
          aria-label="User account and settings"
        >
          {loading ? (
            <div
              className="flex items-center justify-center py-2"
              role="status"
              aria-live="polite"
              aria-label="Loading user information"
            >
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {!collapsed && (
                <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 border border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user?.name?.substring(0, 2).toUpperCase() || "CA"}
                  </div>
                  <div className="flex-1 text-sm overflow-hidden">
                    <div className="font-medium truncate">
                      {user?.name || "CapEx User"}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize truncate">
                      {user?.role?.toLowerCase() || "User"}
                    </div>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "flex gap-1",
                  collapsed ? "flex-col" : "flex-row",
                )}
              >
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  className={cn(
                    "flex-1 focus-ring-enhanced",
                    collapsed ? "w-full" : "",
                  )}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {!collapsed && <span className="ml-2">Theme</span>}
                </Button>

                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  className={cn(
                    "text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-ring-enhanced",
                    collapsed ? "w-full" : "flex-1",
                  )}
                  onClick={signOut}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
