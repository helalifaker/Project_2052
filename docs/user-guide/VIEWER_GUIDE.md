# Viewer Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Viewing Proposals](#viewing-proposals)
4. [Understanding Financial Statements](#understanding-financial-statements)
5. [Viewing Scenarios](#viewing-scenarios)
6. [Viewing Comparisons](#viewing-comparisons)
7. [Exporting Reports](#exporting-reports)
8. [FAQs](#faqs)

---

## Introduction

Welcome to the Viewer Guide for the School Lease Financial Planning System. As a Viewer, you have read-only access to proposals, financial statements, scenarios, and comparison reports created by Planners and Administrators.

### Your Role
- **Purpose**: Review and understand financial proposals without the ability to create or modify them
- **Typical users**: Board members, financial committee members, executives, external advisors
- **Key activity**: Review proposals, analyze scenarios, export reports for meetings

### What You Can Do
- ✓ View all proposals
- ✓ View financial statements (P&L, Balance Sheet, Cash Flow)
- ✓ View saved scenarios and comparisons
- ✓ Export reports (PDF, Excel)
- ✓ Access dashboard metrics

### What You Cannot Do
- ✗ Create new proposals
- ✗ Edit existing proposals
- ✗ Run new scenarios (but can view saved ones)
- ✗ Run new sensitivity analyses (but can view saved ones)
- ✗ Delete proposals
- ✗ Configure system settings
- ✗ Manage users

---

## Getting Started

### First Login

**Step 1: Access the Dashboard**

1. Log in with your viewer credentials
2. You'll land on the Dashboard showing summary metrics
3. Navigate using the sidebar: Dashboard, Proposals, Comparisons

[Screenshot: Viewer Dashboard]

**Step 2: Understand Your View**

- Dashboard shows aggregate metrics across all proposals
- Proposals page shows all proposals (view-only)
- All "Edit", "Create", "Delete" buttons are hidden
- You'll see "View Details" and "Export" buttons only

### Dashboard Overview

Your dashboard displays:
- **Total Proposals**: Number of proposals in the system
- **Active Negotiations**: Proposals with status SUBMITTED, UNDER_REVIEW, or COUNTER_RECEIVED
- **Average NPV**: Average Net Present Value across all proposals
- **Recent Activity**: Latest proposals created or modified
- **Quick Links**: View All Proposals, View Comparisons

[Screenshot: Dashboard Metrics for Viewers]

---

## Viewing Proposals

### Accessing Proposals List

**Navigation**: Sidebar → Proposals

[Screenshot: Proposals List Page]

### Proposals List View

**Each proposal card shows:**
- Proposal name
- Developer name
- Rent model (Fixed, RevShare, Partner)
- Status (Draft, Submitted, Under Review, etc.)
- Key metric: NPV
- Last updated date
- "View Details" button

**Filtering and Sorting:**

**Filter by:**
- Status (Draft, Submitted, Accepted, Rejected, etc.)
- Rent Model (Fixed, RevShare, Partner)
- Developer
- Date range

**Sort by:**
- Date created (newest/oldest)
- NPV (highest/lowest)
- Name (A-Z)

[Screenshot: Proposals List with Filters]

### Viewing Proposal Details

**How to access:**
Click "View Details" on any proposal card.

**Proposal Detail Page has 6 tabs:**

#### Tab 1: Overview
- Summary metrics (Total Rent, NPV, IRR, EBITDA, Cash, Debt)
- Negotiation context (developer, property, round, status)
- Timeline (submitted date, response date)
- Notes (negotiation notes, board comments)

**What you see:**
- 6 metric cards with large numbers
- Status badge
- Timeline
- Action buttons: Export PDF, Export Excel (but NOT Edit, Delete)

[Screenshot: Overview Tab - Viewer Perspective]

#### Tab 2: Financial Statements
- Profit & Loss Statement (30 years)
- Balance Sheet (30 years)
- Cash Flow Statement (30 years)
- Year range selector

**What you see:**
- Complete financial statements
- Millions formatting (15.50 M = 15,500,000 SAR)
- Year range selector to focus on specific periods
- No edit buttons

[Screenshot: Financial Statements Tab - Read Only]

#### Tab 3: Transition Setup
- View transition period assumptions (2025-2027)
- Revenue, rent, staff costs, other OpEx by year
- No edit capability

#### Tab 4: Dynamic Setup
- View dynamic period assumptions (2028-2053)
- Enrollment projections
- Curriculum & tuition
- Rent model parameters
- Staff cost assumptions
- Other OpEx assumptions
- No edit capability

#### Tab 5: Scenarios
- View saved scenarios only
- Cannot adjust sliders or create new scenarios
- Can see metric comparison tables for saved scenarios

**What you see:**
- List of saved scenarios with names and dates
- Metric comparison table for each saved scenario
- "Baseline vs Scenario" comparison
- No interactive sliders

[Screenshot: Scenarios Tab - Saved Scenarios List]

#### Tab 6: Sensitivity Analysis
- View saved sensitivity analyses only
- See tornado charts
- View data tables
- Cannot run new analyses

**What you see:**
- List of saved sensitivity analyses
- Tornado charts showing variable impact
- Data tables
- Export buttons for charts

[Screenshot: Sensitivity Tab - Saved Analyses]

---

## Understanding Financial Statements

Financial statements are displayed in Millions (M) SAR with 2 decimal places for readability.

### Profit & Loss Statement (P&L)

**Structure:**

```
Revenue
  Tuition Revenue
  IB Revenue (if applicable)
  Total Revenue

Operating Expenses
  Rent Expense
  Staff Costs
  Other Operating Expenses
  Depreciation (OLD + NEW)
  Total Operating Expenses

EBIT (Earnings Before Interest & Tax)

Interest
  Interest Expense (on debt)
  Interest Income (on deposits)
  Net Interest

EBT (Earnings Before Tax)

Zakat Expense

Net Income
```

**Key metrics to look for:**
- **Revenue growth**: Is revenue increasing year over year?
- **EBIT margin**: EBIT / Revenue (should be 15-25% for healthy schools)
- **Net Income**: Bottom line profitability
- **Zakat**: Should be 2.5% of (Equity - PPE) when positive

[Screenshot: P&L Statement Example]

### Balance Sheet

**Structure:**

```
ASSETS
  Current Assets
    Cash
    Accounts Receivable
    Prepaid Expenses
    Total Current Assets

  Non-Current Assets
    Gross PPE (at cost)
    Less: Accumulated Depreciation
    Net PPE

  Total Assets

LIABILITIES
  Current Liabilities
    Accounts Payable
    Accrued Expenses
    Deferred Revenue
    Total Current Liabilities

  Non-Current Liabilities
    Debt Balance

  Total Liabilities

EQUITY
  Retained Earnings (cumulative)
  Total Equity

Total Liabilities + Equity
```

**Key checks:**
- **Balance**: Total Assets = Total Liabilities + Equity (within 1 SAR)
- **Cash**: Should never be below minimum (1 M default)
- **Debt**: Track peak debt year
- **Equity growth**: Should increase over time if profitable

[Screenshot: Balance Sheet Example]

### Cash Flow Statement (Indirect Method)

**Structure:**

```
Operating Activities
  Net Income
  Add: Depreciation (non-cash)
  Changes in Working Capital:
    Decrease/(Increase) in AR
    Decrease/(Increase) in Prepaid
    Increase/(Decrease) in AP
    Increase/(Decrease) in Accrued
    Increase/(Decrease) in Deferred Revenue
  Net Cash from Operating Activities

Investing Activities
  CapEx (purchases of PPE)
  Net Cash from Investing Activities

Financing Activities
  Debt Issuance/(Repayment)
  Net Cash from Financing Activities

Net Change in Cash
Beginning Cash
Ending Cash
```

**Key metrics:**
- **Operating Cash Flow**: Should be positive in most years
- **Free Cash Flow**: Operating CF - CapEx
- **Cash runway**: How many years can the school operate without profit?

[Screenshot: Cash Flow Statement Example]

### Millions Formatting

**Understanding "M" values:**

| Display | Actual SAR | In Words |
|---------|------------|----------|
| 0.50 M | 500,000 | Five hundred thousand |
| 1.00 M | 1,000,000 | One million |
| 15.50 M | 15,500,000 | Fifteen million, five hundred thousand |
| 125.75 M | 125,750,000 | One hundred twenty-five million, seven hundred fifty thousand |

**Hover tooltips:**
- Hover over any "M" value to see exact SAR amount
- Useful for precision when needed

### Year Range Selector

**Purpose:** Focus on specific time periods

**Options:**
- 2023-2030 (Historical + Early Transition + Early Dynamic)
- 2031-2040 (Mid-period)
- 2041-2053 (Late period + Exit)
- Custom (select specific years)

**How to use:**
1. Click year range selector dropdown
2. Choose range
3. Statements update to show only selected years

**Best practice:**
- Use 2023-2030 for near-term analysis
- Use 2041-2053 to see long-term sustainability
- Use Custom to compare specific milestone years

[Screenshot: Year Range Selector]

---

## Viewing Scenarios

Scenarios allow Planners to test "what-if" questions. As a Viewer, you can see the results but not create new scenarios.

### Accessing Scenarios

**Navigation**: Proposal Details → Scenarios Tab

[Screenshot: Scenarios Tab - Viewer Perspective]

### Saved Scenarios List

**What you see:**
- List of scenarios created by Planners
- Scenario name (e.g., "High Growth Case", "Conservative Case")
- Created date and creator
- Variable settings (Enrollment %, CPI %, Tuition Growth %, Rent Escalation %)

**Example:**

**Scenario: "Optimistic Growth"**
- Created by: Jane Planner on Nov 15, 2024
- Enrollment: 120% (20% above baseline)
- CPI: 4.0%
- Tuition Growth: 7.0%
- Rent Escalation: 3.0%

### Metric Comparison Table

**For each scenario, view:**

| Metric | Baseline | Scenario | Absolute Change | % Change |
|--------|----------|----------|-----------------|----------|
| Total Rent (30Y) | 450.00 M | 472.50 M | +22.50 M | +5.00% |
| NPV | 125.00 M | 152.30 M | +27.30 M | +21.84% |
| Total EBITDA | 380.00 M | 445.00 M | +65.00 M | +17.11% |
| Final Cash | 95.00 M | 128.00 M | +33.00 M | +34.74% |
| Max Debt | 45.00 M | 38.00 M | -7.00 M | -15.56% |

**Color coding:**
- Green (+): Favorable change (higher NPV, lower debt)
- Red (-): Unfavorable change

**Interpretation:**
In the "Optimistic Growth" scenario:
- NPV increases by 27.30 M (+21.84%) - very positive
- Total Rent increases by 22.50 M (+5.00%) - expected with higher enrollment
- Max Debt decreases by 7.00 M (-15.56%) - improved liquidity
- **Overall: Optimistic scenario significantly improves financial outcomes**

[Screenshot: Scenario Metric Comparison Table]

### Comparing Multiple Scenarios

**View all saved scenarios together:**
1. Scroll through saved scenarios list
2. Compare metric changes across scenarios
3. Identify best-case, worst-case, and base-case outcomes

**Example comparison:**

- **Baseline**: NPV = 125.00 M
- **Optimistic**: NPV = 152.30 M (+21.84%)
- **Pessimistic**: NPV = 98.50 M (-21.20%)
- **Conservative**: NPV = 115.00 M (-8.00%)

**Insight:** NPV ranges from 98.50 M to 152.30 M depending on assumptions. Board should consider this uncertainty.

---

## Viewing Comparisons

Compare multiple proposals side-by-side to understand trade-offs.

### Accessing Comparison View

**Navigation**: Sidebar → Comparisons

OR: Dashboard → "View Comparisons" link

[Screenshot: Comparison Selection Page]

### Comparison Metrics Matrix

**What you see:**
- Table with proposals as columns, metrics as rows
- Green checkmarks indicating "winner" for each metric
- All proposals' key metrics side-by-side

**Example:**

|  | Proposal A (Fixed) | Proposal B (RevShare) | Proposal C (Partner) |
|---|---|---|---|
| **Total Rent** | ✓ 420.00 M | 475.00 M | 445.00 M |
| **NPV** | 110.00 M | ✓ 135.00 M | 122.00 M |
| **Avg EBITDA** | 12.50 M | ✓ 14.80 M | 13.20 M |
| **Final Cash** | 85.00 M | ✓ 105.00 M | 92.00 M |
| **Peak Debt** | ✓ 32.00 M | 48.00 M | 40.00 M |
| **IRR** | 11.5% | ✓ 14.2% | 12.8% |
| **Payback** | ✓ 7.2 years | 8.5 years | 7.8 years |

**Interpretation:**
- **Proposal A** wins on: Total Rent (lowest), Peak Debt (lowest), Payback (fastest)
- **Proposal B** wins on: NPV (highest), EBITDA (highest), Cash (highest), IRR (highest)
- **Proposal C** is middle ground on all metrics

**Key insight:** Proposal A is safest (low rent, low debt). Proposal B is highest value IF projections hold. Proposal C balances risk/reward.

[Screenshot: Comparison Metrics Matrix with Winners]

### Comparison Charts

#### Chart 1: Rent Trajectory (30 Years)

**What it shows:**
- Line chart with rent over time for each proposal
- X-axis: Years (2023-2053)
- Y-axis: Annual rent (M SAR)

**Insights:**
- Fixed rent: Straight line with steady escalation
- RevShare rent: Variable, follows revenue (could be higher or lower than Fixed)
- Partner rent: Base rent + variable component

**Use case:** Understand long-term rent commitment

[Screenshot: Rent Trajectory Comparison Chart]

#### Chart 2: Cost Breakdown

**What it shows:**
- Stacked bar chart showing total 30-year costs by category
- Categories: Rent, Staff, Other OpEx
- One bar per proposal

**Insights:**
- Which proposal has highest total costs?
- What's the cost mix? (rent-heavy vs staff-heavy)

**Use case:** Understand total cost of ownership

[Screenshot: Cost Breakdown Comparison Chart]

### Side-by-Side Financial Statements

**What you see:**
- Financial statements for all compared proposals displayed side-by-side
- Select a specific year (e.g., 2035)
- View P&L, Balance Sheet, or Cash Flow for all proposals

**Example: P&L for 2035**

|  | Proposal A | Proposal B | Proposal C |
|---|---|---|---|
| Revenue | 85.00 M | 88.50 M | 86.20 M |
| Rent | 18.50 M | 22.10 M | 19.80 M |
| Staff | 35.00 M | 36.00 M | 35.50 M |
| Other OpEx | 15.00 M | 15.50 M | 15.20 M |
| EBIT | 16.50 M | 14.90 M | 15.70 M |
| Net Income | 12.80 M | 11.50 M | 12.20 M |

**Insights:**
- Proposal B has highest revenue (if RevShare, makes sense)
- Proposal B also has highest rent (25% of revenue)
- Proposal A has highest net income despite lower revenue

[Screenshot: Side-by-Side P&L Comparison]

---

## Exporting Reports

As a Viewer, you can export proposals and comparisons for offline review or presentation.

### Export Options

**Two formats available:**
1. **PDF**: Professional report with charts and tables
2. **Excel**: Raw data for further analysis

### Exporting Individual Proposals

**How to export:**
1. Open proposal detail page (Overview tab)
2. Click "Export PDF" or "Export Excel" button (top right)
3. File generates and downloads automatically

**PDF includes:**
- Executive summary (1 page)
- Key metrics cards
- All financial statements (P&L, Balance Sheet, Cash Flow)
- Charts (rent trajectory, cost breakdown, cash flow)
- Assumptions summary

**Excel includes:**
- Summary tab (key metrics)
- P&L tab (30 years, full detail)
- Balance Sheet tab (30 years)
- Cash Flow tab (30 years)
- Assumptions tab

**Use cases:**
- Board meeting handouts
- Financial committee review
- Email to external advisors
- Archive for record-keeping

[Screenshot: Export Buttons on Proposal Page]

### Exporting Comparisons

**How to export:**
1. Navigate to Comparison page
2. Select 2-5 proposals to compare
3. Click "Export Comparison" button
4. Choose PDF or Excel

**Comparison PDF includes:**
- Executive summary (which proposal is best on which metric)
- Comparison metrics matrix with winners
- All comparison charts (rent trajectory, cost breakdown)
- Side-by-side financial statements for Year 5, 15, 25
- Assumptions comparison table

**Comparison Excel includes:**
- Comparison matrix tab
- Rent trajectory data (30 years × N proposals)
- Cost breakdown data
- Side-by-side statements (all years, all proposals)

**Use cases:**
- Board decision-making presentations
- Stakeholder reviews
- Negotiation leverage (show competing offers)

[Screenshot: Export Comparison Dialog]

### Exporting Scenarios

**How to export:**
1. Open proposal Scenarios tab
2. Click "Export Scenario" on any saved scenario
3. Exports metric comparison table as PDF or CSV

**Use cases:**
- Sensitivity documentation
- Risk analysis reports
- What-if presentation slides

### Exporting Sensitivity Analyses

**How to export:**
1. Open proposal Sensitivity tab
2. Click "Export" on any saved analysis
3. Choose format:
   - PNG: Tornado chart image only
   - CSV: Raw data points
   - PDF: Full report with chart and data

**Use cases:**
- Risk assessment presentations
- Board risk committee reports
- Audit documentation

[Screenshot: Export Sensitivity Analysis]

### Best Practices for Exporting

**Do:**
- ✓ Export PDFs for executive review (easier to read)
- ✓ Export Excel for detailed analysis (formulas, pivots, charts)
- ✓ Name exported files clearly (e.g., "Proposal_DeveloperA_Round2_2024-11-15.pdf")
- ✓ Archive key exports for audit trail
- ✓ Export comparisons before Board meetings

**Don't:**
- ✗ Share exports with unauthorized parties (confidential financial data)
- ✗ Rely on exports alone (check original in system for latest data)
- ✗ Export excessively (generates server load)

---

## FAQs

### General Questions

**Q: Why can't I create or edit proposals?**

A: Your role is VIEWER, which provides read-only access. This ensures data integrity and prevents accidental changes. Contact your administrator if you need PLANNER access.

**Q: Can I request a scenario or sensitivity analysis?**

A: Yes! Email a Planner describing what you want tested. Example: "Can you run a scenario with 15% lower enrollment and 5% higher CPI?"

**Q: How often is data updated?**

A: Proposals are updated in real-time as Planners make changes. Refresh your browser to see the latest.

**Q: Can I export data to my own Excel models?**

A: Yes, use the "Export Excel" button to download raw data, then import into your models.

### Understanding Financial Statements

**Q: What does "M" mean?**

A: Millions. All financial amounts are displayed in Millions of SAR with 2 decimals.
- Example: 15.50 M = 15,500,000 SAR

**Q: Why does the Balance Sheet always balance?**

A: The system uses a "debt plug" mechanism. If assets exceed liabilities + equity, the system automatically issues debt to balance. This ensures Assets = Liabilities + Equity always.

**Q: What is Zakat and how is it calculated?**

A: Zakat is an Islamic tax on wealth, calculated as 2.5% of the Zakat base:
- Zakat Base = Equity - Net PPE (fixed assets)
- Zakat = Zakat Base × 2.5% (if positive)

**Q: Why is there OLD and NEW depreciation?**

A:
- OLD: Depreciation from historical assets (pre-2025, actual historical data)
- NEW: Depreciation from future capital expenditures (2025+, projected)

**Q: What is the circular solver?**

A: An algorithm that resolves circular dependencies in the calculations:
- Interest Expense depends on Debt Balance
- Zakat depends on Equity
- Net Income depends on Interest and Zakat
- Debt Balance depends on Cash (which depends on Net Income)
The solver iterates until convergence (typically 2-5 iterations).

### Scenarios & Comparisons

**Q: What's the difference between scenarios and sensitivity analysis?**

A:
- **Scenarios**: Test specific combinations of variables (e.g., "High Growth" = 120% enrollment + 7% tuition growth)
- **Sensitivity**: Test one variable across a range to see its impact (e.g., enrollment from 80% to 120%)

**Q: Why do some proposals have more scenarios than others?**

A: Planners create scenarios based on need. Complex negotiations or uncertain assumptions lead to more scenarios.

**Q: Can I see who created a scenario?**

A: Yes, each saved scenario shows the creator's name and timestamp.

**Q: What does the green checkmark mean in comparisons?**

A: It indicates the "winner" for that metric (best value). For example, lowest Total Rent or highest NPV.

**Q: Can I compare proposals from different negotiations?**

A: Yes! Comparison works across any proposals in the system. Useful for benchmarking or analyzing different properties.

### Exporting

**Q: What's the difference between PDF and Excel exports?**

A:
- **PDF**: Professional report for presentations and review (charts, formatting, executive summary)
- **Excel**: Raw data for further analysis (formulas, pivots, custom charts)

**Q: Can I customize the PDF report format?**

A: Not currently. The PDF follows a standard template. For custom formats, export to Excel and build your own report.

**Q: How long do exported files take to generate?**

A:
- Individual proposal: 1-2 seconds
- Comparison (3 proposals): 3-5 seconds
- Large exports may take up to 10 seconds

**Q: Where do exported files download?**

A: To your browser's default download folder. Check your browser's download manager.

### Troubleshooting

**Q: I can't see a proposal that was just created.**

A: Refresh your browser (Ctrl+R or Cmd+R). If still missing, check filters (you might be filtering it out).

**Q: Financial statements show "N/A" or blank cells.**

A: The proposal may be a DRAFT and not yet calculated. Contact the planner to finalize it.

**Q: Comparison page is blank.**

A: Ensure at least 2 proposals are selected and calculated (not drafts).

**Q: Export is taking too long.**

A: Large exports (comparison with 5 proposals, 30 years) can take 10-15 seconds. If longer, try refreshing and re-exporting.

**Q: I see an error message.**

A: Take a screenshot and contact your administrator or technical support. Include the error message and what you were doing when it occurred.

---

## Next Steps

**Get comfortable with the system:**
1. Browse the proposals list
2. Open a few proposals and review financial statements
3. Try the year range selector
4. View saved scenarios
5. Export a PDF report

**For Board meetings:**
1. Review comparison reports before meetings
2. Export comparison PDFs to share with Board members
3. Prepare questions for Planners based on your review

**Stay informed:**
- Check the Dashboard weekly for new proposals
- Set up email notifications (if available) for proposal status changes
- Review scenarios to understand uncertainty and risk

---

## Support

**Need help?**
- Review this guide
- Check the [FAQ](FAQ.md)
- Contact a Planner for scenario requests
- Contact your Administrator for access issues

**Questions about financial formulas?**
- See [Technical Documentation: Calculation Formulas](../technical/CALCULATION_FORMULAS.md)

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Maintained By:** Documentation Agent
