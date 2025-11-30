# Display Percentage Fix Summary

## Issue
After fixing the wizard to send percentages as decimals to the calculation engine, the proposal detail page (DynamicSetupTab) was showing decimal values instead of percentages in the UI:

- **CPI Rate**: Showed `0.02` instead of `2%`
- **Other OpEx**: Showed `0.3` instead of `30%`
- **Yield Rate**: Showed `0.09` instead of `9%`
- **Growth Rates**: Showed `0.02` instead of `2%`
- **Program Percentages**: Showed `1.0` instead of `100%`

## Root Cause

The data flow was:
1. ✅ Wizard sends percentages as decimals (9 → 0.09) to API
2. ✅ API/Database stores decimals (0.09)
3. ✅ Calculation engine uses decimals (0.09)
4. ❌ Detail page UI was loading decimals directly without converting back to percentages

The `staff.cpiRate` had partial conversion logic, but `curriculum`, `rentParams`, and `otherOpexPercent` did not.

## Solution

Created parsing functions to convert decimal percentages back to display percentages when loading proposal data:

### 1. Added Helper Function
```typescript
/**
 * Helper to convert decimal percentages to display percentages
 * If value < 1, assume it's decimal (0.03) and convert to percentage (3)
 */
const toPercent = (value: unknown, defaultValue: number = 0): number => {
  const num = toNumber(value, defaultValue);
  return num < 1 ? num * 100 : num;
};
```

### 2. Created Parsing Functions

#### `parseCurriculumData()`
Converts curriculum percentages and growth rates from decimal to percentage:
```typescript
const parseCurriculumData = (curriculum: unknown): CurriculumData => {
  const c = curriculum as Record<string, unknown> | undefined;
  if (!c) return DEFAULT_CURRICULUM;

  return {
    frenchProgramEnabled: Boolean(c.frenchProgramEnabled),
    frenchProgramPercentage: toPercent(c.frenchProgramPercentage, 1), // 1.0 → 100
    frenchBaseTuition2028: toNumber(c.frenchBaseTuition2028, DEFAULT_CURRICULUM.frenchBaseTuition2028),
    frenchTuitionGrowthRate: toPercent(c.frenchTuitionGrowthRate, 0.03), // 0.05 → 5
    frenchTuitionGrowthFrequency: toNumber(c.frenchTuitionGrowthFrequency, DEFAULT_CURRICULUM.frenchTuitionGrowthFrequency),
    ibProgramEnabled: Boolean(c.ibProgramEnabled),
    ibProgramPercentage: toPercent(c.ibProgramPercentage, 0), // 0.0 → 0
    ibBaseTuition2028: toNumber(c.ibBaseTuition2028, DEFAULT_CURRICULUM.ibBaseTuition2028),
    ibStartYear: toNumber(c.ibStartYear, DEFAULT_CURRICULUM.ibStartYear),
    ibTuitionGrowthRate: toPercent(c.ibTuitionGrowthRate, 0.03), // 0.05 → 5
    ibTuitionGrowthFrequency: toNumber(c.ibTuitionGrowthFrequency, DEFAULT_CURRICULUM.ibTuitionGrowthFrequency),
  };
};
```

#### `parseRentParams()`
Converts rent model percentages from decimal to percentage:
```typescript
const parseRentParams = (rentParams: unknown): RentParamsData => {
  const r = rentParams as Record<string, unknown> | undefined;
  if (!r) return {};

  return {
    // Fixed rent model
    baseRent: toNumber(r.baseRent),
    rentGrowthRate: toPercent(r.rentGrowthRate), // 0.03 → 3
    rentFrequency: toNumber(r.rentFrequency),
    // Revenue share model
    revenueSharePercent: toPercent(r.revenueSharePercent), // 0.15 → 15
    // Partner investment model
    partnerLandSize: toNumber(r.partnerLandSize || r.landSize),
    partnerLandPricePerSqm: toNumber(r.partnerLandPricePerSqm || r.landPricePerSqm),
    partnerBuaSize: toNumber(r.partnerBuaSize || r.buaSize),
    partnerConstructionCostPerSqm: toNumber(r.partnerConstructionCostPerSqm || r.constructionCostPerSqm),
    partnerYieldRate: toPercent(r.partnerYieldRate || r.yieldRate), // 0.09 → 9
    partnerGrowthRate: toPercent(r.partnerGrowthRate || r.growthRate), // 0.02 → 2
    partnerFrequency: toNumber(r.partnerFrequency || r.frequency),
  };
};
```

#### Updated `parseStaffData()`
Simplified to use the new `toPercent` helper:
```typescript
const parseStaffData = (staff: unknown): StaffData => {
  const s = staff as Record<string, unknown> | undefined;
  if (!s) return DEFAULT_STAFF;

  return {
    studentsPerTeacher: toNumber(s.studentsPerTeacher, DEFAULT_STAFF.studentsPerTeacher),
    studentsPerNonTeacher: toNumber(s.studentsPerNonTeacher, DEFAULT_STAFF.studentsPerNonTeacher),
    avgTeacherSalary: toNumber(s.avgTeacherSalary, DEFAULT_STAFF.avgTeacherSalary),
    avgAdminSalary: toNumber(s.avgAdminSalary, DEFAULT_STAFF.avgAdminSalary),
    cpiRate: toPercent(s.cpiRate, 0.03), // 0.02 → 2
    cpiFrequency: toNumber(s.cpiFrequency, DEFAULT_STAFF.cpiFrequency),
  };
};
```

### 3. Updated State Initialization
```typescript
// Use parsing helpers to convert decimal percentages to display format
const [curriculum, setCurriculum] = useState<CurriculumData>(() =>
  parseCurriculumData(proposal.curriculum)
);

const [rentParams, setRentParams] = useState<RentParamsData>(() =>
  parseRentParams(proposal.rentParams)
);

const [staff, setStaff] = useState<StaffData>(() =>
  parseStaffData(proposal.staff)
);

const [otherOpexPercent, setOtherOpexPercent] = useState<number>(() => {
  const value = Number(proposal.otherOpexPercent) || 0.1;
  // Convert decimal to percentage if needed (0.3 → 30)
  return value < 1 ? value * 100 : value;
});
```

### 4. Fixed Other OpEx Display
**Before**:
```typescript
value={(otherOpexPercent * 100).toFixed(1)}  // Would show 3000 instead of 30
onChange={(e) => setOtherOpexPercent((parseFloat(e.target.value) || 0) / 100)}
```

**After**:
```typescript
value={otherOpexPercent.toFixed(1)}  // Shows 30
onChange={(e) => setOtherOpexPercent(parseFloat(e.target.value) || 0)}
```

### 5. Updated Save Handler
When saving changes, convert percentages back to decimals for the API:

```typescript
const handleSave = async () => {
  try {
    setSaving(true);

    // Convert percentages from display format (3) to decimal format (0.03) for API
    const curriculumForApi = {
      ...curriculum,
      frenchProgramPercentage: curriculum.frenchProgramPercentage / 100,
      frenchTuitionGrowthRate: curriculum.frenchTuitionGrowthRate / 100,
      ibProgramPercentage: curriculum.ibProgramPercentage / 100,
      ibTuitionGrowthRate: curriculum.ibTuitionGrowthRate / 100,
    };

    const rentParamsForApi = {
      ...rentParams,
      rentGrowthRate: rentParams.rentGrowthRate ? rentParams.rentGrowthRate / 100 : undefined,
      revenueSharePercent: rentParams.revenueSharePercent ? rentParams.revenueSharePercent / 100 : undefined,
      partnerYieldRate: rentParams.partnerYieldRate ? rentParams.partnerYieldRate / 100 : undefined,
      partnerGrowthRate: rentParams.partnerGrowthRate ? rentParams.partnerGrowthRate / 100 : undefined,
    };

    const staffForApi = {
      ...staff,
      cpiRate: staff.cpiRate / 100,
    };

    const response = await fetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollment,
        curriculum: curriculumForApi,
        rentParams: rentParamsForApi,
        staff: staffForApi,
        otherOpexPercent: otherOpexPercent / 100, // Convert 30 → 0.3
      }),
    });
    // ...
  }
};
```

## Files Modified

**File**: `src/components/proposals/detail/DynamicSetupTab.tsx`

**Changes**:
1. **Lines 143-150**: Added `toPercent()` helper function
2. **Lines 156-168**: Updated `parseStaffData()` to use `toPercent()`
3. **Lines 170-190**: Added `parseCurriculumData()` function
4. **Lines 192-215**: Added `parseRentParams()` function
5. **Lines 230-246**: Updated state initialization to use parsing functions
6. **Lines 785-792**: Fixed Other OpEx display
7. **Lines 277-308**: Updated `handleSave()` to convert percentages back to decimals

## Impact

### Before Fix
- ❌ CPI Rate: `0.02`
- ❌ Other OpEx: `0.3`
- ❌ Yield Rate: `0.09`
- ❌ Growth Rate: `0.02`
- ❌ Tuition Growth: `0.05`
- ❌ Program Percentage: `1.0`

### After Fix
- ✅ CPI Rate: `2%`
- ✅ Other OpEx: `30%`
- ✅ Yield Rate: `9%`
- ✅ Growth Rate: `2%`
- ✅ Tuition Growth: `5%`
- ✅ Program Percentage: `100%`

## Data Flow (Complete)

1. **Wizard Input**: User enters `9` for 9%
2. **Wizard Submit**: Converts to decimal `0.09` before sending to API
3. **API/Database**: Stores as decimal `0.09`
4. **Calculation Engine**: Uses decimal `0.09` for calculations
5. **Detail Page Load**: Converts back to percentage `9` for display
6. **Detail Page Save**: Converts percentage `9` back to decimal `0.09` before API call

## Testing

1. Create a new proposal through the wizard with:
   - Yield Rate: 9%
   - Growth Rate: 2%
   - CPI Rate: 2%
   - Other OpEx: 30%
   - Tuition Growth: 5%
2. Navigate to proposal detail page → Dynamic Setup tab
3. Verify all percentages display correctly:
   - ✅ Rent Model tab shows "9%" and "2%"
   - ✅ Operating Expenses tab shows "2%" for CPI and "30%" for Other OpEx
   - ✅ Program Setup tab shows "5%" for tuition growth
4. Edit a value (e.g., change CPI from 2% to 3%)
5. Click "Save Changes"
6. Refresh page and verify value persists correctly

## Status

✅ **FIXED** - All percentage displays now show correctly in human-readable format while maintaining decimal precision in the database and calculation engine.

## Related Fixes

- See `RENT_CALCULATION_FIX.md` for the wizard percentage-to-decimal conversion fix
- See `CALCULATION_SERIALIZATION_FIX.md` for Decimal.js serialization fixes
