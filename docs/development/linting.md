# Lint Error Checking & Fixing Strategy

## 🔍 How to Check Lint Errors

### 1. **Basic Commands**

```bash
# Check all files
npm run lint

# Check specific file/directory
npm run lint src/app/api/proposals/

# Auto-fix what can be fixed
npm run lint -- --fix

# Check with max warnings (see all issues)
npm run lint -- --max-warnings 0
```

### 2. **Get Detailed Report**

```bash
# Save errors to file for analysis
npm run lint > lint-errors.txt 2>&1

# Count errors by type
npm run lint 2>&1 | grep -E "error|warning" | sort | uniq -c
```

### 3. **IDE Integration**

- **VS Code**: Install ESLint extension - shows errors inline
- **Cursor**: Should show errors in Problems panel
- **WebStorm**: Built-in ESLint support

### 4. **Pre-commit Hook**

The project uses `lint-staged` which runs:
- `eslint --fix` on staged `.ts/.tsx` files
- `prettier --write` for formatting

## 📊 Current Error Categories

Based on your codebase, you have **3 main error types**:

### Type 1: Financial Calculations (408 errors)
**Error**: `Avoid 'number' type for financial calculations. Use 'Decimal' from 'decimal.js'`

**Example**:
```typescript
// ❌ WRONG
const revenue: number = 125300000;
const rent = revenue * 0.08;

// ✅ CORRECT
import Decimal from 'decimal.js';
const revenue = new Decimal('125300000');
const rent = revenue.times(0.08);
```

### Type 2: TypeScript `any` Type (Many errors)
**Error**: `Unexpected any. Specify a different type`

**Example**:
```typescript
// ❌ WRONG
function processData(data: any) { ... }

// ✅ CORRECT
function processData(data: FinancialData) { ... }
// or
function processData(data: unknown) {
  // validate and type guard
}
```

### Type 3: React Component Creation (Several errors)
**Error**: `Cannot create components during render`

**Example**:
```typescript
// ❌ WRONG
function Chart() {
  const CustomTooltip = ({ active, payload }: any) => { ... };
  return <Tooltip content={<CustomTooltip />} />;
}

// ✅ CORRECT
const CustomTooltip = ({ active, payload }: TooltipProps) => { ... };

function Chart() {
  return <Tooltip content={<CustomTooltip />} />;
}
```

## 🎯 Best Strategy to Fix

### **Phase 1: Quick Wins (Auto-fixable)**

```bash
# 1. Run auto-fix
npm run lint -- --fix

# 2. Format with Prettier
npx prettier --write "src/**/*.{ts,tsx}"

# 3. Check again
npm run lint
```

### **Phase 2: Systematic Fix by Category**

#### **A. Fix Financial Calculations (Highest Priority)**

**Strategy**: Use find/replace patterns

1. **Find all `number` types in financial contexts**:
   ```bash
   grep -r "number" src/lib/engine/ | grep -E "(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance)"
   ```

2. **Create a script to help identify**:
   ```typescript
   // Look for patterns like:
   // - Variable declarations with financial names
   // - Function parameters with number type
   // - Return types with number
   ```

3. **Fix systematically by file**:
   - Start with `src/lib/engine/` (core financial logic)
   - Then `src/lib/utils/financial.ts`
   - Then API routes
   - Finally components

#### **B. Fix `any` Types**

**Strategy**: Replace with proper types

1. **Identify common patterns**:
   ```bash
   grep -r ": any" src/ | wc -l  # Count occurrences
   ```

2. **Create type definitions**:
   - For API responses: Create interfaces
   - For event handlers: Use proper event types
   - For generic functions: Use generics

3. **Use `unknown` when type is truly unknown**:
   ```typescript
   function process(data: unknown) {
     if (isValidData(data)) {
       // Now TypeScript knows the type
     }
   }
   ```

#### **C. Fix React Component Issues**

**Strategy**: Move components outside render

1. **Find components created in render**:
   ```bash
   grep -r "const.*=.*\(.*\) =>" src/components/ | grep -E "(Tooltip|Component)"
   ```

2. **Extract to module level**

### **Phase 3: Tools to Help**

#### **1. ESLint with Auto-fix**
```bash
npm run lint -- --fix
```
Fixes: formatting, simple syntax issues

#### **2. TypeScript Compiler**
```bash
npx tsc --noEmit
```
Shows type errors (complements ESLint)

#### **3. Prettier**
```bash
npx prettier --write "src/**/*.{ts,tsx}"
```
Fixes: formatting only

#### **4. Custom Scripts**

Create helper scripts:

```typescript
// scripts/find-number-types.ts
// Scans for number types in financial contexts

// scripts/find-any-types.ts
// Scans for any types

// scripts/fix-decimal-imports.ts
// Ensures Decimal is imported where needed
```

## 🚀 Recommended Workflow

### **Option A: Fix Incrementally (Recommended)**

1. **Fix one file at a time**
   ```bash
   npm run lint src/lib/engine/core/decimal-utils.ts
   # Fix errors
   npm run lint src/lib/engine/core/decimal-utils.ts
   # Verify fixed
   ```

2. **Commit after each category**
   ```bash
   git add src/lib/engine/
   git commit -m "fix: replace number types with Decimal in engine core"
   ```

3. **Use `--no-verify` only for urgent fixes** (not recommended)

### **Option B: Fix All at Once**

1. **Create a branch**
   ```bash
   git checkout -b fix/lint-errors
   ```

2. **Fix systematically by category**
   - Financial calculations first (most critical)
   - Then `any` types
   - Then React components
   - Finally warnings

3. **Test after each category**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit when done**

## 🛠️ Useful Commands

```bash
# Check specific file
npm run lint src/lib/engine/index.ts

# Check and auto-fix
npm run lint -- --fix src/lib/engine/

# Count errors
npm run lint 2>&1 | grep "error" | wc -l

# See only errors (no warnings)
npm run lint 2>&1 | grep "error"

# Generate report
npm run lint -- --format json > lint-report.json

# Check specific rule
npm run lint -- --rule "no-explicit-any: error"
```

## 📝 Priority Order

1. **Financial calculations** (408 errors) - CRITICAL
   - These affect accuracy of financial calculations
   - Start with `src/lib/engine/`

2. **TypeScript `any` types** - HIGH
   - Affects type safety
   - Start with API routes

3. **React component creation** - MEDIUM
   - Affects performance
   - Start with chart components

4. **Unused variables** - LOW
   - Can be auto-fixed or removed

## ⚡ Quick Fix Commands

```bash
# 1. Auto-fix what's possible
npm run lint -- --fix

# 2. Format code
npx prettier --write "src/**/*.{ts,tsx}"

# 3. Check TypeScript
npx tsc --noEmit

# 4. Run all checks
npm run lint && npx tsc --noEmit
```

## 🎯 Next Steps

1. Run `npm run lint` to see current state
2. Start with financial calculations in `src/lib/engine/`
3. Fix one file at a time
4. Test after each fix
5. Commit incrementally

