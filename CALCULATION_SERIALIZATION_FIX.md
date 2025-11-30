# Calculation Serialization Fix Summary

## Issue
When creating new proposals through the wizard, calculations were failing with a Prisma validation error:

```
Invalid `prisma.leaseProposal.create()` invocation
Invalid value for argument `constructor`: We could not serialize [object Function] value
```

## Root Cause
The calculation engine returns Decimal.js objects throughout the financial projections. When saving to the database, these Decimal objects were not being fully serialized to plain JSON values before passing to Prisma.

**Problem**: Decimal.js objects have internal properties like `constructor`, `s`, `e`, and `d` that are JavaScript objects/functions. Prisma's `InputJsonValue` type requires plain JSON-serializable values (strings, numbers, arrays, plain objects) and cannot handle objects with function properties.

## Solution

### File Modified
`src/app/api/proposals/calculate/route.ts` (lines 1135-1214)

### Fix Details
Enhanced the `serializeObject` function to robustly detect and convert all Decimal objects:

1. **Decimal Detection** (`isDecimalLike` helper):
   - Checks `instanceof Decimal` for direct Decimal.js instances
   - Checks for Decimal-like structure (objects with `constructor`, `s`, `e`, `d` properties)
   - Checks for objects with `.toString()` methods that return number strings

2. **Decimal Conversion** (`convertDecimals` function):
   - For Decimal instances: use `.toString()` method
   - For Decimal-like objects: use their `.toString()` method
   - Fallback: convert to Decimal first, then to string
   - Skips function properties during object iteration

3. **Final Serialization**:
   - After converting Decimals, performs `JSON.parse(JSON.stringify())` to ensure complete serialization
   - This removes any remaining non-serializable properties

### Code Example
```typescript
function serializeObject(obj: unknown): unknown {
  // Handle primitives
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  // Handle Decimal instances
  if (obj instanceof Decimal) {
    return obj.toString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle objects with Decimal-like structure (has s, e, d properties)
  // This catches Decimal objects from different contexts/versions
  if (
    typeof obj === "object" &&
    "s" in obj &&
    "e" in obj &&
    "d" in obj &&
    Array.isArray((obj as { d: unknown }).d)
  ) {
    try {
      return new Decimal(obj as Decimal.Value).toString();
    } catch {
      if (typeof (obj as { toString?: () => string }).toString === "function") {
        return (obj as { toString: () => string }).toString();
      }
      return String(obj);
    }
  }

  // Handle plain objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "function") continue;
    if (key === "constructor") continue; // CRITICAL: Skip constructor property
    result[key] = serializeObject(value);
  }
  return result;
}
```

## Related Fixes

### 1. Error Handling in Step7Review.tsx
**Fixed**: Wizard error messages now properly display both `error.details` and `error.message` from API responses.

**Location**: `src/components/proposals/wizard/Step7Review.tsx:109-118`

```typescript
if (!response.ok) {
  const error = await response.json();
  console.error("API Error:", error);
  const errorMessage = error.error || "Calculation failed";
  const errorDetails = error.details
    ? `: ${JSON.stringify(error.details)}`
    : error.message
      ? `: ${error.message}`
      : "";
  throw new Error(errorMessage + errorDetails);
}
```

### 2. Missing Contract Period Years
**Fixed**: Added `contractPeriodYears` to calculation payload.

**Location**: `src/components/proposals/wizard/Step7Review.tsx:52`

```typescript
const payload = {
  name: `${data.developerName} - ${data.rentModel}`,
  developer: data.developerName,
  rentModel: data.rentModel,
  contractPeriodYears: data.contractPeriodYears || 30, // Added
  // ... rest of payload
};
```

## Testing

### Manual Test Steps
1. Navigate to Proposals → Create New Proposal
2. Fill out all wizard steps with valid data
3. Click "Calculate 30 Years" on the review step
4. Verify:
   - No console errors about "undefined" or serialization
   - Proposal is successfully created and saved to database
   - Redirect to proposal detail page with calculated financials

### Expected Behavior
- ✅ Calculations complete successfully
- ✅ Proposal saved to database with all financial periods
- ✅ No Prisma validation errors
- ✅ All Decimal values properly serialized as strings in database JSON fields

## Status
✅ **FIXED** - All serialization issues resolved

### Files Modified
1. `src/app/api/proposals/calculate/route.ts` - Enhanced Decimal serialization
2. `src/components/proposals/wizard/Step7Review.tsx` - Improved error handling + added contractPeriodYears

### Impact
- Wizard calculations now work end-to-end
- Proposals can be created and saved to database
- Error messages provide better debugging information
- All Decimal.js financial values properly serialized for Prisma
