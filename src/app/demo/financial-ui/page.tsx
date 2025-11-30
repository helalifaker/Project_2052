"use client";

import { useState } from "react";
import { Moon, Sun, TrendingUp, TrendingDown, DollarSign, Percent, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialTable, FinancialLineItem } from "@/components/financial/FinancialTable";
import { FinancialValue } from "@/components/financial/FinancialValue";
import { useTheme } from "next-themes";
import { ExecutiveKPICard } from "@/components/dashboard/ExecutiveKPICard";

/**
 * Financial UI Demo Page
 *
 * A comprehensive showcase of all financial UI components
 * featuring the Sahara Twilight color theme.
 *
 * Route: /demo/financial-ui
 */

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette Data
// ─────────────────────────────────────────────────────────────────────────────

const copperScale = [
  { name: "Copper 900", value: "#7a5c2e", description: "Active states" },
  { name: "Copper 700", value: "#a47b42", description: "Primary actions" },
  { name: "Copper 500", value: "#c9a86c", description: "Accent borders" },
  { name: "Copper 300", value: "#e4d4b8", description: "Subtle highlights" },
  { name: "Copper 100", value: "#f7f3eb", description: "Tinted backgrounds" },
];

const stoneScale = [
  { name: "Stone 950", value: "#1c1a17", description: "Dark background" },
  { name: "Stone 900", value: "#292723", description: "Dark cards" },
  { name: "Stone 800", value: "#3d3a34", description: "Dark elevated" },
  { name: "Stone 600", value: "#6b6760", description: "Secondary text" },
  { name: "Stone 400", value: "#a5a19a", description: "Muted text" },
  { name: "Stone 200", value: "#e8e6e1", description: "Borders" },
  { name: "Stone 100", value: "#f5f4f1", description: "Subtle bg" },
  { name: "Stone 50", value: "#faf9f7", description: "Page bg" },
];

const financialIndicators = [
  { name: "Profit", value: "#2d7a4f", description: "Desert Sage" },
  { name: "Loss", value: "#b84233", description: "Terracotta" },
  { name: "Caution", value: "#c4850a", description: "Saffron" },
  { name: "Info", value: "#4a7c96", description: "Twilight Blue" },
];

const chartColors = [
  { name: "Chart 1", value: "#c9a86c", description: "Copper" },
  { name: "Chart 2", value: "#4a7c96", description: "Twilight" },
  { name: "Chart 3", value: "#7a9e8a", description: "Sage" },
  { name: "Chart 4", value: "#9b7a5a", description: "Sienna" },
  { name: "Chart 5", value: "#6b6760", description: "Stone" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Financial Data
// ─────────────────────────────────────────────────────────────────────────────

// ... (keep other imports)

// ... (keep color scales)

// Update mock data to match new component props structure where possible, or map it in render
const mockKPIs = [
  {
    title: "NET PRESENT VALUE",
    value: "SAR 125.5M",
    trend: { value: 12.4, label: "vs prior year" },
    icon: DollarSign,
    subtitle: "30-year projection at 8% discount rate",
  },
  {
    title: "CASH POSITION",
    value: "SAR 45.2M",
    trend: { value: 8.2, label: "vs prior year" },
    icon: TrendingUp,
    subtitle: "Current year-end balance",
  },
  {
    title: "TOTAL RENT",
    value: "SAR 89.3M",
    trend: { value: -3.1, label: "vs prior year" },
    icon: Building2,
    subtitle: "Cumulative 30-year obligation",
  },
  {
    title: "INTERNAL RATE OF RETURN",
    value: "12.4%",
    trend: { value: 0.5, label: "vs prior year" },
    icon: Percent,
    subtitle: "Project IRR",
  },
];

// ... (keep other mocks)

// Remove local ExecutiveKPICard definition (lines 192-236)

// Update render loop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {mockKPIs.map((kpi) => (
    <ExecutiveKPICard key={kpi.title} {...kpi} />
  ))}
</div>

const mockYears = [2023, 2024, 2025, 2026, 2027];

const mockPLData: FinancialLineItem[] = [
  {
    id: "revenue-header",
    label: "REVENUE",
    values: {},
    isHeader: true,
    isSectionStart: true,
  },
  {
    id: "tuition",
    label: "Tuition Revenue",
    values: { 2023: 85_000_000, 2024: 92_000_000, 2025: 98_000_000, 2026: 105_000_000, 2027: 112_000_000 },
    indent: 1,
  },
  {
    id: "other",
    label: "Other Income",
    values: { 2023: 5_000_000, 2024: 5_500_000, 2025: 6_000_000, 2026: 6_500_000, 2027: 7_000_000 },
    indent: 1,
  },
  {
    id: "total-revenue",
    label: "Total Revenue",
    values: { 2023: 90_000_000, 2024: 97_500_000, 2025: 104_000_000, 2026: 111_500_000, 2027: 119_000_000 },
    isSubtotal: true,
  },
  {
    id: "opex-header",
    label: "OPERATING EXPENSES",
    values: {},
    isHeader: true,
    isSectionStart: true,
  },
  {
    id: "staff",
    label: "Staff Costs",
    values: { 2023: 45_000_000, 2024: 47_000_000, 2025: 49_000_000, 2026: 51_000_000, 2027: 53_000_000 },
    indent: 1,
  },
  {
    id: "rent",
    label: "Rent Expense",
    values: { 2023: 12_000_000, 2024: 12_500_000, 2025: 13_000_000, 2026: 13_500_000, 2027: 14_000_000 },
    indent: 1,
  },
  {
    id: "other-opex",
    label: "Other Expenses",
    values: { 2023: 8_000_000, 2024: 8_500_000, 2025: 9_000_000, 2026: 9_500_000, 2027: 10_000_000 },
    indent: 1,
  },
  {
    id: "total-opex",
    label: "Total Operating Expenses",
    values: { 2023: 65_000_000, 2024: 68_000_000, 2025: 71_000_000, 2026: 74_000_000, 2027: 77_000_000 },
    isSubtotal: true,
  },
  {
    id: "ebitda",
    label: "EBITDA",
    values: { 2023: 25_000_000, 2024: 29_500_000, 2025: 33_000_000, 2026: 37_500_000, 2027: 42_000_000 },
    isTotal: true,
  },
  {
    id: "net-income",
    label: "NET INCOME",
    values: { 2023: 18_000_000, 2024: 22_500_000, 2025: 26_000_000, 2026: 30_500_000, 2027: 35_000_000 },
    isGrandTotal: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function ColorSwatch({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className="w-12 h-12 rounded-lg shadow-sm border border-border"
        style={{ backgroundColor: value }}
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{value}</code>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FinancialUIDemoPage() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("colors");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Financial UI Component Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sahara Twilight Theme - Handcrafted Design System
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="kpi">KPI Cards</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
          </TabsList>

          {/* ─────────────────────────────────────────────────────────────────
              Section 1: Color Palette
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="colors" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Copper Accent Scale */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Burnished Copper</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Primary accent - timeless, luxurious, crafted
                </p>
                <div className="space-y-1">
                  {copperScale.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                  ))}
                </div>
              </Card>

              {/* Stone Neutral Scale */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Warm Stone</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Foundation neutrals - sophisticated warmth
                </p>
                <div className="space-y-1">
                  {stoneScale.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                  ))}
                </div>
              </Card>

              {/* Financial Indicators */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Financial Indicators</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Muted professional - subtle yet clear
                </p>
                <div className="space-y-1">
                  {financialIndicators.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                  ))}
                </div>
              </Card>

              {/* Chart Colors */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Chart Palette</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Harmonious 5-color system with warm undertones
                </p>
                <div className="space-y-1">
                  {chartColors.map((color) => (
                    <ColorSwatch key={color.name} {...color} />
                  ))}
                </div>
              </Card>
            </div>

            {/* Color Harmony Preview */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Color Harmony Preview</h2>
              <div className="flex gap-2 h-16">
                {chartColors.map((color) => (
                  <div
                    key={color.name}
                    className="flex-1 rounded-lg first:rounded-l-xl last:rounded-r-xl"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                All chart colors share warm undertones for visual cohesion
              </p>
            </Card>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              Section 2: KPI Cards
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="kpi" className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Executive KPI Cards</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Premium board-level metrics display with hover animations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockKPIs.map((kpi) => (
                <ExecutiveKPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* KPI Card Variants */}
            <Card className="p-6">
              <h3 className="text-md font-semibold mb-4">Design Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="font-medium mb-2">Typography</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Label: 10px uppercase, 0.2em tracking</li>
                    <li>Value: 48px, font-weight 300</li>
                    <li>Subtitle: 12px, muted</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-2">Spacing</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Card padding: 32px (--space-8)</li>
                    <li>Border radius: 16px</li>
                    <li>Icon: 24x24px, 30% opacity</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-2">Interactions</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Border: copper on hover</li>
                    <li>Accent line: scale-x animation</li>
                    <li>Icon: 60% opacity on hover</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              Section 3: Financial Tables
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="tables" className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Financial Statements</h2>
              <p className="text-sm text-muted-foreground mb-6">
                30-year projection tables with visual hierarchy and period indicators
              </p>
            </div>

            <FinancialTable
              title="Profit & Loss Statement (Sample)"
              years={mockYears}
              lineItems={mockPLData}
              showTooltips={true}
              highlightTotals={true}
            />

            {/* Table Features */}
            <Card className="p-6">
              <h3 className="text-md font-semibold mb-4">Table Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--financial-header-bg)" }} />
                    Header Rows
                  </div>
                  <p className="text-muted-foreground">Uppercase, semibold, copper-tinted background</p>
                </div>
                <div>
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--financial-subtotal-bg)" }} />
                    Subtotal Rows
                  </div>
                  <p className="text-muted-foreground">Stone-100 background, top border</p>
                </div>
                <div>
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--financial-total-bg)" }} />
                    Total Rows
                  </div>
                  <p className="text-muted-foreground">Warmer tint, bold, double border</p>
                </div>
                <div>
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--financial-grandtotal-bg)" }} />
                    Grand Total
                  </div>
                  <p className="text-muted-foreground">Copper-tinted, primary accent</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              Section 4: Financial Values
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="values" className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Financial Values</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Currency, percentage, and number formatting with semantic colors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Positive Values */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Positive Values (Profits)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Large Currency</span>
                    <FinancialValue value={125500000} type="currency" size="xl" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium Currency</span>
                    <FinancialValue value={45200000} type="currency" size="lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Small Currency</span>
                    <FinancialValue value={8500000} type="currency" size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Percentage</span>
                    <FinancialValue value={12.4} type="percent" size="lg" colorMode="auto" />
                  </div>
                </div>
              </Card>

              {/* Negative Values */}
              <Card className="p-6">
                <h3 className="font-medium mb-4">Negative Values (Losses)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Large Currency</span>
                    <FinancialValue value={-45000000} type="currency" size="xl" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medium Currency</span>
                    <FinancialValue value={-12500000} type="currency" size="lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Small Currency</span>
                    <FinancialValue value={-3200000} type="currency" size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Percentage</span>
                    <FinancialValue value={-8.5} type="percent" size="lg" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Color Legend */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Semantic Color Usage</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--financial-positive)" }} />
                  <div>
                    <div className="text-sm font-medium">Positive</div>
                    <div className="text-xs text-muted-foreground">Profits, gains, savings</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--financial-negative)" }} />
                  <div>
                    <div className="text-sm font-medium">Negative</div>
                    <div className="text-xs text-muted-foreground">Losses, costs, debts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--financial-warning)" }} />
                  <div>
                    <div className="text-sm font-medium">Warning</div>
                    <div className="text-xs text-muted-foreground">Attention needed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "var(--financial-neutral)" }} />
                  <div>
                    <div className="text-sm font-medium">Neutral</div>
                    <div className="text-xs text-muted-foreground">Baseline, unchanged</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              Section 5: Typography
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="typography" className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Typography Scale</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Golden Ratio proportions for visual harmony
              </p>
            </div>

            <Card className="p-6 space-y-8">
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Hero / 48px / Light</div>
                <div className="text-5xl font-light tracking-tight">SAR 125.5M</div>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">H1 / 30px / Semibold</div>
                <h1 className="text-3xl font-semibold">Financial Statements</h1>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">H2 / 24px / Semibold</div>
                <h2 className="text-2xl font-semibold">Profit & Loss</h2>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">H3 / 20px / Medium</div>
                <h3 className="text-xl font-medium">Revenue Summary</h3>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Body / 16px / Regular</div>
                <p className="text-base">View complete financial projections over 30 years with detailed breakdown by period.</p>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Small / 14px / Regular</div>
                <p className="text-sm">Historical data from 2023-2024, transition period 2025-2027.</p>
              </div>
              <div className="border-b pb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Caption / 12px / Medium</div>
                <p className="text-xs font-medium">All values in millions (SAR)</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Micro / 10px / Semibold / Uppercase</div>
                <p className="text-[10px] font-semibold uppercase tracking-widest">NET PRESENT VALUE</p>
              </div>
            </Card>

            {/* Tabular Numbers */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Tabular Figures for Alignment</h3>
              <div className="font-mono tabular-nums text-right space-y-1 max-w-xs ml-auto">
                <div className="text-lg">125,500,000.00</div>
                <div className="text-lg">45,200,000.00</div>
                <div className="text-lg">8,500,000.00</div>
                <div className="text-lg border-t pt-1">179,200,000.00</div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <code className="bg-muted px-1 rounded">font-variant-numeric: tabular-nums</code> ensures proper vertical alignment
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>Sahara Twilight Theme - Handcrafted with intention, proportion, and harmony</p>
          <p className="mt-1">Project 2052 Financial Planning Application</p>
        </div>
      </footer>
    </div>
  );
}
