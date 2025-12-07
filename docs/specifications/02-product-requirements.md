# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## School Lease Proposal Assessment Application
### Project Zeta

---

**Document Version:** 2.0  
**Date:** November 22, 2025  
**Prepared By:** Board Member (Admin)  
**Status:** APPROVED - Ready for Development  
**Alignment:** 100% consistent with PROJECT_ZETA_FINANCIAL_RULES v4.1

---

## DOCUMENT CONTROL

| Section | Status | Owner |
|---------|--------|-------|
| Product Overview | ✅ Approved | Admin |
| User Roles | ✅ Approved | Admin |
| User Stories | ✅ Approved | Admin |
| Functional Requirements | ✅ Approved | Admin |
| Non-Functional Requirements | ✅ Approved | Admin |
| Data Requirements | ✅ Approved | Admin |
| UI/UX Requirements | ✅ Approved | Admin |
| Success Metrics | ✅ Approved | Admin |

---

## 1. PRODUCT OVERVIEW

### 1.1 Product Vision

**Vision Statement:**
Create a comprehensive financial planning application that enables informed decision-making on school facility lease proposals through sophisticated 30-year financial modeling (2023-2053), three rent model comparisons, and interactive scenario analysis.

**Problem Statement:**
The school board faces a critical decision: selecting a 25-year lease proposal (2028-2053) from multiple developers for the planned 2028 relocation. Each proposal presents different lease structures and financial terms. Current manual analysis is inadequate for this complex 30-year projection across three distinct calculation periods.

**Solution:**
A web-based financial planning application implementing the complete PROJECT_ZETA financial rules, modeling three distinct periods (Historical 2023-2024, Transition 2025-2027, Dynamic 2028-2053), supporting three rent models (Fixed Escalation, Revenue Share, Partner), and generating complete financial statements with circular dependency resolution.

### 1.2 Product Goals

**Primary Goals:**
1. Enable accurate comparison of 3-5 lease proposals simultaneously
2. Model complete school financials over 30 years (2023-2053) with three distinct calculation methodologies
3. Support three rent models: Fixed Escalation, Revenue Share, and Partner (Investment-based)
4. Generate board-ready reports with financial statements in millions (SAR M)
5. Provide ultra-fast calculations (< 1 second) with interactive scenario sliders

**Secondary Goals:**
1. Create reusable framework for future lease evaluations
2. Enable real-time scenario sensitivity analysis with sliders
3. Provide early warning indicators for financial sustainability
4. Build foundation for broader financial planning capabilities

### 1.3 Success Criteria

**Quantitative:**
- Tool used for 2028 relocation lease decision
- All calculations complete in < 1 second (ultra-fast performance)
- Board presentation materials generated directly from tool
- Zero calculation errors vs validated models
- Financial statements display in millions (M) with proper formatting

**Qualitative:**
- Board members find interactive sliders valuable for exploration
- Analysis provides insights not available through manual methods
- Financial statements viewed within each proposal context
- Tool generates confidence in lease decision process

### 1.4 Out of Scope (Version 1.0)

**Explicitly NOT Included:**
- Multi-user real-time collaboration
- Historical data import from external systems (manual entry only)
- Mobile native app (mobile-responsive web only)
- Detailed curriculum planning tools beyond enrollment
- HR/staffing management beyond ratios
- Student enrollment tracking system integration

---

## 2. USER ROLES

### 2.1 Role Definitions

**ADMIN (Primary User):**
- **Who:** Board member setting up the tool (yourself)
- **Responsibilities:**
  - One-time setup of historical data (2023-2024)
  - System configuration (Zakat rate, interest rates, working capital drivers)
  - CapEx module management with automatic reinvestment configuration
  - Working capital ratios (locked after calculation from 2024 data)
- **Access:** Full access to all features and configuration

**PLANNER:**
- **Who:** Board member or admin creating projections
- **Responsibilities:**
  - Input transition period assumptions (2025-2027): 7 inputs
  - Input dynamic period assumptions (2028-2053): 17-33 inputs depending on configuration
  - Create lease proposals and scenarios
  - Run sensitivity analysis with sliders
  - Generate reports
- **Access:** Can create/edit proposals, cannot modify historical data or system settings
- **Can Be:** Same person as admin or different board member

**VIEWER:**
- **Who:** Other board members reviewing analysis
- **Responsibilities:**
  - View all proposals and financial statements
  - View historical data
  - View comparison charts and reports
  - Export reports for board meetings
- **Access:** Read-only access to all outputs, cannot create or modify

### 2.2 Role-Based Access Summary

| Feature | Admin | Planner | Viewer |
|---------|-------|---------|--------|
| View Historical Data | ✅ | ✅ | ✅ |
| Edit Historical Data | ✅ | ❌ | ❌ |
| View System Settings | ✅ | ✅ (read-only) | ✅ (read-only) |
| Edit System Settings | ✅ | ❌ | ❌ |
| Create Proposals | ✅ | ✅ | ❌ |
| Edit Proposals | ✅ | ✅ | ❌ |
| View Financial Statements | ✅ | ✅ | ✅ |
| Run Scenarios | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ✅ |
| Configure CapEx Module | ✅ | ❌ | ❌ |

---

## 3. USER STORIES (SIMPLIFIED BY ROLE)

### 3.1 ADMIN Stories

**US-A1: Setup Historical Data**
- As an Admin, I want to input 2023-2024 historical financial data, so that the system has accurate baseline for all projections
- Acceptance Criteria:
  - Import wizard or manual entry forms for P&L and Balance Sheet
  - System validates completeness before proceeding
  - System auto-calculates working capital ratios from 2024 data
  - Working capital ratios are locked and display as percentages

**US-A2: Configure System Settings**
- As an Admin, I want to configure system-wide settings (Zakat rate, interest rates, minimum cash), so that calculations use correct parameters
- Acceptance Criteria:
  - Pre-filled with Saudi Arabian standards (Zakat 2.5%, etc.)
  - Simple form with validation ranges
  - Settings apply to all periods 2025-2053

**US-A3: Configure CapEx Module**
- As an Admin, I want to configure automatic capital expenditure rules with frequency inputs, so that long-term investments are modeled systematically
- Acceptance Criteria:
  - Can set automatic reinvestment frequency (e.g., every 5 years)
  - Can set reinvestment amount or percentage
  - Can add manual CapEx items for specific years
  - System tracks asset pools and calculates depreciation automatically

### 3.2 PLANNER Stories

**US-P1: Create Lease Proposal**
- As a Planner, I want to create a new lease proposal with developer information, so that I can model different options
- Acceptance Criteria:
  - Enter developer name, proposal date
  - Select rent model type (Fixed / Revenue Share / Partner)
  - All inputs pre-filled with intelligent defaults
  - Can proceed through transition and dynamic setup

**US-P2: Configure Transition Period**
- As a Planner, I want to input transition period assumptions (2025-2027), so that I can bridge from current campus to new campus
- Acceptance Criteria:
  - Input 3 years of student numbers (pre-filled with 5% growth)
  - Input 3 years of average tuition (pre-filled with 5% growth)
  - Input single rent growth percentage (pre-filled 5%)
  - System auto-calculates all other items using 2024 ratios
  - **Total: 7 inputs, takes 10-15 minutes**

**US-P3: Configure Dynamic Period**
- As a Planner, I want to configure comprehensive 25-year projections (2028-2053), so that I can model the full lease term
- Acceptance Criteria:
  - French curriculum: 9 inputs (capacity, ramp-up, tuition)
  - Optional IB curriculum: 6 additional inputs if enabled
  - Staff costs: 6 inputs (ratios, salaries, CPI)
  - Rent model: 3 inputs (Fixed), 1 input (Revenue Share), or 7 inputs (Partner)
  - Other OpEx: 1 input (percentage, pre-filled from 2024)
  - **Total: 17-33 inputs depending on choices, takes 20-40 minutes**

**US-P4: Use Interactive Sliders for Scenarios**
- As a Planner, I want to use sliders to adjust key assumptions, so that I can explore scenarios interactively during meetings
- Acceptance Criteria:
  - Sliders for: enrollment %, CPI %, tuition growth %, rent escalation %
  - Real-time recalculation (< 1 second)
  - Clear display of impact on key metrics
  - Can save slider positions as named scenarios

**US-P5: Run Formal Sensitivity Analysis**
- As a Planner, I want to perform systematic sensitivity analysis, so that I can identify which variables have the greatest impact on outcomes
- Acceptance Criteria:
  - Select variable to test (enrollment, CPI, tuition growth, etc.)
  - Set test range (e.g., ±20%)
  - System generates tornado diagram showing relative impact
  - System generates sensitivity charts (metric vs variable)
  - Can export sensitivity analysis to PDF/Excel
  - Identifies most critical assumptions for decision-making

**US-P6: View Financial Statements Within Proposal**
- As a Planner, I want to see P&L, Balance Sheet, and Cash Flow within each proposal view, so that I understand the complete financial picture
- Acceptance Criteria:
  - Financial statements accessible from proposal detail page
  - Toggle between P&L / BS / CF
  - All amounts displayed in millions (M)
  - Year range selector (e.g., 2028-2032, 2048-2053)

**US-P7: Compare Multiple Proposals**
- As a Planner, I want to select 2-5 proposals for side-by-side comparison, so that I can identify the best option
- Acceptance Criteria:
  - Multi-select interface for proposal selection
  - Side-by-side financial metrics comparison
  - Line charts showing rent trajectory over 25 years
  - Highlight best/worst performers

### 3.3 VIEWER Stories

**US-V1: View Historical Data**
- As a Viewer, I want to see 2023-2024 historical data, so that I understand the baseline
- Acceptance Criteria:
  - Display historical P&L and Balance Sheet
  - Show key ratios calculated from 2024
  - Read-only view

**US-V2: View All Proposals**
- As a Viewer, I want to browse all lease proposals, so that I can review options
- Acceptance Criteria:
  - List view of all proposals with key metrics
  - Click to view detailed financial statements
  - Cannot edit or create

**US-V3: Export Reports**
- As a Viewer, I want to export reports for board meetings, so that I can share analysis
- Acceptance Criteria:
  - Export to PDF or Excel
  - Include charts and financial statements
  - All amounts in millions (M)

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Data Input & Management

**FR-1.1: Historical Data Input (ADMIN ONLY)**
- System SHALL provide forms to input 2023 and 2024 complete financial data
- System SHALL validate completeness of all P&L and Balance Sheet items
- System SHALL store historical data immutably (cannot be changed once confirmed)
- System SHALL auto-calculate working capital ratios from 2024 data:
  - AR % = (AR 2024 / Revenue 2024) × 100
  - Prepaid % = (Prepaid 2024 / OpEx 2024) × 100
  - AP % = (AP 2024 / OpEx 2024) × 100
  - Accrued % = (Accrued 2024 / OpEx 2024) × 100
  - Deferred Revenue % = (Deferred 2024 / Revenue 2024) × 100
- System SHALL lock working capital ratios (display only, cannot modify)

**FR-1.2: System Configuration (ADMIN ONLY)**
- System SHALL provide configuration for:
  - Zakat Rate (pre-fill: 2.5%)
  - Debt Interest Rate (pre-fill: 5%)
  - Bank Deposit Interest Rate (pre-fill: 2%)
  - Minimum Cash Balance (pre-fill: 1,000,000 SAR)
- System SHALL validate ranges and apply to all periods 2025-2053

**FR-1.3: Transition Period Configuration (PLANNER)**
- System SHALL allow input of 3 years of student numbers (2025, 2026, 2027)
- System SHALL allow input of 3 years of average tuition per student
- System SHALL allow input of single rent growth percentage (applied compounding from 2024 base)
- System SHALL pre-fill with 5% growth rates
- System SHALL enforce IB curriculum = 0 (NOT ACTIVE) for transition period
- System SHALL auto-calculate:
  - FR Tuition = numberOfStudents × averageTuition
  - Other Revenue = FR Tuition × (Other2024 / FRTuition2024)
  - Total Revenue = FR Tuition + Other Revenue
  - Staff Costs = Revenue × (StaffCosts2024 / Revenue2024)
  - Rent = Rent2024 × (1 + growthPercent)^year
  - Other OpEx = Revenue × (OtherOpEx2024 / Revenue2024)

**FR-1.4: Dynamic Period - Enrollment Configuration (PLANNER)**
- System SHALL allow input of student capacity (e.g., 2,000)
- System SHALL allow input of 5-year ramp-up percentages (2028-2032)
  - Pre-fill: 20%, 40%, 60%, 80%, 100%
- System SHALL auto-set Years 6+ (2033-2053) to Year 5 enrollment (steady state)
- System SHALL calculate enrollment per year = capacity × ramp-up %

**FR-1.5: Dynamic Period - Curriculum Configuration (PLANNER)**
- System SHALL support French curriculum (ALWAYS ACTIVE):
  - Base tuition 2028
  - Tuition growth rate
  - Tuition growth frequency (1-5 years)
- System SHALL support IB curriculum (OPTIONAL):
  - Toggle on/off
  - If off: IB Revenue = 0 for all years
  - If on: Base tuition 2028, growth rate, growth frequency
- System SHALL calculate tuition per year:
  - `Tuition[Year] = Base2028 × (1 + growthRate)^period`
  - `period = floor((Year - 2028) / frequency)`
- System SHALL calculate Other Revenue:
  - `Other Revenue = Total Tuition × (Other2024 / FRTuition2024)`

**FR-1.6: Dynamic Period - Rent Model Configuration (PLANNER)**
- System SHALL allow selection of ONE rent model:

**Model 1: Fixed Escalation (3 inputs)**
- Base Rent 2028 (SAR)
- Rent Growth Rate (%)
- Growth Frequency (years: 1-5)
- Calculation: `Rent = BaseRent × (1 + growthRate)^period`

**Model 2: Revenue Share (1 input)**
- Revenue Share % (e.g., 8%)
- Calculation: `Rent = Total Revenue × revenueSharePercent`

**Model 3: Partner (Investment-Based) (7 inputs)**
- Land Size (m²)
- Land Price per m² (SAR)
- BUA Size (m²)
- Construction Cost per m² (SAR)
- Yield Rate (%)
- Growth Rate (%)
- Growth Frequency (years: 1-5)
- Calculation:
  ```
  Total Investment = (Land Size × Land Price) + (BUA Size × Construction Cost)
  Base Rent = Total Investment × Yield Rate
  Rent[Year] = Base Rent × (1 + growthRate)^period
  ```

**FR-1.7: Dynamic Period - Operating Costs (PLANNER)**
- System SHALL allow input of staff cost parameters (6 inputs):
  - Students per Teacher (e.g., 14)
  - Students per Non-Teacher (e.g., 25)
  - Teacher Monthly Salary 2028 (SAR)
  - Non-Teacher Monthly Salary 2028 (SAR)
  - CPI Rate (%)
  - CPI Frequency (years: 1-3)

- System SHALL calculate Staff Costs Base 2028:
  ```
  Teachers = ceil(Students / StudentsPerTeacher)
  NonTeachers = ceil(Students / StudentsPerNonTeacher)
  TeacherCosts = Teachers × TeacherSalary × 12
  NonTeacherCosts = NonTeachers × NonTeacherSalary × 12
  BaseStaffCosts2028 = TeacherCosts + NonTeacherCosts
  ```

- System SHALL calculate Staff Costs for 2029+:
  ```
  period = floor((Year - 2028) / cpiFrequency)
  StaffCosts[Year] = BaseStaffCosts2028 × (1 + cpiRate)^period
  ```

- System SHALL allow input of Other OpEx % (1 input):
  - Pre-fill from: (OtherOpEx2024 / Revenue2024) × 100
  - Applied to ALL dynamic years (2028-2053)
  - Calculation: `Other OpEx = Revenue × otherOpexPercent`

**FR-1.8: CapEx Module (ADMIN)**
- System SHALL provide CapEx configuration with:
  - Automatic reinvestment rules (frequency, amount)
  - Manual CapEx items (year, amount, useful life, depreciation method)
- System SHALL track asset pools by acquisition year
- System SHALL calculate depreciation:
  - OLD assets (≤2024): Fixed annual amount (e.g., 5M SAR/year)
  - NEW assets (>2024): Rate-based depreciation
- System SHALL stop depreciation when NBV = 0

### 4.2 Financial Calculations (100% FROM FINANCIAL RULES)

**FR-2.1: Revenue Calculations**

**Historical (2023-2024):**
```
Direct retrieval from database (no calculations)
```

**Transition (2025-2027):**
```
FR Tuition = numberOfStudents × averageTuition
IB Tuition = 0 (NOT ACTIVE)
Other Revenue = FR Tuition × (Other2024 / FRTuition2024)
Total Revenue = FR Tuition + Other Revenue
```

**Dynamic (2028-2053):**
```
FR Tuition = BaseFR2028 × (1 + tuitionGrowthRate)^period × studentsFR
IB Tuition = BaseIB2028 × (1 + tuitionGrowthRate)^period × studentsIB (if active, else 0)
Other Revenue = Total Tuition × (Other2024 / FRTuition2024)
Total Revenue = FR Tuition + IB Tuition + Other Revenue

where: period = floor((Year - 2028) / tuitionGrowthFrequency)
```

**FR-2.2: Operating Expenses Calculations**

**CRITICAL PRINCIPLE:**
`Total Operating Expenses = Rent + Staff Costs + Other OpEx` (ALL PERIODS)

**Historical (2023-2024):**
```
Direct retrieval from database (no calculations)
```

**Transition (2025-2027):**
```
Rent = Rent2024 × (1 + growthPercent)^year
Staff Costs = Revenue × (StaffCosts2024 / Revenue2024)
Other OpEx = Revenue × ((OpEx2024 - StaffCosts2024 - Rent2024) / Revenue2024)
Total OpEx = Rent + Staff Costs + Other OpEx
```

**Dynamic (2028-2053):**
```
Rent = per selected model (FR-1.6)
Staff Costs = BaseStaffCosts2028 × (1 + cpiRate)^period
Other OpEx = Revenue × otherOpexPercent
Total OpEx = Rent + Staff Costs + Other OpEx

where: period = floor((Year - 2028) / cpiFrequency)
```

**FR-2.3: EBITDA Calculation (ALL PERIODS)**
```
EBITDA = Total Revenue - Total Operating Expenses
OR equivalently:
EBITDA = Total Revenue - Rent - Staff Costs - Other OpEx
```

**FR-2.4: Depreciation Calculation (ALL PERIODS)**
```
Total Depreciation = OLD Assets Depreciation + NEW Assets Depreciation

OLD Assets (≤2024):
  Depreciation = Fixed annual amount (until NBV = 0)

NEW Assets (>2024):
  Depreciation = NBV × depreciationRate
```

**FR-2.5: Interest Calculation (ALL PERIODS)**
```
Average Cash = (Opening Cash + Closing Cash) / 2
Average Debt = (Opening Debt + Closing Debt) / 2

IF Average Cash > 0:
  Interest Income = Average Cash × bankDepositRate
  Interest Expense = 0

IF Average Debt > 0:
  Interest Expense = Average Debt × debtInterestRate
  Interest Income = 0

Net Interest = Interest Income - Interest Expense
```

**FR-2.6: Zakat Calculation (ALL PERIODS)**
```
Zakat Base = Equity - Non-Current Assets

IF Zakat Base <= 0:
  Zakat = 0
ELSE:
  Zakat = Zakat Base × zakatRate (e.g., 2.5%)
```

**FR-2.7: Net Income Calculation (ALL PERIODS)**
```
EBT = EBITDA - Depreciation - Net Interest
Net Income = EBT - Zakat
```

**FR-2.8: Balance Sheet Calculations (ALL PERIODS EXCEPT HISTORICAL)**

**Assets:**
```
Cash = Auto-balancing (minimum 1M SAR)
Accounts Receivable = Revenue × arPercent / 100
Prepaid Expenses = Total OpEx × prepaidPercent / 100
Fixed Assets = Prior NBV + CapEx - Depreciation - Disposals
Total Assets = Cash + AR + Prepaid + Fixed Assets
```

**Liabilities:**
```
Accounts Payable = Total OpEx × apPercent / 100
Accrued Expenses = Total OpEx × accruedPercent / 100
Deferred Revenue = Revenue × deferredPercent / 100
Debt = Auto-balancing if Cash would be < minimum
Total Liabilities = AP + Accrued + Deferred + Debt
```

**Equity:**
```
Share Capital = Constant (foundation structure, never changes)
Retained Earnings = Prior RE + Net Income
Total Equity = Share Capital + Retained Earnings

VALIDATION: Total Assets = Total Liabilities + Total Equity
```

**FR-2.9: Cash Flow Calculations (ALL PERIODS EXCEPT HISTORICAL)**

**Operating Activities:**
```
Cash from Operations:
+ Net Income
+ Depreciation (non-cash add-back)
+ Zakat (accrued, not yet paid)
- Increase in AR (or + decrease)
- Increase in Prepaid (or + decrease)
+ Increase in AP (or - decrease)
+ Increase in Accrued (or - decrease)
+ Increase in Deferred Revenue (or - decrease)
- Zakat Payment (paid in April of following year)
= Net Cash from Operating Activities
```

**Investing Activities:**
```
Cash from Investing:
- CapEx Additions
+ Asset Disposals
= Net Cash from Investing Activities
```

**Financing Activities:**
```
Cash from Financing:
+ Increase in Debt (or - decrease)
= Net Cash from Financing Activities
```

**Cash Reconciliation:**
```
Opening Cash
+ Net Cash from Operations
+ Net Cash from Investing
+ Net Cash from Financing
= Closing Cash

VALIDATION: Closing Cash = Balance Sheet Cash
```

**FR-2.10: Circular Dependency Solver**
- System SHALL implement iterative solver for circular dependencies:
  - Interest ↔ Cash/Debt ↔ Balance Sheet
  - Zakat ↔ Net Income ↔ Equity ↔ Zakat Base
- System SHALL iterate until convergence (tolerance: 0.01 SAR)
- System SHALL set maximum iterations (100) and flag if not converged

### 4.3 Comparison & Scenario Analysis

**FR-3.1: Proposal Comparison**
- System SHALL allow selection of 2-5 proposals
- System SHALL display side-by-side comparison of:
  - Total rent over 25 years
  - NPV at specified discount rate
  - Average annual rent
  - Year 1, Year 10, Year 25 rent
  - Cumulative cash flow
  - Lowest cash year and amount
- System SHALL highlight best/worst performers with color coding

**FR-3.2: Interactive Scenario Sliders**
- System SHALL provide sliders for:
  - Enrollment % (range: 50%-150%, step: 5%)
  - CPI Rate % (range: 0%-10%, step: 0.5%)
  - Tuition Growth % (range: 0%-15%, step: 0.5%)
  - Rent Escalation % (Fixed model only, range: 0%-10%, step: 0.5%)
- System SHALL recalculate ALL financials in < 1 second
- System SHALL update all charts and metrics in real-time
- System SHALL allow saving slider positions as named scenarios

**FR-3.3: Formal Sensitivity Analysis**
- System SHALL allow selection of variable for sensitivity testing:
  - Enrollment capacity utilization
  - CPI rate
  - Tuition growth rate
  - Rent escalation rate (Fixed model)
  - Revenue share percentage (Revenue Share model)
  - Yield rate (Partner model)
- System SHALL allow input of test range (e.g., ±20% from base case)
- System SHALL calculate key metrics at multiple points across range (minimum 5 points)
- System SHALL display results as:
  - Tornado diagram showing relative impact of each variable
  - Line charts showing metric vs variable value
  - Sensitivity table with numeric values
- System SHALL identify which variables have greatest impact on:
  - Total rent (25 years)
  - NPV
  - Cumulative EBITDA
  - Lowest cash position
- System SHALL allow export of sensitivity analysis to PDF/Excel

**FR-3.4: Scenario Comparison**
- System SHALL allow creation of scenario variants (duplicate with modified parameters)
- System SHALL display base case vs scenarios side-by-side
- System SHALL show delta/change from base case
- System SHALL allow export of scenario comparison

### 4.4 Reporting & Visualization

**FR-4.1: Financial Statement Display (WITHIN PROPOSAL VIEW)**
- System SHALL display financial statements WITHIN each proposal detail page
- System SHALL provide tabs/toggle for P&L / Balance Sheet / Cash Flow
- System SHALL display ALL amounts in millions (M) with 2 decimal places
  - Example: 1,500,000 SAR displays as "1.50 M"
  - Example: 125,750,000 SAR displays as "125.75 M"
- System SHALL provide year range selector
- System SHALL export individual statements to Excel

**FR-4.2: Charts & Graphs**
- System SHALL display:
  - Line chart: Rent over 25 years (multiple proposals overlaid)
  - Line chart: Revenue, Costs, EBITDA over time
  - Stacked area chart: Revenue breakdown (FR / IB / Other)
  - Bar chart: Total rent comparison across proposals
  - Waterfall chart: Cash flow components
  - **Tornado diagram**: Sensitivity analysis showing relative impact of variables (horizontal bars)
  - **Sensitivity line charts**: Metric vs variable value for formal sensitivity analysis
- System SHALL use professional color palette
- System SHALL allow export as PNG

**FR-4.3: Report Generation**
- System SHALL generate Executive Summary report (PDF)
- System SHALL generate Detailed Proposal Analysis (PDF/Excel)
- System SHALL generate Comparison Report (PDF)
- System SHALL generate Sensitivity Analysis Report with tornado diagrams and impact tables (PDF/Excel)
- System SHALL include all assumptions and calculations
- System SHALL display amounts in millions (M)

### 4.5 Data Validation & Error Handling

**FR-5.1: Input Validation**
- System SHALL validate positive values for students, tuition, salaries
- System SHALL validate percentage ranges (0-100%)
- System SHALL validate year ranges (2023-2053)
- System SHALL prevent negative cash below minimum without auto-debt
- System SHALL warn if assumptions outside reasonable ranges

**FR-5.2: Calculation Validation**
- System SHALL verify Balance Sheet balances (Assets = L + E)
- System SHALL verify Cash Flow reconciles
- System SHALL verify Retained Earnings rollforward
- System SHALL flag if circular solver doesn't converge
- System SHALL validate period linkages (2024→2025, 2027→2028)

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance Requirements (ULTRA-FAST)

**NFR-1.1: Calculation Speed (ULTRA-FAST)**
- System SHALL complete ALL 30-year calculations in < 1 second
- System SHALL recalculate on slider change in < 0.5 seconds
- System SHALL handle circular dependency resolution in < 0.3 seconds
- System SHALL optimize for speed over precision (0.01 SAR tolerance acceptable)

**NFR-1.2: UI Responsiveness (ULTRA-FAST)**
- System SHALL respond to clicks/inputs in < 200ms
- System SHALL update charts in < 300ms after calculation
- System SHALL provide instant feedback on all interactions
- System SHALL never freeze UI during calculations

**NFR-1.3: Load Times**
- System SHALL load proposal list in < 500ms
- System SHALL load proposal details in < 1 second
- System SHALL load comparison view in < 2 seconds
- System SHALL generate PDF reports in < 5 seconds

### 5.2 Usability Requirements

**NFR-2.1: Learning Curve**
- System SHALL be usable by Planner with < 30 minutes training
- System SHALL use 85% pre-filled inputs with intelligent defaults
- System SHALL provide contextual help on all inputs
- System SHALL include calculation transparency (show formulas on hover)

**NFR-2.2: User Interface**
- System SHALL use professional design suitable for board presentations
- System SHALL display financial amounts in millions (M) consistently
- System SHALL use color coding (green=positive, red=negative)
- System SHALL provide clear navigation within proposal context

**NFR-2.3: Accessibility**
- System SHALL work on desktop (primary), tablet (secondary)
- System SHALL support Chrome, Firefox, Safari, Edge
- System SHALL use minimum 14px font size
- System SHALL provide keyboard navigation

### 5.3 Reliability Requirements

**NFR-3.1: Data Integrity**
- System SHALL auto-save every 30 seconds
- System SHALL prevent data loss on refresh/crash
- System SHALL maintain calculation accuracy (0.01 SAR tolerance)
- System SHALL provide export/import for backup

**NFR-3.2: Calculation Accuracy**
- System SHALL match validated Excel models (< 0.01 SAR difference)
- System SHALL balance Balance Sheet in all scenarios
- System SHALL reconcile Cash Flow in all scenarios
- System SHALL properly link all periods (2023→2053)

---

## 6. DATA REQUIREMENTS

### 6.1 Data Model Summary

**Three Primary Entities:**
1. **System Configuration** (singleton, ADMIN-managed)
2. **Historical Data** (2023-2024, ADMIN-managed)
3. **Lease Proposals** (multiple, PLANNER-managed)

### 6.2 System Configuration Structure

```typescript
interface SystemConfiguration {
  // Financial Settings
  zakatRate: number; // 2.5% default
  debtInterestRate: number; // 5% default
  bankDepositRate: number; // 2% default
  minimumCash: number; // 1M SAR default
  discountRateNPV: number; // 4% default
  
  // Working Capital Ratios (LOCKED - auto-calculated from 2024)
  arPercent: number; // % of Revenue
  prepaidPercent: number; // % of Total OpEx
  apPercent: number; // % of Total OpEx
  accruedPercent: number; // % of Total OpEx
  deferredRevenuePercent: number; // % of Revenue
  
  // Foundation Structure
  shareCapital: number; // constant, never changes
}
```

### 6.3 Lease Proposal Structure (SIMPLIFIED)

```typescript
interface LeaseProposal {
  id: string;
  name: string;
  developerName: string;
  status: 'draft' | 'active';
  
  // Rent Model Selection
  rentModel: 'fixedEscalation' | 'revenueShare' | 'partner';
  rentParams: FixedParams | RevenueShareParams | PartnerParams;
  
  // Transition Period (7 inputs)
  transition: {
    students: [number, number, number]; // 2025, 2026, 2027
    avgTuition: [number, number, number];
    rentGrowth: number; // single %
  };
  
  // Dynamic Period (17-33 inputs)
  dynamic: {
    // FR Curriculum (9 inputs)
    frenchCurriculum: {
      capacity: number;
      rampUp: [number, number, number, number, number]; // 5 years
      baseTuition2028: number;
      tuitionGrowthRate: number;
      tuitionGrowthFrequency: number;
    };
    
    // IB Curriculum (6 inputs if enabled)
    ibCurriculum: {
      enabled: boolean;
      capacity: number;
      rampUp: [number, number, number, number, number];
      baseTuition2028: number;
      tuitionGrowthRate: number;
      tuitionGrowthFrequency: number;
    };
    
    // Staff Costs (6 inputs)
    staffCosts: {
      studentsPerTeacher: number;
      studentsPerNonTeacher: number;
      teacherSalary2028: number;
      nonTeacherSalary2028: number;
      cpiRate: number;
      cpiFrequency: number;
    };
    
    // Other OpEx (1 input)
    otherOpexPercent: number;
  };
  
  // Calculated Results (cached)
  financials: FinancialStatements; // 30 years
  metrics: ProposalMetrics;
}

interface FixedParams {
  baseRent2028: number;
  growthRate: number;
  frequency: number;
}

interface RevenueShareParams {
  revenueSharePercent: number;
}

interface PartnerParams {
  landSize: number; // m²
  landPricePerSqm: number;
  buaSize: number; // m²
  constructionCostPerSqm: number;
  yieldRate: number;
  growthRate: number;
  frequency: number;
}
```

---

## 7. USER INTERFACE REQUIREMENTS

### 7.1 Navigation Structure

**Primary Navigation (Top Level):**
- Dashboard (overview of all proposals)
- Historical Data (2023-2024 actuals)
- System Settings (ADMIN only)
- Proposals (list view)
- Comparison (multi-proposal view)
- Reports

**Proposal-Level Navigation (Secondary):**
When viewing a specific proposal:
- Overview (summary metrics)
- Transition Setup (2025-2027 inputs)
- Dynamic Setup (2028-2053 inputs)
- **Financial Statements (P&L / BS / CF)** ← KEY: Statements within proposal context
- Scenarios (interactive sliders for quick exploration)
- Sensitivity Analysis (formal tornado diagrams and impact analysis)

**CRITICAL CHANGE:**
- Financial statements are NOT in primary navigation
- Financial statements are WITHIN each proposal detail view
- Users navigate: Proposals → Select Proposal → Financial Statements tab

### 7.2 Key Screen Layouts

**Dashboard Screen:**
- Proposal cards with key metrics (rent total, NPV)
- Quick actions: Create New, Compare
- System status indicators

**Proposal Detail Screen (CRITICAL):**
- Tabbed interface:
  - Tab 1: Overview (key metrics, assumptions summary)
  - Tab 2: Transition Setup (7 inputs)
  - Tab 3: Dynamic Setup (17-33 inputs)
  - Tab 4: **Financial Statements** (P&L / BS / CF toggle)
  - Tab 5: Scenarios (interactive sliders)
  - Tab 6: Sensitivity Analysis (tornado diagrams, formal testing)

**Financial Statements Tab (WITHIN PROPOSAL):**
- Sub-tabs for P&L / Balance Sheet / Cash Flow
- Year range selector (2023-2027, 2028-2032, 2048-2053, All Years)
- Display format: Table with years as columns
- **All amounts in millions (M)** with 2 decimal places
- Export button (Excel/PDF)
- Calculation transparency (hover to see formulas)

**Scenario Analysis Screen (WITH SLIDERS):**
- Interactive sliders for key assumptions:
  - Enrollment % (50%-150%)
  - CPI % (0%-10%)
  - Tuition Growth % (0%-15%)
  - Rent Escalation % (0%-10%, if Fixed model)
- Real-time metric display:
  - Total Rent (25 years)
  - NPV
  - Cumulative EBITDA
  - Lowest Cash Position
- Save Scenario button
- Comparison of saved scenarios

**Sensitivity Analysis Screen (FORMAL ANALYSIS):**
- Variable selector (dropdown):
  - Enrollment utilization %
  - CPI rate %
  - Tuition growth rate %
  - Rent escalation % (Fixed model)
  - Revenue share % (Revenue Share model)
  - Yield rate % (Partner model)
- Range input: Base case ± X%
- Output displays:
  - **Tornado Diagram**: Horizontal bar chart showing impact magnitude of each variable on NPV
  - **Sensitivity Charts**: Line charts showing how NPV, Total Rent, EBITDA vary with each variable
  - **Sensitivity Table**: Numeric table with values at different test points
- Variable impact ranking (which assumptions matter most)
- Export button (PDF/Excel)

**Comparison Screen:**
- Proposal selector (checkboxes, 2-5 selections)
- Side-by-side metrics table
- Overlaid line charts (rent over time)
- Heat map showing best/worst by metric

### 7.3 Display Format for Financial Numbers

**CRITICAL REQUIREMENT: Millions (M) Display**

**In P&L, Balance Sheet, Cash Flow:**
- System SHALL divide all SAR amounts by 1,000,000
- System SHALL append " M" to all numbers
- System SHALL display 2 decimal places

**Examples:**
```
1,500,000 SAR → 1.50 M
125,750,000 SAR → 125.75 M
5,000 SAR → 0.01 M (rounds to 2 decimals)
```

**Formatting Rules:**
- Use thousands separator for whole number part: 125.75 M (not 125,750,000.00)
- Always show 2 decimal places: 1.50 M (not 1.5 M)
- Negative numbers in parentheses: (2.50 M)
- Color code: Positive in black, Negative in red

---

## 8. SUCCESS METRICS

### 8.1 Development Success

**Metric D-1: Ultra-Fast Performance**
- Target: All calculations < 1 second
- Slider interactions < 0.5 seconds
- Measure: Performance profiling

**Metric D-2: Calculation Accuracy**
- Target: 100% match with financial rules document
- Balance Sheet balances in all scenarios
- Cash Flow reconciles in all scenarios
- Measure: Automated validation suite

**Metric D-3: Code Quality**
- Target: >80% test coverage on calculation engine
- Zero critical bugs
- Measure: Test coverage reports

### 8.2 Usage Success

**Metric U-1: Adoption**
- Target: Tool used for 2028 lease decision
- At least 3 proposals modeled
- At least 5 scenarios per proposal
- Measure: Usage logs

**Metric U-2: Time Efficiency**
- Target: Proposal setup < 30 minutes (PLANNER)
- Scenario analysis < 5 minutes with sliders
- Measure: Time tracking

**Metric U-3: User Satisfaction**
- Target: Positive feedback from board members
- Tool outputs used in board presentations
- Measure: Board feedback

---

## 9. ASSUMPTIONS & CONSTRAINTS

### 9.1 Assumptions

**A-1:** PLANNER has strong financial literacy (can understand ratios, percentages)
**A-2:** 2028 relocation will occur on schedule
**A-3:** Historical data (2023-2024) is accurate and complete
**A-4:** IB curriculum NOT active during transition (2025-2027)
**A-5:** School operates as foundation (no dividends, share capital constant)
**A-6:** Working capital ratios from 2024 remain applicable through 2053
**A-7:** Three rent models cover all likely developer proposals
**A-8:** Ultra-fast calculation is achievable with optimized algorithms

### 9.2 Constraints

**C-1:** Time - 14-16 weeks development (hobby project)
**C-2:** Budget - Minimal (< $300/year)
**C-3:** Single developer - No team support
**C-4:** Browser-based only - No native app
**C-5:** Must handle circular dependencies (interest, zakat)
**C-6:** Must achieve < 1 second calculation time
**C-7:** All amounts must display in millions (M)
**C-8:** Financial statements must be within proposal context

---

## 10. RELEASE PLAN

### 10.1 Version 1.0 (MVP) - Week 5
- Historical data input
- System configuration
- One proposal with Fixed Escalation model
- Basic P&L calculation (all three periods)
- Validation against Excel

### 10.2 Version 1.1 - Week 9
- All three rent models
- Complete financial statements (P&L, BS, CF)
- Circular dependency solver
- Multiple proposals

### 10.3 Version 1.2 - Week 11
- Full revenue engine (FR + optional IB)
- Staff costs with CPI escalation
- CapEx module with automatic reinvestment
- Working capital auto-calculation
- Balance sheet auto-balancing

### 10.4 Version 1.3 (Production) - Week 14-16
- Interactive scenario sliders
- Comparison features
- Report generation (PDF/Excel)
- Millions (M) display formatting
- Financial statements within proposal view
- User guide documentation
- Performance optimization (< 1 second target)

---

## APPENDIX A: INPUT SUMMARY

### ADMIN Inputs (One-time, ~2 hours)
- Historical Data 2023-2024: ~100 line items
- System Settings: 5 settings
- Working Capital Ratios: Auto-calculated, locked (review only)
- CapEx Module: Configure automatic reinvestment rules

### PLANNER Inputs per Proposal

**Transition Period (10-15 minutes):**
1. Student numbers × 3 years
2. Average tuition × 3 years
3. Rent growth %
**Total: 7 inputs**

**Dynamic Period (20-40 minutes):**
1. FR Curriculum: 9 inputs
2. IB Curriculum: 6 inputs (if enabled)
3. Staff Costs: 6 inputs
4. Rent Model: 3-7 inputs (depending on model)
5. Other OpEx: 1 input
**Total: 17-33 inputs**

**Grand Total: 24-40 inputs per proposal, 85% pre-filled**

---

## APPENDIX B: CALCULATION FLOW

```
INPUT LAYER
  ↓
PERIOD DETERMINATION (Historical / Transition / Dynamic)
  ↓
REVENUE CALCULATION
  ├─ FR Tuition
  ├─ IB Tuition (if active)
  └─ Other Revenue
  ↓
OPERATING EXPENSE CALCULATION
  ├─ Rent (per model)
  ├─ Staff Costs
  └─ Other OpEx
  ↓
EBITDA = Revenue - OpEx
  ↓
BELOW EBITDA ITEMS
  ├─ Depreciation (asset pools)
  ├─ Interest (circular)
  └─ Zakat (circular)
  ↓
NET INCOME = EBITDA - Depreciation - Interest - Zakat
  ↓
BALANCE SHEET
  ├─ Assets (Cash auto-balancing)
  ├─ Liabilities (Debt auto-balancing)
  └─ Equity (RE rollforward)
  ↓
CASH FLOW STATEMENT
  ├─ Operating Activities
  ├─ Investing Activities
  └─ Financing Activities
  ↓
VALIDATION
  ├─ BS Balance
  ├─ CF Reconciliation
  └─ Period Linkages
  ↓
OUTPUT LAYER (Display in Millions)
```

---

**— END OF DOCUMENT —**

*This PRD is 100% aligned with PROJECT_ZETA_FINANCIAL_RULES v4.1 and ready for technical implementation.*


---

# AMENDMENT: v2.1 NARRATIVE CORRECTION

*The following section was added in v2.1 to correct workflow narrative.*


## CHANGE SUMMARY

This addendum corrects the **product narrative** in PRD v2.0 to accurately reflect the **iterative negotiation workflow**. All financial calculation requirements from v2.0 remain **100% unchanged**.

**What Changed:**
- ✅ Product framing: Passive receiver → Active negotiator
- ✅ Data model: Add negotiation tracking fields
- ✅ Dashboard UX: Flat list → Thread-based view
- ✅ Status tracking: Added negotiation lifecycle states

**What Stayed the Same:**
- ✅ All financial calculations (100% unchanged)
- ✅ Three rent models (unchanged)
- ✅ Three-period framework (unchanged)
- ✅ Performance requirements (< 1 second)
- ✅ Export functionality (unchanged)

---

## CORRECTED PRODUCT VISION

### Original Vision (v2.0) - INCORRECT
> "Enable comparison of lease proposals received from developers to select the best option."

**Implied Workflow:**
1. Developers submit proposals
2. School reviews proposals
3. School selects best one
4. Done ✅

**Problem:** This is not how negotiations work in reality.

### Corrected Vision (v2.1) - CORRECT
> "Enable financial evaluation of lease scenarios to prepare negotiation positions and evaluate developer responses through iterative offer-counteroffer cycles."

**Actual Workflow:**
1. School creates financial model/offer
2. School submits to developer
3. Developer responds with counter-offer
4. School evaluates counter & creates new counter
5. Iterate until accepted/rejected/abandoned
6. Multiple rounds, multiple versions per negotiation

---

## UPDATED PROBLEM STATEMENT

### v2.0 Problem Statement (Partial)
> "The school board faces a critical decision: selecting a 25-year lease proposal (2028-2053) from multiple developers."

### v2.1 Problem Statement (Complete)
> "The school board must **negotiate** a 25-year lease agreement (2028-2053) with developers through an **iterative offer-counteroffer process**. Each negotiation involves:
> - Creating initial financial models to determine viable rent structures
> - Submitting offers to developers
> - Evaluating developer counter-proposals
> - Creating counter-offers based on financial analysis
> - Multiple rounds until agreement is reached
>
> Current manual analysis cannot support this **dynamic negotiation process** with rapid sensitivity testing, version tracking, and comparative evaluation across negotiation rounds."

---

## DATA MODEL ADDITIONS

### New Fields Added to LeaseProposal

```typescript
interface LeaseProposal {
  // ... All existing fields from v2.0 (UNCHANGED)

  // NEW: Negotiation Context
  developer: string;              // Developer name (e.g., "Developer ABC")
  property: string;               // Property identifier (e.g., "Downtown Campus Site")
  negotiationRound: number;       // Which round (1, 2, 3...)
  version: string;                // Version within round (e.g., "V2.1")

  // NEW: Proposal Metadata
  origin: ProposalOrigin;         // 'OUR_OFFER' or 'THEIR_COUNTER'
  status: ProposalStatus;         // Lifecycle status (see enum below)
  parentProposalId?: string;      // Links to previous version in thread

  // NEW: Timeline Tracking
  submittedDate?: Date;           // When we/they submitted
  responseReceivedDate?: Date;    // When response came back

  // NEW: Notes & Context
  negotiationNotes?: string;      // Internal evaluation notes
  boardComments?: string;         // Board discussion notes
}

enum ProposalOrigin {
  OUR_OFFER = 'our_offer',           // Created by school
  THEIR_COUNTER = 'their_counter',   // Received from developer
}

enum ProposalStatus {
  // Our offers
  DRAFT = 'draft',                        // We're working on it
  READY_TO_SUBMIT = 'ready_to_submit',   // Reviewed, ready to send
  SUBMITTED = 'submitted',                // Sent to developer
  UNDER_REVIEW = 'under_review',          // Developer reviewing

  // Their counters
  COUNTER_RECEIVED = 'counter_received',  // They responded
  EVALUATING_COUNTER = 'evaluating_counter', // We're analyzing

  // Final states
  ACCEPTED = 'accepted',                  // Deal accepted
  REJECTED = 'rejected',                  // Offer/counter rejected
  NEGOTIATION_CLOSED = 'negotiation_closed', // Thread ended
}
```

### Database Migration Required

```sql
-- Add negotiation tracking fields
ALTER TABLE "LeaseProposal" ADD COLUMN "developer" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "property" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "negotiationRound" INTEGER DEFAULT 1;
ALTER TABLE "LeaseProposal" ADD COLUMN "version" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "origin" TEXT CHECK ("origin" IN ('our_offer', 'their_counter'));
ALTER TABLE "LeaseProposal" ADD COLUMN "status" TEXT DEFAULT 'draft';
ALTER TABLE "LeaseProposal" ADD COLUMN "parentProposalId" TEXT REFERENCES "LeaseProposal"("id");
ALTER TABLE "LeaseProposal" ADD COLUMN "submittedDate" TIMESTAMP;
ALTER TABLE "LeaseProposal" ADD COLUMN "responseReceivedDate" TIMESTAMP;
ALTER TABLE "LeaseProposal" ADD COLUMN "negotiationNotes" TEXT;
ALTER TABLE "LeaseProposal" ADD COLUMN "boardComments" TEXT;

-- Add index for negotiation queries
CREATE INDEX "idx_negotiation_thread" ON "LeaseProposal"("developer", "property", "negotiationRound");
CREATE INDEX "idx_status" ON "LeaseProposal"("status");
```

---

## UPDATED USER STORIES

### NEW User Stories (Added to v2.0)

**US-P1-NEW: Create Initial Offer**
- As a Planner, I want to create an initial lease offer to submit to a developer
- Acceptance Criteria:
  - Enter developer name and property details
  - Configure transition and dynamic period assumptions
  - Select rent model (Fixed/Revenue Share/Partner)
  - Mark as DRAFT initially
  - Can progress to READY_TO_SUBMIT when reviewed
  - Can submit (changes status to SUBMITTED, records submittedDate)

**US-P2-NEW: Log Developer Counter-Proposal**
- As a Planner, I want to record a counter-proposal received from a developer
- Acceptance Criteria:
  - Create new proposal version
  - Mark origin as THEIR_COUNTER
  - Link to parent (our previous offer) via parentProposalId
  - Status: COUNTER_RECEIVED
  - Record responseReceivedDate
  - Can add negotiationNotes with initial assessment

**US-P3-NEW: Evaluate Developer Counter**
- As a Planner, I want to evaluate a developer's counter-proposal financially
- Acceptance Criteria:
  - View their counter's financial projections
  - Run sensitivity analysis on their terms
  - Compare to our previous offer
  - Compare to our internal targets
  - Status changes to EVALUATING_COUNTER
  - Can add detailed evaluation notes

**US-P4-NEW: Create Counter-Offer**
- As a Planner, I want to create a counter-offer in response to developer's proposal
- Acceptance Criteria:
  - Duplicate developer's counter as starting point (optional)
  - Adjust rent model parameters
  - Mark origin as OUR_OFFER
  - Link to parent (their counter) via parentProposalId
  - Increment negotiation round if switching back to us
  - Status: DRAFT → READY_TO_SUBMIT → SUBMITTED

**US-P5-NEW: View Negotiation Timeline**
- As a Planner, I want to see complete negotiation history with a developer
- Acceptance Criteria:
  - View all proposals chronologically
  - See status of each version
  - Identify origin (us/them) with visual badges
  - Navigate to any version's details
  - See time elapsed between rounds
  - Filter by status or round

**US-P6-NEW: Compare Versions Within Negotiation**
- As a Planner, I want to compare multiple versions from same negotiation
- Acceptance Criteria:
  - Select 2-3 versions from negotiation thread
  - Side-by-side financial comparison
  - Highlight deltas between versions
  - Show progression over rounds
  - Filter comparison by origin (ours only, theirs only, mixed)
  - Export comparison report

**US-P7-NEW: Track Negotiation Status**
- As a Planner, I want to track where each negotiation stands
- Acceptance Criteria:
  - Dashboard shows status badges for each proposal
  - Clear indication of "ball in our court" vs "awaiting response"
  - Notifications for overdue responses (optional)
  - Can manually update status as negotiation progresses
  - Can mark negotiation as CLOSED (accepted/rejected/abandoned)

### REVISED User Stories (from v2.0)

**US-P1 (v2.0): Create Lease Proposal**
→ **REVISED TO:** US-P1-NEW above

**US-P7 (v2.0): Compare Multiple Proposals**
→ **REVISED TO:** Support two comparison modes:
1. **Cross-Negotiation:** Compare final offers from different developers/properties
2. **Within-Thread:** Compare versions within same negotiation (US-P6-NEW)

---

## UPDATED UI/UX REQUIREMENTS

### Dashboard Layout (v2.1)

**Replaces:** Section 7.2 "Dashboard Screen" in PRD v2.0

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Lease Negotiation Dashboard                              │
│                                                             │
│ [+ Start New Negotiation]    [📋 View All] [⚙️ Settings]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ACTIVE NEGOTIATIONS (2)                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏢 Downtown Campus - Developer ABC                  │   │
│ │                                                     │   │
│ │ Round 3 (Current)                                   │   │
│ │ ├─ V3.0 [THEM] Revenue Share 8%                    │   │
│ │ │   📨 Counter-Received: Dec 1, 2025                │   │
│ │ │   💰 25-Yr Total: €125.8M | NPV: €48.2M          │   │
│ │ │   ⚠️ Above target by 24%                         │   │
│ │ │   [📊 Evaluate] [💬 Add Notes]                   │   │
│ │ │                                                   │   │
│ │ └─ V3.1 [US] Revenue Share 6.5%                    │   │
│ │     📝 Draft - In Progress                          │   │
│ │     💰 25-Yr Total: €101.5M | NPV: €44.8M         │   │
│ │     ✅ Within budget                               │   │
│ │     [✏️ Continue] [📤 Submit]                       │   │
│ │                                                     │   │
│ │ [View All 3 Rounds] [📈 Timeline] [+ Counter-Offer]│   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🏢 North Campus - Developer XYZ                     │   │
│ │                                                     │   │
│ │ Round 1                                             │   │
│ │ └─ V1.0 [US] Fixed Rent 3%                         │   │
│ │     ✈️ Submitted: Nov 20, 2025                     │   │
│ │     ⏳ Awaiting response... (3 days)                │   │
│ │                                                     │   │
│ │ [View Details] [📝 Add Notes]                       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ CLOSED NEGOTIATIONS (1)                                     │
│                                                             │
│ □ Property A - Developer 123                                │
│   ✅ Accepted: V2.1 Revenue Share 7% (Oct 15, 2025)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Negotiation Timeline View (NEW)

**New Component:** `NegotiationTimelineView`

```
Property: Downtown Campus
Developer: ABC Development Corp
Status: Active Negotiation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nov 1, 2025
┌─ V1.0 [US] Fixed Rent 3% annual ───────────────────────┐
│  Status: SUBMITTED                                      │
│  School's target: Keep under 3.5%                      │
│  [View Details] [📊 Financials]                        │
└─────────────────────────────────────────────────────────┘
          ↓ (14 days)

Nov 15, 2025
┌─ V1.1 [THEM] Fixed Rent 5% annual ─────────────────────┐
│  Status: COUNTER_RECEIVED                              │
│  School's evaluation: Too expensive (40% over target)  │
│  Sensitivity: 5% = €15M extra over 25 years           │
│  Internal notes: "Rejected - too high"                 │
│  [View Details] [📊 Compare to V1.0]                   │
└─────────────────────────────────────────────────────────┘
          ↓ (7 days)

Nov 22, 2025
┌─ V2.0 [US] Fixed Rent 4% annual ───────────────────────┐
│  Status: SUBMITTED                                      │
│  School's reasoning: Meet halfway, still acceptable    │
│  [View Details] [📊 Financials]                        │
└─────────────────────────────────────────────────────────┘
          ↓ (9 days)

Dec 1, 2025
┌─ V2.1 [THEM] Revenue Share 8% ─────────────────────────┐
│  Status: EVALUATING_COUNTER                            │
│  School's evaluation: Different model, needs analysis  │
│  Sensitivity: 8% RS vs 4% Fixed → RS better if high   │
│               enrollment sustained                     │
│  Internal notes: "Interesting pivot to Rev Share"      │
│  [View Details] [📊 Run Sensitivity]                   │
└─────────────────────────────────────────────────────────┘
          ↓

Dec 10, 2025 (Draft)
┌─ V3.0 [US] Revenue Share 6.5% ─────────────────────────┐
│  Status: DRAFT                                          │
│  School's reasoning: Split difference, aligns          │
│                      incentives                        │
│  [✏️ Edit] [📤 Submit] [📊 Financials]                 │
└─────────────────────────────────────────────────────────┘
```

### Status Badge Component (NEW)

Visual indicators for proposal status:

```typescript
interface StatusBadge {
  status: ProposalStatus;
  origin: ProposalOrigin;
}

// Visual Design
[📝 DRAFT]             // Gray, our offer in progress
[📤 READY]             // Blue, reviewed and ready
[✈️ SUBMITTED]         // Blue, sent to developer
[⏳ UNDER REVIEW]      // Yellow, developer reviewing
[📨 COUNTER RECEIVED]  // Orange, they responded
[🔍 EVALUATING]        // Yellow, we're analyzing
[✅ ACCEPTED]          // Green, deal done!
[❌ REJECTED]          // Red, offer declined
[🔒 CLOSED]            // Gray, negotiation ended
```

### Comparison Modes (UPDATED)

**Mode 1: Cross-Negotiation Comparison**
> Compare final/best offers from different negotiations

```
Select negotiations to compare:
☑ Downtown Campus - Developer ABC (V3.0 Rev Share 6.5%)
☑ North Campus - Developer XYZ (V1.5 Fixed 4%)
☑ South Campus - Developer QRS (V2.0 Partner)

                    Downtown        North          South
                    ────────        ─────          ─────
Developer           ABC             XYZ            QRS
Our Offer           V3.0            V1.5           V2.0
Rent Model          Rev Share 6.5%  Fixed 4%       Partner
Year 1 Rent         €2.6M          €2.8M          €3.0M
25-Year Total       €101.5M ✅      €118.2M        €135.8M ❌
NPV (4%)            €44.8M ✅       €47.1M         €52.3M ❌
Status              Draft           Submitted      Evaluating

Best Option: Downtown Campus (ABC) - Lowest cost, aligned incentives
```

**Mode 2: Within-Thread Version Comparison**
> Compare versions within same negotiation

```
Negotiation: Downtown Campus - Developer ABC
Select versions to compare:

☑ V2.0 [US] Fixed 4%
☑ V2.1 [THEM] Rev Share 8%
☑ V3.0 [US] Rev Share 6.5%

                    V2.0 [US]       V2.1 [THEM]    V3.0 [US]
                    ─────────       ───────────    ─────────
Origin              Our Offer       Their Counter  Our Counter
Rent Model          Fixed 4%        Rev Share 8%   Rev Share 6.5%
Year 1 Rent         €2.4M          €3.2M ⚠️        €2.6M ✅
25-Year Total       €95.8M         €125.8M ⚠️      €101.5M ✅
NPV (4%)            €43.5M         €48.2M          €44.8M
Delta from V2.0     Baseline       +€30M          +€5.7M

Recommendation: V3.0 - Acceptable middle ground, aligns incentives
```

---

## UPDATED NAVIGATION STRUCTURE

### Primary Navigation (Top Level)

**v2.0 Navigation:**
```
- Dashboard
- Historical Data
- System Settings
- Proposals ← Flat list
- Comparison
- Reports
```

**v2.1 Navigation (REVISED):**
```
- Dashboard ← Thread-based view (active negotiations)
- Negotiations ← All negotiations (searchable, filterable)
- Historical Data
- System Settings (Admin only)
- Reports & Analytics
```

### Negotiation-Level Navigation (NEW)

When viewing a specific negotiation thread:

```
Negotiation: Downtown Campus - Developer ABC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tabs:
├─ 🧵 Timeline (chronological view of all versions)
├─ 📊 Compare Versions (side-by-side comparison)
├─ 💬 Notes & Discussion (internal board notes)
├─ 📈 Analysis (sensitivity, scenarios)
└─ 📑 Documents (contracts, emails, attachments)
```

### Proposal-Level Navigation (Unchanged from v2.0)

When viewing a specific proposal version:

```
Proposal: V3.0 [US] Revenue Share 6.5%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tabs (same as v2.0):
├─ 📝 Overview
├─ 🔄 Transition Setup (2025-2027)
├─ 🚀 Dynamic Setup (2028-2053)
├─ 💰 Financial Statements (P&L / BS / CF)
├─ 🎚️ Scenarios (interactive sliders)
└─ 📊 Sensitivity Analysis (tornado diagrams)
```

---

## API ENHANCEMENTS

### New Endpoints

**GET /api/negotiations**
> Get all negotiation threads (grouped proposals)

Query Parameters:
- `status`: Filter by status (active, closed, all)
- `developer`: Filter by developer name
- `property`: Filter by property
- `sortBy`: Sort field (lastActivity, developer, round)
- `sortOrder`: asc | desc

Response:
```json
{
  "negotiations": [
    {
      "developer": "Developer ABC",
      "property": "Downtown Campus",
      "totalRounds": 3,
      "currentRound": 3,
      "latestVersion": "V3.0",
      "latestStatus": "draft",
      "latestOrigin": "our_offer",
      "lastActivity": "2025-12-10T10:00:00Z",
      "proposals": [
        { "id": "...", "version": "V1.0", ... },
        { "id": "...", "version": "V1.1", ... },
        // ...
      ]
    }
  ]
}
```

**GET /api/negotiations/:developer/:property/timeline**
> Get chronological timeline for specific negotiation

Response:
```json
{
  "negotiation": {
    "developer": "Developer ABC",
    "property": "Downtown Campus",
    "status": "active"
  },
  "timeline": [
    {
      "date": "2025-11-01",
      "version": "V1.0",
      "origin": "our_offer",
      "status": "submitted",
      "summary": "Fixed Rent 3%",
      "proposalId": "..."
    },
    // ...
  ]
}
```

### Enhanced Existing Endpoints

**POST /api/proposals** (UPDATED)

Additional fields in request body:
```json
{
  // ... existing fields from v2.0

  // NEW fields
  "developer": "Developer ABC",
  "property": "Downtown Campus",
  "negotiationRound": 2,
  "version": "V2.0",
  "origin": "our_offer",
  "status": "draft",
  "parentProposalId": "parent-id-here",  // optional
  "negotiationNotes": "Countering their 8% with 6.5%"
}
```

**GET /api/proposals** (UPDATED)

Additional query parameters:
- `developer`: Filter by developer
- `property`: Filter by property
- `origin`: Filter by origin (our_offer, their_counter)
- `status`: Filter by status
- `negotiationRound`: Filter by round

---

## IMPLEMENTATION TIMELINE

### Week 1 Extension (+2 days)

**Focus:** Database schema updates

- [ ] Create Prisma migration for new fields
- [ ] Update Prisma schema with enums
- [ ] Run migration on development database
- [ ] Seed with sample negotiation thread
- [ ] Test parent-child relationships

**Deliverables:**
- Updated schema with negotiation tracking
- Migration file
- Updated types

### Week 2 (+3 days)

**Focus:** API & Dashboard

- [ ] Implement /api/negotiations endpoints
- [ ] Update /api/proposals with new filters
- [ ] Build NegotiationThreadView component
- [ ] Build StatusBadge component
- [ ] Update Dashboard layout

**Deliverables:**
- Thread-based dashboard
- Status tracking
- Negotiation grouping

### Week 2-3 (+2 days)

**Focus:** Timeline & Comparison

- [ ] Build TimelineView component
- [ ] Enhance comparison to support within-thread
- [ ] Add version comparison UI
- [ ] Test negotiation workflows

**Deliverables:**
- Timeline view
- Enhanced comparison
- Complete negotiation UX

---

## BACKWARD COMPATIBILITY

**Migration Strategy for Existing Data:**

```sql
-- For existing proposals without negotiation context
UPDATE "LeaseProposal"
SET
  "developer" = 'Legacy Developer',
  "property" = COALESCE("name", 'Legacy Property'),
  "negotiationRound" = 1,
  "version" = 'V1.0',
  "origin" = 'our_offer',
  "status" = 'draft'
WHERE
  "developer" IS NULL;
```

---

## SUCCESS METRICS (UPDATED)

### Additional Metrics (v2.1)

**Negotiation Tracking:**
- Average negotiation rounds to acceptance: Target < 4 rounds
- Time from initial offer to acceptance: Track per negotiation
- Counter-offer response time: Monitor developer responsiveness

**Version Management:**
- Average versions created per negotiation: Track complexity
- Version comparison usage: Measure utility
- Timeline view engagement: Track user behavior

**Status Accuracy:**
- % of proposals with accurate status: Target 100%
- Status update frequency: Measure discipline
- Closed negotiations tracking: Complete history

---

## APPENDIX: TERMINOLOGY GUIDE

**v2.1 Preferred Terms:**

| Concept | Preferred Term | Avoid | Rationale |
|---------|---------------|-------|-----------|
| Financial model/offer | **Proposal** | Scenario, Model | Generic, works both directions |
| Created by school | **[US] Our Offer** | - | Clear ownership |
| Received from dev | **[THEM] Their Counter** | - | Clear origin |
| Multiple versions | **Negotiation Thread** | Proposal Group | Implies continuity |
| Version identifier | **V2.0, V2.1** | Version 2, Draft 2 | Concise, sortable |
| Workflow stage | **Status** | State, Phase | Standard terminology |
| Version history | **Timeline** | History, Log | Visual metaphor |

---

## DOCUMENT STATUS

✅ **APPROVED FOR IMPLEMENTATION**

**Review & Approval:**
- [x] CAO Review: Approved Nov 23, 2025
- [x] Technical Feasibility: Confirmed (Medium effort, 7-9 hours)
- [x] Backward Compatibility: Migration strategy defined
- [x] Impact Assessment: Complete (see PHASE_3_NARRATIVE_CORRECTION.md)

**Next Steps:**
1. Begin schema migration (Week 1 extension)
2. Update API endpoints (Week 2)
3. Build negotiation UX components (Week 2-3)
4. Update documentation and guides

**Dependencies:**
- Requires PRD v2.0 (all financial requirements remain valid)
- Requires Phase 1 & 2 completion (database and calculation engine)

---

**— END OF ADDENDUM —**

*This addendum (v2.1) supersedes narrative and workflow descriptions in PRD v2.0. All financial calculation requirements from v2.0 remain 100% valid and unchanged.*
