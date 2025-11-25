"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Database,
  Building2,
  GitCompare,
  Plus,
  Search,
  Moon,
  Sun,
  Calculator,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUIStore } from "@/lib/stores/ui-store";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  group: "navigation" | "proposals" | "admin" | "actions";
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Global keyboard shortcut for Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      // Escape to close
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setCommandPaletteOpen(false);
      command();
    },
    [setCommandPaletteOpen],
  );

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, [theme]);

  const commandItems: CommandItem[] = React.useMemo(
    () => [
      // Navigation
      {
        id: "dashboard",
        title: "Dashboard",
        description: "View key metrics and KPIs",
        icon: <LayoutDashboard className="h-4 w-4" />,
        shortcut: "D",
        action: () => router.push("/dashboard"),
        group: "navigation",
      },
      {
        id: "proposals",
        title: "Proposals",
        description: "View all lease proposals",
        icon: <FileText className="h-4 w-4" />,
        shortcut: "P",
        action: () => router.push("/proposals"),
        group: "navigation",
      },
      {
        id: "negotiations",
        title: "Negotiations",
        description: "Track active negotiations",
        icon: <GitCompare className="h-4 w-4" />,
        shortcut: "N",
        action: () => router.push("/negotiations"),
        group: "navigation",
      },
      {
        id: "compare",
        title: "Compare Proposals",
        description: "Side-by-side proposal comparison",
        icon: <BarChart3 className="h-4 w-4" />,
        shortcut: "C",
        action: () => router.push("/proposals/compare"),
        group: "navigation",
      },

      // Proposal Actions
      {
        id: "new-proposal",
        title: "New Proposal",
        description: "Create a new lease proposal",
        icon: <Plus className="h-4 w-4" />,
        action: () => router.push("/proposals/new"),
        group: "proposals",
      },
      {
        id: "search-proposals",
        title: "Search Proposals",
        description: "Find proposals by name or ID",
        icon: <Search className="h-4 w-4" />,
        action: () => router.push("/proposals?search=true"),
        group: "proposals",
      },
      {
        id: "sensitivity-analysis",
        title: "Sensitivity Analysis",
        description: "Run NPV sensitivity analysis",
        icon: <TrendingUp className="h-4 w-4" />,
        action: () => router.push("/proposals?tab=sensitivity"),
        group: "proposals",
      },
      {
        id: "scenarios",
        title: "Scenario Modeling",
        description: "Create what-if scenarios",
        icon: <Calculator className="h-4 w-4" />,
        action: () => router.push("/proposals?tab=scenarios"),
        group: "proposals",
      },

      // Admin
      {
        id: "config",
        title: "Configuration",
        description: "System configuration settings",
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push("/admin/config"),
        group: "admin",
      },
      {
        id: "historical",
        title: "Historical Data",
        description: "Manage historical financial data",
        icon: <Database className="h-4 w-4" />,
        action: () => router.push("/admin/historical"),
        group: "admin",
      },
      {
        id: "capex",
        title: "CapEx Module",
        description: "Capital expenditure management",
        icon: <Building2 className="h-4 w-4" />,
        action: () => router.push("/admin/capex"),
        group: "admin",
      },
      {
        id: "transition",
        title: "Transition Setup",
        description: "Configure transition parameters",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        action: () => router.push("/admin/transition"),
        group: "admin",
      },

      // Actions
      {
        id: "toggle-theme",
        title: theme === "light" ? "Dark Mode" : "Light Mode",
        description: "Toggle between light and dark themes",
        icon:
          theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          ),
        shortcut: "T",
        action: toggleTheme,
        group: "actions",
      },
    ],
    [router, theme, toggleTheme],
  );

  const navigationItems = commandItems.filter((i) => i.group === "navigation");
  const proposalItems = commandItems.filter((i) => i.group === "proposals");
  const adminItems = commandItems.filter((i) => i.group === "admin");
  const actionItems = commandItems.filter((i) => i.group === "actions");

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Proposals">
          {proposalItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Administration">
          {adminItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="cursor-pointer"
            >
              {item.icon}
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
