# Financial Calculation Formulas

## Overview

This document provides comprehensive documentation of all financial formulas used in the 30-year projection engine.

**For:** Developers, financial analysts, auditors
**Location:** `/src/lib/engine/`

---

## Table of Contents

1. [Revenue Calculations](#revenue-calculations)
2. [Rent Models](#rent-models)
3. [Operating Expenses](#operating-expenses)
4. [Depreciation](#depreciation)
5. [Interest Calculations](#interest-calculations)
6. [Zakat Calculation](#zakat-calculation)
7. [Working Capital](#working-capital)
8. [Balance Sheet](#balance-sheet)
9. [Cash Flow](#cash-flow)
10. [Circular Solver Algorithm](#circular-solver-algorithm)
11. [Metrics Calculations](#metrics-calculations)

---

## Revenue Calculations

### Transition Period (2025-2027)

**Formula:** Manual input (user provides annual revenue)

```
Revenue(year) = User Input
```

**Example:**
- 2025 Revenue = 45,000,000 SAR (user entered)

---

### Dynamic Period (2028-2053)

#### Tuition Revenue

**Formula:**
```
Tuition Revenue = Σ (Enrollment_grade × Tuition_grade × (1 + Growth Rate)^(year - 2028))
```

**Breakdown by Grade:**
```
For each grade band (KG1-2, 1-6, 7-9, 10-12):
  Students_grade = Total Enrollment × Grade Distribution %
  Revenue_grade = Students_grade × Tuition_grade × (1 + Growth Rate)^(year - 2028)

Total Tuition Revenue = Σ Revenue_grade
```

**Example (Year 2030):**
```
Total Enrollment = 1,500 students
Distribution: KG (15%), 1-6 (40%), 7-9 (25%), 10-12 (20%)
Tuition (2028): KG=25k, 1-6=30k, 7-9=35k, 10-12=40k
Growth Rate = 5%
Years since 2028 = 2

KG Revenue = (1500 × 0.15) × 25,000 × (1.05)^2 = 225 × 25,000 × 1.1025 = 6,201,563 SAR
1-6 Revenue = (1500 × 0.40) × 30,000 × (1.05)^2 = 600 × 30,000 × 1.1025 = 19,845,000 SAR
7-9 Revenue = (1500 × 0.25) × 35,000 × (1.05)^2 = 375 × 35,000 × 1.1025 = 14,470,313 SAR
10-12 Revenue = (1500 × 0.20) × 40,000 × (1.05)^2 = 300 × 40,000 × 1.1025 = 13,230,000 SAR

Total Tuition Revenue = 53,746,875 SAR
```

#### IB Revenue (Optional)

**Formula:**
```
IB Revenue = IB Students × IB Fee × (1 + Growth Rate)^(year - 2028)
```

**Where:**
```
IB Students = Total Enrollment × IB Participation %
```

**Example:**
```
Total Enrollment = 1,500
IB Participation = 10%
IB Students = 150
IB Fee (2028) = 10,000 SAR
Growth Rate = 5%
Years since 2028 = 2

IB Revenue = 150 × 10,000 × (1.05)^2 = 150 × 10,000 × 1.1025 = 1,653,750 SAR
```

#### Total Revenue

**Formula:**
```
Total Revenue = Tuition Revenue + IB Revenue (if enabled)
```

**Excel Equivalent:**
```excel
=SUMPRODUCT(enrollment_by_grade, tuition_by_grade * (1+growth_rate)^(year-2028))
  + IF(ib_enabled, ib_students * ib_fee * (1+growth_rate)^(year-2028), 0)
```

---

## Rent Models

### Fixed Rent Model

**Formula:**
```
Rent(year) = Year 1 Rent × (1 + CPI Rate)^(year - 2028)
```

**Example:**
```
Year 1 Rent (2028) = 15,000,000 SAR
CPI Rate = 3%
Year = 2035 (7 years after 2028)

Rent(2035) = 15,000,000 × (1.03)^7
           = 15,000,000 × 1.2299
           = 18,448,500 SAR
```

**Excel Equivalent:**
```excel
=base_rent * (1+cpi_rate)^(year-2028)
```

---

### Revenue Share Model

**Formula:**
```
Rent = MAX(Min Rent, MIN(Max Rent, Revenue × Revenue Share %))
```

**With floor and ceiling protection:**
```
IF Revenue × Share % < Min Rent:
  Rent = Min Rent
ELSE IF Revenue × Share % > Max Rent:
  Rent = Max Rent
ELSE:
  Rent = Revenue × Share %
```

**Example:**
```
Revenue = 60,000,000 SAR
Revenue Share % = 25%
Min Rent = 10,000,000 SAR
Max Rent = 25,000,000 SAR

Calculated Rent = 60,000,000 × 0.25 = 15,000,000 SAR
Actual Rent = MAX(10,000,000, MIN(25,000,000, 15,000,000)) = 15,000,000 SAR
```

**Excel Equivalent:**
```excel
=MAX(min_rent, MIN(max_rent, revenue * share_percent))
```

---

### Partner Model (Hybrid)

**Formula:**
```
Rent = Fixed Base + MAX(0, (Revenue - Threshold) × Revenue Share %)
```

**Only revenue above threshold is shared:**
```
IF Revenue > Threshold:
  Variable Component = (Revenue - Threshold) × Share %
ELSE:
  Variable Component = 0

Rent = Fixed Base + Variable Component
```

**Example:**
```
Revenue = 70,000,000 SAR
Fixed Base = 8,000,000 SAR
Threshold = 50,000,000 SAR
Revenue Share % = 15%

Excess Revenue = 70,000,000 - 50,000,000 = 20,000,000 SAR
Variable Component = 20,000,000 × 0.15 = 3,000,000 SAR
Rent = 8,000,000 + 3,000,000 = 11,000,000 SAR
```

**Excel Equivalent:**
```excel
=fixed_base + MAX(0, (revenue - threshold) * share_percent)
```

---

## Operating Expenses

### Staff Costs

**Formula:**
```
Teachers = CEIL(Total Enrollment / Student-Teacher Ratio)
Non-Teacher Staff = Teachers × Non-Teacher Staff %
Total Staff = Teachers + Non-Teacher Staff
Staff Costs = Total Staff × Average Salary × (1 + CPI)^(year - 2028)
```

**Example (Year 2030):**
```
Total Enrollment = 1,500 students
Student-Teacher Ratio = 15:1
Teachers = CEIL(1,500 / 15) = 100
Non-Teacher Staff % = 30%
Non-Teacher Staff = 100 × 0.30 = 30
Total Staff = 130
Average Salary (2028) = 120,000 SAR
CPI = 3%
Years since 2028 = 2

Staff Costs = 130 × 120,000 × (1.03)^2
            = 130 × 120,000 × 1.0609
            = 16,551,000 SAR
```

**Excel Equivalent:**
```excel
=(CEILING(enrollment/ratio,1) * (1+non_teacher_percent)) * avg_salary * (1+cpi)^(year-2028)
```

---

### Other Operating Expenses

**Formula:**
```
Other OpEx(year) = Base Other OpEx × (1 + CPI)^(year - 2028)
```

**Example:**
```
Base Other OpEx (2028) = 10,000,000 SAR
CPI = 3%
Year = 2030

Other OpEx(2030) = 10,000,000 × (1.03)^2
                 = 10,000,000 × 1.0609
                 = 10,609,000 SAR
```

---

## Depreciation

### Straight-Line Method

**Formula:**
```
Annual Depreciation = Asset Cost / Useful Life
```

**Depreciation Schedule:**
```
Year 1 Depreciation = Cost / Life
Year 2 Depreciation = Cost / Life
...
Year N Depreciation = Cost / Life (where N <= Life)
Year N+1 Depreciation = 0 (fully depreciated)
```

**Example:**
```
Asset Cost = 1,000,000 SAR
Useful Life = 10 years

Annual Depreciation = 1,000,000 / 10 = 100,000 SAR/year
Year 1-10: 100,000 SAR each year
Year 11+: 0 SAR
```

**Excel Equivalent:**
```excel
=IF(year - purchase_year < useful_life, cost/useful_life, 0)
```

---

### Declining Balance Method

**Formula:**
```
Rate = 2 / Useful Life  (Double Declining Balance)
Annual Depreciation = Net Book Value × Rate
Net Book Value = Cost - Accumulated Depreciation
```

**Depreciation Schedule:**
```
Year 1: Dep = Cost × Rate
Year 2: Dep = (Cost - Year 1 Dep) × Rate
Year 3: Dep = (Cost - Year 1 Dep - Year 2 Dep) × Rate
...
```

**Example:**
```
Asset Cost = 1,000,000 SAR
Useful Life = 10 years
Rate = 2 / 10 = 0.20 (20%)

Year 1: Dep = 1,000,000 × 0.20 = 200,000 SAR, NBV = 800,000 SAR
Year 2: Dep = 800,000 × 0.20 = 160,000 SAR, NBV = 640,000 SAR
Year 3: Dep = 640,000 × 0.20 = 128,000 SAR, NBV = 512,000 SAR
...
```

**Excel Equivalent:**
```excel
=DDB(cost, salvage_value, useful_life, period, factor)
```

---

### OLD vs NEW Depreciation

**OLD Depreciation (Pre-2025 assets):**
```
OLD Depreciation = Σ Depreciation from Historical Assets
```
- Entered via Historical Data
- Cannot be modified (historical fact)

**NEW Depreciation (2025+ assets):**
```
NEW Depreciation = Σ Depreciation from Future CapEx
```
- Configured via CapEx Module
- Can be edited for scenario analysis

**Total Depreciation:**
```
Total Depreciation = OLD Depreciation + NEW Depreciation
```

---

## Interest Calculations

### Interest Expense (on Debt)

**Formula:**
```
Average Debt = (Opening Debt + Closing Debt) / 2
Interest Expense = Average Debt × Debt Interest Rate
```

**Why average?** More accurate than using only opening or closing balance.

**Example:**
```
Opening Debt = 10,000,000 SAR
Closing Debt = 12,000,000 SAR
Debt Interest Rate = 5%

Average Debt = (10,000,000 + 12,000,000) / 2 = 11,000,000 SAR
Interest Expense = 11,000,000 × 0.05 = 550,000 SAR
```

**Excel Equivalent:**
```excel
=((opening_debt + closing_debt) / 2) * debt_rate
```

---

### Interest Income (on Cash Deposits)

**Formula:**
```
Average Cash = (Opening Cash + Closing Cash) / 2
Excess Cash = MAX(0, Average Cash - Minimum Cash Balance)
Interest Income = Excess Cash × Deposit Interest Rate
```

**Only cash above minimum earns interest.**

**Example:**
```
Opening Cash = 8,000,000 SAR
Closing Cash = 10,000,000 SAR
Minimum Cash = 1,000,000 SAR
Deposit Interest Rate = 2%

Average Cash = (8,000,000 + 10,000,000) / 2 = 9,000,000 SAR
Excess Cash = MAX(0, 9,000,000 - 1,000,000) = 8,000,000 SAR
Interest Income = 8,000,000 × 0.02 = 160,000 SAR
```

**Excel Equivalent:**
```excel
=MAX(0, ((opening_cash + closing_cash)/2) - min_cash) * deposit_rate
```

---

### Net Interest

**Formula:**
```
Net Interest = Interest Income - Interest Expense
```

**If Net Interest > 0:** Net interest income (cash generating)
**If Net Interest < 0:** Net interest expense (cash consuming)

---

## Zakat Calculation

**Formula:**
```
Zakat Base = Total Equity - Net PPE
Zakat Expense = MAX(0, Zakat Base × Zakat Rate)
```

**Components:**
```
Total Equity = Opening Equity + Net Income (before Zakat)
Net PPE = Gross PPE - Accumulated Depreciation
Zakat Rate = 2.5% (default, configurable)
```

**Rationale:** Zakat is calculated on "working capital" (Equity - Non-Current Assets)

**Example:**
```
Total Equity = 10,000,000 SAR
Net PPE = 8,000,000 SAR
Zakat Rate = 2.5%

Zakat Base = 10,000,000 - 8,000,000 = 2,000,000 SAR
Zakat Expense = 2,000,000 × 0.025 = 50,000 SAR
```

**If Zakat Base ≤ 0:** No Zakat payable

**Excel Equivalent:**
```excel
=MAX(0, (total_equity - net_ppe) * zakat_rate)
```

---

## Working Capital

### Working Capital Ratios (Calculated from 2024 Data)

**Formulas:**
```
AR % = (Accounts Receivable / Revenue) × 100
Prepaid % = (Prepaid Expenses / Revenue) × 100
AP % = (Accounts Payable / Operating Expenses) × 100
Accrued % = (Accrued Expenses / Operating Expenses) × 100
Deferred Revenue % = (Deferred Revenue / Revenue) × 100
```

**Example (2024 Data):**
```
Revenue = 60,000,000 SAR
AR = 3,000,000 SAR
AR % = (3,000,000 / 60,000,000) × 100 = 5%

Operating Expenses = 45,000,000 SAR
AP = 2,000,000 SAR
AP % = (2,000,000 / 45,000,000) × 100 = 4.44%
```

---

### Dynamic Period Working Capital (Using Ratios)

**Formulas:**
```
Accounts Receivable = Revenue × (AR % / 100)
Prepaid Expenses = Revenue × (Prepaid % / 100)
Accounts Payable = Operating Expenses × (AP % / 100)
Accrued Expenses = Operating Expenses × (Accrued % / 100)
Deferred Revenue = Revenue × (Deferred Revenue % / 100)
```

**Example (Year 2030, using 2024 ratios):**
```
Revenue = 70,000,000 SAR
AR % = 5%
AR = 70,000,000 × 0.05 = 3,500,000 SAR

Operating Expenses = 50,000,000 SAR
AP % = 4.44%
AP = 50,000,000 × 0.0444 = 2,220,000 SAR
```

**Excel Equivalent:**
```excel
=revenue * (ar_percent/100)
```

---

## Balance Sheet

### Assets

**Current Assets:**
```
Cash = Calculated (see Cash Flow section)
Accounts Receivable = Revenue × AR %
Prepaid Expenses = Revenue × Prepaid %
Total Current Assets = Cash + AR + Prepaid
```

**Non-Current Assets:**
```
Gross PPE = Prior Year Gross PPE + CapEx
Accumulated Depreciation = Prior Year Acc Dep + Current Year Dep
Net PPE = Gross PPE - Accumulated Depreciation
```

**Total Assets:**
```
Total Assets = Total Current Assets + Net PPE
```

---

### Liabilities

**Current Liabilities:**
```
Accounts Payable = Operating Expenses × AP %
Accrued Expenses = Operating Expenses × Accrued %
Deferred Revenue = Revenue × Deferred Revenue %
Total Current Liabilities = AP + Accrued + Deferred
```

**Non-Current Liabilities:**
```
Debt Balance = Calculated (balance sheet plug, see below)
```

**Total Liabilities:**
```
Total Liabilities = Total Current Liabilities + Debt Balance
```

---

### Equity

**Formula:**
```
Total Equity = Prior Year Equity + Current Year Net Income
```

**Breakdown:**
```
Retained Earnings = Cumulative Net Income (all years)
Total Equity = Retained Earnings
```

---

### Balance Sheet Balancing (Debt Plug)

**Identity:**
```
Assets = Liabilities + Equity
```

**Debt Plug Formula:**
```
Required Debt = Total Assets - Total Current Liabilities - Total Equity
Debt Balance = MAX(0, Required Debt)
```

**If Required Debt < 0:** Debt = 0 (excess assets funded by equity)

**Example:**
```
Total Assets = 100,000,000 SAR
Total Current Liabilities = 20,000,000 SAR
Total Equity = 70,000,000 SAR

Required Debt = 100,000,000 - 20,000,000 - 70,000,000 = 10,000,000 SAR
Debt Balance = 10,000,000 SAR
```

**Balance Check:**
```
Assets = 100,000,000 SAR
Liabilities + Equity = (20,000,000 + 10,000,000) + 70,000,000 = 100,000,000 SAR ✓
```

---

## Cash Flow

### Cash Flow Statement (Indirect Method)

**Operating Activities:**
```
Net Income
+ Depreciation (non-cash expense, add back)
- Increase in AR (cash not collected)
+ Decrease in AR (cash collected)
- Increase in Prepaid (cash paid in advance)
+ Decrease in Prepaid
+ Increase in AP (cash owed, not paid yet)
- Decrease in AP (cash paid to vendors)
+ Increase in Accrued (expense recognized, not paid)
- Decrease in Accrued
+ Increase in Deferred Revenue (cash collected in advance)
- Decrease in Deferred Revenue
= Operating Cash Flow
```

**Investing Activities:**
```
- CapEx (capital expenditures, negative for cash outflow)
= Investing Cash Flow
```

**Financing Activities:**
```
+ Debt Issuance (positive for cash inflow)
- Debt Repayment (negative for cash outflow)
= Financing Cash Flow
```

**Net Change in Cash:**
```
Net Cash Flow = Operating CF + Investing CF + Financing CF
Ending Cash = Beginning Cash + Net Cash Flow
```

---

### Cash Flow Formulas (Detailed)

**Operating Cash Flow:**
```
OCF = Net Income
    + Depreciation
    + (Prior AR - Current AR)
    + (Prior Prepaid - Current Prepaid)
    + (Current AP - Prior AP)
    + (Current Accrued - Prior Accrued)
    + (Current Deferred Revenue - Prior Deferred Revenue)
```

**Investing Cash Flow:**
```
ICF = - CapEx
```

**Financing Cash Flow:**
```
FCF = Current Debt - Prior Debt
```

**Ending Cash:**
```
Ending Cash = Prior Cash + OCF + ICF + FCF
```

**Minimum Cash Enforcement:**
```
IF Ending Cash < Minimum Cash Balance:
  Additional Debt = Minimum Cash Balance - Ending Cash
  Ending Cash = Minimum Cash Balance
  Debt Balance = Debt Balance + Additional Debt
```

**Excel Equivalent:**
```excel
=MAX(min_cash, beginning_cash + operating_cf + investing_cf + financing_cf)
```

---

## Circular Solver Algorithm

The circular solver resolves interdependencies between Interest, Zakat, and Debt.

### The Circular Dependency Problem

```
Interest Expense depends on Debt Balance
↓
EBT = EBIT + Net Interest
↓
Zakat depends on Equity
↓
Net Income = EBT - Zakat
↓
Equity = Prior Equity + Net Income
↓
Debt Balance = Total Assets - Current Liabilities - Equity (balance sheet plug)
↓
[CIRCULAR: Debt Balance affects Interest Expense]
```

### Fixed-Point Iteration Algorithm

**Input:** Prior year balances, current year revenue/costs

**Algorithm:**
```
1. Initialize: Debt_estimate = Prior Year Debt

2. Loop (max 100 iterations):

   a. Calculate Interest Expense:
      Average_Debt = (Prior_Debt + Debt_estimate) / 2
      Interest_Expense = Average_Debt × Debt_Rate

   b. Calculate Interest Income:
      Average_Cash = (Prior_Cash + Calculated_Cash_estimate) / 2
      Excess_Cash = MAX(0, Average_Cash - Min_Cash)
      Interest_Income = Excess_Cash × Deposit_Rate

   c. Calculate EBT:
      Net_Interest = Interest_Income - Interest_Expense
      EBT = EBIT + Net_Interest

   d. Calculate Zakat:
      Temp_Net_Income = EBT (without Zakat yet)
      Temp_Equity = Prior_Equity + Temp_Net_Income
      Zakat_Base = Temp_Equity - Net_PPE
      Zakat = MAX(0, Zakat_Base × Zakat_Rate)

   e. Calculate Net Income:
      Net_Income = EBT - Zakat

   f. Calculate Cash Flow and Cash:
      OCF = Net_Income + Depreciation + WC_Changes
      ICF = -CapEx
      FCF = Debt_estimate - Prior_Debt
      Calculated_Cash = Prior_Cash + OCF + ICF + FCF
      Cash = MAX(Min_Cash, Calculated_Cash)

   g. Calculate Equity:
      Equity = Prior_Equity + Net_Income

   h. Calculate Required Debt (balance sheet plug):
      Required_Debt = Total_Assets - Current_Liabilities - Equity

   i. Check Convergence:
      Difference = |Required_Debt - Debt_estimate|
      IF Difference < $1:
         CONVERGED ✓
         RETURN {Debt, Interest, Zakat, Net_Income, Cash}

   j. Update Estimate (with relaxation factor):
      α = 0.5 (relaxation factor)
      Debt_estimate = α × Debt_estimate + (1-α) × Required_Debt

3. IF not converged after 100 iterations:
   RETURN last values with warning
```

**Convergence:**
- Tolerance: 1 SAR (0.000001 M)
- Typical iterations: 2-5
- Relaxation factor: 0.5 (prevents oscillation)

---

## Metrics Calculations

### Total Rent (30 Years)

**Formula:**
```
Total Rent = Σ Rent(year) for year = 2025 to 2053
```

**Example:**
```
Total Rent = Rent(2025) + Rent(2026) + ... + Rent(2053)
           = 450,000,000 SAR
```

---

### Net Present Value (NPV)

**Formula:**
```
NPV = Σ [Cash Flow(year) / (1 + Discount Rate)^(year - 2024)]
```

**Where:**
```
Cash Flow(year) = Net Income(year) + Depreciation(year) - CapEx(year)
```

**Note:** Full NPV calculation with discount rate is roadmap feature. Current system uses Total Net Income as proxy.

---

### Internal Rate of Return (IRR)

**Formula:**
```
IRR = Discount Rate where NPV = 0
```

**Calculation:** Iterative solver (Newton-Raphson method)

**Note:** IRR calculation is roadmap feature.

---

### Average ROE (Return on Equity)

**Formula:**
```
ROE(year) = Net Income(year) / Average Equity(year)
Average Equity = (Opening Equity + Closing Equity) / 2

Average ROE = (Σ ROE(year)) / Number of Years
```

**Example:**
```
Years 2025-2053 (29 years)
Average ROE = (ROE_2025 + ROE_2026 + ... + ROE_2053) / 29
```

---

### Peak Debt

**Formula:**
```
Peak Debt = MAX(Debt(year)) for year = 2025 to 2053
```

**Example:**
```
Peak Debt occurs in 2030 = 45,000,000 SAR
```

---

### Final Cash Balance

**Formula:**
```
Final Cash = Cash(2053)
```

**Example:**
```
Final Cash = 95,000,000 SAR
```

---

## Excel Formula Equivalents

### Summary Table

| Calculation | Excel Formula |
|-------------|---------------|
| Tuition Revenue | `=SUMPRODUCT(enrollment_by_grade, tuition_by_grade * (1+growth)^years)` |
| Fixed Rent | `=base_rent * (1+cpi)^(year-2028)` |
| RevShare Rent | `=MAX(min_rent, MIN(max_rent, revenue * share))` |
| Partner Rent | `=fixed_base + MAX(0, (revenue-threshold) * share)` |
| Staff Costs | `=(CEILING(enrollment/ratio,1) * (1+non_teacher_pct)) * salary * (1+cpi)^years` |
| Depreciation (SL) | `=IF(year-purchase < life, cost/life, 0)` |
| Depreciation (DB) | `=DDB(cost, salvage, life, period, factor)` |
| Interest Expense | `=((open_debt+close_debt)/2) * debt_rate` |
| Interest Income | `=MAX(0, ((open_cash+close_cash)/2)-min_cash) * deposit_rate` |
| Zakat | `=MAX(0, (equity-net_ppe) * zakat_rate)` |
| Working Capital | `=revenue * (ratio/100)` |
| Debt Plug | `=MAX(0, assets - current_liab - equity)` |
| Cash (Enforced Min) | `=MAX(min_cash, begin_cash + ocf + icf + fcf)` |

---

## Related Documentation

- [Architecture](ARCHITECTURE.md) - System architecture
- [API Reference](API_REFERENCE.md) - API endpoints
- [Database Schema](DATABASE_SCHEMA.md) - Database structure

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Maintained By:** Documentation Agent
