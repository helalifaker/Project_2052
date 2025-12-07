# Financial Planner Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating a New Proposal](#creating-a-new-proposal)
4. [Viewing Proposal Details](#viewing-proposal-details)
5. [Interactive Scenarios](#interactive-scenarios)
6. [Sensitivity Analysis](#sensitivity-analysis)
7. [Comparing Proposals](#comparing-proposals)
8. [Editing and Managing Proposals](#editing-and-managing-proposals)
9. [FAQs](#faqs)

---

## Introduction

Welcome to the Financial Planner Guide for the School Lease Financial Planning System. As a Planner, you are responsible for creating and analyzing lease proposals, running scenarios, and comparing options to help your organization make informed real estate decisions.

### Your Responsibilities
- Create detailed lease proposals with enrollment, curriculum, and financial projections
- Run "what-if" scenarios to understand impact of key variables
- Perform sensitivity analysis to identify risk factors
- Compare multiple proposals side-by-side
- Export reports for stakeholder review

### Key Features
- **Proposal Wizard**: Step-by-step guided creation of lease proposals
- **Interactive Scenarios**: Real-time "what-if" analysis with sliders (<200ms response)
- **Sensitivity Analysis**: Tornado charts showing variable impact on metrics
- **Comparison Matrix**: Side-by-side comparison of up to 5 proposals
- **Export Capabilities**: PDF and Excel reports for Board presentations

---

## Getting Started

### First Login

**Step 1: Access Your Dashboard**

1. Log in with your planner credentials
2. You'll land on the main Dashboard showing key metrics and proposals
3. Navigate using the sidebar: Dashboard, Proposals, Comparisons

[Screenshot: Planner Dashboard]

**Step 2: Understand Your Permissions**

As a PLANNER, you can:
- ✓ Create new proposals
- ✓ Edit your own proposals
- ✓ Run scenarios and sensitivity analyses
- ✓ Compare proposals
- ✓ Export PDF and Excel reports
- ✓ View all proposals (read-only for others' proposals)

You cannot:
- ✗ Configure system settings (Admin only)
- ✗ Manage historical data (Admin only)
- ✗ Delete other planners' proposals

### Dashboard Overview

Your dashboard displays:
- **Active Proposals**: Total number of proposals in the system
- **Recent Activity**: Latest proposals created or modified
- **Quick Metrics**: Summary statistics across all proposals
- **Quick Actions**: Create New Proposal, Compare Proposals

[Screenshot: Dashboard Metrics Cards]

---

## Creating a New Proposal

The proposal wizard guides you through 7 steps to create a complete financial projection.

### Starting the Wizard

**Navigation**: Dashboard → "Create New Proposal" button OR Proposals → "New Proposal"

[Screenshot: Create Proposal Button]

### Step 1: Proposal Basics

**Purpose:** Define the proposal fundamentals.

#### Fields to Complete:

**Developer Name** (Required)
- The name of the property developer or landlord
- Example: "Developer A", "ABC Real Estate"
- Used for tracking and comparison

**Property Name** (Optional)
- The specific property or location
- Example: "Downtown Campus", "North District Building"

**Negotiation Round** (Auto-generated)
- Starts at 1
- Increments if you create a counter-proposal

**Rent Model** (Required)

Choose one of three rent models:

| Model | Description | Best For |
|-------|-------------|----------|
| **Fixed** | Fixed annual rent with CPI escalation | Predictable costs, budget certainty |
| **RevShare** | Percentage of school revenue | New schools, uncertain enrollment |
| **Partner** | Hybrid: Fixed base + Revenue share | Risk-sharing, aligned incentives |

[Screenshot: Rent Model Selection Cards]

**Tips:**
- Choose Fixed if you want predictable rent expenses
- Choose RevShare if enrollment is uncertain but you want to share upside
- Choose Partner for a balanced approach

Click "Next" to proceed to Step 2.

### Step 2: Transition Period (2025-2027)

**Purpose:** Define the ramp-up period as the school establishes operations.

The transition period covers 3 years (2025, 2026, 2027) before the school reaches steady-state operations in 2028.

#### Fields to Complete:

**For Each Year (2025, 2026, 2027):**

**Total Revenue** (Required)
- Projected revenue for that year
- Enter in SAR (the system will format it)
- Example: 45,000,000 SAR for 2025

**Tuition Revenue** (Optional)
- Break out tuition from total revenue if you have it
- Example: 40,000,000 SAR

**IB Revenue Toggle** (Optional)
- If your school offers International Baccalaureate (IB) program
- Toggle ON and enter IB-specific revenue
- Example: 5,000,000 SAR

**Rent Expense** (Required)
- Rent paid to landlord for that year
- Depends on rent model selected in Step 1
- Example: 12,000,000 SAR for 2025

**Staff Costs** (Required)
- Total salaries and benefits for all staff
- Example: 18,000,000 SAR

**Other Operating Expenses** (Required)
- All non-rent, non-staff operating costs
- Includes utilities, supplies, marketing, etc.
- Example: 8,000,000 SAR

**Tips:**
- Transition years typically have lower revenue as enrollment ramps up
- Rent might be discounted in early years (rent-free period, concessions)
- Staff costs grow as you hire teachers in advance of student enrollment
- Be realistic - avoid overly optimistic projections

[Screenshot: Transition Period Form - 3 Year Tabs]

Click "Next" to proceed to Step 3.

### Step 3: Enrollment Projections (2028-2053)

**Purpose:** Define how student enrollment evolves over the 26-year dynamic period.

#### Fields to Complete:

**Starting Enrollment (2028)** (Required)
- Number of students in Year 1 of steady-state operations
- Example: 1,200 students

**Enrollment Growth Model**

Choose one of three patterns:

**Option A: Linear Growth**
- Enrollment grows by a fixed number each year
- Example: +50 students per year until max capacity

**Option B: S-Curve Growth**
- Slow start, rapid middle growth, plateau at end (realistic)
- Example: 10% growth years 1-5, 20% years 6-15, 5% years 16-26

**Option C: Custom by Year**
- Manually enter enrollment for specific years or milestones
- Most flexible but time-consuming

**Maximum Capacity** (Required)
- Physical maximum the building can accommodate
- Example: 2,000 students

**Capacity Utilization Target** (Required)
- Target % of max capacity to maintain (e.g., 90% to allow for fluctuation)
- Example: 90% = target of 1,800 students if max is 2,000

[Screenshot: Enrollment Growth Model Selection]

**Tips:**
- Be conservative - enrollment rarely grows as fast as hoped
- Consider local demographics and competition
- Account for student churn/attrition (typically 5-10% annually)
- S-Curve is most realistic for new schools

Click "Next" to proceed to Step 4.

### Step 4: Curriculum & Tuition (2028-2053)

**Purpose:** Define grade levels offered and tuition pricing by grade.

#### Fields to Complete:

**Grade Levels Offered**

Select which grades your school will serve:
- ☐ KG1, KG2 (Kindergarten)
- ☐ Grades 1-6 (Elementary)
- ☐ Grades 7-9 (Middle School)
- ☐ Grades 10-12 (High School)
- ☐ IB Diploma (Grades 11-12)

**Enrollment Distribution**

Specify what % of total enrollment is in each grade band:
- KG1-2: ____%
- Grades 1-6: ____%
- Grades 7-9: ____%
- Grades 10-12: ____%
- Total must = 100%

**Tuition by Grade Level (2028 SAR/year)**

| Grade Band | Tuition per Student | Example |
|------------|---------------------|---------|
| KG1-2 | _________ | 25,000 |
| Grades 1-6 | _________ | 30,000 |
| Grades 7-9 | _________ | 35,000 |
| Grades 10-12 | _________ | 40,000 |
| IB Diploma | _________ | 50,000 |

**Tuition Growth Rate** (Required)
- Annual % increase in tuition fees
- Example: 5% per year
- Typically tracks inflation + 1-3%

**IB Toggle**
- Toggle ON if offering IB program
- Requires separate IB fee input
- Example: 10,000 SAR/year IB fee (in addition to tuition)

[Screenshot: Curriculum Configuration Form]

**Tips:**
- Research competitive tuition rates in your area
- KG tuition is typically lowest, high school highest
- IB programs command premium pricing
- Tuition growth should be realistic (3-7% annually)

Click "Next" to proceed to Step 5.

### Step 5: Rent Model Parameters (2028-2053)

**Purpose:** Configure the specific rent payment structure based on the model chosen in Step 1.

#### Option A: Fixed Rent Model

**Year 1 Rent (2028)** (Required)
- Fixed annual rent in first year of operations
- Example: 15,000,000 SAR

**CPI Escalation Rate** (Required)
- Annual % increase in rent (inflation adjustment)
- Example: 3% per year
- Typical range: 2-4%

**Rent-Free Period** (Optional)
- Number of months with no rent (landlord incentive)
- Example: 6 months in 2025
- Applied during transition period

**Formula:**
```
Year N Rent = Year 1 Rent × (1 + CPI Rate)^(N-1)
```

**Example Calculation:**
- Year 1 (2028): 15,000,000 SAR
- Year 2 (2029): 15,000,000 × 1.03 = 15,450,000 SAR
- Year 3 (2030): 15,450,000 × 1.03 = 15,913,500 SAR

[Screenshot: Fixed Rent Configuration]

#### Option B: Revenue Share Model

**Revenue Share %** (Required)
- Percentage of gross school revenue paid as rent
- Example: 25%
- Typical range: 20-35%

**Minimum Rent (Floor)** (Optional)
- Minimum annual rent regardless of revenue
- Protects landlord if revenue is low
- Example: 10,000,000 SAR

**Maximum Rent (Cap)** (Optional)
- Maximum annual rent regardless of revenue
- Protects school if revenue is very high
- Example: 25,000,000 SAR

**Formula:**
```
Rent = max(Min Rent, min(Max Rent, Revenue × Revenue Share %))
```

**Example Calculation:**
- Revenue: 60,000,000 SAR
- Revenue Share: 25%
- Min Rent: 10,000,000 SAR
- Max Rent: 25,000,000 SAR
- **Calculated Rent: 15,000,000 SAR** (60M × 25%)

[Screenshot: Revenue Share Configuration]

#### Option C: Partner Model (Hybrid)

**Fixed Base Rent** (Required)
- Minimum annual fixed rent
- Example: 8,000,000 SAR

**Revenue Share %** (Required)
- Additional rent as % of revenue above threshold
- Example: 15%

**Revenue Threshold** (Required)
- Revenue level at which revenue sharing kicks in
- Example: 50,000,000 SAR

**Formula:**
```
Rent = Fixed Base + max(0, (Revenue - Threshold) × Revenue Share %)
```

**Example Calculation:**
- Revenue: 70,000,000 SAR
- Fixed Base: 8,000,000 SAR
- Revenue Share: 15%
- Threshold: 50,000,000 SAR
- **Calculated Rent: 8,000,000 + (70M - 50M) × 15% = 11,000,000 SAR**

[Screenshot: Partner Model Configuration]

**Tips:**
- Fixed model is most common for established schools
- RevShare is better for startups with uncertain revenue
- Partner model aligns incentives - landlord benefits from school's success
- Always negotiate caps in RevShare models

Click "Next" to proceed to Step 6.

### Step 6: Operating Expenses (2028-2053)

**Purpose:** Project non-rent operating costs.

#### Staff Costs Configuration

**Student-Teacher Ratio** (Required)
- Number of students per teacher
- Example: 15:1 (15 students per teacher)
- Typical range: 12:1 to 20:1

**Average Teacher Salary (2028)** (Required)
- Annual salary per teacher including benefits
- Example: 120,000 SAR/year
- Includes salary, benefits, bonuses

**Non-Teacher Staff %** (Required)
- Administrative and support staff as % of teachers
- Example: 30% (3 support staff for every 10 teachers)
- Includes admin, IT, facilities, counselors

**CPI Growth Rate** (Required)
- Annual % increase in salaries
- Example: 3%
- Typically matches CPI

**Formula:**
```
Number of Teachers = Total Enrollment / Student-Teacher Ratio
Staff Costs = (Teachers × Avg Salary × (1 + Non-Teacher %)) × (1 + CPI)^(Year - 2028)
```

**Example Calculation (2028):**
- Enrollment: 1,200 students
- Ratio: 15:1
- Teachers: 1,200 / 15 = 80
- Avg Salary: 120,000 SAR
- Non-Teacher %: 30%
- **Staff Costs: 80 × 120,000 × 1.30 = 12,480,000 SAR**

[Screenshot: Staff Costs Configuration]

#### Other Operating Expenses

**Annual Other OpEx (2028)** (Required)
- All non-rent, non-staff operating expenses
- Example: 10,000,000 SAR
- Includes: utilities, supplies, maintenance, marketing, technology, insurance

**OpEx Growth Rate** (Required)
- Annual % increase
- Example: 3% (tracks CPI)

**Tips:**
- Other OpEx is typically 15-25% of total revenue
- Don't forget: technology, textbooks, facilities, insurance, marketing
- Be conservative - expenses always higher than expected
- Check if any expenses are included in rent (CAM charges)

Click "Next" to proceed to Step 7.

### Step 7: Review & Submit

**Purpose:** Review all inputs before final calculation.

[Screenshot: Review Summary Page]

#### Review Checklist

The review page shows a summary of all inputs:
- ☐ Proposal basics (developer, rent model)
- ☐ Transition period (2025-2027 projections)
- ☐ Enrollment (starting, growth, capacity)
- ☐ Curriculum & Tuition (grades, pricing, growth)
- ☐ Rent parameters (model-specific)
- ☐ Staff costs (ratio, salaries, growth)
- ☐ Other OpEx

#### Actions

**Edit:** Click "Edit" next to any section to go back and revise

**Save as Draft:** Save progress without calculating
- Useful if you need to gather more information
- Come back later to complete

**Calculate & Save:** Run full 30-year projection
- Calculation takes <1 second for 30 years
- Creates full financial statements (P&L, Balance Sheet, Cash Flow)
- Generates metrics (NPV, IRR, payback period, etc.)

**Tips:**
- Double-check all numbers before calculating
- Ensure enrollment projections are realistic
- Verify rent model parameters match term sheet
- Save as draft if unsure - you can always recalculate

Click "Calculate & Save" to finalize the proposal.

---

## Viewing Proposal Details

After creating a proposal, view comprehensive financials and metrics.

### Accessing Proposal Details

**Navigation**: Proposals → Click on any proposal card

[Screenshot: Proposals List Page]

### Proposal Detail Tabs

The detail page has 6 tabs:

#### Tab 1: Overview

**Summary Metrics (Top Cards):**
- Total Rent (30 years)
- Net Present Value (NPV)
- Internal Rate of Return (IRR)
- Average Annual EBITDA
- Final Cash Balance
- Peak Debt

**Negotiation Context:**
- Developer name
- Property name
- Negotiation round
- Origin (Our Offer / Their Counter)
- Status (Draft, Submitted, Under Review, etc.)

**Quick Actions:**
- Edit Proposal
- Duplicate
- Export PDF
- Export Excel
- Delete

[Screenshot: Overview Tab with Metric Cards]

#### Tab 2: Financial Statements

**Three Financial Statements:**

**Profit & Loss Statement**
- Revenue (tuition, IB, other)
- Operating Expenses (rent, staff, other)
- EBIT (Earnings Before Interest & Tax)
- Interest (expense and income)
- EBT (Earnings Before Tax)
- Zakat
- Net Income

**Balance Sheet**
- Assets (cash, AR, prepaid, PPE)
- Liabilities (AP, accrued, deferred revenue, debt)
- Equity (cumulative retained earnings)
- **Balances automatically** (Assets = Liabilities + Equity)

**Cash Flow Statement** (Indirect Method)
- Operating Cash Flow (starts with Net Income)
- Investing Cash Flow (CapEx)
- Financing Cash Flow (debt issuance/repayment)
- Net Change in Cash

**Year Range Selector**
- Select years to display: 2023-2030, 2031-2040, 2041-2053, or Custom
- Default: Shows first 10 years

**Millions Formatting**
- All amounts displayed in Millions (M) SAR
- Example: 15.50 M = 15,500,000 SAR
- Tooltips show exact amounts

[Screenshot: Financial Statements Tab with Year Range Selector]

**Tips:**
- Use year range selector to focus on specific periods
- Check balance sheet always balances (Assets = Liabilities + Equity within 1 SAR)
- Watch cash flow - negative cash triggers automatic debt issuance
- Depreciation is split between OLD (pre-2025) and NEW (post-2025) assets

#### Tab 3: Transition Setup

**Purpose:** View and edit transition period (2025-2027) assumptions.

Shows:
- Revenue by year
- Rent by year
- Staff costs by year
- Other OpEx by year

**Actions:**
- Edit transition assumptions
- Recalculate proposal with new values

[Screenshot: Transition Setup Tab]

#### Tab 4: Dynamic Setup

**Purpose:** View and edit dynamic period (2028-2053) assumptions.

Shows:
- Enrollment projections graph
- Curriculum & tuition table
- Rent model parameters
- Staff cost assumptions
- Other OpEx assumptions

**Actions:**
- Edit any parameter
- Recalculate proposal

[Screenshot: Dynamic Setup Tab with Enrollment Chart]

#### Tab 5: Scenarios (Interactive)

**Purpose:** Run "what-if" analysis with real-time calculations.

See full section below: [Interactive Scenarios](#interactive-scenarios)

#### Tab 6: Sensitivity Analysis

**Purpose:** Identify which variables have the most impact on key metrics.

See full section below: [Sensitivity Analysis](#sensitivity-analysis)

---

## Interactive Scenarios

Scenarios let you adjust key variables and see the impact on metrics in real-time (<200ms).

### Accessing Scenarios

**Navigation**: Proposal Details → Scenarios Tab

[Screenshot: Scenarios Tab]

### The Four Scenario Sliders

#### 1. Enrollment Capacity (%)

**Range:** 50% to 150% of baseline
**What it does:** Scales enrollment projections up or down
**Example:** 120% = 20% more students than baseline projection

**Use cases:**
- "What if we attract more students than expected?"
- "What if enrollment is lower due to competition?"

#### 2. Consumer Price Index (CPI) Growth (%)

**Range:** 0% to 10% annual
**What it does:** Adjusts staff salary growth and rent escalation
**Example:** 5% CPI = salaries and rent increase 5% per year

**Use cases:**
- "What if inflation is higher than expected?"
- "What if we enter a deflationary period?"

#### 3. Tuition Growth Rate (%)

**Range:** 0% to 15% annual
**What it does:** Adjusts how fast tuition fees increase each year
**Example:** 7% = tuition increases 7% per year

**Use cases:**
- "Can we raise tuition faster than planned?"
- "What if competitive pressure limits tuition increases?"

#### 4. Rent Escalation Rate (%)

**Range:** 0% to 10% annual
**What it does:** Adjusts how fast rent increases each year (Fixed model only)
**Example:** 4% = rent increases 4% per year

**Use cases:**
- "What if landlord wants higher escalation?"
- "Can we negotiate lower escalation?"

[Screenshot: Scenario Sliders with Current Values]

### Real-Time Metric Comparison Table

As you adjust sliders, the table updates instantly showing:

| Metric | Baseline | Current | Absolute Change | % Change |
|--------|----------|---------|-----------------|----------|
| Total Rent (30Y) | 450.00 M | 472.50 M | +22.50 M | +5.00% |
| NPV | 125.00 M | 135.20 M | +10.20 M | +8.16% |
| Total EBITDA (30Y) | 380.00 M | 410.00 M | +30.00 M | +7.89% |
| Final Cash | 95.00 M | 112.00 M | +17.00 M | +17.89% |
| Maximum Debt | 45.00 M | 38.00 M | -7.00 M | -15.56% |

**Color Coding:**
- Green (+) = Favorable change
- Red (-) = Unfavorable change

[Screenshot: Metric Comparison Table]

### Performance

- **Target:** <200ms calculation time
- **Actual:** Typically 50-150ms for 30 years
- Calculation time displayed below table

### Saving Scenarios

**Why save?**
- Compare multiple "what-if" scenarios
- Share scenarios with colleagues
- Return to scenarios later

**How to save:**
1. Adjust sliders to desired values
2. Click "Save Scenario" button
3. Enter a descriptive name (e.g., "High Growth Case")
4. Click "Save"

**Saved scenario includes:**
- All four slider values
- Calculated metrics
- Timestamp and creator

[Screenshot: Save Scenario Dialog]

### Loading Saved Scenarios

**Viewing saved scenarios:**
- Scroll down to "Saved Scenarios" section
- See list of all saved scenarios with timestamps

**Loading a scenario:**
1. Click "Load" on any saved scenario
2. Sliders automatically adjust to saved values
3. Metrics recalculate

**Deleting a scenario:**
1. Click "Delete" on any saved scenario
2. Confirm deletion
3. Cannot be undone

[Screenshot: Saved Scenarios List]

### Best Practices

**Do:**
- ✓ Save your baseline as "Baseline" before experimenting
- ✓ Create optimistic, realistic, and pessimistic scenarios
- ✓ Use descriptive names (e.g., "Low Enrollment + High CPI")
- ✓ Reset to baseline frequently to avoid confusion

**Don't:**
- ✗ Save too many scenarios (keep the 5-7 most relevant)
- ✗ Use extreme values (50% enrollment is unrealistic)
- ✗ Forget to reset before starting a new scenario

---

## Sensitivity Analysis

Sensitivity analysis shows which variables have the biggest impact on your key metrics using tornado charts.

### Accessing Sensitivity Analysis

**Navigation**: Proposal Details → Sensitivity Analysis Tab

[Screenshot: Sensitivity Analysis Tab]

### Understanding Sensitivity Analysis

**Purpose:** Identify risk factors and opportunities

**Question answered:** "If I'm off by 10% on enrollment projections, how much does NPV change?"

**Output:** Tornado chart showing impact of each variable

### Running Sensitivity Analysis

**Step 1: Select Variable to Test**

Choose one of four variables:
- Enrollment %
- CPI Growth %
- Tuition Growth %
- Rent Escalation %

**Step 2: Set Range**

Define the range to test:
- **Minimum:** How much below baseline? (e.g., -20%)
- **Maximum:** How much above baseline? (e.g., +20%)
- System tests 11 points across the range

**Step 3: Select Impact Metric**

Choose which metric to measure:
- NPV (Net Present Value)
- Total Rent (30 years)
- Total EBITDA (30 years)
- Final Cash Balance
- Maximum Debt

**Step 4: Run Analysis**

Click "Run Sensitivity Analysis"
- Takes 2-5 seconds to calculate
- Tests the variable at 11 points
- Generates tornado chart

[Screenshot: Sensitivity Analysis Configuration]

### Interpreting Tornado Charts

**What is a tornado chart?**
- Horizontal bar chart showing impact of variable changes
- Widest bars = highest impact on metric
- Narrow bars = low impact

**Example: NPV Sensitivity**

```
Enrollment %:     |=====================================| (±50M impact)
Tuition Growth %: |==========================| (±30M impact)
CPI Growth %:     |==================| (±20M impact)
Rent Escalation %:|==========| (±10M impact)
```

**Interpretation:**
- Enrollment has the BIGGEST impact on NPV (±50M for ±20% change)
- Rent Escalation has the SMALLEST impact (±10M for ±20% change)
- **Focus risk mitigation on enrollment projections**

[Screenshot: Tornado Chart Example]

### Multiple Sensitivity Analyses

**Comparing different metrics:**

Run sensitivity on:
1. NPV (shows overall value impact)
2. Maximum Debt (shows liquidity risk)
3. Final Cash (shows long-term sustainability)

**Example insights:**
- Enrollment affects NPV most, but CPI affects Max Debt most
- Focus enrollment accuracy for value, CPI accuracy for liquidity

### Exporting Sensitivity Results

**Export options:**
- **PNG:** Tornado chart image for presentations
- **CSV:** Raw data for further analysis in Excel
- **PDF:** Full report with chart and data table

**How to export:**
1. Click "Export" dropdown
2. Select format (PNG, CSV, or PDF)
3. File downloads automatically

[Screenshot: Export Sensitivity Results]

### Best Practices

**Do:**
- ✓ Run sensitivity on NPV first (overall value)
- ✓ Run sensitivity on Max Debt for liquidity risk
- ✓ Use ±20% range for most variables
- ✓ Focus attention on wide bars (high impact variables)
- ✓ Share tornado charts with Board to communicate risk

**Don't:**
- ✗ Test too many variables at once (run separate analyses)
- ✗ Use unrealistic ranges (±50% enrollment is unlikely)
- ✗ Ignore narrow bars - even low impact variables matter
- ✗ Forget to document assumptions

---

## Comparing Proposals

Compare up to 5 proposals side-by-side to identify the best option.

### Accessing Comparison View

**Navigation**: Proposals → "Compare Proposals" button (top right)

OR: Dashboard → "Compare Proposals" quick action

[Screenshot: Compare Proposals Button]

### Selecting Proposals to Compare

**Step 1: Choose Proposals**

Check the boxes next to proposals you want to compare:
- Minimum: 2 proposals
- Maximum: 5 proposals

**Tips:**
- Compare proposals from same developer (e.g., their counter vs our offer)
- Compare proposals from different developers
- Compare different rent models (Fixed vs RevShare vs Partner)

**Step 2: Click "Compare Selected"**

[Screenshot: Proposal Selection with Checkboxes]

### Comparison Metrics Matrix

**Table layout:**
- Rows: Metrics
- Columns: Proposals
- Green checkmark: Best value for that metric

**Metrics compared:**

| Metric | Description | Lower is Better? |
|--------|-------------|------------------|
| Total Rent (30Y) | Total rent paid over 30 years | ✓ Yes |
| NPV | Net Present Value of the deal | ✗ No (higher is better) |
| Avg EBITDA | Average annual earnings | ✗ No (higher is better) |
| Final Cash | Cash balance at Year 30 | ✗ No (higher is better) |
| Peak Debt | Maximum debt reached | ✓ Yes |
| IRR | Internal Rate of Return | ✗ No (higher is better) |
| Payback Period | Years to recover investment | ✓ Yes |

**Example:**

|  | Proposal A (Fixed) | Proposal B (RevShare) | Proposal C (Partner) |
|---|---|---|---|
| **Total Rent** | ✓ 420.00 M | 475.00 M | 445.00 M |
| **NPV** | 110.00 M | ✓ 135.00 M | 122.00 M |
| **Avg EBITDA** | 12.50 M | ✓ 14.80 M | 13.20 M |
| **Final Cash** | 85.00 M | ✓ 105.00 M | 92.00 M |
| **Peak Debt** | ✓ 32.00 M | 48.00 M | 40.00 M |

**Interpretation:**
- Proposal A has lowest rent and lowest debt (most conservative)
- Proposal B has highest NPV and cash (best value if projections hold)
- Proposal C is middle ground (balanced risk/reward)

[Screenshot: Comparison Metrics Matrix with Checkmarks]

### Comparison Charts

**Chart 1: Rent Trajectory (30 Years)**

Line chart showing rent over time for each proposal.

**Insights:**
- Fixed rent: Steady escalation line
- RevShare rent: Variable, follows revenue
- Partner rent: Stepped or hybrid pattern

[Screenshot: Rent Trajectory Comparison Chart]

**Chart 2: Cost Breakdown**

Stacked bar chart showing total costs by category:
- Rent
- Staff
- Other OpEx

**Insights:**
- Which proposal has highest total cost?
- How does cost mix differ?

[Screenshot: Cost Breakdown Comparison Chart]

### Side-by-Side Financial Statements

**View complete financials for all proposals simultaneously.**

**Three views:**
1. **Profit & Loss Comparison**
2. **Balance Sheet Comparison**
3. **Cash Flow Comparison**

**How to use:**
- Select year or year range (e.g., 2035)
- See all proposals' P&L for that year side-by-side
- Quickly spot differences

[Screenshot: Side-by-Side P&L Comparison]

### Exporting Comparisons

**Export options:**
- **PDF:** Full comparison report (all charts, tables, financials)
- **Excel:** Comparison matrix + raw data for further analysis

**How to export:**
1. Click "Export Comparison" button
2. Select PDF or Excel
3. File generates and downloads

**PDF includes:**
- Comparison matrix with winner indicators
- All comparison charts
- Side-by-side financial statements
- Executive summary

**Use for:**
- Board presentations
- Stakeholder reviews
- Financial committee meetings

[Screenshot: Export Comparison Button]

### Best Practices

**Do:**
- ✓ Compare similar proposals (same property, different terms)
- ✓ Compare different developers for same requirements
- ✓ Create comparison scenarios (baseline vs optimistic)
- ✓ Export PDFs for executive review
- ✓ Use green checkmarks to quickly identify winners

**Don't:**
- ✗ Compare more than 5 proposals (too cluttered)
- ✗ Compare proposals with vastly different assumptions
- ✗ Focus on one metric only (consider trade-offs)
- ✗ Ignore qualitative factors (location, landlord reputation)

---

## Editing and Managing Proposals

### Editing an Existing Proposal

**When to edit:**
- Correct input errors
- Update assumptions based on new information
- Negotiate changes to terms

**How to edit:**
1. Open proposal detail page
2. Go to "Transition Setup" or "Dynamic Setup" tab
3. Click "Edit" button
4. Modify values
5. Click "Recalculate" to update financials

**What happens:**
- All financial statements recalculate instantly
- Metrics update
- Saved scenarios remain unchanged (use old assumptions)
- Audit trail created (if implemented)

[Screenshot: Edit Button on Setup Tabs]

### Duplicating a Proposal

**Why duplicate?**
- Create counter-offers from original proposal
- Test variations without losing original
- Create negotiation sequence (Round 1, Round 2, etc.)

**How to duplicate:**
1. Open proposal detail page
2. Click "Duplicate" button (top right)
3. New proposal created with same inputs
4. Edit the duplicate as needed

**Tips:**
- Name duplicates clearly (e.g., "Developer A - Round 2 Counter")
- Link duplicates using negotiation tracking (developer + property + round)

[Screenshot: Duplicate Button]

### Deleting a Proposal

**Permissions:**
- You can delete your own proposals
- Admins can delete any proposal

**How to delete:**
1. Open proposal detail page
2. Click "Delete" button (red, top right)
3. Confirm deletion (cannot be undone)

**Warning:** Deleting removes:
- All financial data
- All saved scenarios
- All sensitivity analyses
- Cannot be recovered

**Alternative:** Change status to "REJECTED" instead of deleting (preserves history)

[Screenshot: Delete Confirmation Dialog]

### Proposal Status Workflow

**Status options:**
- DRAFT: Work in progress
- READY_TO_SUBMIT: Complete, pending submission
- SUBMITTED: Sent to developer/landlord
- UNDER_REVIEW: Developer reviewing our proposal
- COUNTER_RECEIVED: Developer sent counter-offer
- EVALUATING_COUNTER: We're analyzing their counter
- ACCEPTED: Deal agreed
- REJECTED: Deal declined
- NEGOTIATION_CLOSED: Discussion ended (no deal)

**How to change status:**
1. Open proposal detail page
2. Click current status badge (top left)
3. Select new status from dropdown
4. Optionally add notes

**Tips:**
- Keep status updated for team visibility
- Use negotiation notes field to document changes
- Track counters using parent-child relationships

[Screenshot: Status Dropdown]

---

## FAQs

### Creating Proposals

**Q: How long does it take to create a proposal?**

A: 15-30 minutes if you have all information ready. The wizard guides you step-by-step.

**Q: Can I save a draft and come back later?**

A: Yes! Click "Save as Draft" at any step. Your progress is saved and you can resume later from Proposals → Drafts.

**Q: What if I don't have all the information?**

A: Use reasonable estimates and mark the proposal as DRAFT. You can edit it later when you get accurate data.

**Q: Can I copy a proposal from last year?**

A: Yes, use the "Duplicate" function and then edit the duplicated proposal with new values.

### Scenarios

**Q: Why are scenarios useful?**

A: Scenarios let you test "what-if" questions quickly. Example: "What if enrollment is 20% lower than projected?" You'll immediately see the impact on NPV, cash, and debt.

**Q: How many scenarios should I save?**

A: Keep 3-5 scenarios: Baseline, Optimistic, Pessimistic, and 1-2 specific cases (e.g., "High CPI").

**Q: Can other planners see my saved scenarios?**

A: Yes, saved scenarios are attached to the proposal and visible to anyone who can view the proposal.

**Q: Do scenario changes affect the base proposal?**

A: No! Scenarios are temporary. The base proposal remains unchanged unless you explicitly click "Save as New Proposal" (if that feature exists).

### Sensitivity Analysis

**Q: What's the difference between scenarios and sensitivity analysis?**

A:
- **Scenarios:** You manually adjust multiple variables to create a specific case
- **Sensitivity:** The system automatically tests one variable across a range to show its impact

**Q: How do I choose which variable to test?**

A: Start with variables you're most uncertain about (usually enrollment or tuition growth).

**Q: What's a good range to test?**

A: ±20% is standard. Use ±10% for low-risk variables, ±30% for high-risk variables.

**Q: Can I test multiple variables at once?**

A: Not in one analysis. Run separate sensitivity analyses for each variable, then compare the tornado charts.

### Comparing Proposals

**Q: How many proposals can I compare?**

A: 2 to 5 proposals. More than 5 becomes too cluttered.

**Q: Can I compare proposals with different rent models?**

A: Yes! That's one of the best uses of comparison. See how Fixed vs RevShare vs Partner stack up.

**Q: What if two proposals have the same "winner" checkmarks?**

A: It's a tie on that metric. Look at other metrics to break the tie, or use qualitative factors (location, landlord reputation).

**Q: Can I export the comparison for my Board?**

A: Yes, click "Export Comparison" and choose PDF. The report includes all charts, tables, and an executive summary.

### Financial Statements

**Q: What does "M" mean in the financial statements?**

A: Millions. All amounts are displayed in Millions of SAR with 2 decimal places.
- Example: 15.50 M = 15,500,000 SAR

**Q: Why is there "OLD" and "NEW" depreciation?**

A:
- OLD: Depreciation from historical assets (pre-2025, from admin historical data)
- NEW: Depreciation from future CapEx (post-2025, from CapEx module)

**Q: What is the "circular solver"?**

A: An algorithm that resolves circular dependencies:
- Interest depends on debt
- Zakat depends on equity
- Equity depends on net income
- Net income depends on interest and zakat
The solver iterates until these converge (typically 2-5 iterations).

**Q: Why does debt suddenly appear in some years?**

A: If cash falls below the minimum cash balance (configured by Admin), the system automatically issues debt to restore the minimum. This ensures the school never runs out of cash.

### Troubleshooting

**Q: Calculation is taking too long (> 5 seconds).**

A:
- Refresh the page
- Check your internet connection
- Clear browser cache
- Contact support if issue persists

**Q: My scenario slider isn't updating the metrics.**

A:
- Wait 300ms (there's a debounce)
- Check for error messages
- Try refreshing the page
- Ensure proposal was calculated successfully

**Q: I can't edit a proposal.**

A: Check:
- Is it your proposal? (Only creators and Admins can edit)
- Is your role PLANNER or ADMIN? (Viewers can't edit)
- Is it locked for some reason? (Contact Admin)

**Q: Comparison page is blank.**

A:
- Ensure you selected at least 2 proposals
- Check that selected proposals have been calculated (not drafts)
- Try refreshing the page

---

## Next Steps

**Master the basics:**
1. Create your first test proposal (use dummy data)
2. Run a few scenarios to understand the tool
3. Create a sensitivity analysis
4. Compare two proposals

**Real work:**
1. Create proposals for actual negotiations
2. Share PDFs with stakeholders
3. Use comparison matrix to present options to Board
4. Track negotiation rounds using status workflow

**Advanced techniques:**
1. Create negotiation sequences (Round 1, Round 2 counters)
2. Build scenario libraries (Conservative, Base, Aggressive)
3. Combine sensitivity charts to identify risk factors
4. Use Excel exports for custom analysis

---

## Support

**Need help?**
- Review this guide
- Check the [FAQ](FAQ.md)
- Ask your Admin for assistance
- Review [Technical Documentation](../technical/) for formula details

**Feature requests:**
- Contact your system administrator
- Submit feedback through the app

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Maintained By:** Documentation Agent
