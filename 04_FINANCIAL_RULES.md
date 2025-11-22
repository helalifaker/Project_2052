# Project Zeta - Financial Calculation Rules (Master Document)

**Version:** 4.1  
**Last Updated:** November 22, 2025  
**Status:** ✅ COMPLETE - All Financial Rules + Input Requirements Documented  
**Owner:** Faker (CAO)

---

## 📋 DOCUMENT STATUS

| Section | Status | Last Updated |
|---------|--------|--------------|
| P&L Principles | ✅ Complete | Nov 22, 2025 |
| Depreciation Rules | ✅ Complete | Nov 22, 2025 |
| Balance Sheet Principles | ✅ Complete | Nov 22, 2025 |
| Cash Flow Principles | ✅ Complete | Nov 22, 2025 |
| Working Capital Rules | ✅ Complete | Nov 22, 2025 |
| Period Linkage Rules | ✅ Complete | Nov 22, 2025 |
| Input Requirements | ✅ Complete | Nov 22, 2025 |

---

## PART 1: PROFIT & LOSS STATEMENT (P&L)

### 1.1 Core P&L Principles

#### The Three Periods Approach

**HISTORICAL (2023-2024):**
- Data Source: `historical_actuals` table
- Calculation: NONE - Direct data retrieval only
- Purpose: Fixed baseline, provides ratios for transition period

**TRANSITION (2025-2027):**
- Data Source: `transition_year_data` table + 2024 ratios
- Calculation: RATIO-BASED from 2024
- Primary Driver: Number of Students
- Purpose: Bridge to new campus with minimal changes
- **CRITICAL:** IB curriculum NOT active during transition period (only FR)

**DYNAMIC (2028-2052):**
- Data Source: Multiple calculation engines
- Calculation: FULL PROJECTION with sophisticated models
- Purpose: Long-term projection post-relocation
- **CRITICAL:** IB curriculum optional (may or may not be active)

---

### 1.2 IB CURRICULUM AVAILABILITY RULE

**CRITICAL BUSINESS RULE:**
> IB (International Baccalaureate) curriculum is NOT available during the transition period and is OPTIONAL during the dynamic period.

**Period-Specific Rules:**

**Historical Period (2023-2024):**
- IB may or may not exist (use actual data as-is)
- Source: `historical_actuals.tuitionIB`

**Transition Period (2025-2027):**
- ❌ IB curriculum is NOT ACTIVE
- ✅ Only French (FR) curriculum operates
- IB Revenue = 0 for all transition years
- All students are FR students

**Dynamic Period (2028-2052):**
- ✅ IB curriculum is OPTIONAL
- User decides if IB program launches
- If IB not active: IB Revenue = 0, only FR operates
- If IB active: Both FR and IB revenue calculated

**Implementation Logic:**
```typescript
// Check if IB curriculum is active for the year
function isIBActive(year: number, curriculumPlans: CurriculumPlan[]): boolean {
  const period = getPeriodForYear(year);
  
  if (period === 'TRANSITION') {
    // IB never active in transition period
    return false;
  }
  
  if (period === 'DYNAMIC') {
    // Check if IB curriculum plan exists and has students
    const ibPlan = curriculumPlans.find(p => p.curriculumType === 'IB');
    if (!ibPlan) return false;
    
    const yearData = ibPlan.studentsProjection.find(s => s.year === year);
    return yearData && yearData.students > 0;
  }
  
  // Historical - use actual data
  return true;
}
```

---

### 1.3 THE OTHER REVENUE RATIO PRINCIPLE

**Core Concept:**
> Other revenue maintains a constant ratio to tuition revenue based on the 2024 baseline.

**Formula (Applies to Transition and Dynamic Periods):**
```
Other Revenue Ratio = Other Revenue 2024 / FR Tuition 2024
Note: Use only FR tuition for ratio since IB not active in transition

Other Revenue [Year N] = Total Tuition [Year N] × Other Revenue Ratio
```

**Why This Approach?**
- Maintains business model proportions
- Automatic scaling with tuition growth
- No manual input required for each year
- Reflects the relationship between tuition and ancillary revenues (cafeteria, programs, etc.)
- Based on FR curriculum only (consistent baseline)

**Example:**
```
2024 Historical Data:
├─ FR Tuition: 80,000,000 SAR
├─ IB Tuition: 0 SAR (or minimal)
├─ Other Revenue: 8,000,000 SAR
└─ Ratio: 8M / 80M = 10%

2025 Transition:
├─ FR Tuition: 88,000,000 SAR
├─ IB Tuition: 0 SAR (NOT ACTIVE)
└─ Other Revenue: 88M × 10% = 8,800,000 SAR

2028 Dynamic (IB Optional):
├─ FR Tuition: 95,000,000 SAR
├─ IB Tuition: 5,000,000 SAR (if active)
├─ Total Tuition: 100,000,000 SAR
└─ Other Revenue: 100M × 10% = 10,000,000 SAR
```

**Implementation:**
```typescript
// Calculate once from 2024 baseline (using FR tuition only)
function getOtherRevenueRatio(): Decimal {
  const hist2024 = getHistoricalActuals(2024);
  // Use only FR tuition for baseline (IB not relevant for transition)
  const frTuition2024 = hist2024.tuitionFrenchCurriculum;
  const otherRevenue2024 = hist2024.otherIncome;
  
  return otherRevenue2024.dividedBy(frTuition2024);
}

// Apply to any year
function calculateOtherRevenue(totalTuition: Decimal): Decimal {
  const ratio = getOtherRevenueRatio();
  return totalTuition.times(ratio);
}
```

---

### 1.3 REVENUE CALCULATIONS

#### Historical Period (2023-2024)

```typescript
// Source: Direct retrieval from historical_actuals
revenue = {
  tuitionFR: historical_actuals.tuitionFrenchCurriculum,
  tuitionIB: historical_actuals.tuitionIB,
  otherRevenue: historical_actuals.otherIncome,
  totalRevenue: historical_actuals.totalRevenues
};
```

**Rules:**
- No calculations
- All values from database
- Immutable - cannot be changed

---

#### Transition Period (2025-2027)

**CRITICAL:** IB curriculum NOT ACTIVE during transition period.

**Primary Formula:**
```
Tuition Revenue = Average Tuition per Student × Number of Students (FR only)
Other Revenue = (Other Revenue 2024 / FR Tuition 2024) × Tuition Revenue Current Year
Total Revenue = Tuition Revenue + Other Revenue
```

**Implementation:**
```typescript
// Step 1: Get number of students (FR curriculum only)
const numberOfStudents = transitionData.numberOfStudents; // All students are FR

// Step 2: Get average tuition (direct input required for each year)
const avgTuition = transitionData.averageTuitionPerStudent;

// Step 3: Calculate tuition revenue (FR only)
const tuitionRevenueFR = avgTuition.times(numberOfStudents);
const tuitionRevenueIB = new Decimal(0); // IB NOT ACTIVE
const tuitionRevenue = tuitionRevenueFR; // Only FR

// Step 4: Calculate other revenue using 2024 ratio
const hist2024 = getHistoricalActuals(2024);
const frTuition2024 = hist2024.tuitionFrenchCurriculum;
const otherRevenue2024 = hist2024.otherIncome;

// Other revenue ratio to FR tuition
const otherRevenueRatio = otherRevenue2024.dividedBy(frTuition2024);

// Apply ratio to current year's tuition
const otherRevenue = tuitionRevenue.times(otherRevenueRatio);

// Step 5: Calculate total revenue
const totalRevenue = tuitionRevenue.plus(otherRevenue);
```

**Key Inputs Required:**
- `numberOfStudents` - Direct input for each transition year (required) - All FR students
- `averageTuitionPerStudent` - Direct input for each transition year (required) - FR tuition
- Other revenue is automatically calculated from 2024 ratio

**Removed Fields (No Longer Used):**
- ~~`targetEnrollment`~~ → Use `numberOfStudents` instead
- ~~`otherRevenue`~~ → Automatically calculated from ratio

**Rules:**
- Number of students is direct input (not derived from capacity)
- Average tuition must be provided for each year
- Other revenue automatically calculated using 2024 ratio to FR tuition
- **All students are FR students** - IB not active
- **IB Revenue = 0** for all transition years
- Revenue scales with student count

---

#### Dynamic Period (2028-2052)

**CRITICAL:** IB curriculum is OPTIONAL - may or may not be active.

**Student Enrollment Logic:**
```
Years 1-5 (2028-2032): Based on Capacity × Ramp-up %
Years 6+ (2033-2052): Fixed at Year 5 enrollment level

Example:
Year 2028 (Year 1): Capacity × 20% ramp-up = Students
Year 2029 (Year 2): Capacity × 40% ramp-up = Students
Year 2030 (Year 3): Capacity × 60% ramp-up = Students
Year 2031 (Year 4): Capacity × 80% ramp-up = Students
Year 2032 (Year 5): Capacity × 100% ramp-up = Students
Year 2033+ (Year 6+): Same as Year 2032 (steady state)
```

**Primary Formula:**
```
Students [Year N] = Capacity × Ramp-up % (Years 1-5)
                  = Students Year 5 (Years 6+)

Tuition [Year N] = Base Tuition × (1 + Tuition Growth Rate)^period
  Where: period = floor((Year - 2028) / Tuition Growth Frequency)

FR Revenue = Tuition FR × Students FR
IB Revenue = Tuition IB × Students IB (if active, else 0)
Other Revenue = Total Tuition × Other Revenue Ratio
Total Revenue = FR Revenue + IB Revenue + Other Revenue
```

**Implementation:**
```typescript
// Calculate student enrollment for a given year
function calculateStudentEnrollment(
  year: number,
  capacity: number,
  rampUpPlan: RampUpYear[]
): number {
  const baseYear = 2028;
  const yearsSinceBase = year - baseYear + 1; // Year 1 = 2028
  
  if (yearsSinceBase <= 5) {
    // Years 1-5: Use ramp-up plan
    const rampUpYear = rampUpPlan.find(r => r.year === yearsSinceBase);
    if (!rampUpYear) {
      throw new Error(`Ramp-up plan missing for year ${yearsSinceBase}`);
    }
    
    // Students = Capacity × Ramp-up %
    const students = Math.round(capacity * rampUpYear.percentage);
    return students;
  } else {
    // Years 6+: Use Year 5 enrollment (steady state)
    const year5RampUp = rampUpPlan.find(r => r.year === 5);
    if (!year5RampUp) {
      throw new Error('Ramp-up plan missing for year 5');
    }
    
    const studentsYear5 = Math.round(capacity * year5RampUp.percentage);
    return studentsYear5;
  }
}

// Calculate FR revenue (ALWAYS active)
const capacityFR = frPlan.capacity;
const rampUpPlanFR = frPlan.rampUpPlan;
const studentsFR = calculateStudentEnrollment(year, capacityFR, rampUpPlanFR);

const tuitionFR = calculateDynamicTuition(year, frPlan, tuitionGrowthRate);
const revenueFR = tuitionFR.times(studentsFR);

// Calculate IB revenue (OPTIONAL - check if active)
let revenueIB = new Decimal(0);
const ibPlan = curriculumPlans.find(p => p.curriculumType === 'IB');

if (ibPlan) {
  // IB curriculum plan exists
  const capacityIB = ibPlan.capacity;
  const rampUpPlanIB = ibPlan.rampUpPlan;
  
  // Check if IB has capacity configured
  if (capacityIB > 0 && rampUpPlanIB && rampUpPlanIB.length > 0) {
    const studentsIB = calculateStudentEnrollment(year, capacityIB, rampUpPlanIB);
    
    if (studentsIB > 0) {
      // IB is active for this year
      const tuitionIB = calculateDynamicTuition(year, ibPlan, tuitionGrowthRate);
      revenueIB = tuitionIB.times(studentsIB);
    }
  }
}

// Calculate total tuition (FR + IB)
const totalTuitionRevenue = revenueFR.plus(revenueIB);

// Calculate other revenue using 2024 ratio to FR tuition
const hist2024 = getHistoricalActuals(2024);
const frTuition2024 = hist2024.tuitionFrenchCurriculum;
const otherRevenue2024 = hist2024.otherIncome;

// Other revenue ratio to FR tuition
const otherRevenueRatio = otherRevenue2024.dividedBy(frTuition2024);

// Apply ratio to current year's total tuition
const otherRevenue = totalTuitionRevenue.times(otherRevenueRatio);

const totalRevenue = totalTuitionRevenue.plus(otherRevenue);
```

**Configuration Inputs:**

**For each curriculum (FR and IB):**
- `capacity` - Maximum student capacity
- `rampUpPlan` - Array of 5 ramp-up percentages
- `tuitionBase` - Base tuition for year 2028
- `tuitionGrowthRate` - Annual tuition growth rate (e.g., 0.05 for 5%)
- `tuitionGrowthFrequency` - Years between tuition increases (1, 2, 3, 4, or 5)

**Ramp-up Plan Structure:**
```typescript
interface RampUpYear {
  year: number;        // 1, 2, 3, 4, 5
  percentage: Decimal; // e.g., 0.20, 0.40, 0.60, 0.80, 1.00
}

// Example ramp-up plan
const rampUpPlanFR: RampUpYear[] = [
  { year: 1, percentage: new Decimal(0.20) }, // 2028: 20% of capacity
  { year: 2, percentage: new Decimal(0.40) }, // 2029: 40% of capacity
  { year: 3, percentage: new Decimal(0.60) }, // 2030: 60% of capacity
  { year: 4, percentage: new Decimal(0.80) }, // 2031: 80% of capacity
  { year: 5, percentage: new Decimal(1.00) }, // 2032: 100% of capacity
];
// 2033+: 100% of capacity (same as year 5)
```

**Example:**
```
FR Curriculum Configuration:
├─ Capacity: 2,000 students
├─ Ramp-up Plan:
│  ├─ Year 1 (2028): 20% → 400 students
│  ├─ Year 2 (2029): 40% → 800 students
│  ├─ Year 3 (2030): 60% → 1,200 students
│  ├─ Year 4 (2031): 80% → 1,600 students
│  └─ Year 5 (2032): 100% → 2,000 students
└─ Year 6+ (2033-2052): 2,000 students (steady state)

IB Curriculum Configuration (if active):
├─ Capacity: 500 students
├─ Ramp-up Plan:
│  ├─ Year 1 (2028): 10% → 50 students
│  ├─ Year 2 (2029): 30% → 150 students
│  ├─ Year 3 (2030): 50% → 250 students
│  ├─ Year 4 (2031): 75% → 375 students
│  └─ Year 5 (2032): 100% → 500 students
└─ Year 6+ (2033-2052): 500 students (steady state)

Revenue Calculation Example (Year 2028):
├─ FR Students: 400
├─ FR Tuition: 50,000 SAR (base with CPI)
├─ FR Revenue: 400 × 50,000 = 20,000,000 SAR
├─ IB Students: 50 (if IB active)
├─ IB Tuition: 60,000 SAR (base with CPI)
├─ IB Revenue: 50 × 60,000 = 3,000,000 SAR
├─ Total Tuition: 23,000,000 SAR
├─ Other Revenue: 23,000,000 × 10% = 2,300,000 SAR
└─ Total Revenue: 25,300,000 SAR

Revenue Calculation Example (Year 2033):
├─ FR Students: 2,000 (same as Year 5)
├─ FR Tuition: 55,000 SAR (with CPI growth)
├─ FR Revenue: 2,000 × 55,000 = 110,000,000 SAR
├─ IB Students: 500 (same as Year 5)
├─ IB Tuition: 66,000 SAR (with CPI growth)
├─ IB Revenue: 500 × 66,000 = 33,000,000 SAR
├─ Total Tuition: 143,000,000 SAR
├─ Other Revenue: 143,000,000 × 10% = 14,300,000 SAR
└─ Total Revenue: 157,300,000 SAR
```

**Rules:**
- **FR curriculum:** Always active, always calculated
- **IB curriculum:** Optional
  - If no IB curriculum plan exists → IB Revenue = 0
  - If IB capacity = 0 → IB Revenue = 0
  - If IB active → Calculate based on capacity and ramp-up
- **Student Enrollment:**
  - Years 1-5 (2028-2032): Capacity × Ramp-up %
  - Years 6+ (2033-2052): Fixed at Year 5 level (steady state)
- **Ramp-up Plan:** Must have exactly 5 years defined
- **Tuition Growth:**
  - Growth rate is separate from CPI
  - Can be different for each curriculum
  - Frequency determines how often tuition increases (1-5 years)
  - Period = floor((Year - 2028) / Frequency)
- Other revenue automatically calculated using 2024 ratio to FR tuition
- Other Revenue = (Other Revenue 2024 / FR Tuition 2024) × Total Tuition Current Year

**Helper Function:**
```typescript
// Calculate tuition with growth rate for any curriculum
function calculateDynamicTuition(
  year: number,
  curriculumPlan: CurriculumPlan,
  tuitionGrowthRate: Decimal
): Decimal {
  const baseYear = 2028;
  const baseTuition = curriculumPlan.tuitionBase;
  const frequency = curriculumPlan.tuitionGrowthFrequency;
  
  // Calculate period (how many growth cycles)
  const period = Math.floor((year - baseYear) / frequency);
  
  // Apply tuition growth
  const growthFactor = new Decimal(1).plus(tuitionGrowthRate).pow(period);
  const tuition = baseTuition.times(growthFactor);
  
  return tuition;
}
```

---

### 1.4 STAFF COSTS CALCULATIONS

#### Historical Period (2023-2024)

```typescript
// Source: Direct retrieval
staffCosts = historical_actuals.salariesAndRelatedCosts;
```

**Rules:** No calculations, direct retrieval only

---

#### Transition Period (2025-2027)

**Formula (Single Method):**
```
Staff Costs = (Staff Costs 2024 / Revenue 2024) × Revenue [Current Year]
```

**Implementation:**
```typescript
// Calculate staff costs using 2024 ratio
const hist2024 = getHistoricalActuals(2024);
const staffCostRatio2024 = hist2024.salariesAndRelatedCosts
  .dividedBy(hist2024.totalRevenues);

const staffCosts = totalRevenue.times(staffCostRatio2024);
```

**Key Principle:** Maintains 2024 business model proportions

**Example:**
```
2024: Revenue = 100M, Staff Costs = 40M, Ratio = 40%
2025: Revenue = 110M, Staff Costs = 110M × 40% = 44M
```

**Rules:**
- Single calculation method (no alternatives)
- Ratio automatically maintains business model proportions
- Scales with revenue growth
- Simple and consistent

---

#### Dynamic Period (2028-2052)

**Base Year 2028 Calculation:**

The base staff costs for year 2028 is calculated from students per teacher/non-teacher:

```
Step 1: Calculate number of staff needed (Year 2028)
  Teachers Needed = Total Students 2028 / Students per Teacher
  Non-Teachers Needed = Total Students 2028 / Students per Non-Teacher

Step 2: Calculate annual staff costs (Year 2028)
  Teacher Costs = Teachers Needed × Teacher Average Salary × 12 months
  Non-Teacher Costs = Non-Teachers Needed × Non-Teacher Average Salary × 12 months
  
  Base Staff Costs 2028 = Teacher Costs + Non-Teacher Costs

Step 3: Apply CPI growth for future years (Y+1 onwards)
  Staff Costs [Year N] = Base Staff Costs 2028 × (1 + CPI)^period
  
  Where:
    period = floor((Year N - 2028) / CPI Frequency)
```

**Implementation:**
```typescript
// Step 1: Calculate base staff costs for 2028
function calculateStaffCostBase2028(
  totalStudents2028: number,
  studentsPerTeacher: Decimal,
  studentsPerNonTeacher: Decimal,
  teacherMonthlySalary: Decimal,
  nonTeacherMonthlySalary: Decimal
): Decimal {
  
  // Calculate number of staff needed
  const teachersNeeded = new Decimal(totalStudents2028).dividedBy(studentsPerTeacher);
  const nonTeachersNeeded = new Decimal(totalStudents2028).dividedBy(studentsPerNonTeacher);
  
  // Calculate annual costs
  const teacherCosts = teachersNeeded
    .times(teacherMonthlySalary)
    .times(12);
  
  const nonTeacherCosts = nonTeachersNeeded
    .times(nonTeacherMonthlySalary)
    .times(12);
  
  // Total base for 2028
  const baseStaffCosts = teacherCosts.plus(nonTeacherCosts);
  
  return baseStaffCosts;
}

// Step 2: Apply CPI growth for years after 2028
function calculateDynamicStaffCosts(
  year: number,
  baseStaffCosts2028: Decimal,
  cpiRate: Decimal,
  cpiFrequency: number
): Decimal {
  
  if (year === 2028) {
    // Year 2028 uses base (no CPI growth yet)
    return baseStaffCosts2028;
  }
  
  // For Y+1 onwards (2029+), apply CPI growth
  const baseYear = 2028;
  const period = Math.floor((year - baseYear) / cpiFrequency);
  
  const growthFactor = new Decimal(1).plus(cpiRate).pow(period);
  const staffCosts = baseStaffCosts2028.times(growthFactor);
  
  return staffCosts;
}
```

**Configuration Inputs:**
- `studentsPerTeacher` - e.g., 14 (14 students per 1 teacher)
- `studentsPerNonTeacher` - e.g., 25 (25 students per 1 non-teacher)
- `teacherMonthlySalary` - Average monthly salary for teachers
- `nonTeacherMonthlySalary` - Average monthly salary for non-teaching staff
- `cpiRate` - Annual CPI rate (e.g., 0.03 for 3%)
- `cpiFrequency` - Years between CPI adjustments (1, 2, or 3)

**Example:**
```
2028 Calculation:
├─ Total Students: 2,000
├─ Students per Teacher: 14
├─ Teachers Needed: 2,000 / 14 = 142.86 ≈ 143
├─ Teacher Salary: 15,000 SAR/month
├─ Teacher Costs: 143 × 15,000 × 12 = 25,740,000 SAR
├─ Students per Non-Teacher: 25
├─ Non-Teachers Needed: 2,000 / 25 = 80
├─ Non-Teacher Salary: 10,000 SAR/month
├─ Non-Teacher Costs: 80 × 10,000 × 12 = 9,600,000 SAR
└─ Base Staff Costs 2028: 35,340,000 SAR

2029 Calculation (CPI = 3%, Frequency = 1):
├─ Period: (2029 - 2028) / 1 = 1
├─ Growth Factor: (1 + 0.03)^1 = 1.03
└─ Staff Costs 2029: 35,340,000 × 1.03 = 36,400,200 SAR

2030 Calculation:
├─ Period: (2030 - 2028) / 1 = 2
├─ Growth Factor: (1 + 0.03)^2 = 1.0609
└─ Staff Costs 2030: 35,340,000 × 1.0609 = 37,502,406 SAR
```

**Rules:**
- Base year = 2028 (calculated from ratios)
- Year 2028 uses base (period 0, no CPI growth applied yet)
- CPI growth starts from year 2029 (Y+1)
- Never calculate backwards (years < 2028 use transition method)
- Base calculation uses student counts and staff ratios

---

### 1.5 RENT CALCULATIONS

#### Historical Period (2023-2024)

```typescript
// Source: Direct retrieval
rent = historical_actuals.schoolRent;
```

**Rules:** No calculations, direct retrieval only

---

#### Transition Period (2025-2027)

**Primary Formula:**
```
Rent = Rent 2024 × (1 + Growth %)
```

**Implementation:**
```typescript
let rent: Decimal;

if (transitionData.rentGrowthPercent) {
  // Apply growth from 2024 base
  const rent2024 = getHistoricalActuals(2024).schoolRent;
  const growthMultiplier = new Decimal(1).plus(
    transitionData.rentGrowthPercent.dividedBy(100)
  );
  rent = rent2024.times(growthMultiplier);
} else {
  // No growth - use 2024 rent
  const rent2024 = getHistoricalActuals(2024).schoolRent;
  rent = rent2024;
}
```

**CRITICAL RULE:** 
- ❌ NO rent models in transition period
- ✅ Simple growth percentage only
- Rent models (Fixed Escalation, Revenue Share, Partner Model) apply ONLY to dynamic period

---

#### Dynamic Period (2028-2052)

**Three Rent Models Available:**

##### Model 1: Fixed Escalation
```
Rent = Base Rent × (1 + Escalation Rate)^period

Where:
  period = floor((Year - 2028) / Frequency)
```

**Implementation:**
```typescript
const period = Math.floor((year - 2028) / rentPlan.frequency);
const growthFactor = new Decimal(1).plus(rentPlan.escalationRate).pow(period);
rent = rentPlan.baseRent.times(growthFactor);
```

##### Model 2: Revenue Share
```
Rent = Total Revenue × Revenue Share %

Where:
  - Revenue Share %: Percentage of total revenue (e.g., 8%)
  - Rent is recalculated each year based on actual revenue
```

**Implementation:**
```typescript
rent = totalRevenue.times(rentPlan.revenueSharePercent);
```

**Required Parameters:**
- `revenueSharePercent`: Decimal (e.g., 0.08 for 8%)

##### Model 3: Partner Model
```
Step 1: Total Investment = (Land Size × Land Price) + (BUA Size × Construction Cost)
Step 2: Base Rent = Total Investment × Yield Rate
Step 3: Rent = Base Rent × (1 + Growth Rate)^period
```

**Implementation:**
```typescript
const totalInvestment = rentPlan.landSize
  .times(rentPlan.landPricePerSqm)
  .plus(rentPlan.buaSize.times(rentPlan.constructionCostPerSqm));

const baseRent = totalInvestment.times(rentPlan.yieldBase);

const period = Math.floor((year - 2028) / rentPlan.frequency);
const growthFactor = new Decimal(1).plus(rentPlan.growthRate).pow(period);
rent = baseRent.times(growthFactor);
```

**Rules:**
- Rent models ONLY for years 2028-2052
- User selects one model per version
- Models support different frequency settings (1, 2, or 3 years)

---

### 1.6 OPERATING EXPENSES (OpEx)

**CRITICAL PRINCIPLE:**
> Total Operating Expenses = Rent + Staff Costs + Other Operating Expenses (for all periods)

**Breakdown:**
```
Total Operating Expenses
├─ Rent
├─ Staff Costs (Salaries and Related Costs)
└─ Other Operating Expenses
```

---

#### Historical Period (2023-2024)

**Source:** Direct from historical_actuals table

```typescript
// All components from historical_actuals
const rent = historical_actuals.schoolRent;
const staffCosts = historical_actuals.salariesAndRelatedCosts;
const otherOpex = historical_actuals.totalOperatingExpenses
  .minus(historical_actuals.salariesAndRelatedCosts)
  .minus(historical_actuals.schoolRent);

const totalOpex = rent.plus(staffCosts).plus(otherOpex);
// or simply:
const totalOpex = historical_actuals.totalOperatingExpenses;
```

**Rules:** 
- All data from database
- No calculations needed
- Total OpEx = Rent + Staff Costs + Other OpEx

---

#### Transition Period (2025-2027)

**Components:**
1. **Rent:** Calculated per rent formula (2024 base with growth %)
2. **Staff Costs:** Calculated per staff costs formula (2024 ratio)
3. **Other OpEx:** 2024 ratio applied to current revenue

**Formula:**
```
Other OpEx = (Other OpEx 2024 / Revenue 2024) × Revenue [Current Year]

Total OpEx = Rent + Staff Costs + Other OpEx
```

**Implementation:**
```typescript
// 1. Rent (already calculated - see Rent section)
const rent = calculateTransitionRent(year, transitionData);

// 2. Staff Costs (already calculated - see Staff Costs section)
const staffCosts = calculateTransitionStaffCosts(totalRevenue);

// 3. Other Operating Expenses using 2024 ratio
const hist2024 = getHistoricalActuals(2024);

// Calculate 2024 Other OpEx (excluding staff costs and rent)
const otherOpex2024 = hist2024.totalOperatingExpenses
  .minus(hist2024.salariesAndRelatedCosts)
  .minus(hist2024.schoolRent);

const otherOpexRatio2024 = otherOpex2024.dividedBy(hist2024.totalRevenues);

const otherOpex = totalRevenue.times(otherOpexRatio2024);

// 4. Total Operating Expenses
const totalOpex = rent.plus(staffCosts).plus(otherOpex);
```

**Key Principle:** Maintains 2024 business model proportions

**Example:**
```
2024 Base Data:
├─ Revenue: 100M SAR
├─ Rent: 10M SAR
├─ Staff Costs: 40M SAR
├─ Other OpEx: 15M SAR
├─ Total OpEx: 65M SAR
└─ Other OpEx Ratio: 15M / 100M = 15%

2025 Calculation:
├─ Revenue: 110M SAR (student-driven)
├─ Rent: 10M × (1 + 5%) = 10.5M SAR
├─ Staff Costs: 110M × 40% = 44M SAR
├─ Other OpEx: 110M × 15% = 16.5M SAR
└─ Total OpEx: 10.5M + 44M + 16.5M = 71M SAR
```

**Rules:**
- Rent: From rent calculation (separate formula)
- Staff Costs: From staff costs calculation (separate formula)
- Other OpEx: Ratio-based from 2024
- Total OpEx = Sum of three components

---

#### Dynamic Period (2028-2052)

**Components:**
1. **Rent:** Calculated per rent model (3 options)
2. **Staff Costs:** Calculated per staff costs formula (2028 base + CPI)
3. **Other OpEx:** Single percentage of revenue (user-defined)

**Formula:**
```
Other OpEx = Revenue × Other OpEx Percentage

Total OpEx = Rent + Staff Costs + Other OpEx
```

**Implementation:**
```typescript
// 1. Rent (already calculated - see Rent section)
const rent = calculateDynamicRent(year, rentPlan, totalRevenue);

// 2. Staff Costs (already calculated - see Staff Costs section)
const staffCosts = calculateDynamicStaffCosts(year, baseStaffCosts2028, cpiRate);

// 3. Other Operating Expenses - Single percentage
// User defines one percentage that applies to ALL dynamic period years
const otherOpexPercentage = dynamicConfig.otherOpexPercentage; // e.g., 46%

const otherOpex = totalRevenue
  .times(otherOpexPercentage)
  .dividedBy(100);

// 4. Total Operating Expenses
const totalOpex = rent.plus(staffCosts).plus(otherOpex);
```

**Configuration:**
- `otherOpexPercentage` - Single percentage (e.g., 46%) applied to all years 2028-2052

**Example:**
```
Dynamic Period Configuration:
├─ Other OpEx Percentage: 46% of revenue
└─ Applied to ALL years (2028-2052)

Year 2028 Calculation:
├─ Revenue: 25M SAR
├─ Rent: 5M SAR (from rent model)
├─ Staff Costs: 35.3M SAR (from staff costs calculation)
├─ Other OpEx: 25M × 46% = 11.5M SAR
└─ Total OpEx: 5M + 35.3M + 11.5M = 51.8M SAR

Year 2035 Calculation:
├─ Revenue: 157M SAR
├─ Rent: 8M SAR (from rent model)
├─ Staff Costs: 45M SAR (from staff costs calculation with CPI)
├─ Other OpEx: 157M × 46% = 72.2M SAR
└─ Total OpEx: 8M + 45M + 72.2M = 125.2M SAR
```

**Rules:**
- Rent: Calculated separately using chosen rent model
- Staff Costs: Calculated separately using staff costs formula
- Other OpEx: Single percentage of revenue (constant across all dynamic years)
- No sub-accounts needed (simplified)
- Total OpEx = Sum of three components

**Simplified Approach:**
- ❌ No multiple sub-accounts
- ❌ No category-level detail
- ✅ Single percentage for "Other OpEx"
- ✅ Same percentage applies to all years 2028-2052
- ✅ Simple to configure and maintain

---

### 1.7 EBITDA CALCULATION

**Formula (All Periods):**
```
EBITDA = Total Revenue - Total Operating Expenses

Where:
  Total Operating Expenses = Rent + Staff Costs + Other OpEx
```

**OR equivalently:**
```
EBITDA = Total Revenue - Rent - Staff Costs - Other OpEx
```

**Implementation:**
```typescript
const ebitda = totalRevenue
  .minus(staffCosts)
  .minus(rent)
  .minus(opex);

const ebitdaMargin = ebitda.dividedBy(totalRevenue).times(100);
```

**Rules:**
- Same formula for all periods
- Components calculated differently per period
- EBITDA margin = (EBITDA / Revenue) × 100

---

### 1.8 DEPRECIATION

#### The Depreciation Continuity Principle

**CRITICAL RULE:**
> Historical fixed assets from 2024 continue depreciating at their established rate until Net Book Value reaches zero, regardless of which period we're in.

#### Historical Period (2023-2024)

```typescript
// Source: Direct retrieval
depreciation = historical_actuals.depreciation;
```

---

#### Transition & Dynamic Periods (2025-2052)

**Two Asset Pools:**

1. **OLD Assets (pre-2024):**
   - Fixed depreciation: 5,000,000 SAR/year (example from 2024)
   - Continues until NBV = 0 (typically 2029)
   - Depreciation amount DOES NOT CHANGE

2. **NEW Assets (2025+):**
   - Rate-based depreciation (e.g., 10%)
   - Each year's CapEx creates new asset pool
   - Each pool tracked separately

**Formula:**
```
Total Depreciation = OLD Assets Depreciation + NEW Assets Depreciation

Where:
  OLD Assets Depreciation = Fixed amount from 2024 (until NBV = 0)
  NEW Assets Depreciation = Σ (Asset Pool NBV × Depreciation Rate)
```

**Implementation:**
```typescript
function calculateDepreciation(
  year: number,
  fixedAssetsRegister: FixedAssetsRegister,
  newCapEx: Decimal,
  newAssetDepreciationRate: Decimal
): {
  depreciation: Decimal;
  updatedRegister: FixedAssetsRegister;
} {
  let totalDepreciation = new Decimal(0);
  const updatedPools: AssetPool[] = [];
  
  // Step 1: Depreciate existing asset pools
  for (const pool of fixedAssetsRegister.assetPools) {
    if (pool.isFullyDepreciated) continue;
    
    let depreciation: Decimal;
    
    if (pool.acquisitionYear <= 2024) {
      // OLD ASSETS: Fixed annual depreciation
      depreciation = pool.annualDepreciation; // e.g., 5,000,000
    } else {
      // NEW ASSETS: Rate-based
      depreciation = pool.netBookValue.times(pool.depreciationRate);
    }
    
    // Don't depreciate below zero
    if (depreciation.greaterThan(pool.netBookValue)) {
      depreciation = pool.netBookValue;
    }
    
    totalDepreciation = totalDepreciation.plus(depreciation);
    
    // Update pool
    const newAccumulated = pool.accumulatedDepreciation.plus(depreciation);
    const newNBV = pool.grossValue.minus(newAccumulated);
    
    updatedPools.push({
      ...pool,
      accumulatedDepreciation: newAccumulated,
      netBookValue: newNBV,
      isFullyDepreciated: newNBV.isZero(),
    });
  }
  
  // Step 2: Add new asset pool if CapEx exists
  if (newCapEx.greaterThan(0)) {
    const newAssetDepreciation = newCapEx.times(newAssetDepreciationRate);
    totalDepreciation = totalDepreciation.plus(newAssetDepreciation);
    
    updatedPools.push({
      acquisitionYear: year,
      grossValue: newCapEx,
      accumulatedDepreciation: newAssetDepreciation,
      netBookValue: newCapEx.minus(newAssetDepreciation),
      annualDepreciation: newAssetDepreciation,
      depreciationRate: newAssetDepreciationRate,
      isFullyDepreciated: false,
    });
  }
  
  return { depreciation: totalDepreciation, updatedRegister: {...} };
}
```

**Example Timeline:**
```
2024 (Historical): Old Assets NBV = 25M, Depreciation = 5M
2025 (Transition): Old Assets NBV = 20M, Depreciation = 5M + new assets
2026 (Transition): Old Assets NBV = 15M, Depreciation = 5M + new assets
2027 (Transition): Old Assets NBV = 10M, Depreciation = 5M + new assets
2028 (Dynamic):    Old Assets NBV = 5M,  Depreciation = 5M + new assets
2029 (Dynamic):    Old Assets NBV = 0,   Depreciation = 5M (final) + new assets
2030+ (Dynamic):   Old Assets NBV = 0,   Depreciation = new assets only
```

**Rules:**
- Track asset pools by acquisition year
- OLD assets (≤2024): Fixed depreciation amount
- NEW assets (>2024): Rate-based depreciation
- Each pool depreciates until NBV = 0
- Never recalculate OLD asset depreciation amount

---

### 1.9 BELOW EBITDA ITEMS

These items create circular dependencies and require iterative solving:

**Items Calculated:**
- Depreciation (from fixed assets + CapEx)
- Interest Expense (from debt balance)
- Interest Income (from cash deposits)
- Zakat (from net income before zakat)

---

#### Capital Expenditure (CapEx)

**Source:** Admin-managed CapEx module

**Applies To:** Both Transition (2025-2027) and Dynamic (2028-2052) periods

**Description:**
- CapEx module created with automatic calculation capabilities
- Moved under Admin section for centralized management
- Used for both transition and dynamic periods
- Tracks capital investments by year and category

**Note:** Historical period (2023-2024) uses actual CapEx from historical_actuals.cfAdditionsFixedAssets

---

#### Interest Expense & Interest Income

**Calculation Basis:** Average bank position (average of opening and closing cash balance for the period)

**Formula:**
```
Average Cash = (Opening Cash + Closing Cash) / 2

If Average Cash > 0:
  Interest Income = Average Cash × Bank Deposit Interest Rate
  Interest Expense = 0

If Average Cash < 0 (overdraft):
  Interest Expense = |Average Cash| × Debt Interest Rate
  Interest Income = 0

If Debt exists:
  Interest Expense = Average Debt × Debt Interest Rate
```

**Circular Dependency:**
```
Interest Expense → Net Income → Equity → Balance Sheet → Cash/Debt → Interest Expense (circular!)
```

**Implementation:**
```typescript
// Calculated by circular solver
function calculateInterest(
  openingCash: Decimal,
  closingCash: Decimal,
  openingDebt: Decimal,
  closingDebt: Decimal,
  bankDepositRate: Decimal,
  debtInterestRate: Decimal
): { interestIncome: Decimal; interestExpense: Decimal } {
  
  // Average cash position
  const averageCash = openingCash.plus(closingCash).dividedBy(2);
  
  // Average debt position
  const averageDebt = openingDebt.plus(closingDebt).dividedBy(2);
  
  let interestIncome = new Decimal(0);
  let interestExpense = new Decimal(0);
  
  // Interest income on positive cash balance
  if (averageCash.greaterThan(0)) {
    interestIncome = averageCash.times(bankDepositRate);
  }
  
  // Interest expense on debt
  if (averageDebt.greaterThan(0)) {
    interestExpense = averageDebt.times(debtInterestRate);
  }
  
  return { interestIncome, interestExpense };
}
```

**Configuration:**
- `bankDepositInterestRate` - e.g., 0.02 (2% per annum on cash deposits)
- `debtInterestRate` - e.g., 0.05 (5% per annum on borrowings)

**Rules:**
- Uses average of opening and closing balances (more accurate)
- Circular solver iterates until values converge
- Interest income and expense cannot both be positive in same period

---

#### Zakat

**Calculation Basis:** Equity - Non-Current Assets (Net Working Capital approach)

**Formula:**
```
Zakat Base = Equity - Non-Current Assets
Zakat = Zakat Base × Zakat Rate

Where:
  Equity = Total Equity from Balance Sheet
  Non-Current Assets = Fixed Assets (Net Book Value) + Other non-current assets
  Zakat Rate = e.g., 0.025 (2.5% for Saudi Arabia)
```

**Circular Dependency:**
```
Zakat → Net Income → Equity → Zakat (circular!)
```

**Implementation:**
```typescript
// Calculated by circular solver
function calculateZakat(
  equity: Decimal,
  nonCurrentAssets: Decimal,
  zakatRate: Decimal
): Decimal {
  
  if (zakatRate.isZero()) {
    // If zakat rate = 0, no zakat payable
    return new Decimal(0);
  }
  
  // Calculate Zakat base (Equity - Non-Current Assets)
  const zakatBase = equity.minus(nonCurrentAssets);
  
  // If base is negative or zero, no zakat
  if (zakatBase.lessThanOrEqualTo(0)) {
    return new Decimal(0);
  }
  
  // Calculate Zakat
  const zakat = zakatBase.times(zakatRate);
  
  // Zakat cannot be negative (minimum 0)
  return zakat.greaterThan(0) ? zakat : new Decimal(0);
}
```

**Configuration:**
- `zakatRate` - e.g., 0.025 (2.5% for Saudi Arabia) or 0 if not applicable

**Example:**
```
Balance Sheet Data:
├─ Total Equity: 50,000,000 SAR
├─ Non-Current Assets (Fixed Assets NBV): 30,000,000 SAR
├─ Zakat Rate: 2.5%

Zakat Calculation:
├─ Zakat Base: 50,000,000 - 30,000,000 = 20,000,000 SAR
├─ Zakat: 20,000,000 × 2.5% = 500,000 SAR
└─ Zakat as % of Equity: 500,000 / 50,000,000 = 1%
```

**Rules:**
- Based on net working capital (Equity - Non-Current Assets)
- Zakat rate can be 0 (does not impact calculation flow)
- If rate = 0, zakat = 0, but calculation still proceeds
- If Zakat Base ≤ 0, then Zakat = 0
- Circular solver handles the dependency
- Zakat cannot be negative (minimum 0)
- Applies to all periods (Historical, Transition, Dynamic)

**Why This Method?**
- Aligns with Saudi Arabian Zakat regulations
- Based on net working capital (liquid assets)
- Excludes non-current/fixed assets from Zakat base
- More accurate reflection of zakatable wealth

---

**Why Circular Solver?**

These items create interdependencies that cannot be calculated sequentially:

```
Circular Dependency Chain:
Interest → Affects Net Income
Net Income → Affects Equity
Equity → Affects Balance Sheet
Balance Sheet → Affects Debt/Cash
Debt/Cash → Affects Interest (back to start)

Zakat also creates circularity:
Zakat → Affects Net Income
Net Income → Affects Equity
Equity → May affect Zakat (if equity-based)
```

The circular solver iterates until all values converge to a consistent solution (typically 1-4 iterations).

**Formula Cascade:**
```
EBITDA
├─ Less: Depreciation
└─ = EBIT

EBIT
├─ Less: Interest Expense
├─ Add: Interest Income
└─ = EBT (Earnings Before Zakat)

EBT
├─ Less: Zakat
└─ = NET INCOME
```

---

### 1.10 COMPLETE P&L STRUCTURE

**Financial Statement Format (10 Lines):**

```
┌─────────────────────────────────────────────────────────┐
│                   PROFIT & LOSS STATEMENT                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. REVENUE                                               │
│     Total Revenue (Tuition + Other Revenue)               │
│                                                           │
│  2. SALARIES & RELATED COSTS                              │
│     Staff costs (teachers + non-teachers)                 │
│                                                           │
│  3. SCHOOL RENT                                           │
│     Rent expense                                          │
│                                                           │
│  4. OTHER OPEX                                            │
│     Other operating expenses                              │
│     ─────────────────────────────────────                 │
│                                                           │
│  5. EBITDA                                                │
│     (Revenue - Salaries - Rent - Other OpEx)              │
│                                                           │
│  6. DEPRECIATION                                          │
│     Depreciation expense                                  │
│     ─────────────────────────────────────                 │
│                                                           │
│  7. INTEREST INCOME/EXPENSES (NET)                        │
│     Interest Income - Interest Expense                    │
│     ─────────────────────────────────────                 │
│                                                           │
│  8. EBT                                                   │
│     Earnings Before Taxes/Zakat                           │
│     (EBITDA - Depreciation +/- Net Interest)              │
│                                                           │
│  9. ZAKAT                                                 │
│     Zakat expense                                         │
│     ─────────────────────────────────────                 │
│                                                           │
│  10. NET INCOME                                           │
│      (EBT - Zakat)                                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

**Calculation Flow:**

```typescript
// 1. Revenue
const revenue = tuitionRevenueFR + tuitionRevenueIB + otherRevenue;

// 2. Salaries & Related Costs
const salaries = staffCosts; // From staff costs calculation

// 3. School Rent
const rent = schoolRent; // From rent calculation

// 4. Other OpEx
const otherOpex = otherOperatingExpenses; // From other OpEx calculation

// 5. EBITDA
const ebitda = revenue - salaries - rent - otherOpex;
const ebitdaMargin = (ebitda / revenue) * 100;

// 6. Depreciation
const depreciation = depreciationExpense; // From depreciation calculation

// 7. Interest Income/Expenses (Net)
const netInterest = interestIncome - interestExpense;
// Note: Can be positive (net income) or negative (net expense)

// 8. EBT (Earnings Before Taxes)
const ebt = ebitda - depreciation + netInterest;

// 9. Zakat
const zakat = zakatExpense; // From Zakat calculation

// 10. Net Income
const netIncome = ebt - zakat;
const netIncomeMargin = (netIncome / revenue) * 100;
```

---

**Alternative Presentation (with subtotals):**

```
Line 1:  Revenue                           100,000,000
Line 2:  Salaries & Related Costs          (40,000,000)
Line 3:  School Rent                       (10,000,000)
Line 4:  Other OpEx                        (15,000,000)
         ─────────────────────────────────────────────
Line 5:  EBITDA                             35,000,000  (35% margin)
Line 6:  Depreciation                       (5,000,000)
         ─────────────────────────────────────────────
         EBIT                                30,000,000  (30% margin)
Line 7:  Interest Income/Expenses (Net)        500,000
         ─────────────────────────────────────────────
Line 8:  EBT                                 30,500,000
Line 9:  Zakat                                 (500,000)
         ─────────────────────────────────────────────
Line 10: NET INCOME                          30,000,000  (30% margin)
```

---

**Notes:**

1. **Revenue** includes all sources (FR tuition + IB tuition + other revenue)
2. **Salaries & Related Costs** = Total staff costs
3. **School Rent** = Rent expense only
4. **Other OpEx** = All other operating expenses (excluding salaries and rent)
5. **EBITDA** = Earnings Before Interest, Taxes (Zakat), Depreciation & Amortization
6. **Depreciation** = Non-cash expense from fixed assets
7. **Interest Income/Expenses** = Net of interest income minus interest expense
8. **EBT** = Earnings Before Taxes/Zakat
9. **Zakat** = Calculated on (Equity - Non-Current Assets)
10. **Net Income** = Final profit after all expenses

---

**Revenue Breakdown (Supporting Detail):**

While the main statement shows only "Revenue", the system maintains detail:
- Tuition Revenue - French Curriculum
- Tuition Revenue - IB Curriculum (if active)
- Other Revenue

**Operating Expenses Breakdown:**

Total Operating Expenses = Salaries + Rent + Other OpEx
- Line 2: Salaries & Related Costs
- Line 3: School Rent
- Line 4: Other OpEx

**EBITDA to Net Income Bridge:**

```
EBITDA (Line 5)
  - Depreciation (Line 6)
  +/- Net Interest (Line 7)
  = EBT (Line 8)
  - Zakat (Line 9)
  = Net Income (Line 10)
```

---

## PART 2: BALANCE SHEET

### 2.1 BALANCE SHEET STRUCTURE

**Complete Balance Sheet Format:**

```
┌─────────────────────────────────────────────────────────┐
│                      BALANCE SHEET                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ASSETS                                                   │
│                                                           │
│  CURRENT ASSETS                                           │
│  ├─ Cash & Cash Equivalents                              │
│  ├─ Accounts Receivable                                  │
│  └─ Prepaid Expenses                                     │
│  ─────────────────────────────────────                   │
│  TOTAL CURRENT ASSETS                                     │
│                                                           │
│  NON-CURRENT ASSETS                                       │
│  ├─ Fixed Assets (Gross)                                 │
│  ├─ Less: Accumulated Depreciation                       │
│  └─ Net Fixed Assets                                     │
│  ─────────────────────────────────────                   │
│  TOTAL NON-CURRENT ASSETS                                 │
│  ═════════════════════════════════════                   │
│  TOTAL ASSETS                                             │
│                                                           │
│  LIABILITIES                                              │
│                                                           │
│  CURRENT LIABILITIES                                      │
│  ├─ Accounts Payable                                     │
│  ├─ Accrued Expenses                                     │
│  ├─ Deferred Revenue                                     │
│  └─ Short-term Debt                                      │
│  ─────────────────────────────────────                   │
│  TOTAL CURRENT LIABILITIES                                │
│                                                           │
│  NON-CURRENT LIABILITIES                                  │
│  └─ Long-term Debt                                       │
│  ─────────────────────────────────────                   │
│  TOTAL NON-CURRENT LIABILITIES                            │
│  ═════════════════════════════════════                   │
│  TOTAL LIABILITIES                                        │
│                                                           │
│  EQUITY                                                   │
│  ├─ Share Capital / Contributed Capital                  │
│  ├─ Retained Earnings                                    │
│  └─ Current Year Net Income                              │
│  ═════════════════════════════════════                   │
│  TOTAL EQUITY                                             │
│  ═════════════════════════════════════                   │
│  TOTAL LIABILITIES & EQUITY                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Fundamental Equation:**
```
Total Assets = Total Liabilities + Total Equity
```

---

### 2.2 PERIOD-SPECIFIC RULES

#### Historical Period (2023-2024)

**Source:** All items from `historical_actuals` table

```typescript
// Direct from database - no calculations needed
const balanceSheet = {
  // Current Assets
  cash: historical_actuals.cashAndCashEquivalents,
  accountsReceivable: historical_actuals.accountsReceivable,
  prepaidExpenses: historical_actuals.prepaidExpenses,
  
  // Non-Current Assets
  fixedAssetsGross: historical_actuals.fixedAssetsGross,
  accumulatedDepreciation: historical_actuals.accumulatedDepreciation,
  netFixedAssets: historical_actuals.netFixedAssets,
  
  // Current Liabilities
  accountsPayable: historical_actuals.accountsPayable,
  accruedExpenses: historical_actuals.accruedExpenses,
  deferredRevenue: historical_actuals.deferredRevenue,
  shortTermDebt: historical_actuals.shortTermDebt,
  
  // Non-Current Liabilities
  longTermDebt: historical_actuals.longTermDebt,
  
  // Equity
  shareCapital: historical_actuals.shareCapital,
  retainedEarnings: historical_actuals.retainedEarnings,
  currentYearNetIncome: historical_actuals.netIncome
};
```

**Rules:**
- All values from database
- No formulas or calculations
- Used as base for 2025+ projections

---

#### Transition Period (2025-2027) + Dynamic Period (2028-2052)

**CRITICAL:** Same calculation methodology for both periods

**Base Year:** 2024 (last actual year)

**Working Capital Drivers:** User-defined percentages (maintained in admin center)

---

### 2.3 CURRENT ASSETS

#### 2.3.1 Cash & Cash Equivalents

**Nature:** Balancing item (calculated last)

**Calculation Logic:**
```
Step 1: Calculate all other assets and liabilities
Step 2: Calculate required equity
Step 3: Cash = Assets needed to balance the equation
Step 4: Apply minimum cash requirement and debt auto-balancing
```

**Minimum Cash Balance:** 1,000,000 SAR

**Implementation:**
```typescript
function calculateCash(
  year: number,
  accountsReceivable: Decimal,
  prepaidExpenses: Decimal,
  netFixedAssets: Decimal,
  totalLiabilities: Decimal,
  totalEquity: Decimal,
  minimumCashBalance: Decimal
): { cash: Decimal; shortTermDebt: Decimal; longTermDebt: Decimal } {
  
  // Total assets excluding cash
  const assetsExcludingCash = accountsReceivable
    .plus(prepaidExpenses)
    .plus(netFixedAssets);
  
  // Required total assets to balance
  const requiredTotalAssets = totalLiabilities.plus(totalEquity);
  
  // Initial cash (before debt adjustment)
  let cash = requiredTotalAssets.minus(assetsExcludingCash);
  
  let shortTermDebt = new Decimal(0);
  let longTermDebt = new Decimal(0);
  
  // Check if cash meets minimum requirement
  if (cash.lessThan(minimumCashBalance)) {
    // Need to borrow to maintain minimum cash
    const shortfall = minimumCashBalance.minus(cash);
    shortTermDebt = shortfall;
    cash = minimumCashBalance;
  }
  
  // If excess cash (more than 2x minimum), could pay down existing debt
  const excessCashThreshold = minimumCashBalance.times(2);
  if (cash.greaterThan(excessCashThreshold)) {
    const priorYearDebt = getPriorYearTotalDebt(year - 1);
    
    if (priorYearDebt.greaterThan(0)) {
      const excessCash = cash.minus(minimumCashBalance);
      const debtPaydown = Decimal.min(excessCash, priorYearDebt);
      cash = cash.minus(debtPaydown);
      // Note: Debt reduction handled in debt section
    }
  }
  
  return { cash, shortTermDebt, longTermDebt };
}
```

**Rules:**
- Cash is the last item calculated (balancing plug)
- Minimum 1,000,000 SAR maintained at all times
- If cash would fall below minimum → Increase short-term debt
- If cash exceeds 2× minimum and debt exists → Use excess to pay down debt

---

#### 2.3.2 Accounts Receivable

**Nature:** Driven by revenue and collection period

**Formula:**
```
Accounts Receivable = Revenue × Accounts Receivable %
```

**Configuration Input:**
- `accountsReceivablePercent` - % of annual revenue (e.g., 8.2%)

**Suggested Default (from 2024):**
```typescript
// Calculate suggested percentage from 2024 actuals
const hist2024 = getHistoricalActuals(2024);
const suggestedARPercent = hist2024.accountsReceivable
  .dividedBy(hist2024.totalRevenues)
  .times(100);

// Example: If 2024 AR = 8,200,000 and Revenue = 100,000,000
// Suggested % = 8.2%
```

**Implementation:**
```typescript
function calculateAccountsReceivable(
  revenue: Decimal,
  accountsReceivablePercent: Decimal
): Decimal {
  const ar = revenue.times(accountsReceivablePercent).dividedBy(100);
  return ar;
}
```

**Alternative (Days-based calculation):**
```typescript
// If user prefers to think in days
function calculateAccountsReceivableFromDays(
  revenue: Decimal,
  daysReceivable: number
): Decimal {
  const ar = revenue.dividedBy(365).times(daysReceivable);
  return ar;
}

// Conversion: 30 days ≈ 8.2% of annual revenue
```

**Example:**
```
Configuration:
├─ Accounts Receivable %: 8.2%
└─ (Suggested from 2024: 8.2%)

Year 2025 Calculation:
├─ Revenue: 110,000,000 SAR
├─ AR %: 8.2%
└─ Accounts Receivable: 110M × 8.2% = 9,020,000 SAR
```

**Rules:**
- Same % applies to both Transition (2025-2027) and Dynamic (2028-2052)
- User can override suggested % from 2024
- Maintained in admin center
- Represents tuition fees not yet collected from parents

---

#### 2.3.3 Prepaid Expenses

**Nature:** Expenses paid in advance (rent, insurance, etc.)

**Formula:**
```
Prepaid Expenses = Total OpEx × Prepaid Expenses %
```

**Configuration Input:**
- `prepaidExpensesPercent` - % of annual OpEx (e.g., 4%)

**Suggested Default (from 2024):**
```typescript
// Calculate suggested percentage from 2024 actuals
const hist2024 = getHistoricalActuals(2024);
const totalOpEx2024 = hist2024.salariesAndRelatedCosts
  .plus(hist2024.schoolRent)
  .plus(hist2024.otherOpEx);

const suggestedPrepaidPercent = hist2024.prepaidExpenses
  .dividedBy(totalOpEx2024)
  .times(100);

// Example: If 2024 Prepaid = 2,600,000 and OpEx = 65,000,000
// Suggested % = 4%
```

**Implementation:**
```typescript
function calculatePrepaidExpenses(
  totalOpEx: Decimal,
  prepaidExpensesPercent: Decimal
): Decimal {
  const prepaid = totalOpEx.times(prepaidExpensesPercent).dividedBy(100);
  return prepaid;
}
```

**Example:**
```
Configuration:
├─ Prepaid Expenses %: 4%
└─ (Suggested from 2024: 4%)

Year 2025 Calculation:
├─ Total OpEx: 71,000,000 SAR
│   (Salaries + Rent + Other OpEx)
├─ Prepaid %: 4%
└─ Prepaid Expenses: 71M × 4% = 2,840,000 SAR
```

**Rules:**
- Same % applies to both Transition and Dynamic periods
- Based on total operating expenses (Salaries + Rent + Other OpEx)
- Typical items: advance rent, insurance, licenses

---

### 2.4 NON-CURRENT ASSETS

#### 2.4.1 Fixed Assets (Gross)

**Nature:** Historical cost of all fixed assets

**Formula:**
```
Fixed Assets Gross [Year N] = Fixed Assets Gross [Year N-1]
                            + CapEx Additions [Year N]
                            - Asset Disposals Gross [Year N]
```

**Starting Point (2025):**
```typescript
const fixedAssetsGross2025 = getHistoricalActuals(2024).fixedAssetsGross;
```

**Annual Movement:**
```typescript
function calculateFixedAssetsGross(
  year: number,
  priorYearGross: Decimal,
  capexAdditions: Decimal,
  disposalsGross: Decimal
): Decimal {
  const currentYearGross = priorYearGross
    .plus(capexAdditions)
    .minus(disposalsGross);
  
  return currentYearGross;
}
```

**CapEx Additions:**
- From CapEx module (admin-managed)
- Can include: buildings, equipment, furniture, technology, leasehold improvements

**Asset Disposals (Gross):**
- From CapEx module
- Removes original cost of disposed assets
- Important for 2028 relocation (dispose old location assets)

**Example:**
```
Year 2028 (Relocation Year):
├─ Opening Gross Fixed Assets: 45,000,000 SAR
├─ CapEx Additions:
│   └─ New school fit-out: 50,000,000 SAR
├─ Asset Disposals:
│   └─ Old leasehold improvements: (5,000,000) SAR (gross)
└─ Ending Gross Fixed Assets: 90,000,000 SAR
```

---

#### 2.4.2 Accumulated Depreciation

**Nature:** Total depreciation accumulated over time

**Formula:**
```
Accumulated Depreciation [Year N] = Accumulated Depreciation [Year N-1]
                                  + Depreciation Expense [Year N]
                                  - Disposal Accumulated Depreciation [Year N]
```

**Starting Point (2025):**
```typescript
const accDepreciation2025 = getHistoricalActuals(2024).accumulatedDepreciation;
```

**Annual Movement:**
```typescript
function calculateAccumulatedDepreciation(
  year: number,
  priorYearAccDep: Decimal,
  depreciationExpense: Decimal,
  disposalAccDep: Decimal
): Decimal {
  const currentYearAccDep = priorYearAccDep
    .plus(depreciationExpense)
    .minus(disposalAccDep);
  
  return currentYearAccDep;
}
```

**Depreciation Expense:**
- From P&L depreciation calculation (already defined)
- Added each year to accumulated depreciation

**Disposal Accumulated Depreciation:**
- From CapEx module
- Removes accumulated depreciation on disposed assets
- Net Book Value = Gross - Accumulated Depreciation (of disposed asset)

**Example:**
```
Year 2028 (Relocation Year):
├─ Opening Accumulated Depreciation: 15,000,000 SAR
├─ Depreciation Expense 2028: 5,500,000 SAR
├─ Disposal Accumulated Depreciation:
│   └─ Old leasehold (3 years old): (3,000,000) SAR
└─ Ending Accumulated Depreciation: 17,500,000 SAR
```

---

#### 2.4.3 Net Fixed Assets

**Formula:**
```
Net Fixed Assets = Fixed Assets (Gross) - Accumulated Depreciation
```

**Implementation:**
```typescript
function calculateNetFixedAssets(
  fixedAssetsGross: Decimal,
  accumulatedDepreciation: Decimal
): Decimal {
  const netFixedAssets = fixedAssetsGross.minus(accumulatedDepreciation);
  return netFixedAssets;
}
```

**Example:**
```
Year 2028:
├─ Fixed Assets (Gross): 90,000,000 SAR
├─ Accumulated Depreciation: (17,500,000) SAR
└─ Net Fixed Assets: 72,500,000 SAR
```

**Rules:**
- Represents book value of fixed assets
- Used in Zakat calculation (Non-Current Assets)
- Decreases each year due to depreciation
- Increases with CapEx additions
- Can have step changes with disposals

---

### 2.5 CURRENT LIABILITIES

#### 2.5.1 Accounts Payable

**Nature:** Amounts owed to suppliers and vendors

**Formula:**
```
Accounts Payable = Total OpEx × Accounts Payable %
```

**Configuration Input:**
- `accountsPayablePercent` - % of annual OpEx (e.g., 12%)

**Suggested Default (from 2024):**
```typescript
const hist2024 = getHistoricalActuals(2024);
const totalOpEx2024 = hist2024.salariesAndRelatedCosts
  .plus(hist2024.schoolRent)
  .plus(hist2024.otherOpEx);

const suggestedAPPercent = hist2024.accountsPayable
  .dividedBy(totalOpEx2024)
  .times(100);

// Example: If 2024 AP = 7,800,000 and OpEx = 65,000,000
// Suggested % = 12%
```

**Implementation:**
```typescript
function calculateAccountsPayable(
  totalOpEx: Decimal,
  accountsPayablePercent: Decimal
): Decimal {
  const ap = totalOpEx.times(accountsPayablePercent).dividedBy(100);
  return ap;
}
```

**Example:**
```
Configuration:
├─ Accounts Payable %: 12%
└─ (Suggested from 2024: 12%)

Year 2025 Calculation:
├─ Total OpEx: 71,000,000 SAR
├─ AP %: 12%
└─ Accounts Payable: 71M × 12% = 8,520,000 SAR
```

**Rules:**
- Same % applies to both Transition and Dynamic periods
- Based on total operating expenses
- Represents unpaid invoices to vendors

---

#### 2.5.2 Accrued Expenses

**Nature:** Expenses incurred but not yet paid

**Formula:**
```
Accrued Expenses = Total OpEx × Accrued Expenses %
```

**Configuration Input:**
- `accruedExpensesPercent` - % of annual OpEx (e.g., 5.5%)

**Suggested Default (from 2024):**
```typescript
const hist2024 = getHistoricalActuals(2024);
const totalOpEx2024 = hist2024.salariesAndRelatedCosts
  .plus(hist2024.schoolRent)
  .plus(hist2024.otherOpEx);

const suggestedAccruedPercent = hist2024.accruedExpenses
  .dividedBy(totalOpEx2024)
  .times(100);

// Example: If 2024 Accrued = 3,575,000 and OpEx = 65,000,000
// Suggested % = 5.5%
```

**Implementation:**
```typescript
function calculateAccruedExpenses(
  totalOpEx: Decimal,
  accruedExpensesPercent: Decimal
): Decimal {
  const accrued = totalOpEx.times(accruedExpensesPercent).dividedBy(100);
  return accrued;
}
```

**Example:**
```
Configuration:
├─ Accrued Expenses %: 5.5%
└─ (Suggested from 2024: 5.5%)

Year 2025 Calculation:
├─ Total OpEx: 71,000,000 SAR
├─ Accrued %: 5.5%
└─ Accrued Expenses: 71M × 5.5% = 3,905,000 SAR
```

**Rules:**
- Same % applies to both Transition and Dynamic periods
- Typical items: salaries payable, utilities, interest accrued
- Differs from AP (accrued = no invoice yet, AP = invoice received)

---

#### 2.5.3 Deferred Revenue

**Nature:** Advance tuition payments not yet earned

**CRITICAL for Schools:** Parents often pay tuition in advance

**Formula:**
```
Deferred Revenue = Total Revenue × Deferred Revenue %
```

**Configuration Input:**
- `deferredRevenuePercent` - % of annual revenue (e.g., 15%)

**Suggested Default (from 2024):**
```typescript
const hist2024 = getHistoricalActuals(2024);
const suggestedDeferredPercent = hist2024.deferredRevenue
  .dividedBy(hist2024.totalRevenues)
  .times(100);

// Example: If 2024 Deferred = 15,000,000 and Revenue = 100,000,000
// Suggested % = 15%
```

**Implementation:**
```typescript
function calculateDeferredRevenue(
  revenue: Decimal,
  deferredRevenuePercent: Decimal
): Decimal {
  const deferred = revenue.times(deferredRevenuePercent).dividedBy(100);
  return deferred;
}
```

**Example:**
```
Configuration:
├─ Deferred Revenue %: 15%
└─ (Suggested from 2024: 15%)

Year 2025 Calculation:
├─ Total Revenue: 110,000,000 SAR
├─ Deferred %: 15%
└─ Deferred Revenue: 110M × 15% = 16,500,000 SAR

Interpretation:
Parents have paid 16.5M in advance for future terms
This will be recognized as revenue when earned
```

**Rules:**
- Same % applies to both Transition and Dynamic periods
- Represents unearned revenue (liability)
- Important cash flow consideration for schools
- Revenue recognized over the academic period

---

#### 2.5.4 Short-term Debt

**Nature:** Auto-balanced to maintain minimum cash

**Calculation:** Part of cash balancing mechanism

**Formula:**
```
If Cash < Minimum Cash Balance:
  Short-term Debt = Minimum Cash Balance - Calculated Cash
  Cash = Minimum Cash Balance
Else:
  Short-term Debt = 0
```

**Configuration:**
- `minimumCashBalance` - 1,000,000 SAR (fixed)
- `debtInterestRate` - % per annum (e.g., 5%)

**Implementation:**
```typescript
function calculateShortTermDebt(
  calculatedCash: Decimal,
  minimumCashBalance: Decimal
): { cash: Decimal; shortTermDebt: Decimal } {
  
  if (calculatedCash.lessThan(minimumCashBalance)) {
    const shortfall = minimumCashBalance.minus(calculatedCash);
    return {
      cash: minimumCashBalance,
      shortTermDebt: shortfall
    };
  } else {
    return {
      cash: calculatedCash,
      shortTermDebt: new Decimal(0)
    };
  }
}
```

**Example:**
```
Scenario 1: Cash Shortfall
├─ Calculated Cash (before adjustment): 500,000 SAR
├─ Minimum Cash Required: 1,000,000 SAR
├─ Shortfall: 500,000 SAR
└─ Action:
    ├─ Borrow Short-term Debt: 500,000 SAR
    └─ Final Cash: 1,000,000 SAR

Scenario 2: Sufficient Cash
├─ Calculated Cash (before adjustment): 5,000,000 SAR
├─ Minimum Cash Required: 1,000,000 SAR
├─ No Shortfall
└─ Action:
    ├─ Short-term Debt: 0 SAR
    └─ Final Cash: 5,000,000 SAR
```

**Rules:**
- Auto-balancing mechanism
- Ensures minimum 1M cash at all times
- Interest expense calculated in P&L
- Can be repaid when excess cash available

---

### 2.6 NON-CURRENT LIABILITIES

#### 2.6.1 Long-term Debt

**Nature:** Debt for major investments (e.g., relocation financing)

**Calculation:** Separate from short-term debt

**Options:**

**Option 1: Manual Debt Schedule (Recommended for major investments)**
```typescript
// User inputs debt by year
const debtSchedule = {
  2025: 0,
  2026: 0,
  2027: 0,
  2028: 20000000,  // Borrow 20M for relocation
  2029: 18000000,  // Pay down 2M
  2030: 16000000,  // Pay down 2M
  // ... etc
};
```

**Option 2: Auto-balancing (System manages)**
```typescript
// System automatically borrows/repays based on cash position
// Excess cash (above 2× minimum) can pay down debt
```

**Current Portion:**
```typescript
// Amount due within 12 months (moves to short-term debt)
// User specifies or auto-calculated based on repayment schedule
```

**Implementation:**
```typescript
function calculateLongTermDebt(
  year: number,
  debtSchedule?: Map<number, Decimal>,
  autoBorrowIfNeeded?: boolean
): Decimal {
  
  if (debtSchedule && debtSchedule.has(year)) {
    // Manual schedule provided
    return debtSchedule.get(year);
  }
  
  if (autoBorrowIfNeeded) {
    // Auto-balancing logic
    const priorYearDebt = getLongTermDebt(year - 1);
    const excessCash = getExcessCash(year);
    
    if (excessCash.greaterThan(0) && priorYearDebt.greaterThan(0)) {
      // Use excess cash to pay down debt
      const paydown = Decimal.min(excessCash, priorYearDebt);
      return priorYearDebt.minus(paydown);
    }
    
    return priorYearDebt;
  }
  
  // No debt
  return new Decimal(0);
}
```

**Example:**
```
Relocation Scenario (2028):
├─ Need funding for: 50M fit-out
├─ Available cash: 10M
├─ Capital needed: 40M
└─ Financing:
    ├─ Equity injection: 0 (Foundation - no injections)
    ├─ Long-term debt: 20M (borrow)
    └─ Remaining from operations: 20M (accumulated cash)

Repayment Plan:
├─ 2028: Borrow 20,000,000 SAR
├─ 2029: Repay 2,000,000 SAR (balance: 18M)
├─ 2030: Repay 2,000,000 SAR (balance: 16M)
└─ ... 10-year repayment schedule
```

**Rules:**
- Can be manually scheduled or auto-balanced
- Interest calculated in P&L (already covered)
- Current portion (<12 months) classified as short-term debt
- Foundation structure: No equity injections, debt is main financing tool

---

### 2.7 EQUITY

#### 2.7.1 Share Capital / Contributed Capital

**Nature:** Initial foundation capital (no changes for foundation)

**Formula:**
```
Share Capital [Year N] = Share Capital [Year N-1] + Capital Injections [Year N]

Foundation Structure: Capital Injections = 0 (always)
```

**Starting Point (2025):**
```typescript
const shareCapital2025 = getHistoricalActuals(2024).shareCapital;
```

**Annual Calculation:**
```typescript
function calculateShareCapital(
  year: number,
  priorYearShareCapital: Decimal,
  capitalInjections: Decimal = new Decimal(0)
): Decimal {
  // Foundation: No capital injections
  return priorYearShareCapital;
}
```

**Example:**
```
Foundation Structure:
├─ 2024 Share Capital: 50,000,000 SAR
├─ 2025 Share Capital: 50,000,000 SAR (no change)
├─ 2026 Share Capital: 50,000,000 SAR (no change)
└─ ... (remains constant for all years)
```

**Rules:**
- Foundation structure (not for-profit)
- No capital injections allowed
- Remains constant throughout projection period
- Initial funding only

---

#### 2.7.2 Retained Earnings

**Nature:** Accumulated profits/losses from prior years

**Formula:**
```
Retained Earnings [Year N] = Retained Earnings [Year N-1]
                           + Net Income [Year N-1]
                           - Dividends [Year N-1]

Foundation Structure: Dividends = 0 (always)
```

**Starting Point (2025):**
```typescript
const retainedEarnings2025 = getHistoricalActuals(2024).retainedEarnings;
```

**Annual Calculation:**
```typescript
function calculateRetainedEarnings(
  year: number,
  priorYearRetainedEarnings: Decimal,
  priorYearNetIncome: Decimal,
  dividends: Decimal = new Decimal(0)
): Decimal {
  // Foundation: No dividends paid
  const retainedEarnings = priorYearRetainedEarnings
    .plus(priorYearNetIncome);
  
  return retainedEarnings;
}
```

**Example:**
```
Year 2025:
├─ Opening Retained Earnings (2024 closing): 10,000,000 SAR
├─ Add: 2024 Net Income: 5,000,000 SAR
├─ Less: Dividends: 0 SAR (Foundation)
└─ 2025 Retained Earnings: 15,000,000 SAR

Year 2026:
├─ Opening Retained Earnings: 15,000,000 SAR
├─ Add: 2025 Net Income: 6,000,000 SAR
├─ Less: Dividends: 0 SAR (Foundation)
└─ 2026 Retained Earnings: 21,000,000 SAR
```

**Rules:**
- Accumulates all prior years' profits
- Foundation: No dividend distributions
- Can be negative if cumulative losses
- Grows with profitable operations

---

#### 2.7.3 Current Year Net Income

**Nature:** Profit or loss for the current year

**Source:** From P&L Statement (Line 10)

**Formula:**
```
Current Year Net Income = Net Income from P&L
```

**Implementation:**
```typescript
function getCurrentYearNetIncome(year: number): Decimal {
  // Direct from P&L calculation
  const netIncome = calculateNetIncome(year);
  return netIncome;
}
```

**Example:**
```
Year 2025 P&L:
├─ Revenue: 110,000,000 SAR
├─ Operating Expenses: (71,000,000) SAR
├─ EBITDA: 39,000,000 SAR
├─ Depreciation: (5,500,000) SAR
├─ Interest (Net): (250,000) SAR
├─ EBT: 33,250,000 SAR
├─ Zakat: (500,000) SAR
└─ Net Income: 32,750,000 SAR

Year 2025 Balance Sheet:
└─ Current Year Net Income: 32,750,000 SAR
```

**Rules:**
- Flows directly from P&L
- Becomes part of retained earnings in next year
- Can be positive (profit) or negative (loss)

---

### 2.8 COMPLETE BALANCE SHEET CALCULATION (2025-2052)

**Full Implementation:**

```typescript
interface BalanceSheetConfig {
  // Working Capital %
  accountsReceivablePercent: Decimal;
  prepaidExpensesPercent: Decimal;
  accountsPayablePercent: Decimal;
  accruedExpensesPercent: Decimal;
  deferredRevenuePercent: Decimal;
  
  // Cash & Debt
  minimumCashBalance: Decimal;
  debtInterestRate: Decimal;
  
  // Starting Balances (from 2024)
  fixedAssetsGrossOpening2025: Decimal;
  accDepreciationOpening2025: Decimal;
  shareCapitalOpening2025: Decimal;
  retainedEarningsOpening2025: Decimal;
}

function calculateBalanceSheet(
  year: number,
  config: BalanceSheetConfig,
  plData: PLData,
  capexData: CapExData
): BalanceSheet {
  
  // ========================================
  // STEP 1: CURRENT ASSETS (excluding cash)
  // ========================================
  
  const accountsReceivable = plData.revenue
    .times(config.accountsReceivablePercent)
    .dividedBy(100);
  
  const prepaidExpenses = plData.totalOpEx
    .times(config.prepaidExpensesPercent)
    .dividedBy(100);
  
  // ========================================
  // STEP 2: NON-CURRENT ASSETS
  // ========================================
  
  const priorYearGross = year === 2025 
    ? config.fixedAssetsGrossOpening2025
    : getBalanceSheet(year - 1).fixedAssetsGross;
  
  const fixedAssetsGross = priorYearGross
    .plus(capexData.additions)
    .minus(capexData.disposalsGross);
  
  const priorYearAccDep = year === 2025
    ? config.accDepreciationOpening2025
    : getBalanceSheet(year - 1).accumulatedDepreciation;
  
  const accumulatedDepreciation = priorYearAccDep
    .plus(plData.depreciation)
    .minus(capexData.disposalsAccDep);
  
  const netFixedAssets = fixedAssetsGross
    .minus(accumulatedDepreciation);
  
  // ========================================
  // STEP 3: CURRENT LIABILITIES (excluding debt)
  // ========================================
  
  const accountsPayable = plData.totalOpEx
    .times(config.accountsPayablePercent)
    .dividedBy(100);
  
  const accruedExpenses = plData.totalOpEx
    .times(config.accruedExpensesPercent)
    .dividedBy(100);
  
  const deferredRevenue = plData.revenue
    .times(config.deferredRevenuePercent)
    .dividedBy(100);
  
  // ========================================
  // STEP 4: NON-CURRENT LIABILITIES
  // ========================================
  
  const longTermDebt = calculateLongTermDebt(year);
  
  // ========================================
  // STEP 5: EQUITY
  // ========================================
  
  const shareCapital = year === 2025
    ? config.shareCapitalOpening2025
    : getBalanceSheet(year - 1).shareCapital;
  // Foundation: No capital injections
  
  const priorRetainedEarnings = year === 2025
    ? config.retainedEarningsOpening2025
    : getBalanceSheet(year - 1).retainedEarnings;
  
  const priorYearNetIncome = year === 2025
    ? getHistoricalActuals(2024).netIncome
    : getPL(year - 1).netIncome;
  
  const retainedEarnings = priorRetainedEarnings
    .plus(priorYearNetIncome);
  // Foundation: No dividends
  
  const currentYearNetIncome = plData.netIncome;
  
  const totalEquity = shareCapital
    .plus(retainedEarnings)
    .plus(currentYearNetIncome);
  
  // ========================================
  // STEP 6: CASH & DEBT BALANCING
  // ========================================
  
  // Total assets excluding cash
  const assetsExcludingCash = accountsReceivable
    .plus(prepaidExpenses)
    .plus(netFixedAssets);
  
  // Total liabilities excluding debt
  const liabilitiesExcludingDebt = accountsPayable
    .plus(accruedExpenses)
    .plus(deferredRevenue);
  
  // Required total assets to balance
  const requiredTotalAssets = liabilitiesExcludingDebt
    .plus(longTermDebt)
    .plus(totalEquity);
  
  // Initial cash calculation
  let cash = requiredTotalAssets.minus(assetsExcludingCash);
  let shortTermDebt = new Decimal(0);
  
  // Apply minimum cash requirement
  if (cash.lessThan(config.minimumCashBalance)) {
    const shortfall = config.minimumCashBalance.minus(cash);
    shortTermDebt = shortfall;
    cash = config.minimumCashBalance;
  }
  
  // ========================================
  // STEP 7: FINAL TOTALS
  // ========================================
  
  const totalCurrentAssets = cash
    .plus(accountsReceivable)
    .plus(prepaidExpenses);
  
  const totalNonCurrentAssets = netFixedAssets;
  
  const totalAssets = totalCurrentAssets
    .plus(totalNonCurrentAssets);
  
  const totalCurrentLiabilities = accountsPayable
    .plus(accruedExpenses)
    .plus(deferredRevenue)
    .plus(shortTermDebt);
  
  const totalNonCurrentLiabilities = longTermDebt;
  
  const totalLiabilities = totalCurrentLiabilities
    .plus(totalNonCurrentLiabilities);
  
  const totalLiabilitiesAndEquity = totalLiabilities
    .plus(totalEquity);
  
  // ========================================
  // STEP 8: BALANCE CHECK
  // ========================================
  
  if (!totalAssets.equals(totalLiabilitiesAndEquity)) {
    throw new Error(
      `Balance sheet does not balance for year ${year}: ` +
      `Assets = ${totalAssets}, Liabilities + Equity = ${totalLiabilitiesAndEquity}`
    );
  }
  
  return {
    // Current Assets
    cash,
    accountsReceivable,
    prepaidExpenses,
    totalCurrentAssets,
    
    // Non-Current Assets
    fixedAssetsGross,
    accumulatedDepreciation,
    netFixedAssets,
    totalNonCurrentAssets,
    
    totalAssets,
    
    // Current Liabilities
    accountsPayable,
    accruedExpenses,
    deferredRevenue,
    shortTermDebt,
    totalCurrentLiabilities,
    
    // Non-Current Liabilities
    longTermDebt,
    totalNonCurrentLiabilities,
    
    totalLiabilities,
    
    // Equity
    shareCapital,
    retainedEarnings,
    currentYearNetIncome,
    totalEquity,
    
    totalLiabilitiesAndEquity
  };
}
```

---

### 2.9 EXAMPLE BALANCE SHEET

**Year 2025 Example:**

```
┌─────────────────────────────────────────────────────────┐
│              BALANCE SHEET - Year 2025                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ASSETS                                              SAR  │
│                                                           │
│  CURRENT ASSETS                                           │
│  ├─ Cash & Cash Equivalents              12,500,000      │
│  ├─ Accounts Receivable                   9,020,000      │
│  └─ Prepaid Expenses                      2,840,000      │
│  ─────────────────────────────────────────────────       │
│  TOTAL CURRENT ASSETS                     24,360,000     │
│                                                           │
│  NON-CURRENT ASSETS                                       │
│  ├─ Fixed Assets (Gross)                 47,000,000      │
│  ├─ Less: Accumulated Depreciation      (16,500,000)     │
│  └─ Net Fixed Assets                     30,500,000      │
│  ─────────────────────────────────────────────────       │
│  TOTAL NON-CURRENT ASSETS                 30,500,000     │
│  ═════════════════════════════════════════════════       │
│  TOTAL ASSETS                             54,860,000     │
│                                                           │
│  LIABILITIES                                              │
│                                                           │
│  CURRENT LIABILITIES                                      │
│  ├─ Accounts Payable                      8,520,000      │
│  ├─ Accrued Expenses                      3,905,000      │
│  ├─ Deferred Revenue                     16,500,000      │
│  └─ Short-term Debt                               0      │
│  ─────────────────────────────────────────────────       │
│  TOTAL CURRENT LIABILITIES                28,925,000     │
│                                                           │
│  NON-CURRENT LIABILITIES                                  │
│  └─ Long-term Debt                                0      │
│  ─────────────────────────────────────────────────       │
│  TOTAL NON-CURRENT LIABILITIES                    0      │
│  ═════════════════════════════════════════════════       │
│  TOTAL LIABILITIES                        28,925,000     │
│                                                           │
│  EQUITY                                                   │
│  ├─ Share Capital                        50,000,000      │
│  ├─ Retained Earnings                   (56,815,000)     │
│  └─ Current Year Net Income              32,750,000      │
│  ═════════════════════════════════════════════════       │
│  TOTAL EQUITY                             25,935,000     │
│  ═════════════════════════════════════════════════       │
│  TOTAL LIABILITIES & EQUITY               54,860,000     │
│                                                           │
└─────────────────────────────────────────────────────────┘

Working Capital Analysis:
├─ Current Assets: 24,360,000
├─ Current Liabilities: 28,925,000
└─ Working Capital: (4,565,000)  [Negative - typical for schools with deferred revenue]

Key Ratios:
├─ Current Ratio: 0.84x
├─ Debt to Equity: 0.00x
└─ Return on Equity: 126% (Net Income / Opening Equity)
```

**Assumptions Used:**
```
Configuration (from admin center):
├─ Accounts Receivable %: 8.2% of revenue
├─ Prepaid Expenses %: 4% of OpEx
├─ Accounts Payable %: 12% of OpEx
├─ Accrued Expenses %: 5.5% of OpEx
├─ Deferred Revenue %: 15% of revenue
├─ Minimum Cash Balance: 1,000,000 SAR
└─ No debt required (profitable operations)

From P&L 2025:
├─ Revenue: 110,000,000 SAR
├─ Total OpEx: 71,000,000 SAR
├─ Depreciation: 5,500,000 SAR
└─ Net Income: 32,750,000 SAR

From CapEx Module 2025:
├─ CapEx Additions: 2,000,000 SAR
└─ Asset Disposals: 0 SAR
```

---

### 2.10 ADMIN CENTER CONFIGURATION

**Balance Sheet Settings Screen:**

```
┌───────────────────────────────────────────────────────────┐
│ BALANCE SHEET CONFIGURATION (2025-2052)                   │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ ═══════════════════════════════════════════════════════   │
│ SECTION 1: WORKING CAPITAL ASSUMPTIONS                    │
│ ═══════════════════════════════════════════════════════   │
│                                                            │
│ Current Assets (% of Revenue or OpEx):                    │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Accounts Receivable:                               │   │
│ │ ├─ Percentage:        [8.2]% of Annual Revenue    │   │
│ │ └─ 2024 Actual:       8.2% (suggested default)    │   │
│ │                                                    │   │
│ │ Prepaid Expenses:                                  │   │
│ │ ├─ Percentage:        [4.0]% of Annual OpEx       │   │
│ │ └─ 2024 Actual:       4.0% (suggested default)    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ Current Liabilities (% of Revenue or OpEx):               │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Accounts Payable:                                  │   │
│ │ ├─ Percentage:       [12.0]% of Annual OpEx       │   │
│ │ └─ 2024 Actual:      12.0% (suggested default)    │   │
│ │                                                    │   │
│ │ Accrued Expenses:                                  │   │
│ │ ├─ Percentage:        [5.5]% of Annual OpEx       │   │
│ │ └─ 2024 Actual:       5.5% (suggested default)    │   │
│ │                                                    │   │
│ │ Deferred Revenue:                                  │   │
│ │ ├─ Percentage:       [15.0]% of Annual Revenue    │   │
│ │ └─ 2024 Actual:      15.0% (suggested default)    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ ═══════════════════════════════════════════════════════   │
│ SECTION 2: CASH & DEBT MANAGEMENT                         │
│ ═══════════════════════════════════════════════════════   │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Minimum Cash Balance:    [1,000,000] SAR          │   │
│ │                                                    │   │
│ │ Debt Interest Rate:            [5.0]% per annum   │   │
│ │                                                    │   │
│ │ Debt Management Strategy:                         │   │
│ │ ☑ Auto-balancing (system manages debt)            │   │
│ │ ☐ Manual debt schedule (user inputs by year)     │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ ═══════════════════════════════════════════════════════   │
│ SECTION 3: FIXED ASSETS                                   │
│ ═══════════════════════════════════════════════════════   │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 2024 Closing Balances (auto-populated):           │   │
│ │ ├─ Fixed Assets (Gross):    45,000,000 SAR        │   │
│ │ └─ Accumulated Depreciation: 11,000,000 SAR       │   │
│ │                                                    │   │
│ │ Future Additions/Disposals:                        │   │
│ │ └─ Managed via CapEx Module →                     │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ ═══════════════════════════════════════════════════════   │
│ SECTION 4: EQUITY STRUCTURE                               │
│ ═══════════════════════════════════════════════════════   │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Foundation Structure:                              │   │
│ │                                                    │   │
│ │ 2024 Closing Balances (auto-populated):           │   │
│ │ ├─ Share Capital:          50,000,000 SAR         │   │
│ │ └─ Retained Earnings:     (89,565,000) SAR        │   │
│ │                                                    │   │
│ │ Capital Injections:                                │   │
│ │ ☐ None - Foundation structure (no injections)     │   │
│ │                                                    │   │
│ │ Dividend Payments:                                 │   │
│ │ ☐ None - Foundation structure (no dividends)      │   │
│ │                                                    │   │
│ │ Note: Equity changes through retained earnings    │   │
│ │       and net income accumulation only            │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│                                                            │
│              [Calculate Suggested Defaults from 2024]     │
│                                                            │
│                      [Save Configuration]                 │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

### 2.11 KEY BALANCE SHEET PRINCIPLES

**1. Balancing Equation:**
```
Total Assets = Total Liabilities + Total Equity
```
- MUST balance every period
- System validates balance before saving

**2. Cash as Balancing Plug:**
- Cash calculated last to balance the equation
- Minimum 1M SAR maintained at all times
- Debt auto-adjusts if cash insufficient

**3. Working Capital Drivers:**
- All percentages suggested from 2024 actuals
- User can override in admin center
- Same drivers for Transition (2025-2027) and Dynamic (2028-2052)

**4. Foundation Structure:**
- No capital injections
- No dividend payments
- Equity grows only through retained earnings

**5. Fixed Assets:**
- Managed via CapEx module
- Additions and disposals tracked
- Net Book Value used for Zakat calculation

**6. Deferred Revenue:**
- Critical for school cash flow
- Represents advance tuition payments
- Liability until earned

**7. Debt Management:**
- Auto-balancing preferred
- Interest calculated in P&L
- Can have manual schedule for major financing

---

## PART 3: CASH FLOW STATEMENT

### 3.1 CASH FLOW STATEMENT STRUCTURE

**Complete Cash Flow Format (Indirect Method):**

```
┌─────────────────────────────────────────────────────────┐
│                  CASH FLOW STATEMENT                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  CASH FLOW FROM OPERATING ACTIVITIES                     │
│  ├─ Net Income                                           │
│  ├─ Adjustments for non-cash items:                      │
│  │  ├─ Add: Depreciation                                │
│  │  └─ Add: Zakat (accrued, not yet paid)               │
│  ├─ Changes in Working Capital:                          │
│  │  ├─ (Increase)/Decrease in Accounts Receivable       │
│  │  ├─ (Increase)/Decrease in Prepaid Expenses          │
│  │  ├─ Increase/(Decrease) in Accounts Payable          │
│  │  ├─ Increase/(Decrease) in Accrued Expenses          │
│  │  └─ Increase/(Decrease) in Deferred Revenue          │
│  └─ Less: Payment of Prior Year Zakat                   │
│  ─────────────────────────────────────                   │
│  NET CASH FROM OPERATING ACTIVITIES                      │
│                                                           │
│  CASH FLOW FROM INVESTING ACTIVITIES                     │
│  ├─ Purchase of Fixed Assets (CapEx)                     │
│  └─ Proceeds from Asset Disposals                        │
│  ─────────────────────────────────────                   │
│  NET CASH FROM INVESTING ACTIVITIES                      │
│                                                           │
│  CASH FLOW FROM FINANCING ACTIVITIES                     │
│  ├─ Proceeds from Long-term Debt                         │
│  ├─ Repayment of Long-term Debt                          │
│  ├─ Increase/(Decrease) in Short-term Debt               │
│  └─ Capital Contributions (Foundation: always 0)         │
│  ─────────────────────────────────────                   │
│  NET CASH FROM FINANCING ACTIVITIES                      │
│                                                           │
│  NET INCREASE/(DECREASE) IN CASH                         │
│  ├─ Opening Cash Balance                                 │
│  ─────────────────────────────────────                   │
│  CLOSING CASH BALANCE                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Fundamental Equation:**
```
Closing Cash = Opening Cash + Net Cash from Operations 
                             + Net Cash from Investing 
                             + Net Cash from Financing
```

---

### 3.2 PERIOD-SPECIFIC RULES

#### Historical Period (2023-2024)

**Two Options:**

**Option A: Calculate from P&L and Balance Sheet**
```typescript
// Derive cash flow from financial statements
const cashFlow = calculateCashFlow(
  getPL(year),
  getBalanceSheet(year),
  getBalanceSheet(year - 1)
);
```

**Option B: Direct from actuals (if available)**
```typescript
// If historical cash flow data exists
const cashFlow = historical_actuals.cashFlowStatement;
```

**Recommended:** Option A (calculated) for consistency

---

#### Transition Period (2025-2027) + Dynamic Period (2028-2052)

**CRITICAL:** Same calculation methodology for both periods

**Method:** Indirect method - start from Net Income and adjust

---

### 3.3 OPERATING ACTIVITIES

#### 3.3.1 Starting Point: Net Income

**Source:** From P&L Statement (Line 10)

```typescript
const netIncome = getPL(year).netIncome;
```

---

#### 3.3.2 Non-Cash Adjustments

**Depreciation:**

**Nature:** Non-cash expense (reduces profit but doesn't use cash)

**Treatment:** Add back to Net Income

```typescript
const depreciation = getPL(year).depreciation;
const addBackDepreciation = depreciation; // Always positive adjustment
```

**Example:**
```
P&L shows:
├─ EBITDA: 35,000,000
├─ Depreciation: (5,500,000) ← Reduces profit
└─ EBIT: 29,500,000

Cash Flow:
├─ Net Income: 30,000,000 (after depreciation reduced profit)
├─ Add back Depreciation: +5,500,000 ← Restore cash (no actual payment)
└─ Adjusted Cash: 35,500,000
```

---

**Zakat (Accrued but not yet paid):**

**Critical Timing:** 
- Zakat accrued in Year N (reduces Net Income)
- Zakat paid in April of Year N+1
- Two-step treatment

**Year N (Accrual Year):**
```typescript
// Zakat expense reduces Net Income but cash not yet paid
const zakatExpense = getPL(year).zakat;
const addBackZakat = zakatExpense; // Add back (not paid yet)
```

**Year N+1 (Payment Year):**
```typescript
// Payment of prior year Zakat
const priorYearZakat = getPL(year - 1).zakat;
const zakatPayment = priorYearZakat.negated(); // Cash outflow
```

**Example:**
```
Year 2025:
├─ P&L Zakat Expense: (500,000) ← Reduces Net Income
├─ Cash Flow: Add back +500,000 ← Not paid yet (April 2026)
└─ Net Effect: No cash impact in 2025

Year 2026 (April):
├─ Payment of 2025 Zakat: (500,000) ← Actual cash outflow
└─ This is separate line in Operating Activities
```

**Implementation:**
```typescript
function calculateZakatAdjustments(
  year: number,
  currentYearZakat: Decimal,
  priorYearZakat: Decimal
): { addBackZakat: Decimal; zakatPayment: Decimal } {
  
  // Add back current year Zakat (accrued, not paid)
  const addBackZakat = currentYearZakat;
  
  // Pay prior year Zakat (actual cash out)
  const zakatPayment = priorYearZakat.negated();
  
  return { addBackZakat, zakatPayment };
}
```

---

#### 3.3.3 Working Capital Changes

**Concept:** Changes in Balance Sheet current accounts affect cash

**Rule:**
```
Increase in Asset = Use of Cash (negative)
Decrease in Asset = Source of Cash (positive)

Increase in Liability = Source of Cash (positive)
Decrease in Liability = Use of Cash (negative)
```

**Formula:**
```
Change = Current Year Balance - Prior Year Balance

For Assets (AR, Prepaid):
  If Change > 0 (increase): Cash outflow (negative)
  If Change < 0 (decrease): Cash inflow (positive)

For Liabilities (AP, Accrued, Deferred):
  If Change > 0 (increase): Cash inflow (positive)
  If Change < 0 (decrease): Cash outflow (negative)
```

---

**Accounts Receivable:**

**Logic:** 
- AR increases → Gave more credit → Cash not collected → Negative cash flow
- AR decreases → Collected cash → Positive cash flow

```typescript
function calculateARChange(
  currentYearAR: Decimal,
  priorYearAR: Decimal
): Decimal {
  const change = currentYearAR.minus(priorYearAR);
  
  // Increase in AR = use of cash (negative)
  // Decrease in AR = source of cash (positive)
  return change.negated();
}
```

**Example:**
```
Year 2024: AR = 8,200,000
Year 2025: AR = 9,020,000
Change: +820,000 (increase)

Cash Flow Impact: (820,000) ← Cash tied up in receivables
```

---

**Prepaid Expenses:**

**Logic:**
- Prepaid increases → Paid cash in advance → Negative cash flow
- Prepaid decreases → Used up prepayments → Positive cash flow

```typescript
function calculatePrepaidChange(
  currentYearPrepaid: Decimal,
  priorYearPrepaid: Decimal
): Decimal {
  const change = currentYearPrepaid.minus(priorYearPrepaid);
  
  // Increase in Prepaid = use of cash (negative)
  // Decrease in Prepaid = source of cash (positive)
  return change.negated();
}
```

**Example:**
```
Year 2024: Prepaid = 2,600,000
Year 2025: Prepaid = 2,840,000
Change: +240,000 (increase)

Cash Flow Impact: (240,000) ← Paid more in advance
```

---

**Accounts Payable:**

**Logic:**
- AP increases → Delayed payment to suppliers → Positive cash flow
- AP decreases → Paid suppliers → Negative cash flow

```typescript
function calculateAPChange(
  currentYearAP: Decimal,
  priorYearAP: Decimal
): Decimal {
  const change = currentYearAP.minus(priorYearAP);
  
  // Increase in AP = source of cash (positive)
  // Decrease in AP = use of cash (negative)
  return change;
}
```

**Example:**
```
Year 2024: AP = 7,800,000
Year 2025: AP = 8,520,000
Change: +720,000 (increase)

Cash Flow Impact: +720,000 ← Owed more to suppliers (retained cash)
```

---

**Accrued Expenses:**

**Logic:**
- Accrued increases → Delayed payment → Positive cash flow
- Accrued decreases → Paid accruals → Negative cash flow

```typescript
function calculateAccruedChange(
  currentYearAccrued: Decimal,
  priorYearAccrued: Decimal
): Decimal {
  const change = currentYearAccrued.minus(priorYearAccrued);
  
  // Increase in Accrued = source of cash (positive)
  // Decrease in Accrued = use of cash (negative)
  return change;
}
```

**Example:**
```
Year 2024: Accrued = 3,575,000
Year 2025: Accrued = 3,905,000
Change: +330,000 (increase)

Cash Flow Impact: +330,000 ← Delayed payments (retained cash)
```

---

**Deferred Revenue:**

**Logic:** CRITICAL for schools!
- Deferred increases → Parents paid in advance → Positive cash flow
- Deferred decreases → Recognized revenue (earned) → Negative cash flow

```typescript
function calculateDeferredRevenueChange(
  currentYearDeferred: Decimal,
  priorYearDeferred: Decimal
): Decimal {
  const change = currentYearDeferred.minus(priorYearDeferred);
  
  // Increase in Deferred = source of cash (positive)
  // Decrease in Deferred = use of cash (negative)
  return change;
}
```

**Example:**
```
Year 2024: Deferred Revenue = 15,000,000
Year 2025: Deferred Revenue = 16,500,000
Change: +1,500,000 (increase)

Cash Flow Impact: +1,500,000 ← Parents paid advance tuition (major cash source!)
```

---

#### 3.3.4 Complete Operating Activities Calculation

```typescript
function calculateOperatingActivities(
  year: number,
  pl: PL,
  currentBS: BalanceSheet,
  priorBS: BalanceSheet
): OperatingCashFlow {
  
  // Starting point
  const netIncome = pl.netIncome;
  
  // Non-cash adjustments
  const depreciation = pl.depreciation;
  const currentYearZakat = pl.zakat;
  const priorYearZakat = year > 2025 ? getPL(year - 1).zakat : new Decimal(0);
  
  // Add back non-cash items
  const addBackDepreciation = depreciation;
  const addBackZakat = currentYearZakat;
  
  // Working capital changes
  const arChange = currentBS.accountsReceivable
    .minus(priorBS.accountsReceivable)
    .negated(); // Increase = negative
  
  const prepaidChange = currentBS.prepaidExpenses
    .minus(priorBS.prepaidExpenses)
    .negated(); // Increase = negative
  
  const apChange = currentBS.accountsPayable
    .minus(priorBS.accountsPayable); // Increase = positive
  
  const accruedChange = currentBS.accruedExpenses
    .minus(priorBS.accruedExpenses); // Increase = positive
  
  const deferredChange = currentBS.deferredRevenue
    .minus(priorBS.deferredRevenue); // Increase = positive
  
  const totalWCChange = arChange
    .plus(prepaidChange)
    .plus(apChange)
    .plus(accruedChange)
    .plus(deferredChange);
  
  // Prior year Zakat payment (April of current year)
  const zakatPayment = priorYearZakat.negated();
  
  // Total operating cash flow
  const operatingCashFlow = netIncome
    .plus(addBackDepreciation)
    .plus(addBackZakat)
    .plus(totalWCChange)
    .plus(zakatPayment);
  
  return {
    netIncome,
    depreciation: addBackDepreciation,
    zakatAddBack: addBackZakat,
    workingCapitalChanges: {
      accountsReceivable: arChange,
      prepaidExpenses: prepaidChange,
      accountsPayable: apChange,
      accruedExpenses: accruedChange,
      deferredRevenue: deferredChange,
      total: totalWCChange
    },
    zakatPayment,
    netCashFromOperations: operatingCashFlow
  };
}
```

---

### 3.4 INVESTING ACTIVITIES

#### 3.4.1 Purchase of Fixed Assets (CapEx)

**Source:** CapEx Module

**Treatment:** Cash outflow (negative)

```typescript
const capexAdditions = getCapEx(year).additions;
const purchaseOfAssets = capexAdditions.negated(); // Always negative
```

**Example:**
```
Year 2028 (Relocation):
├─ New school fit-out: 50,000,000 SAR
└─ Cash Flow: (50,000,000) ← Major cash outflow
```

---

#### 3.4.2 Proceeds from Asset Disposals

**Source:** CapEx Module (if assets sold)

**Treatment:** Cash inflow (positive)

```typescript
const assetDisposals = getCapEx(year).disposals;
const proceedsFromDisposals = assetDisposals.saleProceeds; // Positive if sold
```

**Example:**
```
Year 2028 (Old location):
├─ Sale of old equipment: 2,000,000 SAR
└─ Cash Flow: +2,000,000 ← Cash inflow
```

**Note:** If write-off (no sale), proceeds = 0

---

#### 3.4.3 Complete Investing Activities

```typescript
function calculateInvestingActivities(
  year: number,
  capexData: CapExData
): InvestingCashFlow {
  
  // Purchase of assets (negative)
  const purchaseOfAssets = capexData.additions.negated();
  
  // Proceeds from disposals (positive)
  const proceedsFromDisposals = capexData.disposals?.saleProceeds || new Decimal(0);
  
  // Net investing cash flow
  const netInvestingCashFlow = purchaseOfAssets.plus(proceedsFromDisposals);
  
  return {
    purchaseOfAssets,
    proceedsFromDisposals,
    netCashFromInvesting: netInvestingCashFlow
  };
}
```

**Example:**
```
Year 2028 Investing Activities:
├─ Purchase of Fixed Assets: (50,000,000)
├─ Proceeds from Disposals: 2,000,000
└─ Net Cash from Investing: (48,000,000)
```

---

### 3.5 FINANCING ACTIVITIES

#### 3.5.1 Long-term Debt

**Proceeds from Debt:**

**When:** New debt borrowed

```typescript
const currentLTDebt = currentBS.longTermDebt;
const priorLTDebt = priorBS.longTermDebt;
const ltDebtChange = currentLTDebt.minus(priorLTDebt);

const proceedsFromDebt = ltDebtChange.greaterThan(0) 
  ? ltDebtChange  // Positive change = borrowed (cash inflow)
  : new Decimal(0);
```

**Repayment of Debt:**

**When:** Debt paid down

```typescript
const repaymentOfDebt = ltDebtChange.lessThan(0)
  ? ltDebtChange  // Negative change = repaid (cash outflow)
  : new Decimal(0);
```

**Example:**
```
Year 2028:
├─ Prior Year LT Debt: 0
├─ Current Year LT Debt: 20,000,000
├─ Change: +20,000,000
└─ Proceeds from Debt: +20,000,000 (borrowed)

Year 2029:
├─ Prior Year LT Debt: 20,000,000
├─ Current Year LT Debt: 18,000,000
├─ Change: (2,000,000)
└─ Repayment of Debt: (2,000,000) (paid down)
```

---

#### 3.5.2 Short-term Debt

**Treatment:** Same as long-term

**Auto-balancing nature:**
- Short-term debt adjusts to maintain minimum cash
- Changes flow through financing activities

```typescript
const currentSTDebt = currentBS.shortTermDebt;
const priorSTDebt = priorBS.shortTermDebt;
const stDebtChange = currentSTDebt.minus(priorSTDebt);

// Positive change = borrowed, Negative change = repaid
```

---

#### 3.5.3 Capital Contributions

**Foundation Structure:** Always zero

```typescript
const capitalContributions = new Decimal(0); // Foundation - no injections
```

**For reference (if not foundation):**
```typescript
// If there were capital contributions
const shareCapitalChange = currentBS.shareCapital.minus(priorBS.shareCapital);
const capitalContributions = shareCapitalChange; // Would be cash inflow
```

---

#### 3.5.4 Complete Financing Activities

```typescript
function calculateFinancingActivities(
  currentBS: BalanceSheet,
  priorBS: BalanceSheet
): FinancingCashFlow {
  
  // Long-term debt changes
  const ltDebtChange = currentBS.longTermDebt.minus(priorBS.longTermDebt);
  const proceedsFromLTDebt = ltDebtChange.greaterThan(0) ? ltDebtChange : new Decimal(0);
  const repaymentOfLTDebt = ltDebtChange.lessThan(0) ? ltDebtChange : new Decimal(0);
  
  // Short-term debt changes
  const stDebtChange = currentBS.shortTermDebt.minus(priorBS.shortTermDebt);
  const netSTDebtChange = stDebtChange;
  
  // Capital contributions (Foundation: always 0)
  const capitalContributions = new Decimal(0);
  
  // Net financing cash flow
  const netFinancingCashFlow = proceedsFromLTDebt
    .plus(repaymentOfLTDebt)
    .plus(netSTDebtChange)
    .plus(capitalContributions);
  
  return {
    proceedsFromLTDebt,
    repaymentOfLTDebt,
    netSTDebtChange,
    capitalContributions,
    netCashFromFinancing: netFinancingCashFlow
  };
}
```

**Example:**
```
Year 2028 Financing Activities:
├─ Proceeds from Long-term Debt: 20,000,000
├─ Repayment of Long-term Debt: 0
├─ Increase in Short-term Debt: 0
├─ Capital Contributions: 0 (Foundation)
└─ Net Cash from Financing: 20,000,000
```

---

### 3.6 COMPLETE CASH FLOW CALCULATION

**Full Implementation:**

```typescript
interface CashFlowStatement {
  // Operating Activities
  netIncome: Decimal;
  depreciation: Decimal;
  zakatAddBack: Decimal;
  workingCapitalChanges: {
    accountsReceivable: Decimal;
    prepaidExpenses: Decimal;
    accountsPayable: Decimal;
    accruedExpenses: Decimal;
    deferredRevenue: Decimal;
    total: Decimal;
  };
  zakatPayment: Decimal;
  netCashFromOperations: Decimal;
  
  // Investing Activities
  purchaseOfAssets: Decimal;
  proceedsFromDisposals: Decimal;
  netCashFromInvesting: Decimal;
  
  // Financing Activities
  proceedsFromLTDebt: Decimal;
  repaymentOfLTDebt: Decimal;
  netSTDebtChange: Decimal;
  capitalContributions: Decimal;
  netCashFromFinancing: Decimal;
  
  // Cash Reconciliation
  netChangeInCash: Decimal;
  openingCash: Decimal;
  closingCash: Decimal;
}

function calculateCashFlow(
  year: number,
  pl: PL,
  currentBS: BalanceSheet,
  priorBS: BalanceSheet,
  capexData: CapExData
): CashFlowStatement {
  
  // ========================================
  // OPERATING ACTIVITIES
  // ========================================
  
  const operating = calculateOperatingActivities(year, pl, currentBS, priorBS);
  
  // ========================================
  // INVESTING ACTIVITIES
  // ========================================
  
  const investing = calculateInvestingActivities(year, capexData);
  
  // ========================================
  // FINANCING ACTIVITIES
  // ========================================
  
  const financing = calculateFinancingActivities(currentBS, priorBS);
  
  // ========================================
  // NET CHANGE IN CASH
  // ========================================
  
  const netChangeInCash = operating.netCashFromOperations
    .plus(investing.netCashFromInvesting)
    .plus(financing.netCashFromFinancing);
  
  const openingCash = priorBS.cash;
  const closingCash = openingCash.plus(netChangeInCash);
  
  // ========================================
  // VALIDATION: Must match Balance Sheet
  // ========================================
  
  if (!closingCash.equals(currentBS.cash)) {
    throw new Error(
      `Cash flow does not reconcile for year ${year}: ` +
      `Calculated closing cash = ${closingCash}, ` +
      `Balance Sheet cash = ${currentBS.cash}`
    );
  }
  
  return {
    // Operating
    netIncome: operating.netIncome,
    depreciation: operating.depreciation,
    zakatAddBack: operating.zakatAddBack,
    workingCapitalChanges: operating.workingCapitalChanges,
    zakatPayment: operating.zakatPayment,
    netCashFromOperations: operating.netCashFromOperations,
    
    // Investing
    purchaseOfAssets: investing.purchaseOfAssets,
    proceedsFromDisposals: investing.proceedsFromDisposals,
    netCashFromInvesting: investing.netCashFromInvesting,
    
    // Financing
    proceedsFromLTDebt: financing.proceedsFromLTDebt,
    repaymentOfLTDebt: financing.repaymentOfLTDebt,
    netSTDebtChange: financing.netSTDebtChange,
    capitalContributions: financing.capitalContributions,
    netCashFromFinancing: financing.netCashFromFinancing,
    
    // Cash Reconciliation
    netChangeInCash,
    openingCash,
    closingCash
  };
}
```

---

### 3.7 EXAMPLE CASH FLOW STATEMENT

**Year 2025 Example:**

```
┌─────────────────────────────────────────────────────────┐
│            CASH FLOW STATEMENT - Year 2025               │
├─────────────────────────────────────────────────────────┤
│                                                      SAR  │
│  OPERATING ACTIVITIES                                    │
│  Net Income                                  32,750,000  │
│  Adjustments for non-cash items:                         │
│  ├─ Add: Depreciation                         5,500,000  │
│  └─ Add: Zakat (accrued, paid 2026)             500,000  │
│                                                           │
│  Changes in Working Capital:                             │
│  ├─ (Increase) in Accounts Receivable          (820,000) │
│  ├─ (Increase) in Prepaid Expenses             (240,000) │
│  ├─ Increase in Accounts Payable                720,000  │
│  ├─ Increase in Accrued Expenses                330,000  │
│  └─ Increase in Deferred Revenue              1,500,000  │
│                                             ─────────────  │
│  Total Working Capital Changes                1,490,000  │
│                                                           │
│  Less: Payment of 2024 Zakat (April 2025)      (450,000) │
│                                             ─────────────  │
│  NET CASH FROM OPERATING ACTIVITIES          39,790,000  │
│                                                           │
│  INVESTING ACTIVITIES                                    │
│  Purchase of Fixed Assets                    (2,000,000) │
│  Proceeds from Asset Disposals                        0  │
│                                             ─────────────  │
│  NET CASH FROM INVESTING ACTIVITIES          (2,000,000) │
│                                                           │
│  FINANCING ACTIVITIES                                    │
│  Proceeds from Long-term Debt                         0  │
│  Repayment of Long-term Debt                          0  │
│  Increase/(Decrease) in Short-term Debt               0  │
│  Capital Contributions                                0  │
│                                             ─────────────  │
│  NET CASH FROM FINANCING ACTIVITIES                   0  │
│                                                           │
│  NET INCREASE IN CASH                        37,790,000  │
│                                                           │
│  CASH RECONCILIATION                                     │
│  Opening Cash Balance (Jan 1, 2025)         (25,290,000) │
│  Net Increase in Cash                        37,790,000  │
│                                             ─────────────  │
│  CLOSING CASH BALANCE (Dec 31, 2025)         12,500,000  │
│                                             ═════════════  │
└─────────────────────────────────────────────────────────┘

Key Insights:
├─ Strong Operating Cash Flow: 39.8M (121% of Net Income)
├─ Working Capital is Cash Source: 1.5M (mainly deferred revenue)
├─ Minimal CapEx: 2M
├─ No Debt Changes: 0
└─ Cash Position Improved: From (25.3M) to 12.5M
```

---

**Year 2028 Example (Relocation Year):**

```
┌─────────────────────────────────────────────────────────┐
│            CASH FLOW STATEMENT - Year 2028               │
├─────────────────────────────────────────────────────────┤
│                                                      SAR  │
│  OPERATING ACTIVITIES                                    │
│  Net Income                                  15,000,000  │
│  Adjustments for non-cash items:                         │
│  ├─ Add: Depreciation                         6,000,000  │
│  └─ Add: Zakat (accrued, paid 2029)             600,000  │
│                                                           │
│  Changes in Working Capital:                             │
│  ├─ (Increase) in Accounts Receivable        (1,500,000) │
│  ├─ (Increase) in Prepaid Expenses             (300,000) │
│  ├─ Increase in Accounts Payable                900,000  │
│  ├─ Increase in Accrued Expenses                400,000  │
│  └─ Increase in Deferred Revenue              2,000,000  │
│                                             ─────────────  │
│  Total Working Capital Changes                1,500,000  │
│                                                           │
│  Less: Payment of 2027 Zakat                   (550,000) │
│                                             ─────────────  │
│  NET CASH FROM OPERATING ACTIVITIES          22,550,000  │
│                                                           │
│  INVESTING ACTIVITIES                                    │
│  Purchase of Fixed Assets (Relocation)      (50,000,000) │
│  Proceeds from Asset Disposals                2,000,000  │
│                                             ─────────────  │
│  NET CASH FROM INVESTING ACTIVITIES         (48,000,000) │
│                                                           │
│  FINANCING ACTIVITIES                                    │
│  Proceeds from Long-term Debt                20,000,000  │
│  Repayment of Long-term Debt                          0  │
│  Increase in Short-term Debt                  5,000,000  │
│  Capital Contributions (Foundation)                   0  │
│                                             ─────────────  │
│  NET CASH FROM FINANCING ACTIVITIES          25,000,000  │
│                                                           │
│  NET DECREASE IN CASH                          (450,000) │
│                                                           │
│  CASH RECONCILIATION                                     │
│  Opening Cash Balance (Jan 1, 2028)          15,000,000  │
│  Net Decrease in Cash                          (450,000) │
│                                             ─────────────  │
│  CLOSING CASH BALANCE (Dec 31, 2028)         14,550,000  │
│                                             ═════════════  │
└─────────────────────────────────────────────────────────┘

Key Insights - RELOCATION YEAR:
├─ Operating Cash Flow: 22.6M (still positive during relocation)
├─ Major CapEx: (50M) for new school fit-out
├─ Asset Disposal: +2M from old equipment sale
├─ Debt Financing: 20M long-term + 5M short-term = 25M borrowed
├─ Net Cash Funded By:
│   ├─ Operations: 22.6M (47%)
│   └─ Debt: 25M (53%)
└─ Cash maintained above 1M minimum: 14.6M
```

---

### 3.8 KEY CASH FLOW PRINCIPLES

**1. Indirect Method:**
- Start with Net Income
- Add back non-cash expenses
- Adjust for working capital changes
- Results in Operating Cash Flow

**2. Zakat Timing (Critical):**
```
Year N:
├─ P&L: Zakat Expense (reduces Net Income)
├─ Cash Flow: Add back (not paid yet)
└─ Net Effect: No cash impact

Year N+1 (April):
├─ Cash Flow: Payment of prior year Zakat
└─ Net Effect: Cash outflow
```

**3. Working Capital Impact:**
```
Asset Increase = Cash Outflow (negative)
Liability Increase = Cash Inflow (positive)

Key for Schools:
├─ Deferred Revenue increases → Major cash source
└─ Parents pay tuition in advance
```

**4. Three Activities:**
```
Operating: Day-to-day business
Investing: CapEx (assets bought/sold)
Financing: Debt and equity changes
```

**5. Cash Reconciliation:**
```
Opening Cash + Net Change = Closing Cash
MUST match Balance Sheet cash
```

**6. Foundation Structure:**
- No capital contributions (always 0)
- Debt is main external financing source
- Operating cash flow funds growth

---

### 3.9 VALIDATION RULES

**Cash Flow Validation Checklist:**

```typescript
function validateCashFlow(
  year: number,
  cashFlow: CashFlowStatement,
  balanceSheet: BalanceSheet,
  priorBS: BalanceSheet
): boolean {
  
  // 1. Closing cash must match Balance Sheet
  if (!cashFlow.closingCash.equals(balanceSheet.cash)) {
    throw new Error('Closing cash does not match Balance Sheet');
  }
  
  // 2. Opening cash must match prior year closing
  if (!cashFlow.openingCash.equals(priorBS.cash)) {
    throw new Error('Opening cash does not match prior year');
  }
  
  // 3. Net change must equal closing minus opening
  const calculatedChange = cashFlow.closingCash.minus(cashFlow.openingCash);
  if (!cashFlow.netChangeInCash.equals(calculatedChange)) {
    throw new Error('Net change in cash calculation error');
  }
  
  // 4. Net change must equal sum of three activities
  const sumActivities = cashFlow.netCashFromOperations
    .plus(cashFlow.netCashFromInvesting)
    .plus(cashFlow.netCashFromFinancing);
  
  if (!cashFlow.netChangeInCash.equals(sumActivities)) {
    throw new Error('Net change does not equal sum of activities');
  }
  
  return true;
}
```

**Validation Checks:**
- [ ] Closing Cash = Balance Sheet Cash
- [ ] Opening Cash = Prior Year Closing Cash
- [ ] Net Change = Closing - Opening
- [ ] Net Change = Operations + Investing + Financing
- [ ] All working capital changes calculated correctly
- [ ] Zakat timing handled properly (add back in Year N, pay in Year N+1)
- [ ] CapEx matches CapEx module
- [ ] Debt changes match Balance Sheet movements

---

## PART 4: PERIOD LINKAGE RULES

### 4.1 OVERVIEW

**Purpose:** Define how the three periods (Historical, Transition, Dynamic) connect seamlessly to create a continuous 30-year financial model (2023-2052).

**Critical Transitions:**
1. **2024 → 2025** (Historical to Transition)
2. **2027 → 2028** (Transition to Dynamic)

**Fundamental Principle:**
```
Ending Balance Sheet [Year N] = Opening Balance Sheet [Year N+1]
```

---

### 4.2 GENERAL LINKAGE PRINCIPLES

#### 4.2.1 Balance Sheet Continuity

**Rule:** Every Balance Sheet account flows forward

```typescript
// For ANY year N to N+1 transition
function linkBalanceSheets(
  yearN: number,
  yearNplus1: number
): void {
  const endingBS = getBalanceSheet(yearN);
  const openingBS = getBalanceSheet(yearNplus1);
  
  // ASSETS
  openingBS.cash = endingBS.cash;
  openingBS.accountsReceivable = endingBS.accountsReceivable;
  openingBS.prepaidExpenses = endingBS.prepaidExpenses;
  openingBS.fixedAssetsGross = endingBS.fixedAssetsGross;
  openingBS.accumulatedDepreciation = endingBS.accumulatedDepreciation;
  
  // LIABILITIES
  openingBS.accountsPayable = endingBS.accountsPayable;
  openingBS.accruedExpenses = endingBS.accruedExpenses;
  openingBS.deferredRevenue = endingBS.deferredRevenue;
  openingBS.shortTermDebt = endingBS.shortTermDebt;
  openingBS.longTermDebt = endingBS.longTermDebt;
  
  // EQUITY
  openingBS.shareCapital = endingBS.shareCapital;
  openingBS.retainedEarnings = calculateOpeningRetainedEarnings(yearN);
  openingBS.currentYearNetIncome = new Decimal(0); // Starts at 0
}
```

---

#### 4.2.2 Retained Earnings Rollforward

**Formula:**
```
Opening Retained Earnings [Year N+1] = Closing Retained Earnings [Year N]
                                     + Net Income [Year N]
                                     - Dividends [Year N]

Foundation: Dividends = 0 (always)
```

**Implementation:**
```typescript
function calculateOpeningRetainedEarnings(
  priorYear: number
): Decimal {
  const priorBS = getBalanceSheet(priorYear);
  const priorPL = getPL(priorYear);
  
  // Foundation: No dividends
  const dividends = new Decimal(0);
  
  const openingRE = priorBS.retainedEarnings
    .plus(priorPL.netIncome)
    .minus(dividends);
  
  return openingRE;
}
```

**Example:**
```
Year 2024 Ending:
├─ Retained Earnings: (89,565,000)
└─ Net Income: 32,750,000

Year 2025 Opening:
├─ Retained Earnings: (89,565,000) + 32,750,000 = (56,815,000)
└─ Current Year Net Income: 0 (starts fresh)
```

---

#### 4.2.3 Cash Flow Continuity

**Rule:** Cash flows forward exactly

```typescript
// Cash at start of Year N+1 = Cash at end of Year N
const openingCash2025 = getBalanceSheet(2024).cash;
const closingCash2024 = getBalanceSheet(2024).cash;

assert(openingCash2025.equals(closingCash2024));
```

**Validation:**
```
Cash Flow Statement Year N+1:
├─ Opening Cash = Balance Sheet Year N ending cash
└─ Must reconcile exactly
```

---

### 4.3 TRANSITION 1: HISTORICAL → TRANSITION (2024 → 2025)

#### 4.3.1 What Carries Forward from 2024

**All Balance Sheet Items:**
```
From Historical Actuals 2024:
├─ Cash → 2025 Opening Cash
├─ Accounts Receivable → 2025 Opening AR
├─ Prepaid Expenses → 2025 Opening Prepaid
├─ Fixed Assets (Gross) → 2025 Opening Gross FA
├─ Accumulated Depreciation → 2025 Opening Acc Dep
├─ Accounts Payable → 2025 Opening AP
├─ Accrued Expenses → 2025 Opening Accrued
├─ Deferred Revenue → 2025 Opening Deferred
├─ Short-term Debt → 2025 Opening ST Debt
├─ Long-term Debt → 2025 Opening LT Debt
├─ Share Capital → 2025 Opening Share Capital
└─ Retained Earnings → 2025 Opening RE (with 2024 net income rolled in)
```

---

#### 4.3.2 What Gets Extracted from 2024 for Ratios

**Working Capital Ratios:**
```typescript
const hist2024 = getHistoricalActuals(2024);

// Calculate suggested defaults for admin center
const suggestedRatios = {
  // Assets
  accountsReceivablePercent: hist2024.accountsReceivable
    .dividedBy(hist2024.totalRevenues)
    .times(100),
  
  prepaidExpensesPercent: hist2024.prepaidExpenses
    .dividedBy(hist2024.totalOperatingExpenses)
    .times(100),
  
  // Liabilities
  accountsPayablePercent: hist2024.accountsPayable
    .dividedBy(hist2024.totalOperatingExpenses)
    .times(100),
  
  accruedExpensesPercent: hist2024.accruedExpenses
    .dividedBy(hist2024.totalOperatingExpenses)
    .times(100),
  
  deferredRevenuePercent: hist2024.deferredRevenue
    .dividedBy(hist2024.totalRevenues)
    .times(100),
  
  // Other OpEx
  otherOpExPercent: hist2024.otherOperatingExpenses
    .dividedBy(hist2024.totalRevenues)
    .times(100),
  
  // Staff Costs
  staffCostsPercent: hist2024.salariesAndRelatedCosts
    .dividedBy(hist2024.totalRevenues)
    .times(100)
};
```

**Other Revenue Ratio:**
```typescript
const otherRevenueRatio = hist2024.otherIncome
  .dividedBy(hist2024.tuitionFrenchCurriculum);
// Used for all future periods (2025-2052)
```

---

#### 4.3.3 What Changes in Calculation Method

**Before (Historical 2024):**
- All from database
- No calculations

**After (Transition 2025):**
- Revenue: Student count × Average tuition
- Staff Costs: 2024 ratio × Revenue
- Rent: 2024 base × (1 + growth %)
- Other OpEx: 2024 ratio × Revenue
- Working Capital: Percentages from 2024

**Key Point:** Methodology changes, but balances carry forward exactly

---

#### 4.3.4 Implementation

```typescript
function transitionToTransitionPeriod(year2024: HistoricalActuals): void {
  
  // 1. Carry forward ALL Balance Sheet balances
  const opening2025 = {
    cash: year2024.cashAndCashEquivalents,
    accountsReceivable: year2024.accountsReceivable,
    prepaidExpenses: year2024.prepaidExpenses,
    fixedAssetsGross: year2024.fixedAssetsGross,
    accumulatedDepreciation: year2024.accumulatedDepreciation,
    accountsPayable: year2024.accountsPayable,
    accruedExpenses: year2024.accruedExpenses,
    deferredRevenue: year2024.deferredRevenue,
    shortTermDebt: year2024.shortTermDebt,
    longTermDebt: year2024.longTermDebt,
    shareCapital: year2024.shareCapital,
    retainedEarnings: year2024.retainedEarnings.plus(year2024.netIncome),
    currentYearNetIncome: new Decimal(0)
  };
  
  // 2. Calculate and store suggested ratios
  const suggestedConfig = calculateSuggestedRatios(year2024);
  saveSuggestedConfig(suggestedConfig);
  
  // 3. Validate balance
  const totalAssets = opening2025.cash
    .plus(opening2025.accountsReceivable)
    .plus(opening2025.prepaidExpenses)
    .plus(opening2025.fixedAssetsGross)
    .minus(opening2025.accumulatedDepreciation);
  
  const totalLiabilitiesAndEquity = opening2025.accountsPayable
    .plus(opening2025.accruedExpenses)
    .plus(opening2025.deferredRevenue)
    .plus(opening2025.shortTermDebt)
    .plus(opening2025.longTermDebt)
    .plus(opening2025.shareCapital)
    .plus(opening2025.retainedEarnings);
  
  if (!totalAssets.equals(totalLiabilitiesAndEquity)) {
    throw new Error('2024 to 2025 transition does not balance');
  }
}
```

---

### 4.4 TRANSITION 2: TRANSITION → DYNAMIC (2027 → 2028)

#### 4.4.1 What Carries Forward from 2027

**All Balance Sheet Items (Same as any year):**
```
From Transition 2027:
├─ All asset balances
├─ All liability balances
└─ All equity balances
→ Become 2028 opening balances
```

**No special treatment - same as any year-to-year transition**

---

#### 4.4.2 What Changes in Calculation Method

**Before (Transition 2027):**
- Revenue: Student count × Average tuition
- Staff Costs: 2024 ratio
- Rent: 2024 base + growth %
- Other OpEx: 2024 ratio

**After (Dynamic 2028):**
- Revenue: Capacity-based with tuition growth rate
- Staff Costs: 2028 base calculated from ratios + CPI growth
- Rent: Rent model (3 options)
- Other OpEx: Single percentage

---

#### 4.4.3 Special Consideration: Staff Costs Base 2028

**Critical:** 2028 becomes the base year for Dynamic period staff costs

**Calculation:**
```typescript
// Calculate 2028 base from student/teacher ratios
function calculate2028StaffCostBase(
  totalStudents2028: number,
  studentsPerTeacher: Decimal,
  studentsPerNonTeacher: Decimal,
  teacherMonthlySalary: Decimal,
  nonTeacherMonthlySalary: Decimal
): Decimal {
  
  const teachersNeeded = new Decimal(totalStudents2028)
    .dividedBy(studentsPerTeacher);
  
  const nonTeachersNeeded = new Decimal(totalStudents2028)
    .dividedBy(studentsPerNonTeacher);
  
  const teacherCosts = teachersNeeded
    .times(teacherMonthlySalary)
    .times(12);
  
  const nonTeacherCosts = nonTeachersNeeded
    .times(nonTeacherMonthlySalary)
    .times(12);
  
  const base2028 = teacherCosts.plus(nonTeacherCosts);
  
  return base2028;
}

// This becomes the base for 2029-2052 with CPI growth
```

**Example:**
```
2028 Calculation:
├─ Total Students: 2,500 (Year 1 of dynamic)
├─ Students per Teacher: 14
├─ Teachers Needed: 2,500 / 14 = 178.57 ≈ 179
├─ Teacher Salary: 15,000 SAR/month
├─ Teacher Costs: 179 × 15,000 × 12 = 32,220,000
├─ Students per Non-Teacher: 25
├─ Non-Teachers Needed: 2,500 / 25 = 100
├─ Non-Teacher Salary: 10,000 SAR/month
├─ Non-Teacher Costs: 100 × 10,000 × 12 = 12,000,000
└─ Base Staff Costs 2028: 44,220,000 SAR

2029 Calculation:
├─ Base 2028: 44,220,000
├─ CPI Growth: 3%
└─ Staff Costs 2029: 44,220,000 × 1.03 = 45,546,600 SAR
```

---

#### 4.4.4 Major Event: Relocation in 2028

**Assets:**
```
Fixed Assets (Gross):
├─ Opening 2028: 47,000,000 (from 2027)
├─ Add: New school fit-out: 50,000,000
├─ Less: Disposal of old assets: (5,000,000)
└─ Closing 2028: 92,000,000

Accumulated Depreciation:
├─ Opening 2028: 16,500,000 (from 2027)
├─ Add: 2028 Depreciation: 6,000,000
├─ Less: Disposal accumulated: (3,000,000)
└─ Closing 2028: 19,500,000

Net Fixed Assets 2028: 72,500,000
```

**Financing:**
```
Debt:
├─ Opening Long-term Debt: 0
├─ Borrowed for relocation: 20,000,000
├─ Closing Long-term Debt: 20,000,000

Short-term Debt:
├─ Auto-adjusted to maintain min cash
└─ May increase due to relocation cash needs
```

---

#### 4.4.5 Implementation

```typescript
function transitionToDynamicPeriod(year2027: BalanceSheet): void {
  
  // 1. Carry forward ALL balances (standard)
  const opening2028 = carryForwardBalances(year2027);
  
  // 2. Calculate Staff Cost Base 2028
  const students2028 = calculateStudents2028();
  const base2028 = calculate2028StaffCostBase(
    students2028,
    studentsPerTeacher,
    studentsPerNonTeacher,
    teacherSalary,
    nonTeacherSalary
  );
  
  // Store for future use (2029-2052)
  saveStaffCostBase2028(base2028);
  
  // 3. Set up rent model
  const rentModel = selectRentModel(); // User choice
  
  // 4. Handle relocation if scheduled
  if (relocationScheduled2028) {
    handleRelocationTransition();
  }
  
  // 5. Validate balance
  validateBalanceSheet(opening2028);
}
```

---

### 4.5 YEAR-TO-YEAR LINKAGES (General)

#### 4.5.1 Every Year Transition (2025-2026, 2026-2027, etc.)

**Standard Process:**

```typescript
function linkYearToYear(yearN: number, yearNplus1: number): void {
  
  const endingBS_N = getBalanceSheet(yearN);
  const openingBS_Nplus1 = initializeBalanceSheet(yearNplus1);
  
  // ========================================
  // ASSETS
  // ========================================
  
  // Cash
  openingBS_Nplus1.cash = endingBS_N.cash;
  
  // Current Assets
  openingBS_Nplus1.accountsReceivable = endingBS_N.accountsReceivable;
  openingBS_Nplus1.prepaidExpenses = endingBS_N.prepaidExpenses;
  
  // Fixed Assets
  openingBS_Nplus1.fixedAssetsGross = endingBS_N.fixedAssetsGross;
  openingBS_Nplus1.accumulatedDepreciation = endingBS_N.accumulatedDepreciation;
  
  // ========================================
  // LIABILITIES
  // ========================================
  
  // Current Liabilities
  openingBS_Nplus1.accountsPayable = endingBS_N.accountsPayable;
  openingBS_Nplus1.accruedExpenses = endingBS_N.accruedExpenses;
  openingBS_Nplus1.deferredRevenue = endingBS_N.deferredRevenue;
  openingBS_Nplus1.shortTermDebt = endingBS_N.shortTermDebt;
  
  // Non-Current Liabilities
  openingBS_Nplus1.longTermDebt = endingBS_N.longTermDebt;
  
  // ========================================
  // EQUITY
  // ========================================
  
  // Share Capital (Foundation: never changes)
  openingBS_Nplus1.shareCapital = endingBS_N.shareCapital;
  
  // Retained Earnings (with prior year net income)
  const priorYearNetIncome = getPL(yearN).netIncome;
  openingBS_Nplus1.retainedEarnings = endingBS_N.retainedEarnings
    .plus(priorYearNetIncome);
  
  // Current Year Net Income (starts at zero)
  openingBS_Nplus1.currentYearNetIncome = new Decimal(0);
  
  // ========================================
  // VALIDATION
  // ========================================
  
  validateOpeningBalance(openingBS_Nplus1);
}
```

---

#### 4.5.2 Asset Pool Continuity

**Fixed Assets Tracking:**

```typescript
interface AssetPool {
  assetId: string;
  description: string;
  acquisitionYear: number;
  originalCost: Decimal;
  usefulLife: number;
  depreciationMethod: 'STRAIGHT_LINE' | 'RATE_BASED';
  annualDepreciation: Decimal;
  accumulatedDepreciation: Decimal;
  netBookValue: Decimal;
  disposalYear?: number;
}

function carryForwardAssetPools(yearN: number): AssetPool[] {
  const pools = getAssetPools(yearN);
  
  return pools.map(pool => {
    // If not disposed, carry forward with updated depreciation
    if (!pool.disposalYear || pool.disposalYear > yearN) {
      return {
        ...pool,
        accumulatedDepreciation: pool.accumulatedDepreciation
          .plus(pool.annualDepreciation),
        netBookValue: pool.originalCost
          .minus(pool.accumulatedDepreciation.plus(pool.annualDepreciation))
      };
    }
    // If disposed in yearN, exclude from yearN+1
    return null;
  }).filter(pool => pool !== null);
}
```

**Example:**
```
Asset Pool Year 2027:
├─ Building (2023): NBV = 30,000,000
├─ Equipment (2025): NBV = 5,000,000
└─ Leasehold (2026): NBV = 8,000,000

Year 2028 (After depreciation and relocation):
├─ Building (2023): NBV = 28,500,000
├─ Equipment (2025): NBV = 4,000,000
├─ Leasehold (2026): DISPOSED
└─ New School (2028): NBV = 48,000,000 (new)

Carried to Year 2029:
├─ Building (2023): NBV = 27,000,000
├─ Equipment (2025): NBV = 3,000,000
└─ New School (2028): NBV = 45,600,000
```

---

#### 4.5.3 Debt Continuity

**Debt Schedule Tracking:**

```typescript
interface DebtSchedule {
  year: number;
  openingBalance: Decimal;
  borrowings: Decimal;
  repayments: Decimal;
  closingBalance: Decimal;
  interestExpense: Decimal;
}

function linkDebt(yearN: number, yearNplus1: number): void {
  const debtN = getDebt(yearN);
  
  // Opening balance Year N+1 = Closing balance Year N
  const openingDebtNplus1 = debtN.closingBalance;
  
  // This becomes starting point for Year N+1 calculations
  setOpeningDebt(yearNplus1, openingDebtNplus1);
}
```

**Example:**
```
Year 2028 Debt:
├─ Opening: 0
├─ Borrowed: 20,000,000
├─ Repaid: 0
└─ Closing: 20,000,000

Year 2029 Debt:
├─ Opening: 20,000,000 ← From 2028 closing
├─ Borrowed: 0
├─ Repaid: (2,000,000)
└─ Closing: 18,000,000

Year 2030 Debt:
├─ Opening: 18,000,000 ← From 2029 closing
├─ Borrowed: 0
├─ Repaid: (2,000,000)
└─ Closing: 16,000,000
```

---

### 4.6 VALIDATION & RECONCILIATION

#### 4.6.1 Balance Sheet Reconciliation

**Every Period Transition:**

```typescript
function validatePeriodTransition(
  yearN: number,
  yearNplus1: number
): ValidationResult {
  
  const checks = [];
  
  // 1. Balance Sheet Balance
  const endingBS_N = getBalanceSheet(yearN);
  const openingBS_Nplus1 = getBalanceSheet(yearNplus1);
  
  // Assets = Liabilities + Equity (both years)
  checks.push(validateBalanceSheetEquation(endingBS_N));
  checks.push(validateBalanceSheetEquation(openingBS_Nplus1));
  
  // 2. Cash Continuity
  checks.push({
    name: 'Cash Continuity',
    pass: endingBS_N.cash.equals(openingBS_Nplus1.cash),
    message: `Cash ${yearN} ending = ${yearNplus1} opening`
  });
  
  // 3. Fixed Assets Continuity
  const expectedGrossFA = endingBS_N.fixedAssetsGross;
  checks.push({
    name: 'Gross Fixed Assets',
    pass: openingBS_Nplus1.fixedAssetsGross.equals(expectedGrossFA),
    message: `Gross FA ${yearN} ending = ${yearNplus1} opening`
  });
  
  // 4. Accumulated Depreciation Continuity
  const expectedAccDep = endingBS_N.accumulatedDepreciation;
  checks.push({
    name: 'Accumulated Depreciation',
    pass: openingBS_Nplus1.accumulatedDepreciation.equals(expectedAccDep),
    message: `Acc Dep ${yearN} ending = ${yearNplus1} opening`
  });
  
  // 5. Retained Earnings Calculation
  const priorNetIncome = getPL(yearN).netIncome;
  const expectedRE = endingBS_N.retainedEarnings.plus(priorNetIncome);
  checks.push({
    name: 'Retained Earnings',
    pass: openingBS_Nplus1.retainedEarnings.equals(expectedRE),
    message: `RE ${yearNplus1} = RE ${yearN} + NI ${yearN}`
  });
  
  // 6. Share Capital (Foundation: should never change)
  checks.push({
    name: 'Share Capital',
    pass: openingBS_Nplus1.shareCapital.equals(endingBS_N.shareCapital),
    message: `Share Capital constant (Foundation structure)`
  });
  
  // 7. All working capital items
  checks.push({
    name: 'Accounts Receivable',
    pass: openingBS_Nplus1.accountsReceivable.equals(endingBS_N.accountsReceivable)
  });
  
  checks.push({
    name: 'Accounts Payable',
    pass: openingBS_Nplus1.accountsPayable.equals(endingBS_N.accountsPayable)
  });
  
  // ... all other items
  
  const allPassed = checks.every(check => check.pass);
  
  return {
    success: allPassed,
    checks: checks,
    message: allPassed 
      ? `Transition ${yearN} → ${yearNplus1} validated successfully`
      : `Transition ${yearN} → ${yearNplus1} validation failed`
  };
}
```

---

#### 4.6.2 Cash Flow Reconciliation

**Every Year:**

```typescript
function validateCashFlowReconciliation(year: number): ValidationResult {
  
  const cf = getCashFlow(year);
  const priorBS = getBalanceSheet(year - 1);
  const currentBS = getBalanceSheet(year);
  
  const checks = [];
  
  // 1. Opening Cash
  checks.push({
    name: 'Opening Cash',
    pass: cf.openingCash.equals(priorBS.cash),
    message: `CF opening = Prior BS closing`
  });
  
  // 2. Closing Cash
  checks.push({
    name: 'Closing Cash',
    pass: cf.closingCash.equals(currentBS.cash),
    message: `CF closing = Current BS cash`
  });
  
  // 3. Net Change
  const calculatedChange = cf.closingCash.minus(cf.openingCash);
  checks.push({
    name: 'Net Change Calculation',
    pass: cf.netChangeInCash.equals(calculatedChange),
    message: `Net change = Closing - Opening`
  });
  
  // 4. Three Activities Sum
  const sumActivities = cf.netCashFromOperations
    .plus(cf.netCashFromInvesting)
    .plus(cf.netCashFromFinancing);
  
  checks.push({
    name: 'Activities Sum',
    pass: cf.netChangeInCash.equals(sumActivities),
    message: `Net change = Sum of three activities`
  });
  
  const allPassed = checks.every(check => check.pass);
  
  return {
    success: allPassed,
    checks: checks
  };
}
```

---

### 4.7 COMPLETE 30-YEAR LINKAGE MAP

**Visual Representation:**

```
2023 [HISTORICAL] ──────────────────┐
                                     │
2024 [HISTORICAL] ──────────────────┤
                                     │
                    [TRANSITION 1]   │
                    2024 → 2025      │
                    • Balances       │
                    • Ratios         │
                    • Methodology    │
                                     │
2025 [TRANSITION] ──────────────────┤
                                     │
2026 [TRANSITION] ──────────────────┤
                                     │
2027 [TRANSITION] ──────────────────┤
                                     │
                    [TRANSITION 2]   │
                    2027 → 2028      │
                    • Balances       │
                    • Staff Base     │
                    • Relocation     │
                    • Rent Model     │
                                     │
2028 [DYNAMIC Y1] ──────────────────┤
                                     │
2029 [DYNAMIC Y2] ──────────────────┤
                                     │
2030 [DYNAMIC Y3] ──────────────────┤
                                     │
...                                  │
                                     │
2051 [DYNAMIC Y24] ─────────────────┤
                                     │
2052 [DYNAMIC Y25] ─────────────────┘

Each arrow represents:
├─ Balance Sheet continuity
├─ Retained Earnings rollforward
├─ Asset pool continuity
├─ Debt continuity
└─ Cash flow reconciliation
```

---

### 4.8 KEY LINKAGE RULES SUMMARY

**1. Balance Sheet Continuity:**
```
Every account balance flows forward year-to-year
No breaks, no resets
```

**2. Retained Earnings:**
```
Opening RE [N+1] = Closing RE [N] + Net Income [N]
Foundation: No dividends ever deducted
```

**3. Cash:**
```
Opening Cash [N+1] = Closing Cash [N]
Must reconcile with Cash Flow Statement
```

**4. Fixed Assets:**
```
Opening Gross [N+1] = Closing Gross [N]
Opening Acc Dep [N+1] = Closing Acc Dep [N]
Asset pools tracked individually
```

**5. Debt:**
```
Opening Debt [N+1] = Closing Debt [N]
Interest accrues on average balance
```

**6. Share Capital (Foundation):**
```
Never changes
No capital injections allowed
Remains constant 2023-2052
```

**7. Methodology Changes:**
```
2024 → 2025: Historical → Transition (ratios begin)
2027 → 2028: Transition → Dynamic (models begin)
Balances unaffected by methodology changes
```

**8. Special Events:**
```
2028 Relocation:
├─ Major CapEx
├─ Asset disposals
├─ Debt financing
└─ All handled within standard linkage framework
```

---

### 4.9 IMPLEMENTATION CHECKLIST

**For Every Year Transition:**

- [ ] Carry forward all Balance Sheet balances exactly
- [ ] Calculate Retained Earnings with prior year Net Income
- [ ] Validate Balance Sheet equation (Assets = Liabilities + Equity)
- [ ] Reconcile Cash Flow (opening, net change, closing)
- [ ] Update asset pools with depreciation
- [ ] Carry forward debt balances
- [ ] Validate all working capital accounts
- [ ] Check Share Capital is constant (Foundation)
- [ ] Ensure no breaks in continuity

**For Special Transitions:**

**2024 → 2025:**
- [ ] Extract and store all 2024 ratios
- [ ] Calculate suggested defaults for admin center
- [ ] Initialize transition period calculations
- [ ] Validate historical to transition linkage

**2027 → 2028:**
- [ ] Calculate Staff Cost Base 2028
- [ ] Initialize rent model
- [ ] Handle relocation events (CapEx, disposals, financing)
- [ ] Initialize dynamic period calculations
- [ ] Validate transition to dynamic linkage

---

## PART 5: INPUT REQUIREMENTS & OWNERSHIP

### 5.1 OVERVIEW

**Purpose:** Define all required inputs for the 30-year financial model, organized by role and period.

**Three User Roles:**
1. **ADMIN** - Historical data setup and system configuration (one-time)
2. **PLANNER** - All projection inputs for transition and dynamic periods (ongoing)
3. **VIEWER** - Read-only access to outputs (no inputs required)

**Key Principle:** ALL inputs are pre-filled with intelligent defaults. Users review and modify as needed.

---

### 5.2 ADMIN INPUTS (One-time Setup)

#### 5.2.1 Historical Data (2023-2024)

**Source:** Import from accounting system or manual entry

| Category | Data Required | Format | Notes |
|----------|---------------|--------|-------|
| **P&L Actuals** | All revenue line items | SAR amounts | Complete income statement |
| | All expense line items | SAR amounts | All operating expenses |
| | Net Income | SAR amounts | Bottom line |
| **Balance Sheet Actuals** | All asset accounts | SAR amounts | Complete assets |
| | All liability accounts | SAR amounts | All liabilities |
| | All equity accounts | SAR amounts | Share capital & retained earnings |
| **Fixed Assets Register** | Gross fixed assets | SAR amounts | Historical cost |
| | Accumulated depreciation | SAR amounts | Depreciation to date |

**Pre-fill:** Import wizard or manual entry forms  
**User Action:** Enter/import once, then confirm

---

#### 5.2.2 System Settings (Apply to All Periods 2025-2052)

| Setting | Pre-fill | Type | Range | Notes |
|---------|----------|------|-------|-------|
| **Zakat Rate** | 2.5% | % | 0-5% | Saudi Arabian standard |
| **Debt Interest Rate** | 5% | % | 0-20% | Annual interest rate |
| **Minimum Cash Balance** | 1,000,000 SAR | SAR | >0 | Auto-balancing threshold |

**Pre-fill:** Industry/regulatory standards  
**User Action:** Review and modify if different

---

#### 5.2.3 Working Capital Drivers (Apply to All Periods 2025-2052)

| Driver | Pre-fill Source | Example | Locked? | Notes |
|--------|----------------|---------|---------|-------|
| **Accounts Receivable %** | (AR 2024 / Revenue 2024) × 100 | 8.2% | ✅ Yes | % of Revenue |
| **Prepaid Expenses %** | (Prepaid 2024 / OpEx 2024) × 100 | 4% | ✅ Yes | % of Total OpEx |
| **Accounts Payable %** | (AP 2024 / OpEx 2024) × 100 | 12% | ✅ Yes | % of Total OpEx |
| **Accrued Expenses %** | (Accrued 2024 / OpEx 2024) × 100 | 5.5% | ✅ Yes | % of Total OpEx |
| **Deferred Revenue %** | (Deferred 2024 / Revenue 2024) × 100 | 15% | ✅ Yes | % of Revenue |

**Pre-fill:** Auto-calculated from 2024 actuals  
**User Action:** Review only (cannot modify - locked for consistency)  
**Applied to:** All periods 2025-2052

**Calculation Example:**
```typescript
const ar_percent = (actuals_2024.accountsReceivable / actuals_2024.totalRevenue) × 100;
// If AR = 8,200,000 and Revenue = 100,000,000
// Then ar_percent = 8.2%
```

---

### 5.3 PLANNER INPUTS

#### 5.3.1 Transition Period (2025-2027)

##### **Revenue Inputs**

| Input | Pre-fill Logic | Year | Example | Type | User Action |
|-------|---------------|------|---------|------|-------------|
| **Number of Students** | 2024 students × 1.05 | 2025 | 1,890 | Number | Modify per actual plan |
| | 2025 students × 1.05 | 2026 | 1,985 | Number | Modify per actual plan |
| | 2026 students × 1.05 | 2027 | 2,084 | Number | Modify per actual plan |
| **Average Tuition per Student** | 2024 avg tuition × 1.05 | 2025 | 54,000 SAR | SAR | Modify per actual plan |
| | 2025 avg tuition × 1.05 | 2026 | 56,700 SAR | SAR | Modify per actual plan |
| | 2026 avg tuition × 1.05 | 2027 | 59,535 SAR | SAR | Modify per actual plan |

**Pre-fill Logic:** 5% annual growth from 2024 baseline  
**Total Inputs:** 6 (3 years × 2 inputs)

---

##### **Rent Input**

| Input | Pre-fill | Type | Range | Notes |
|-------|----------|------|-------|-------|
| **Annual Rent Growth %** | 5% | % | 0-20% | Applied to 2024 rent base |

**Pre-fill Logic:** Standard escalation rate  
**Total Inputs:** 1

**Calculation:**
```
Rent 2025 = Rent 2024 × (1 + 5%) = Rent 2024 × 1.05
Rent 2026 = Rent 2024 × (1 + 5%)^2
Rent 2027 = Rent 2024 × (1 + 5%)^3
```

---

##### **Other Inputs (Auto-calculated)**

| Item | Source | Notes |
|------|--------|-------|
| **Staff Costs** | 2024 ratio (auto-calc) | (Staff 2024 / Revenue 2024) × Revenue Current |
| **Other OpEx** | 2024 ratio (auto-calc) | (Other OpEx 2024 / Revenue 2024) × Revenue Current |

**No planner input required** - System calculates from Admin's 2024 data

---

#### 5.3.2 Dynamic Period (2028-2052)

##### **Revenue - French Curriculum (ALWAYS ACTIVE)**

| Input | Pre-fill Logic | Example | Type | Range | Notes |
|-------|---------------|---------|------|-------|-------|
| **Student Capacity** | 2027 students × 1.10 | 2,300 | Number | >0 | Total capacity at new location |
| **Ramp-up % Year 1 (2028)** | 20% (standard) | 20% | % | 0-100% | First year utilization |
| **Ramp-up % Year 2 (2029)** | 40% (standard) | 40% | % | 0-100% | Second year utilization |
| **Ramp-up % Year 3 (2030)** | 60% (standard) | 60% | % | 0-100% | Third year utilization |
| **Ramp-up % Year 4 (2031)** | 80% (standard) | 80% | % | 0-100% | Fourth year utilization |
| **Ramp-up % Year 5 (2032)** | 100% (standard) | 100% | % | 0-100% | Full capacity |
| **Base Tuition 2028** | 2027 tuition × 1.05 | 62,512 SAR | SAR | >0 | Starting tuition |
| **Tuition Growth Rate** | 5% (standard) | 5% | % | 0-20% | Annual growth rate |
| **Tuition Growth Frequency** | 1 year (annual) | 1 | Years | 1-5 | How often tuition increases |

**Pre-fill Logic:** 
- Capacity: 10% buffer above 2027 enrollment
- Ramp-up: Standard 5-year plan
- Tuition: Continue 5% growth trend

**Total Inputs:** 9

---

##### **Revenue - IB Curriculum (OPTIONAL)**

| Input | Pre-fill | Example | Type | Range | Notes |
|-------|----------|---------|------|-------|-------|
| **Enable IB Curriculum?** | No (disabled) | No | Yes/No | - | Turn on if offering IB |
| **Student Capacity** | 0 (if disabled) | 500 | Number | >0 | IB-specific capacity |
| **Ramp-up % Year 1-5** | 20/40/60/80/100 | Same as FR | % | 0-100% | Standard ramp-up |
| **Base Tuition 2028** | 0 (if disabled) | 60,000 SAR | SAR | >0 | IB tuition (higher than FR) |
| **Tuition Growth Rate** | 5% (if enabled) | 5% | % | 0-20% | Same as FR default |
| **Tuition Growth Frequency** | 1 year (if enabled) | 1 | Years | 1-5 | Same as FR default |

**Pre-fill Logic:** 
- Default: Disabled (not all schools offer IB)
- If enabled: Same patterns as FR curriculum

**Total Inputs:** 6 (if enabled)

---

##### **Staff Costs**

| Input | Pre-fill Logic | Example | Type | Range | Notes |
|-------|---------------|---------|------|-------|-------|
| **Students per Teacher** | 14 (industry standard) | 14 | Number | >0 | Class size basis |
| **Students per Non-Teacher** | 25 (industry standard) | 25 | Number | >0 | Support staff ratio |
| **Teacher Monthly Salary (2028)** | Extrapolated from 2024 + CPI | 16,500 SAR | SAR | >0 | Base year salary |
| **Non-Teacher Monthly Salary (2028)** | Extrapolated from 2024 + CPI | 11,000 SAR | SAR | >0 | Base year salary |
| **CPI Rate** | 3% (standard) | 3% | % | 0-10% | Salary inflation rate |
| **CPI Frequency** | 1 year (annual) | 1 | Years | 1-3 | How often salaries increase |

**Pre-fill Logic:**
- Ratios: Industry standards for schools
- Salaries: Back-calculated from 2024 staff costs, then grown by CPI to 2028
- CPI: Economic forecast

**Total Inputs:** 6

**Calculation Example (2028 Base):**
```typescript
// Step 1: Calculate implied 2024 salaries from actuals
const totalStaff2024 = staffCosts2024 / 12; // Monthly
const impliedTeacherSalary2024 = calculateFromRatios();

// Step 2: Grow to 2028 (4 years at 3% CPI)
const teacherSalary2028 = impliedTeacherSalary2024 × (1.03)^4;

// Pre-fill in form
teacherMonthlySalary2028 = 16,500 SAR
```

---

##### **Rent Model Selection**

| Input | Pre-fill | Options | Notes |
|-------|----------|---------|-------|
| **Rent Model** | Fixed Escalation | Fixed Escalation / Revenue Share / Partner Model | Choose ONE model |

**User selects ONE model, then provides specific parameters:**

---

###### **OPTION A: FIXED ESCALATION MODEL**

| Input | Pre-fill Logic | Example | Type | Range | Notes |
|-------|---------------|---------|------|-------|-------|
| **Base Rent 2028** | 2027 rent × 1.05 | 13,310,000 SAR | SAR | >0 | Starting rent |
| **Rent Growth Rate** | 3% (standard) | 3% | % | 0-10% | Annual escalation |
| **Growth Frequency** | 1 year (annual) | 1 | Years | 1-5 | How often rent increases |

**Pre-fill Logic:** Extrapolate from transition period  
**Total Inputs:** 3

**Calculation:**
```
Rent [Year N] = Base Rent 2028 × (1 + Growth Rate)^period
Where: period = floor((Year - 2028) / Frequency)

Example (Annual):
Year 2028: 13,310,000 × (1.03)^0 = 13,310,000
Year 2029: 13,310,000 × (1.03)^1 = 13,709,300
Year 2030: 13,310,000 × (1.03)^2 = 14,120,579
```

---

###### **OPTION B: REVENUE SHARE MODEL**

| Input | Pre-fill | Example | Type | Range | Notes |
|-------|----------|---------|------|-------|-------|
| **Revenue Share %** | 8% (standard) | 8% | % | 0-20% | Percentage of total revenue |

**Pre-fill Logic:** Conservative market standard  
**Total Inputs:** 1

**Calculation:**
```
Rent = Total Revenue × Revenue Share %

Example:
If Revenue = 100,000,000 SAR
Revenue Share % = 8%
Rent = 100,000,000 × 8% = 8,000,000 SAR
```

**Note:** Pure percentage-based. Recalculated annually. No minimum rent, no frequency needed.

---

###### **OPTION C: PARTNER MODEL (INVESTMENT-BASED)**

| Input | Pre-fill | Example | Type | Range | Notes |
|-------|----------|---------|------|-------|-------|
| **Land Size** | Empty (user must enter) | 10,000 | m² | >0 | Total land area |
| **Land Price per m²** | 5,000 SAR (Riyadh avg) | 5,000 | SAR/m² | >0 | Market land price |
| **BUA Size** | Empty (user must enter) | 8,000 | m² | >0 | Built-up area |
| **Construction Cost per m²** | 7,500 SAR (standard) | 7,500 | SAR/m² | >0 | All-in construction |
| **Yield Rate** | 8% (market standard) | 8% | % | 5-15% | Annual ROI expectation |
| **Growth Rate** | 3% (CPI-linked) | 3% | % | 0-10% | Rent escalation |
| **Growth Frequency** | 1 year (annual) | 1 | Years | 1-5 | How often rent increases |

**Pre-fill Logic:** 
- Sizes: Must be entered (project-specific)
- Prices: Market averages for Riyadh
- Yield: Educational property standard

**Total Inputs:** 7

**Calculation:**
```
Step 1: Total Investment
= (Land Size × Land Price) + (BUA Size × Construction Cost)
= (10,000 × 5,000) + (8,000 × 7,500)
= 50,000,000 + 60,000,000
= 110,000,000 SAR

Step 2: Base Rent 2028
= Total Investment × Yield Rate
= 110,000,000 × 8%
= 8,800,000 SAR

Step 3: Annual Rent
Rent [Year N] = Base Rent × (1 + Growth Rate)^period
Where: period = floor((Year - 2028) / Frequency)

Example (Annual):
Year 2028: 8,800,000 × (1.03)^0 = 8,800,000
Year 2029: 8,800,000 × (1.03)^1 = 9,064,000
Year 2030: 8,800,000 × (1.03)^2 = 9,335,920
```

---

##### **Other Operating Expenses**

| Input | Pre-fill Source | Example | Type | Range | Notes |
|-------|----------------|---------|------|-------|-------|
| **Other OpEx % of Revenue** | (Other OpEx 2024 / Revenue 2024) × 100 | 46% | % | 0-100% | Single percentage for all other OpEx |

**Pre-fill Logic:** Auto-calculated from 2024 actuals  
**Total Inputs:** 1

**User Action:** 
- Accept default (maintain 2024 efficiency)
- Reduce % (efficiency improvements)
- Increase % (additional services)

---

##### **CapEx Planning**

**Source:** Managed via Auto-Reinvestment Module (separate admin function)

| Component | Managed By | Notes |
|-----------|------------|-------|
| **CapEx Additions** | Auto-Reinvestment Module | Admin configures reinvestment rules |
| **Asset Disposals** | On-demand entry | User adds when disposal occurs |

**No inputs in this section** - CapEx is handled through separate module

**User Action:** Configure CapEx module separately in admin settings

---

### 5.4 INPUT SUMMARY BY ROLE

#### **ADMIN INPUTS (One-time Setup)**

| Category | Inputs | Effort |
|----------|--------|--------|
| Historical Data (2023-2024) | ~50-100 line items | 1-2 hours (import) |
| System Settings | 3 settings | 10 minutes |
| Working Capital Drivers | 5 percentages (auto-calc, review only) | 5 minutes |
| **TOTAL ADMIN** | **~58-108 items** | **~1.5-2.5 hours** |

---

#### **PLANNER INPUTS - TRANSITION (2025-2027)**

| Category | Inputs | Effort |
|----------|--------|--------|
| Student Counts | 3 (one per year) | 5 minutes |
| Average Tuition | 3 (one per year) | 5 minutes |
| Rent Growth | 1 percentage | 2 minutes |
| **TOTAL TRANSITION** | **7 inputs** | **~10-15 minutes** |

---

#### **PLANNER INPUTS - DYNAMIC (2028-2052)**

| Category | Inputs | Effort |
|----------|--------|--------|
| FR Curriculum | 9 inputs | 10 minutes |
| IB Curriculum (if enabled) | 6 inputs | 5 minutes |
| Staff Costs | 6 inputs | 5 minutes |
| Rent Model: Fixed Escalation | 3 inputs | 3 minutes |
| Rent Model: Revenue Share | 1 input | 1 minute |
| Rent Model: Partner Model | 7 inputs | 10 minutes |
| Other OpEx | 1 input | 2 minutes |
| **TOTAL DYNAMIC** | **17-33 inputs** | **~20-40 minutes** |

*(Range depends on IB enablement and rent model selected)*

---

#### **GRAND TOTAL - ALL INPUTS**

| Role | Category | Inputs | Pre-filled? | Effort |
|------|----------|--------|-------------|--------|
| **ADMIN** | Setup | ~58-108 | Partially | 1.5-2.5 hours |
| **PLANNER** | Transition | 7 | ✅ Yes | 10-15 mins |
| **PLANNER** | Dynamic | 17-33 | ✅ Yes | 20-40 mins |
| **TOTAL** | **All** | **~82-148** | **~85% pre-filled** | **~2-3.5 hours** |

---

### 5.5 PRE-FILL SOURCES

**Intelligent Defaults by Source:**

| Pre-fill Source | Count | Examples |
|-----------------|-------|----------|
| **Auto-calculated from 2024** | ~10 | Working capital %, Other OpEx %, salary extrapolations |
| **Industry standards** | ~8 | Students/teacher ratios, standard ramp-up patterns |
| **Market standards** | ~6 | Zakat 2.5%, CPI 3%, interest 5% |
| **Regulatory standards** | ~2 | Zakat rate, minimum cash |
| **Extrapolated trends** | ~9 | Student growth, tuition growth, capacity planning |
| **Empty (user must enter)** | ~2-4 | Land size, BUA size (Partner Model only) |

**Result:** ~75-85% of inputs pre-filled with intelligent defaults!

---

### 5.6 INPUT VALIDATION RULES

#### **Required Fields (Cannot be empty):**
- ✅ All 2024 historical data
- ✅ Transition student counts (3 years)
- ✅ Transition average tuition (3 years)
- ✅ FR Curriculum capacity and base tuition
- ✅ Staff ratios and 2028 salaries
- ✅ Rent model selection and all model parameters
- ✅ Other OpEx percentage

#### **Optional Fields:**
- IB Curriculum (entire section - can remain disabled)
- CapEx beyond auto-reinvestment module

#### **Range Validations:**

| Field Type | Validation Rule |
|------------|----------------|
| Percentages | 0% to 100% |
| Growth rates | 0% to 20% (reasonable bounds) |
| Frequencies | 1 to 5 years |
| SAR amounts | > 0 (must be positive) |
| Student counts | > 0 (must have students) |
| Ratios | > 0 (must be positive) |

---

### 5.7 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN (One-time)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Import 2024 Historical Data                          │
│     ├─ P&L Actuals                                       │
│     ├─ Balance Sheet Actuals                             │
│     └─ Fixed Assets                                      │
│                                                           │
│  2. System Auto-calculates                                │
│     ├─ Working Capital % (LOCKED)                        │
│     ├─ Other OpEx % (suggestion)                         │
│     └─ Staff Cost ratios (reference)                     │
│                                                           │
│  3. Admin Reviews & Confirms                              │
│     ├─ Zakat rate (2.5%)                                 │
│     ├─ Interest rate (5%)                                │
│     └─ Min cash (1M)                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            ↓
                   Setup Complete ✓
                            ↓
┌─────────────────────────────────────────────────────────┐
│                PLANNER - TRANSITION (2025-2027)          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  System Pre-fills (5% growth from 2024):                 │
│  ├─ Students: 1,890 / 1,985 / 2,084                     │
│  ├─ Avg Tuition: 54K / 56.7K / 59.5K                    │
│  └─ Rent Growth: 5%                                      │
│                                                           │
│  Planner Reviews & Modifies                               │
│  └─ Adjust to actual enrollment plans                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            ↓
                 Transition Ready ✓
                            ↓
┌─────────────────────────────────────────────────────────┐
│                PLANNER - DYNAMIC (2028-2052)             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  System Pre-fills:                                        │
│  ├─ FR Capacity: 2,300 (10% buffer)                     │
│  ├─ Ramp-up: 20/40/60/80/100%                           │
│  ├─ Tuition: 62.5K, 5% growth, annual                   │
│  ├─ Staff: 14:1, 25:1 ratios                            │
│  ├─ Salaries: 16.5K / 11K (extrapolated)                │
│  ├─ Rent: Fixed Escalation 13.3M, 3%, annual            │
│  └─ Other OpEx: 46%                                      │
│                                                           │
│  Planner Reviews & Modifies:                              │
│  ├─ Enable IB? (if offering)                             │
│  ├─ Select rent model                                    │
│  ├─ Adjust growth assumptions                            │
│  └─ Fine-tune operational parameters                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            ↓
                    Model Complete ✓
                            ↓
┌─────────────────────────────────────────────────────────┐
│              SYSTEM GENERATES (Automatic)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  30-Year Financial Projection (2023-2052)                │
│  ├─ P&L Statements (30 years)                            │
│  ├─ Balance Sheets (30 years)                            │
│  ├─ Cash Flow Statements (30 years)                      │
│  └─ Financial Ratios & KPIs                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   VIEWER (Read-only)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Access All Outputs:                                      │
│  ├─ Financial Statements                                 │
│  ├─ Reports & Dashboards                                 │
│  ├─ Charts & Visualizations                              │
│  └─ Export capabilities                                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

### 5.8 INPUT CHECKLIST (Implementation Guide)

#### **ADMIN CHECKLIST:**
- [ ] Historical P&L data (2023-2024) entered/imported
- [ ] Historical Balance Sheet data (2023-2024) entered/imported
- [ ] Fixed Assets register entered/imported
- [ ] System settings reviewed (Zakat, interest, min cash)
- [ ] Working capital percentages reviewed (auto-calculated, locked)
- [ ] Setup marked complete

#### **PLANNER CHECKLIST - TRANSITION:**
- [ ] Student counts reviewed/modified (2025-2027)
- [ ] Average tuition reviewed/modified (2025-2027)
- [ ] Rent growth percentage set
- [ ] Transition period marked complete

#### **PLANNER CHECKLIST - DYNAMIC:**

**Revenue:**
- [ ] FR Curriculum capacity set
- [ ] FR Ramp-up plan reviewed (5 years)
- [ ] FR Base tuition 2028 set
- [ ] FR Tuition growth rate & frequency set
- [ ] IB Curriculum decision (enable/disable)
- [ ] IB Parameters set (if enabled)

**Operating Costs:**
- [ ] Students per teacher set
- [ ] Students per non-teacher set
- [ ] Teacher salary 2028 set
- [ ] Non-teacher salary 2028 set
- [ ] CPI rate & frequency set
- [ ] Other OpEx percentage reviewed/set

**Rent:**
- [ ] Rent model selected
- [ ] Rent model parameters entered
- [ ] Rent calculations validated

**Final:**
- [ ] All required fields complete
- [ ] All pre-fills reviewed
- [ ] Dynamic period marked complete

---

### 5.9 TIPS FOR EFFICIENT INPUT

**For Admin:**
1. **Import don't type** - Use accounting system export/import
2. **Verify balances** - Ensure Balance Sheet balances before proceeding
3. **Trust auto-calculations** - Working capital % are accurate from your data

**For Planner:**
1. **Start with defaults** - Run model with pre-fills first to see baseline
2. **Modify incrementally** - Change one variable at a time to see impact
3. **Use scenarios** - Save different versions for comparison
4. **Validate reasonableness** - Check that outputs make business sense

**For Both:**
1. **Document assumptions** - Note why you changed defaults
2. **Review annually** - Update assumptions as business evolves
3. **Validate with actuals** - Compare projections to actuals regularly

---

## APPENDIX A: THE 2024 BASELINE PRINCIPLE

**Year 2024 is the bridge between periods.**

**What 2024 Provides:**

1. **For Transition Period (2025-2027):**
   ```
   Staff Cost Ratio = Staff Costs 2024 / Revenue 2024
   OpEx Ratio = OpEx 2024 / Revenue 2024
   Rent Baseline = Rent 2024 (for growth calculations)
   Other Revenue Ratio = Other Revenue 2024 / FR Tuition 2024 (FR only - IB not active in transition)
   Depreciation = Fixed amount for OLD assets
   Closing Balances = Opening balances for 2025
   ```

2. **Example Application:**
   ```
   2024 Actuals:
   ├─ FR Tuition: 80M SAR (base for other revenue ratio)
   ├─ IB Tuition: 0 SAR (or minimal - not used in transition)
   ├─ Total Revenue: 100M SAR
   ├─ Staff Costs: 40M SAR → Ratio: 40% of revenue
   ├─ OpEx: 15M SAR → Ratio: 15% of revenue
   ├─ Rent: 10M SAR
   └─ Other Revenue: 8M SAR → Ratio: 10% of FR tuition
   
   2025 Projection (Transition):
   ├─ Number of Students: 1,800 (all FR)
   ├─ Avg Tuition: 50,000 SAR
   ├─ FR Tuition Revenue: 1,800 × 50,000 = 90M SAR
   ├─ IB Tuition Revenue: 0 SAR (NOT ACTIVE)
   ├─ Other Revenue: 90M × 10% = 9M SAR
   ├─ Total Revenue: 99M SAR
   ├─ Staff Costs: 99M × 40% = 39.6M SAR
   ├─ OpEx: 99M × 15% = 14.85M SAR
   └─ Rent: 10M × (1 + 5%) = 10.5M SAR
   
   2028 Projection (Dynamic - IB Optional):
   ├─ FR Revenue: 95M SAR (CPI growth from base)
   ├─ IB Revenue: 5M SAR (if IB active) OR 0 SAR (if not active)
   ├─ Total Tuition: 100M SAR (or 95M if IB not active)
   ├─ Other Revenue: 100M × 10% = 10M SAR
   ├─ Total Revenue: 110M SAR
   ├─ Staff Costs: Calculated with CPI growth from 2028 base
   └─ Rent: Calculated per rent model
   ```

**Key Insight:** Transition period maintains 2024 business model proportions while scaling to different enrollment levels.

---

## APPENDIX B: QUICK REFERENCE TABLES

### Period Comparison Matrix

| Line Item | HISTORICAL | TRANSITION | DYNAMIC |
|-----------|-----------|------------|---------|
| **FR Revenue** | Direct from DB | avgTuition × students | BaseFR × (1+TuitionGrowthRate)^p × students |
| **IB Revenue** | Direct from DB (may be 0) | **0 (NOT ACTIVE)** | Optional: BaseIB × (1+TuitionGrowthRate)^p × students OR 0 |
| **Other Revenue** | Direct from DB | (OtherRev2024/FRTuition2024) × TuitionCurrent | (OtherRev2024/FRTuition2024) × TuitionCurrent |
| **Total Revenue** | Direct from DB | FR + Other | FR + IB (if active) + Other |
| **Staff Costs** | Direct from DB | (StaffCosts2024/Revenue2024) × RevenueCurrent | Base2028 × (1+CPI)^period |
| **Rent** | Direct from DB | Rent2024 × (1+growthPercent) | Rent Model (3 options) |
| **Other OpEx** | Direct from DB | (OtherOpEx2024/Revenue2024) × RevenueCurrent | Revenue × otherOpexPercent |
| **EBITDA** | Direct from DB | Revenue - Salaries - Rent - Other OpEx | Revenue - Salaries - Rent - Other OpEx |
| **Depreciation** | Direct from DB | OLD (fixed) + NEW (rate) | OLD (fixed) + NEW (rate) |
| **Interest** | Direct from DB | Circular Solver | Circular Solver |
| **Zakat** | Direct from DB | Circular Solver | Circular Solver |

---

### Calculation Methods by Period

**Transition Period (2025-2027):**

| Item | Method | Formula |
|------|--------|---------|
| Revenue | Direct input × average tuition | avgTuition × numberOfStudents |
| Staff Costs | 2024 ratio | (StaffCosts2024 / Revenue2024) × RevenueCurrent |
| Rent | 2024 base + growth % | Rent2024 × (1 + growthPercent) |
| Other OpEx | 2024 ratio | (OtherOpEx2024 / Revenue2024) × RevenueCurrent |
| Depreciation | Fixed OLD + Rate NEW | OLD: Fixed amount, NEW: Rate-based |

**Dynamic Period (2028-2052):**

| Item | Method | Formula |
|------|--------|---------|
| Revenue | Curriculum plans with **Tuition Growth Rate** | Base × (1 + TuitionGrowthRate)^period × students |
| Staff Costs | Base2028 with CPI | Base2028 × (1 + CPI)^period |
| Rent | Selected rent model | Fixed Escalation OR Revenue Share OR Partner Model |
| Other OpEx | Single percentage | Revenue × otherOpexPercent |
| Depreciation | Asset pool tracking | Rate-based on NBV |

**Key Differences:**
- Transition: Single method only (2024 ratio-based)
- Dynamic: Tuition Growth Rate (NOT CPI) for revenue
- Dynamic: Other OpEx is single percentage (NOT ratio or sub-accounts)

---

## APPENDIX C: VALIDATION RULES

### Historical Period Validation
- [ ] All data from historical_actuals table
- [ ] No calculations performed
- [ ] All fields populated
- [ ] 2024 data correctly stored for ratio extraction

### Transition Period Validation
- [ ] Revenue driven by student count × average tuition
- [ ] IB curriculum NOT active (IB Revenue = 0)
- [ ] Staff costs use 2024 ratio (single method)
- [ ] Other OpEx uses 2024 ratio (single method)
- [ ] Rent = 2024 rent × (1 + growth%)
- [ ] No rent models used
- [ ] OLD assets depreciate at fixed amount
- [ ] NEW assets depreciate at specified rate

### Dynamic Period Validation
- [ ] Tuition calculated with **Tuition Growth Rate** from 2028 base (NOT CPI)
- [ ] Revenue separated by curriculum (FR + IB if active)
- [ ] Staff costs grown with CPI from 2028 base
- [ ] Rent calculated using selected model (3 options)
- [ ] Other OpEx calculated as single percentage of revenue
- [ ] Asset pools tracked separately
- [ ] OLD assets fully depreciated by expected year

---

## CHANGE LOG

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 4.1 | Nov 22, 2025 | **INPUT REQUIREMENTS COMPLETE - PART 5 ADDED**: (1) Complete input catalog by role (Admin, Planner, Viewer) (2) Historical data requirements (3) System settings (4) Working capital drivers (locked, auto-calculated) (5) Transition period inputs (7 total) (6) Dynamic period inputs (17-33 total depending on selections) (7) All three rent models with complete parameters (Fixed: 3 inputs, Revenue Share: 1 input, Partner: 7 inputs) (8) Pre-fill sources and logic documented (9) Input validation rules (10) Data flow diagram (11) Implementation checklists (12) ~75-85% inputs pre-filled with intelligent defaults **COMPLETE PRODUCTION-READY DOCUMENTATION** | Faker (CAO) |
| 4.0 | Nov 22, 2025 | **PERIOD LINKAGE RULES COMPLETE - ALL FINANCIAL RULES DOCUMENTED**: (1) General linkage principles (Balance Sheet continuity, Retained Earnings rollforward, Cash flow) (2) Transition 1: Historical→Transition (2024→2025) with ratio extraction (3) Transition 2: Transition→Dynamic (2027→2028) with Staff Base 2028 calculation and relocation handling (4) Year-to-year linkages with asset pool continuity (5) Debt schedule tracking (6) Complete validation & reconciliation rules (7) 30-year linkage map (2023-2052) (8) Foundation equity rules (Share Capital constant, no dividends) (9) Implementation checklist **PROJECT ZETA FINANCIAL RULES 100% COMPLETE** | Faker (CAO) |
| 3.0 | Nov 22, 2025 | **CASH FLOW STATEMENT COMPLETE**: (1) Indirect method implementation (start from Net Income) (2) Operating activities with non-cash adjustments (Depreciation, Zakat) (3) Working capital changes (AR, Prepaid, AP, Accrued, Deferred Revenue) (4) Zakat timing: Accrued in Year N, paid April Year N+1 (5) Investing activities (CapEx purchases & disposals) (6) Financing activities (Debt movements, foundation = no equity) (7) Complete cash reconciliation (8) Full TypeScript implementation (9) Examples for normal year (2025) and relocation year (2028) (10) Validation rules **THREE FINANCIAL STATEMENTS COMPLETE** | Faker (CAO) |
| 2.1 | Nov 22, 2025 | Fixed Appendix B & C errors: (1) Removed Priority 1/2/3 columns for Transition period (single method only, no priorities) (2) Changed Dynamic period revenue from CPI to **Tuition Growth Rate** (3) Clarified Other OpEx is single percentage in Dynamic (not sub-accounts) (4) Updated validation rules to match actual specifications | Faker (CAO) |
| 2.0 | Nov 22, 2025 | **BALANCE SHEET COMPLETE**: (1) Full Balance Sheet structure defined (Assets, Liabilities, Equity) (2) Working capital drivers with 2024-based suggestions (AR, Prepaid, AP, Accrued, Deferred Revenue) (3) Cash auto-balancing with 1M minimum (4) Debt management (auto-balancing) (5) Foundation equity structure (no injections/dividends) (6) Fixed assets with CapEx module integration (additions & disposals) (7) Same formulas for Transition (2025-2027) and Dynamic (2028-2052) (8) Complete TypeScript implementation (9) Admin center configuration (10) Example Balance Sheet with ratios | Faker (CAO) |
| 1.9 | Nov 22, 2025 | Finalized P&L statement format: (1) Defined exact 10-line financial statement structure (2) Revenue, Salaries, Rent, Other OpEx, EBITDA, Depreciation, Interest (Net), EBT, Zakat, Net Income (3) Added calculation flow with TypeScript code (4) Included example presentation with numbers (5) Added supporting detail breakdown notes (6) **P&L SECTION COMPLETE - Ready for Implementation** | Faker (CAO) |
| 1.8 | Nov 22, 2025 | Simplified Zakat calculation to single method: (1) Zakat based on Equity - Non-Current Assets (2) Formula: Zakat = (Equity - Non-Current Assets) × Zakat Rate (3) Removed income-based calculation option (4) Removed zakatCalculationMethod field (5) Aligns with Saudi Arabian Zakat regulations for net working capital (6) Single zakatRate input (e.g., 2.5%) | Faker (CAO) |
| 1.7 | Nov 22, 2025 | Clarified OpEx structure and calculation: (1) Total OpEx = Rent + Staff Costs + Other OpEx (all periods) (2) Transition: Other OpEx uses 2024 ratio (3) Dynamic: Other OpEx is single percentage (e.g., 46%) applied to ALL years (4) Removed sub-account complexity for dynamic period (5) Simplified to three-component model throughout | Faker (CAO) |
| 1.6 | Nov 22, 2025 | Changed staff costs calculation input from ratios to students per staff: (1) Changed from teacherRatio to studentsPerTeacher (2) Changed from nonTeacherRatio to studentsPerNonTeacher (3) Formula changed from multiplication to division: Teachers = Students / StudentsPerTeacher (4) More intuitive input (e.g., "14 students per teacher" instead of "0.0714 ratio") (5) Updated examples to reflect new calculation method | Faker (CAO) |
| 1.5 | Nov 22, 2025 | Changed dynamic period tuition calculation from CPI-based to tuition growth rate-based: (1) Tuition growth rate separate from CPI (2) Configurable tuition growth frequency (1-5 years) (3) Each curriculum can have different growth rate (4) Added tuitionGrowthRate and tuitionGrowthFrequency fields (5) Updated formula: Tuition = Base × (1 + Growth Rate)^period (6) Added examples for annual, biennial, and triennial growth scenarios | Faker (CAO) |
| 1.4 | Nov 22, 2025 | Updated dynamic period student enrollment: (1) Students now based on capacity × ramp-up % for first 5 years (2028-2032) (2) Years 6+ (2033-2052) use Year 5 enrollment (steady state) (3) Added calculateStudentEnrollment function (4) Ramp-up plan structure defined with 5-year percentages (5) Examples updated to show capacity-based calculation | Faker (CAO) |
| 1.3 | Nov 22, 2025 | Simplified and enhanced P&L calculations: (1) Staff costs transition: single ratio-based formula only (removed 3-mode complexity) (2) Staff costs dynamic: detailed 2028 base from teacher/student ratios, CPI growth from Y+1 (2029+) (3) OpEx transition: single ratio-based formula only (4) OpEx dynamic: percentage-based only (removed fixed amount complexity) (5) Added CapEx section (admin-managed module for both periods) (6) Added Interest calculation (average bank position method with circular dependency) (7) Added Zakat calculation (income/equity-based with circular dependency, can be 0%) | Faker (CAO) |
| 1.2 | Nov 22, 2025 | Added IB curriculum availability rules: (1) IB NOT active during transition period (2025-2027) - only FR operates (2) IB optional during dynamic period (2028-2052) (3) Updated other revenue ratio to use FR tuition only for consistency (4) Added IB availability check logic | Faker (CAO) |
| 1.1 | Nov 22, 2025 | Updated revenue calculations: (1) Transition period numberOfStudents is direct input, no capacity needed (2) averageTuitionPerStudent required for each transition year (3) Other revenue automatically calculated using 2024 ratio for both transition and dynamic periods | Faker (CAO) |
| 1.0 | Nov 22, 2025 | Initial P&L section complete with depreciation rules | Faker (CAO) |

---

**END OF DOCUMENT**

*Next sections to be added: Balance Sheet, Cash Flow, Period Linkage*
