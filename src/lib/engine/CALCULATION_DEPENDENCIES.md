# CALCULATION ENGINE - DEPENDENCY DOCUMENTATION

**Phase 2: Core Financial Engine**
**Document Type:** Technical Reference
**Last Updated:** November 22, 2025
**Status:** Day 1-2 Architecture Complete

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Calculation Flow](#calculation-flow)
3. [Period Dependencies](#period-dependencies)
4. [Circular Dependencies](#circular-dependencies)
5. [Statement Dependencies](#statement-dependencies)
6. [Module Dependencies](#module-dependencies)
7. [Data Flow Diagrams](#data-flow-diagrams)

---

## OVERVIEW

The financial calculation engine processes 30 years of data (2024-2053) across three distinct periods:

| Period | Years | Type | Complexity |
|--------|-------|------|------------|
| **Historical** | 2023-2024 | Actual data | Low - Direct import |
| **Transition** | 2025-2027 | Projections | Medium - Pre-fill + ratios |
| **Dynamic** | 2028-2053 | Full projection | High - Enrollment + models |

### Key Principles

1. **Sequential Processing**: Years must be calculated in order (2024 → 2025 → ... → 2053)
2. **Period Continuity**: Each year's balance sheet opening = previous year's closing
3. **Circular Resolution**: Interest ↔ Zakat ↔ Debt must converge via iteration
4. **Balance Sheet Balancing**: Assets = Liabilities + Equity (debt is the plug)
5. **Cash Flow Reconciliation**: Δ Cash must match balance sheet changes

---

## CALCULATION FLOW

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CALCULATION ENGINE INPUT                      │
│  - System Config (zakat rate, interest rates, min cash)         │
│  - Historical Data (2023-2024)                                   │
│  - Transition Config (2025-2027)                                 │
│  - Dynamic Config (enrollment, curriculum, rent model)           │
│  - CapEx Config                                                  │
│  - Working Capital Ratios                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PERIOD ORCHESTRATOR (index.ts)                 │
│  Loops through years 2024-2053 in sequence                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                 ┌────────────┴────────────┐
                 ↓                         ↓
┌─────────────────────────┐   ┌─────────────────────────┐
│   HISTORICAL PERIOD     │   │   TRANSITION PERIOD     │
│   (2023-2024)           │   │   (2025-2027)           │
│                         │   │                         │
│ - Import actual data    │   │ - Pre-fill from prior   │
│ - Calculate WC ratios   │   │ - Apply growth rates    │
│ - Validate immutability │   │ - Use rent model        │
└─────────────────────────┘   └─────────────────────────┘
                                             ↓
                              ┌─────────────────────────┐
                              │   DYNAMIC PERIOD        │
                              │   (2028-2053)           │
                              │                         │
                              │ - Enrollment engine     │
                              │ - Curriculum calculator │
                              │ - Staff cost calculator │
                              │ - Rent model            │
                              │ - CapEx module          │
                              └─────────────────────────┘
                                             ↓
┌─────────────────────────────────────────────────────────────────┐
│               FOR EACH YEAR: CIRCULAR SOLVER                     │
│  Iteratively solve: Interest ↔ Zakat ↔ Debt                    │
│  1. Estimate debt (from prior year or initial guess)            │
│  2. Calculate interest expense                                   │
│  3. Calculate EBT, then Zakat                                    │
│  4. Calculate net income                                         │
│  5. Update balance sheet → new debt requirement                 │
│  6. Check convergence (|new debt - old debt| < $0.01)          │
│  7. Repeat until converged (max 100 iterations)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FINANCIAL STATEMENTS GENERATION                 │
│  1. Profit & Loss (from circular solver results)                │
│  2. Balance Sheet (with debt plug to balance)                   │
│  3. Cash Flow (indirect method from P&L and BS changes)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         VALIDATION                               │
│  - Balance sheet balanced? (diff < $0.01)                       │
│  - Cash flow reconciled? (diff < $0.01)                         │
│  - Solver converged? (iterations < 100)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CALCULATION ENGINE OUTPUT                       │
│  - 30 years of financial periods                                │
│  - Summary metrics (NPV, IRR, ROE, etc.)                        │
│  - Validation results                                            │
│  - Performance metrics                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## PERIOD DEPENDENCIES

### Historical Period (2023-2024)

**Inputs:**
- Database: `HistoricalData` table (all P&L and BS line items)
- System Config: Zakat rate, interest rates (for validation only)
- Working Capital Ratios: If not auto-calculating

**Outputs:**
- Financial Period for 2023 and 2024
- **Working Capital Ratios** (GAP 2): Auto-calculated from 2024 data
  - AR % = AR / Revenue
  - Prepaid % = Prepaid / OpEx
  - AP % = AP / OpEx
  - Accrued % = Accrued / OpEx
  - Deferred Revenue % = Deferred Revenue / Revenue

**Dependencies:**
- 2024 balance sheet → used as opening balance for 2025
- 2024 WC ratios → applied to all future years (unless overridden)

**GAP Coverage:**
- ✅ GAP 2: Working Capital Auto-calculation
- ✅ GAP 17: Historical Data Immutability

### Transition Period (2025-2027)

**Inputs:**
- Prior Year: 2024 balance sheet (opening balances)
- Transition Config: Pre-fill flags, growth rates, OpEx assumptions
- Rent Model: One of 3 models (Fixed, Revenue Share, Partner)
- Working Capital Ratios: From 2024 or manual
- CapEx Config: Any new assets purchased

**Calculation Order:**
1. **Pre-fill Logic** (GAP 19):
   - If `preFillFromPriorYear = true`: Copy prior year's values as starting point
   - Else: Use manual inputs

2. **Revenue Projection**:
   - If pre-filled: `Revenue[year] = Revenue[prior] * (1 + growthRate)`
   - Else: Use manual revenue input

3. **Rent Calculation**: Apply selected rent model

4. **Staff Costs**: Use ratio or fixed amount

5. **Other OpEx**: From input

6. **Working Capital**: Apply 2024 ratios

7. **CapEx & Depreciation**: Track new assets + depreciate old assets

8. **Circular Solver**: Resolve Interest ↔ Zakat ↔ Debt

**Outputs:**
- Financial Periods for 2025, 2026, 2027
- 2027 balance sheet → opening balance for 2028

**GAP Coverage:**
- ✅ GAP 4: Partner Investment rent model
- ✅ GAP 19: Pre-fill logic

### Dynamic Period (2028-2053)

**Inputs:**
- Prior Year: 2027 balance sheet (opening balances)
- Enrollment Config: Ramp-up schedule, steady state, grade distribution
- Curriculum Config: IB toggle, tuition fees per curriculum
- Staff Config: Fixed + variable costs
- Rent Model: Same as Transition
- CapEx Config: Auto-reinvestment settings
- Working Capital Ratios: From 2024

**Calculation Order:**
1. **Enrollment Engine** (GAP 20):
   ```
   IF year is in ramp-up period (2028-2032):
     students = interpolate(startStudents, targetStudents, year)
   ELSE:
     students = steadyStateStudents
   ```

2. **Curriculum Revenue** (GAP 3):
   ```
   IF IB enabled AND year >= IB start year:
     IB_students = students * ibStudentPercentage
     National_students = students * (1 - ibStudentPercentage)
     revenue = (IB_students * ibFee) + (National_students * nationalFee)
   ELSE:
     revenue = students * nationalFee
   ```

3. **Staff Costs**:
   ```
   staffCost = fixedStaffCost + (students * variableStaffCostPerStudent)
   ```

4. **Rent Calculation**: Apply selected rent model

5. **CapEx** (GAP 1):
   - Auto-reinvestment: Every N years, add new assets
   - Depreciation: Calculate for all assets (OLD + NEW)
   - Accumulate depreciation, track NBV

6. **Working Capital**: Apply 2024 ratios

7. **Circular Solver**: Resolve Interest ↔ Zakat ↔ Debt

**Outputs:**
- Financial Periods for 2028-2053 (26 years)

**GAP Coverage:**
- ✅ GAP 1: CapEx Depreciation Engine
- ✅ GAP 3: IB Curriculum Toggle
- ✅ GAP 20: Enrollment Ramp-up

---

## CIRCULAR DEPENDENCIES

### The Problem

Three variables depend on each other in a circular manner:

```
       ┌──────────────────┐
       │                  │
       ↓                  │
   INTEREST ────→ EBT ────→ ZAKAT
       ↑                  │
       │                  ↓
   DEBT ←──────── NET INCOME ←──────┘
       ↑                  │
       │                  │
       └──────────────────┘
```

- **Interest Expense** depends on **Debt Balance**
- **Zakat** depends on **EBT** (which depends on Interest)
- **Net Income** depends on Zakat
- **Debt Balance** depends on cash shortfall (which depends on Net Income)

### The Solution: Iterative Solver (GAP 11)

**Algorithm: Fixed-Point Iteration with Relaxation**

```python
def solve_circular_dependencies(year_data):
    # Initial guess: debt from prior year
    debt_estimate = prior_year_debt

    for iteration in range(MAX_ITERATIONS):
        # 1. Calculate interest based on current debt estimate
        interest_expense = debt_estimate * debt_interest_rate
        interest_income = max(0, cash - min_cash_balance) * deposit_interest_rate

        # 2. Calculate EBT
        ebt = revenue - rent - staff_costs - other_opex - depreciation - interest_expense + interest_income

        # 3. Calculate Zakat (only on positive EBT)
        zakat = max(0, ebt * zakat_rate)

        # 4. Calculate Net Income
        net_income = ebt - zakat

        # 5. Update balance sheet
        equity = prior_equity + net_income
        assets = calculate_assets(...)
        liabilities_without_debt = calculate_current_liabilities(...)

        # 6. Calculate new debt requirement (PLUG)
        new_debt = max(0, assets - liabilities_without_debt - equity)

        # 7. Check convergence
        if abs(new_debt - debt_estimate) < TOLERANCE:
            return converged(debt=new_debt, interest=interest_expense, zakat=zakat)

        # 8. Update estimate with relaxation (for stability)
        debt_estimate = debt_estimate * relaxation_factor + new_debt * (1 - relaxation_factor)

    return not_converged()
```

**Convergence Criteria:**
- Tolerance: $0.01
- Max Iterations: 100
- Typical convergence: 5-10 iterations

**GAP Coverage:**
- ✅ GAP 11: Circular Dependency Solver
- ✅ GAP 14: Minimum Cash Balance (affects interest income calculation)
- ✅ GAP 16: Bank Deposit Interest

---

## STATEMENT DEPENDENCIES

### Profit & Loss Statement

**Calculation Order:**

1. **Revenue**
   - Tuition Revenue (from enrollment × curriculum fees)
   - Other Revenue (if any)
   - **Total Revenue** = Sum

2. **Operating Expenses**
   - Rent Expense (from rent model)
   - Staff Costs (from staff calculator)
   - Other OpEx (from input)
   - **Total OpEx** = Sum

3. **EBITDA** = Total Revenue - Total OpEx

4. **Depreciation** (from CapEx module)

5. **EBIT** = EBITDA - Depreciation

6. **Interest** (from circular solver)
   - Interest Expense (debt × debt_interest_rate)
   - Interest Income (excess cash × deposit_interest_rate)
   - Net Interest = Interest Income - Interest Expense

7. **EBT** = EBIT + Net Interest

8. **Zakat** = max(0, EBT × zakat_rate)

9. **Net Income** = EBT - Zakat

### Balance Sheet

**Calculation Order:**

1. **Assets - Current**
   - **Cash**: From cash flow (see below)
   - **AR**: Revenue × AR%
   - **Prepaid**: OpEx × Prepaid%
   - **Total Current Assets** = Sum

2. **Assets - Non-Current**
   - **PP&E (Gross)**: Prior PP&E + CapEx
   - **Accumulated Depreciation**: Prior Accum Depr + Current Year Depr
   - **PP&E (Net)**: Gross - Accumulated
   - **Total Non-Current Assets** = PP&E Net

3. **Total Assets** = Current + Non-Current

4. **Liabilities - Current**
   - **AP**: OpEx × AP%
   - **Accrued**: OpEx × Accrued%
   - **Deferred Revenue**: Revenue × Deferred%
   - **Total Current Liabilities** = Sum

5. **Equity**
   - **Retained Earnings**: Prior Equity
   - **Net Income**: From P&L
   - **Total Equity** = Retained + Net Income

6. **Liabilities - Non-Current (PLUG)** (GAP 12)
   - **Debt**: max(0, Total Assets - Current Liabilities - Equity)
   - If negative (surplus cash), debt = 0, add to cash

7. **Total Liabilities** = Current + Debt

8. **Validation**: Assets - (Liabilities + Equity) should be ~0

### Cash Flow Statement (Indirect Method) (GAP 13)

**Calculation Order:**

1. **Cash Flow from Operations**
   - Start: Net Income
   - Add back: Depreciation (non-cash expense)
   - Subtract: Δ AR (increase = use of cash)
   - Subtract: Δ Prepaid (increase = use of cash)
   - Add: Δ AP (increase = source of cash)
   - Add: Δ Accrued (increase = source of cash)
   - Add: Δ Deferred Revenue (increase = source of cash)
   - **CFO** = Sum

2. **Cash Flow from Investing**
   - **CapEx** = New asset purchases (negative)
   - **CFI** = -CapEx

3. **Cash Flow from Financing**
   - **Debt Issuance**: If debt increased
   - **Debt Repayment**: If debt decreased
   - **CFF** = Issuance - Repayment

4. **Net Change in Cash** = CFO + CFI + CFF

5. **Ending Cash** = Beginning Cash + Net Change

6. **Validation**: Ending Cash should match Balance Sheet cash

**GAP Coverage:**
- ✅ GAP 12: Balance Sheet Auto-Balance (debt plug)
- ✅ GAP 13: Cash Flow Statement (indirect method)

---

## MODULE DEPENDENCIES

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORE MODULES                             │
│  - types.ts (all interfaces)                                     │
│  - constants.ts (Decimal constants)                              │
│  - decimal-utils.ts (safe arithmetic)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────┬──────────────────┬──────────────────┐
│  PERIOD MODULES  │  CALCULATION     │  SUPPORTING      │
│                  │  MODULES         │  MODULES         │
│  - historical.ts │  - enrollment.ts │  - validators.ts │
│  - transition.ts │  - curriculum.ts │  - ppe-tracker.ts│
│  - dynamic.ts    │  - staff.ts      │                  │
│                  │  - depreciation.ts│                 │
└──────────────────┴──────────────────┴──────────────────┘
                              ↓
┌────────────────────────────────────────────────────────┐
│                   RENT MODEL MODULES                    │
│  - fixed.ts (fixed escalation)                          │
│  - revenue-share.ts (revenue percentage)                │
│  - partner.ts (partner investment)                      │
│  - factory.ts (model selector)                          │
└────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────┐
│                   SOLVER MODULES                        │
│  - circular.ts (circular dependency solver)             │
│  - balance-plug.ts (balance sheet balancing)            │
└────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────┐
│                 STATEMENT GENERATORS                    │
│  - profit-loss.ts (P&L generator)                       │
│  - balance-sheet.ts (BS generator)                      │
│  - cash-flow.ts (CF generator)                          │
└────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────┐
│                   MAIN ORCHESTRATOR                     │
│  - index.ts (coordinate all modules)                    │
└────────────────────────────────────────────────────────┘
```

### Import Rules

1. **Core modules** (types, constants, decimal-utils):
   - Can be imported by ANY module
   - Must NOT import from any other engine modules

2. **Period modules** (historical, transition, dynamic):
   - Can import: core, calculation, supporting, rent-models, solvers, statements
   - Must NOT import from each other (to avoid circular imports)

3. **Calculation modules** (enrollment, curriculum, etc.):
   - Can import: core only
   - Must NOT import from period modules

4. **Solver modules**:
   - Can import: core, calculation, statements
   - Must NOT import from period modules

5. **Statement generators**:
   - Can import: core only
   - Must NOT import from period or solver modules

6. **Main orchestrator** (index.ts):
   - Can import: ALL modules
   - This is the ONLY module that imports period modules

---

## DATA FLOW DIAGRAMS

### Year-to-Year Continuity

```
Year N Balance Sheet (Closing)
  ├── Cash ──────────────────────→ Year N+1 Beginning Cash
  ├── AR, Prepaid, PP&E, etc. ───→ (Used for ratio validation)
  ├── Total Equity ──────────────→ Year N+1 Opening Equity
  └── Debt ──────────────────────→ Year N+1 Debt Estimate (initial)
```

### Working Capital Flow (GAP 2)

```
2024 Balance Sheet
  ├── AR / Revenue ────→ AR Ratio ─────┐
  ├── Prepaid / OpEx ──→ Prepaid Ratio │
  ├── AP / OpEx ───────→ AP Ratio      ├─→ Applied to ALL future years
  ├── Accrued / OpEx ──→ Accrued Ratio │   (2025-2053)
  └── Deferred / Rev ──→ Deferred Ratio┘
```

### CapEx Asset Tracking (GAP 1)

```
Year N
  ├── Existing Assets (OLD)
  │     ├── Purchase Year: 2023-2024
  │     ├── Accumulated Depreciation
  │     ├── NBV
  │     └── Remaining Life
  ├── New Assets (from Transition/Dynamic)
  │     ├── Purchase Year: N
  │     ├── Useful Life
  │     └── Depreciation Method
  │
  └─→ Depreciation Engine
        ├── For each asset:
        │     ├── Calculate annual depreciation
        │     ├── Update accumulated depreciation
        │     └── Update NBV
        │
        └─→ Total Depreciation (to P&L)
            Total PP&E Net (to Balance Sheet)
```

---

## GAP COVERAGE MATRIX

| GAP # | Description | Module | Status |
|-------|-------------|--------|--------|
| GAP 1 | CapEx Depreciation Engine | `capex/depreciation.ts` | Week 3 |
| GAP 2 | Working Capital Auto-calc | `periods/historical.ts` | Week 1 |
| GAP 3 | IB Curriculum Toggle | `dynamic/curriculum.ts` | Week 3 |
| GAP 4 | Partner Investment Model | `rent-models/partner.ts` | Week 2 |
| GAP 11 | Circular Solver | `solvers/circular.ts` | Week 4 |
| GAP 12 | Balance Sheet Auto-Balance | `statements/balance-sheet.ts` | Week 4 |
| GAP 13 | Cash Flow (Indirect) | `statements/cash-flow.ts` | Week 4 |
| GAP 14 | Minimum Cash Balance | `solvers/circular.ts` | Week 4 |
| GAP 16 | Bank Deposit Interest | `solvers/circular.ts` | Week 4 |
| GAP 17 | Historical Immutability | `periods/historical.ts` | Week 1 |
| GAP 19 | Pre-fill Logic | `periods/transition.ts` | Week 2 |
| GAP 20 | Enrollment Ramp-up | `dynamic/enrollment.ts` | Week 3 |

---

## NEXT STEPS

### Week 1 (Days 3-5): Historical Period
- [ ] Implement `periods/historical.ts`
- [ ] Implement Working Capital auto-calculation (GAP 2)
- [ ] Implement Historical Immutability (GAP 17)
- [ ] Write unit tests

### Week 2 (Days 6-10): Transition + Rent Models
- [ ] Implement `periods/transition.ts`
- [ ] Implement Pre-fill logic (GAP 19)
- [ ] Implement all 3 rent models (GAP 4)
- [ ] Write unit tests

### Week 3 (Days 11-15): Dynamic + CapEx
- [ ] Implement `dynamic/enrollment.ts` (GAP 20)
- [ ] Implement `dynamic/curriculum.ts` (GAP 3)
- [ ] Implement `dynamic/staff.ts`
- [ ] Implement `capex/depreciation.ts` (GAP 1)
- [ ] Write unit tests

### Week 4 (Days 16-20): Solver + Statements
- [ ] Implement `solvers/circular.ts` (GAP 11, 14, 16)
- [ ] Implement `statements/profit-loss.ts`
- [ ] Implement `statements/balance-sheet.ts` (GAP 12)
- [ ] Implement `statements/cash-flow.ts` (GAP 13)
- [ ] Integration testing
- [ ] Performance optimization

---

**END OF DOCUMENT**
