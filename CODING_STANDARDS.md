# CODING STANDARDS & BEST PRACTICES
## Project_2052 - Financial Planning Application

**Version:** 1.0
**Date:** November 22, 2025
**Status:** APPROVED - Mandatory for All Development
**Alignment:** Tech Stack (Next.js 16, React 19, TypeScript 5.7, Prisma, Decimal.js)

---

## TABLE OF CONTENTS

1. [Core Principles](#1-core-principles)
2. [TypeScript Standards](#2-typescript-standards)
3. [Financial Calculation Standards](#3-financial-calculation-standards)
4. [Performance Standards](#4-performance-standards)
5. [React & Next.js Standards](#5-react--nextjs-standards)
6. [Database & Prisma Standards](#6-database--prisma-standards)
7. [API Design Standards](#7-api-design-standards)
8. [Testing Standards](#8-testing-standards)
9. [Security Standards](#9-security-standards)
10. [Error Handling Standards](#10-error-handling-standards)
11. [Code Organization](#11-code-organization)
12. [Documentation Standards](#12-documentation-standards)

---

## 1. CORE PRINCIPLES

### 1.1 Accuracy Over Convenience

**Financial calculations require absolute precision.**

✅ **DO:**
```typescript
import Decimal from 'decimal.js';

// Always use Decimal.js for money
const revenue = new Decimal('125300000'); // 125.3M SAR
const rent = revenue.times(0.08); // 8% of revenue
const netIncome = revenue.minus(rent);
```

❌ **DON'T:**
```typescript
// NEVER use JavaScript numbers for money
const revenue = 125300000;
const rent = revenue * 0.08; // Precision loss!
const netIncome = revenue - rent; // Rounding errors accumulate
```

**Why:** JavaScript numbers use floating-point arithmetic which causes precision errors. `0.1 + 0.2 !== 0.3` in JavaScript.

---

### 1.2 Performance is a Feature

**Target: < 1 second for 30-year calculations**

✅ **DO:**
```typescript
// Pre-create Decimal constants (reuse, don't recreate)
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const ZAKAT_RATE = new Decimal(0.025);

function calculateZakat(ebt: Decimal): Decimal {
  return ebt.greaterThan(DECIMAL_ZERO)
    ? ebt.times(ZAKAT_RATE)
    : DECIMAL_ZERO;
}
```

❌ **DON'T:**
```typescript
// Don't recreate constants in loops
function calculateZakat(ebt: Decimal): Decimal {
  const zakatRate = new Decimal(0.025); // Created every call!
  const zero = new Decimal(0);          // Wasteful!
  return ebt.greaterThan(zero) ? ebt.times(zakatRate) : zero;
}
```

**Why:** Creating millions of Decimal instances in 30-year calculations kills performance.

---

### 1.3 Type Safety is Non-Negotiable

✅ **DO:**
```typescript
interface FinancialPeriod {
  year: number;
  revenue: Decimal;
  rent: Decimal;
  netIncome: Decimal;
}

function calculatePeriod(inputs: ProposalInputs): FinancialPeriod {
  // TypeScript ensures all fields are present
  return {
    year: inputs.year,
    revenue: new Decimal(inputs.revenue),
    rent: new Decimal(inputs.rent),
    netIncome: new Decimal(0)
  };
}
```

❌ **DON'T:**
```typescript
// Never use 'any' type
function calculatePeriod(inputs: any): any {
  return {
    year: inputs.year,
    revenue: inputs.revenue, // What type is this?
    // Missing fields? TypeScript can't help!
  };
}
```

**Why:** Financial applications cannot afford runtime type errors. Catch them at compile time.

---

### 1.4 Immutability by Default

✅ **DO:**
```typescript
// Use const, create new objects
function updateProposal(proposal: Proposal, newRent: Decimal): Proposal {
  return {
    ...proposal,
    rentParams: {
      ...proposal.rentParams,
      baseRent2028: newRent
    }
  };
}
```

❌ **DON'T:**
```typescript
// Don't mutate objects
function updateProposal(proposal: Proposal, newRent: Decimal): Proposal {
  proposal.rentParams.baseRent2028 = newRent; // Mutation!
  return proposal; // Same reference, causes bugs
}
```

**Why:** Mutations cause hard-to-debug issues, especially in React (stale state, unnecessary re-renders).

---

## 2. TYPESCRIPT STANDARDS

### 2.1 Strict Mode Always Enabled

**tsconfig.json must have:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2.2 Type Everything Explicitly

✅ **DO:**
```typescript
// Explicit return types
function calculateRent(
  baseRent: Decimal,
  growthRate: number,
  years: number
): Decimal {
  return baseRent.times(Math.pow(1 + growthRate, years));
}

// Explicit parameter types
interface RentCalculationParams {
  baseRent2028: Decimal;
  growthRate: number;
  frequency: number;
}

function calculateFixedRent(params: RentCalculationParams): Decimal[] {
  // Implementation
  return [];
}
```

❌ **DON'T:**
```typescript
// Implicit return types (harder to maintain)
function calculateRent(baseRent, growthRate, years) {
  return baseRent.times(Math.pow(1 + growthRate, years));
}

// Implicit parameter types
function calculateFixedRent(params) {
  // What fields does params have?
  return [];
}
```

### 2.3 Use Type Guards for Runtime Safety

✅ **DO:**
```typescript
function isFinancialPeriod(obj: unknown): obj is FinancialPeriod {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'year' in obj &&
    'revenue' in obj &&
    obj.revenue instanceof Decimal
  );
}

// Usage
const data = JSON.parse(response);
if (isFinancialPeriod(data)) {
  // TypeScript knows data is FinancialPeriod
  console.log(data.revenue.toString());
}
```

❌ **DON'T:**
```typescript
// Type assertion without validation
const data = JSON.parse(response) as FinancialPeriod;
console.log(data.revenue.toString()); // Runtime error if invalid!
```

### 2.4 Avoid Type Assertions (Use Validation Instead)

✅ **DO:**
```typescript
import { z } from 'zod';

const ProposalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  rentModel: z.enum(['FIXED', 'REVSHARE', 'PARTNER'])
});

type Proposal = z.infer<typeof ProposalSchema>;

// Runtime validation + type safety
function parseProposal(data: unknown): Proposal {
  return ProposalSchema.parse(data); // Throws if invalid
}
```

❌ **DON'T:**
```typescript
// Blind type assertion
function parseProposal(data: unknown): Proposal {
  return data as Proposal; // No runtime validation!
}
```

---

## 3. FINANCIAL CALCULATION STANDARDS

### 3.1 Decimal.js Configuration

**Global configuration (once, at app startup):**

```typescript
// src/lib/decimal-config.ts
import Decimal from 'decimal.js';

// Configure ONCE at app initialization
Decimal.set({
  precision: 20,                    // 20 decimal places
  rounding: Decimal.ROUND_HALF_UP,  // Standard rounding
  toExpNeg: -9,                     // Prevent scientific notation
  toExpPos: 9
});

// Pre-create reusable constants
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const DECIMAL_HUNDRED = new Decimal(100);

// Financial constants
export const ZAKAT_RATE = new Decimal(0.025);        // 2.5%
export const DEFAULT_DEBT_RATE = new Decimal(0.05);  // 5%
export const DEFAULT_DEPOSIT_RATE = new Decimal(0.02); // 2%

// Common operations
export function percentToDecimal(percent: number): Decimal {
  return new Decimal(percent).dividedBy(DECIMAL_HUNDRED);
}

export function decimalToPercent(decimal: Decimal): number {
  return decimal.times(DECIMAL_HUNDRED).toNumber();
}
```

### 3.2 Always Use Decimal for Money

✅ **DO:**
```typescript
// Store as Decimal
interface BalanceSheet {
  cash: Decimal;
  ar: Decimal;
  ppNet: Decimal;
  debt: Decimal;
  equity: Decimal;
}

// Calculations
function calculateTotalAssets(bs: BalanceSheet): Decimal {
  return bs.cash
    .plus(bs.ar)
    .plus(bs.ppNet);
}

// Display (only convert at the UI layer)
function formatMillions(amount: Decimal): string {
  const millions = amount.dividedBy(1_000_000);
  return `${millions.toFixed(2)} M`;
}
```

❌ **DON'T:**
```typescript
// Never mix numbers with Decimals
interface BalanceSheet {
  cash: number;      // NO!
  ar: Decimal;       // Inconsistent!
  ppNet: number;     // NO!
}

// Wrong calculation
function calculateTotalAssets(bs: BalanceSheet): number {
  return bs.cash + bs.ar.toNumber() + bs.ppNet; // Precision loss!
}
```

### 3.3 Comparison Operations

✅ **DO:**
```typescript
// Use Decimal comparison methods
function ensureMinimumCash(cash: Decimal, minCash: Decimal): boolean {
  return cash.greaterThanOrEqualTo(minCash);
}

function calculateZakat(ebt: Decimal): Decimal {
  if (ebt.lessThanOrEqualTo(DECIMAL_ZERO)) {
    return DECIMAL_ZERO;
  }
  return ebt.times(ZAKAT_RATE);
}
```

❌ **DON'T:**
```typescript
// Never compare Decimals with JavaScript operators
function ensureMinimumCash(cash: Decimal, minCash: Decimal): boolean {
  return cash >= minCash; // Type error! Even if it worked, wrong!
}

function calculateZakat(ebt: Decimal): Decimal {
  if (ebt.toNumber() <= 0) { // Loses precision!
    return DECIMAL_ZERO;
  }
  return ebt.times(ZAKAT_RATE);
}
```

### 3.4 Array Operations with Decimals

✅ **DO:**
```typescript
// Sum array of Decimals
function sumDecimals(values: Decimal[]): Decimal {
  return values.reduce(
    (sum, value) => sum.plus(value),
    DECIMAL_ZERO
  );
}

// Map calculations
function calculateRentSeries(baseRent: Decimal, years: number): Decimal[] {
  return Array.from({ length: years }, (_, i) => {
    return baseRent.times(Math.pow(1.05, i));
  });
}
```

❌ **DON'T:**
```typescript
// Don't use number arithmetic
function sumDecimals(values: Decimal[]): number {
  return values.reduce(
    (sum, value) => sum + value.toNumber(), // Precision loss!
    0
  );
}
```

### 3.5 Division and Precision

✅ **DO:**
```typescript
// Explicit precision control
function calculateAverageRent(totalRent: Decimal, years: number): Decimal {
  return totalRent.dividedBy(years);
  // Result automatically uses configured precision (20 digits)
}

// For percentages, be explicit
function calculatePercentage(part: Decimal, whole: Decimal): Decimal {
  if (whole.isZero()) {
    return DECIMAL_ZERO;
  }
  return part.dividedBy(whole).times(DECIMAL_HUNDRED);
}
```

❌ **DON'T:**
```typescript
// Losing precision
function calculateAverageRent(totalRent: Decimal, years: number): number {
  return totalRent.toNumber() / years; // Precision loss twice!
}

// Division by zero not handled
function calculatePercentage(part: Decimal, whole: Decimal): Decimal {
  return part.dividedBy(whole).times(100); // Throws if whole is 0!
}
```

---

## 4. PERFORMANCE STANDARDS

### 4.1 Web Workers for Heavy Calculations

✅ **DO:**
```typescript
// src/workers/calculation.worker.ts
import Decimal from 'decimal.js';
import { calculateFinancials } from '@/lib/engine';

self.onmessage = (e: MessageEvent<ProposalInputs>) => {
  const result = calculateFinancials(e.data);

  // Serialize Decimals to strings for transfer
  const serialized = serializeFinancials(result);
  self.postMessage(serialized);
};

// src/hooks/useFinancialCalculation.ts
export function useFinancialCalculation() {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('@/workers/calculation.worker.ts', import.meta.url)
    );

    return () => workerRef.current?.terminate();
  }, []);

  const calculate = useCallback((inputs: ProposalInputs) => {
    return new Promise<FinancialResult>((resolve) => {
      workerRef.current!.onmessage = (e) => {
        const result = deserializeFinancials(e.data);
        resolve(result);
      };
      workerRef.current!.postMessage(inputs);
    });
  }, []);

  return { calculate };
}
```

❌ **DON'T:**
```typescript
// Running 30-year calculations on main thread
function MyComponent() {
  const [result, setResult] = useState<FinancialResult>();

  const handleCalculate = (inputs: ProposalInputs) => {
    // This blocks the UI for 1+ second!
    const financials = calculateFinancials(inputs);
    setResult(financials);
  };

  return <button onClick={handleCalculate}>Calculate</button>;
}
```

### 4.2 Memoization for Expensive Computations

✅ **DO:**
```typescript
// Memoize expensive calculations
const FinancialTable = memo(({ data }: { data: FinancialPeriod[] }) => {
  const formattedData = useMemo(() => {
    return data.map(period => ({
      year: period.year,
      revenue: formatMillions(period.revenue),
      rent: formatMillions(period.rent),
      netIncome: formatMillions(period.netIncome)
    }));
  }, [data]); // Only recalculate when data changes

  return <Table data={formattedData} />;
});

// Memoize callbacks
function ProposalForm() {
  const handleSubmit = useCallback((values: FormValues) => {
    // Submit logic
  }, []); // Stable reference

  return <Form onSubmit={handleSubmit} />;
}
```

❌ **DON'T:**
```typescript
// Recalculating on every render
function FinancialTable({ data }: { data: FinancialPeriod[] }) {
  // This runs on EVERY render, even if data hasn't changed!
  const formattedData = data.map(period => ({
    year: period.year,
    revenue: formatMillions(period.revenue),
    rent: formatMillions(period.rent),
    netIncome: formatMillions(period.netIncome)
  }));

  return <Table data={formattedData} />;
}
```

### 4.3 Debounce Interactive Inputs

✅ **DO:**
```typescript
// Debounce slider updates
import { useDebouncedCallback } from 'use-debounce';

function ScenarioSlider() {
  const [enrollment, setEnrollment] = useState(100);
  const { recalculate } = useFinancialCalculation();

  // Debounce recalculation by 300ms
  const debouncedRecalculate = useDebouncedCallback(
    (value: number) => {
      recalculate({ enrollmentPercent: value });
    },
    300 // Wait 300ms after user stops dragging
  );

  const handleSliderChange = (value: number) => {
    setEnrollment(value); // Update UI immediately
    debouncedRecalculate(value); // Recalculate after delay
  };

  return <Slider value={enrollment} onChange={handleSliderChange} />;
}
```

❌ **DON'T:**
```typescript
// Recalculating on every slider pixel movement
function ScenarioSlider() {
  const [enrollment, setEnrollment] = useState(100);
  const { recalculate } = useFinancialCalculation();

  const handleSliderChange = (value: number) => {
    setEnrollment(value);
    recalculate({ enrollmentPercent: value }); // Fires 100s of times!
  };

  return <Slider value={enrollment} onChange={handleSliderChange} />;
}
```

### 4.4 Cache Calculation Results

✅ **DO:**
```typescript
// src/lib/cache.ts
import { hash } from 'object-hash';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class CalculationCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxAge = 5 * 60 * 1000; // 5 minutes

  get(key: unknown): T | undefined {
    const keyHash = hash(key);
    const entry = this.cache.get(keyHash);

    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(keyHash);
      return undefined;
    }

    return entry.value;
  }

  set(key: unknown, value: T): void {
    const keyHash = hash(key);
    this.cache.set(keyHash, {
      value,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Usage
const financialCache = new CalculationCache<FinancialResult>();

export async function calculateWithCache(inputs: ProposalInputs) {
  const cached = financialCache.get(inputs);
  if (cached) {
    return cached; // <100ms cached response!
  }

  const result = await calculateFinancials(inputs);
  financialCache.set(inputs, result);
  return result;
}
```

❌ **DON'T:**
```typescript
// Recalculating identical inputs repeatedly
export async function calculateFinancials(inputs: ProposalInputs) {
  // Always recalculates, even for identical inputs
  // User clicks back and forth between proposals → wasted time
  return expensiveCalculation(inputs);
}
```

---

## 5. REACT & NEXT.JS STANDARDS

### 5.1 Server vs Client Components

✅ **DO:**
```typescript
// app/proposals/[id]/page.tsx (Server Component - default)
import { db } from '@/lib/db';

export default async function ProposalPage({
  params
}: {
  params: { id: string }
}) {
  // Fetch data on server
  const proposal = await db.proposal.findUnique({
    where: { id: params.id }
  });

  // Pass to client component
  return <ProposalDetail proposal={proposal} />;
}

// components/ProposalDetail.tsx (Client Component)
'use client';

import { useState } from 'react';

export function ProposalDetail({ proposal }: { proposal: Proposal }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive UI with state
  return <Tabs value={activeTab} onValueChange={setActiveTab}>...</Tabs>;
}
```

❌ **DON'T:**
```typescript
// Don't use 'use client' unnecessarily
'use client'; // This makes EVERYTHING client-side!

import { db } from '@/lib/db';

export default async function ProposalPage() {
  // This won't work - can't use async in client components
  const proposal = await db.proposal.findUnique(...);
  return <div>{proposal.name}</div>;
}
```

### 5.2 API Route Handlers

✅ **DO:**
```typescript
// app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const CreateProposalSchema = z.object({
  name: z.string().min(1),
  rentModel: z.enum(['FIXED', 'REVSHARE', 'PARTNER']),
  // ... other fields
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate & authorize
    const user = await requireAuth(request, ['ADMIN', 'PLANNER']);

    // 2. Parse & validate body
    const body = await request.json();
    const validated = CreateProposalSchema.parse(body);

    // 3. Business logic
    const proposal = await db.proposal.create({
      data: {
        ...validated,
        createdBy: user.id
      }
    });

    // 4. Return success
    return NextResponse.json(proposal, { status: 201 });

  } catch (error) {
    // Proper error handling (see section 10)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

❌ **DON'T:**
```typescript
// No validation, no error handling
export async function POST(request: NextRequest) {
  const body = await request.json(); // What if invalid JSON?

  // No validation!
  const proposal = await db.proposal.create({ data: body });

  return NextResponse.json(proposal); // What if it failed?
}
```

### 5.3 Form Handling

✅ **DO:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ProposalFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  baseRent2028: z.number().positive('Must be positive'),
  growthRate: z.number().min(0).max(0.2, 'Max 20%')
});

type ProposalFormValues = z.infer<typeof ProposalFormSchema>;

export function ProposalForm() {
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(ProposalFormSchema),
    defaultValues: {
      name: '',
      baseRent2028: 0,
      growthRate: 0.05 // 5% default
    }
  });

  const onSubmit = async (data: ProposalFormValues) => {
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create proposal');
      }

      const proposal = await response.json();
      // Handle success
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      {/* ... other fields */}
    </form>
  );
}
```

❌ **DON'T:**
```typescript
// Uncontrolled form with no validation
export function ProposalForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // No validation!
    await fetch('/api/proposals', {
      method: 'POST',
      body: formData // Wrong content type!
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" /> {/* No error display */}
    </form>
  );
}
```

---

## 6. DATABASE & PRISMA STANDARDS

### 6.1 Schema Design

✅ **DO:**
```prisma
// schema.prisma

model LeaseProposal {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(255)
  rentModel   RentModel
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Use Json for complex nested data
  financials  Json?

  // Explicit indexes for performance
  @@index([createdBy])
  @@index([createdAt])
}

enum RentModel {
  FIXED
  REVSHARE
  PARTNER
}

model SystemConfig {
  id                  String   @id @default(uuid())
  zakatRate           Decimal  @default(0.025) @db.Decimal(10, 4)
  debtInterestRate    Decimal  @default(0.05)  @db.Decimal(10, 4)
  depositInterestRate Decimal  @default(0.02)  @db.Decimal(10, 4)
  minCashBalance      Decimal  @default(1000000) @db.Decimal(15, 2)

  updatedAt DateTime @updatedAt
}
```

❌ **DON'T:**
```prisma
// Bad schema design
model LeaseProposal {
  id   Int    @id @default(autoincrement()) // Use UUID, not Int
  name String // No length limit
  type String // Use enum, not String

  // No indexes!
  // No created/updated timestamps!
}
```

### 6.2 Query Optimization

✅ **DO:**
```typescript
// Select only needed fields
const proposals = await db.leaseProposal.findMany({
  select: {
    id: true,
    name: true,
    rentModel: true,
    createdAt: true
  },
  where: {
    createdBy: userId
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Use transactions for multi-table operations
await db.$transaction(async (tx) => {
  const proposal = await tx.leaseProposal.create({ data: proposalData });
  await tx.auditLog.create({
    data: {
      action: 'CREATE_PROPOSAL',
      proposalId: proposal.id,
      userId: user.id
    }
  });
});
```

❌ **DON'T:**
```typescript
// Fetching all fields (wasteful)
const proposals = await db.leaseProposal.findMany();

// No transactions (data inconsistency risk)
const proposal = await db.leaseProposal.create({ data: proposalData });
await db.auditLog.create({ data: logData }); // Not atomic!
```

### 6.3 Handling Decimal Fields

✅ **DO:**
```typescript
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

// Save Decimal to database
const config = await db.systemConfig.update({
  where: { id: configId },
  data: {
    zakatRate: new Prisma.Decimal(zakatRate.toString()) // Convert Decimal.js → Prisma.Decimal
  }
});

// Read from database
const savedConfig = await db.systemConfig.findUnique({
  where: { id: configId }
});

// Convert Prisma.Decimal → Decimal.js
const zakatRate = new Decimal(savedConfig.zakatRate.toString());
```

❌ **DON'T:**
```typescript
// Direct number conversion (precision loss)
const config = await db.systemConfig.update({
  data: {
    zakatRate: zakatRate.toNumber() // Loses precision!
  }
});
```

---

## 7. API DESIGN STANDARDS

### 7.1 RESTful Conventions

✅ **DO:**
```typescript
// Proper HTTP methods and status codes

// GET /api/proposals - List all (200)
export async function GET() {
  const proposals = await db.leaseProposal.findMany();
  return NextResponse.json(proposals, { status: 200 });
}

// POST /api/proposals - Create (201)
export async function POST(request: NextRequest) {
  const proposal = await db.leaseProposal.create({ data });
  return NextResponse.json(proposal, { status: 201 });
}

// GET /api/proposals/[id] - Get one (200 or 404)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const proposal = await db.leaseProposal.findUnique({
    where: { id: params.id }
  });

  if (!proposal) {
    return NextResponse.json(
      { error: 'Proposal not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(proposal);
}

// PUT /api/proposals/[id] - Update (200)
// DELETE /api/proposals/[id] - Delete (204)
```

❌ **DON'T:**
```typescript
// Wrong methods and status codes
// POST /api/getProposals (should be GET)
// GET /api/createProposal (should be POST)
// Always returning 200, even for errors
```

### 7.2 Error Response Format

✅ **DO:**
```typescript
// Consistent error response format
interface ErrorResponse {
  error: string;           // Human-readable message
  code?: string;           // Machine-readable code
  details?: unknown;       // Additional details (validation errors, etc.)
  timestamp: string;
}

function errorResponse(
  error: string,
  status: number,
  details?: unknown
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      code: `ERROR_${status}`,
      details,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Usage
return errorResponse('Validation failed', 400, validationErrors);
```

❌ **DON'T:**
```typescript
// Inconsistent error formats
return NextResponse.json({ message: 'Error' }); // Sometimes 'message'
return NextResponse.json({ error: 'Error' });   // Sometimes 'error'
return NextResponse.json('Error');              // Sometimes just string
```

---

## 8. TESTING STANDARDS

### 8.1 Unit Tests for Calculations

✅ **DO:**
```typescript
// tests/engine/rent-models/fixed.test.ts
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { calculateFixedRent } from '@/lib/engine/rent-models/fixed';

describe('Fixed Rent Model', () => {
  it('calculates base year rent correctly', () => {
    const result = calculateFixedRent({
      baseRent2028: new Decimal(10_000_000), // 10M SAR
      growthRate: 0.05,
      frequency: 1
    });

    expect(result[0]).toEqual(new Decimal(10_000_000));
  });

  it('applies growth rate correctly', () => {
    const result = calculateFixedRent({
      baseRent2028: new Decimal(10_000_000),
      growthRate: 0.05, // 5% per year
      frequency: 1
    });

    // Year 2 = 10M × 1.05 = 10.5M
    expect(result[1]).toEqual(new Decimal(10_500_000));
  });

  it('respects growth frequency', () => {
    const result = calculateFixedRent({
      baseRent2028: new Decimal(10_000_000),
      growthRate: 0.05,
      frequency: 3 // Every 3 years
    });

    // Years 0-2 should be same
    expect(result[0]).toEqual(result[1]);
    expect(result[1]).toEqual(result[2]);

    // Year 3 should increase
    expect(result[3]).toEqual(new Decimal(10_500_000));
  });

  it('handles 26 years correctly', () => {
    const result = calculateFixedRent({
      baseRent2028: new Decimal(10_000_000),
      growthRate: 0.05,
      frequency: 1
    });

    expect(result).toHaveLength(26); // 2028-2053
  });
});
```

### 8.2 Integration Tests

✅ **DO:**
```typescript
// tests/api/proposals.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/proposals/route';

describe('POST /api/proposals', () => {
  beforeEach(async () => {
    // Clean database
    await db.leaseProposal.deleteMany();
  });

  it('creates proposal with valid data', async () => {
    const request = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Developer',
        rentModel: 'FIXED',
        // ... valid data
      })
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test Developer');
  });

  it('rejects invalid data', async () => {
    const request = new Request('http://localhost:3000/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // Invalid: empty name
        rentModel: 'INVALID' // Invalid enum
      })
    });

    const response = await POST(request as any);

    expect(response.status).toBe(400);
  });
});
```

### 8.3 Test Coverage Requirements

**Minimum coverage targets:**
- **Calculation engine:** 100% (financial accuracy is critical)
- **API routes:** 90%
- **React components:** 80%
- **Utilities:** 90%
- **Overall:** >85%

---

## 9. SECURITY STANDARDS

### 9.1 Role-Based Access Control

✅ **DO:**
```typescript
// src/lib/auth/rbac.ts
import { NextRequest } from 'next/server';

export enum Role {
  ADMIN = 'ADMIN',
  PLANNER = 'PLANNER',
  VIEWER = 'VIEWER'
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<User> {
  const session = await getSession(request);

  if (!session) {
    throw new UnauthorizedError('Not authenticated');
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      `Requires role: ${allowedRoles.join(' or ')}`
    );
  }

  return session.user;
}

// Usage in API route
export async function POST(request: NextRequest) {
  const user = await requireAuth(request, [Role.ADMIN, Role.PLANNER]);
  // Only ADMIN or PLANNER can proceed
}
```

❌ **DON'T:**
```typescript
// No authorization checks
export async function POST(request: NextRequest) {
  // Anyone can create proposals!
  const proposal = await db.leaseProposal.create({ data });
  return NextResponse.json(proposal);
}
```

### 9.2 Input Validation

✅ **DO:**
```typescript
// Always validate user input
const ProposalSchema = z.object({
  name: z.string().min(1).max(255),
  baseRent2028: z.number()
    .positive()
    .max(1_000_000_000), // Sanity check
  growthRate: z.number()
    .min(0)
    .max(0.5), // Max 50%
});

// Validate before processing
const validated = ProposalSchema.parse(userInput);
```

❌ **DON'T:**
```typescript
// Trusting user input
const proposal = await db.leaseProposal.create({
  data: request.body // No validation!
});
```

### 9.3 Prevent SQL Injection

✅ **DO:**
```typescript
// Prisma automatically prevents SQL injection
const proposals = await db.leaseProposal.findMany({
  where: {
    name: {
      contains: userSearchTerm // Safe - parameterized
    }
  }
});
```

❌ **DON'T:**
```typescript
// Raw SQL without parameters (vulnerable!)
const proposals = await db.$queryRaw`
  SELECT * FROM LeaseProposal
  WHERE name LIKE '%${userSearchTerm}%'
`; // SQL INJECTION VULNERABILITY!
```

---

## 10. ERROR HANDLING STANDARDS

### 10.1 Custom Error Classes

✅ **DO:**
```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// Usage
if (!proposal) {
  throw new NotFoundError('Proposal');
}
```

### 10.2 Error Handling in API Routes

✅ **DO:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const proposal = await db.leaseProposal.findUnique({
      where: { id: params.id }
    });

    if (!proposal) {
      throw new NotFoundError('Proposal');
    }

    return NextResponse.json(proposal);

  } catch (error) {
    // Log error with context
    console.error('Failed to fetch proposal:', {
      proposalId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Return appropriate response
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    // Unknown errors → 500
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 10.3 Error Boundaries in React

✅ **DO:**
```typescript
// app/error.tsx (Next.js error boundary)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 11. CODE ORGANIZATION

### 11.1 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── proposals/
│   │   │   ├── route.ts          # GET, POST /api/proposals
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE /api/proposals/:id
│   │   ├── config/
│   │   └── historical/
│   ├── proposals/                # Proposal pages
│   │   ├── page.tsx              # List
│   │   ├── new/
│   │   │   └── page.tsx          # Create wizard
│   │   └── [id]/
│   │       └── page.tsx          # Detail
│   ├── admin/                    # Admin pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── table.tsx
│   ├── financial/                # Financial-specific components
│   │   ├── FinancialTable.tsx
│   │   ├── PLStatement.tsx
│   │   └── BalanceSheet.tsx
│   ├── charts/                   # Chart components
│   │   └── RentTrajectory.tsx
│   └── forms/                    # Form components
│       └── ProposalForm.tsx
│
├── lib/                          # Core libraries
│   ├── engine/                   # Calculation engine
│   │   ├── core/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── decimal-utils.ts
│   │   ├── periods/
│   │   │   ├── historical.ts
│   │   │   ├── transition.ts
│   │   │   └── dynamic.ts
│   │   ├── rent-models/
│   │   │   ├── fixed.ts
│   │   │   ├── revenue-share.ts
│   │   │   └── partner.ts
│   │   ├── statements/
│   │   │   ├── profit-loss.ts
│   │   │   ├── balance-sheet.ts
│   │   │   └── cash-flow.ts
│   │   ├── solvers/
│   │   │   ├── circular.ts
│   │   │   └── balance-plug.ts
│   │   └── index.ts
│   ├── validation/               # Zod schemas
│   │   ├── proposal.ts
│   │   ├── config.ts
│   │   └── historical.ts
│   ├── formatting/               # Display formatting
│   │   ├── millions.ts
│   │   └── currency.ts
│   ├── auth/                     # Authentication
│   │   ├── session.ts
│   │   └── rbac.ts
│   ├── errors.ts                 # Custom errors
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utilities
│
├── hooks/                        # Custom React hooks
│   ├── useFinancialCalculation.ts
│   ├── useProposals.ts
│   └── useAuth.ts
│
├── types/                        # TypeScript types
│   ├── proposal.ts
│   ├── financial.ts
│   └── user.ts
│
├── workers/                      # Web Workers
│   └── calculation.worker.ts
│
└── styles/                       # Global styles
    └── globals.css
```

### 11.2 Import Order

✅ **DO:**
```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import { z } from 'zod';

// 2. Internal absolute imports (grouped by category)
// Components
import { Button } from '@/components/ui/button';
import { FinancialTable } from '@/components/financial/FinancialTable';

// Lib
import { calculateFixedRent } from '@/lib/engine/rent-models/fixed';
import { formatMillions } from '@/lib/formatting/millions';

// Types
import type { Proposal, FinancialPeriod } from '@/types';

// 3. Relative imports
import { ProposalSummary } from './ProposalSummary';
import { styles } from './styles';
```

---

## 12. DOCUMENTATION STANDARDS

### 12.1 Function Documentation

✅ **DO:**
```typescript
/**
 * Calculates fixed escalation rent for 26 years (2028-2053).
 *
 * The rent increases by growthRate every `frequency` years.
 * Years without escalation maintain the previous year's rent.
 *
 * @param params - Fixed rent calculation parameters
 * @param params.baseRent2028 - Base rent in SAR for year 2028
 * @param params.growthRate - Annual growth rate as decimal (e.g., 0.05 = 5%)
 * @param params.frequency - Years between escalations (1-5)
 *
 * @returns Array of 26 Decimal values representing rent for each year
 *
 * @example
 * ```typescript
 * const rent = calculateFixedRent({
 *   baseRent2028: new Decimal(10_000_000), // 10M SAR
 *   growthRate: 0.05,                       // 5% growth
 *   frequency: 3                             // Every 3 years
 * });
 * // rent[0] = 10M, rent[1] = 10M, rent[2] = 10M, rent[3] = 10.5M
 * ```
 */
export function calculateFixedRent(
  params: FixedRentParams
): Decimal[] {
  // Implementation
}
```

### 12.2 Complex Logic Comments

✅ **DO:**
```typescript
/**
 * Solves circular dependencies using fixed-point iteration.
 *
 * Circular dependencies in our model:
 * 1. Debt → Interest → Cash Need → Debt
 * 2. EBT → Zakat → Net Income → Equity → Zakat
 *
 * We iterate until both interest and zakat converge (change < SAR 1).
 */
export function solveCircularDependencies(
  period: Partial<FinancialPeriod>,
  config: SystemConfig
): FinancialPeriod {
  let debt = period.debt || DECIMAL_ZERO;
  let iterations = 0;
  const MAX_ITERATIONS = 100;
  const TOLERANCE = new Decimal(1); // SAR 1

  while (iterations < MAX_ITERATIONS) {
    // Step 1: Calculate interest based on current debt estimate
    const interest = debt.times(config.debtInterestRate);

    // Step 2: Calculate zakat based on current EBT estimate
    const ebt = period.ebit!.minus(interest);
    const zakat = ebt.greaterThan(DECIMAL_ZERO)
      ? ebt.times(config.zakatRate)
      : DECIMAL_ZERO;

    // Step 3: Check convergence
    // ... convergence logic
  }

  return finalPeriod;
}
```

---

## SUMMARY: KEY RULES

### Financial Calculations
1. **ALWAYS use Decimal.js** for money (never JavaScript numbers)
2. **Pre-create constants** (don't recreate in loops)
3. **Compare using methods** (.greaterThan(), not >)
4. **Handle division by zero** explicitly

### Performance
1. **Use Web Workers** for 30-year calculations
2. **Memoize expensive computations** (useMemo, memo)
3. **Debounce interactive inputs** (300ms for sliders)
4. **Cache calculation results** (5-minute TTL)

### Type Safety
1. **Enable strict mode** in TypeScript
2. **Type everything explicitly** (no implicit any)
3. **Use Zod for runtime validation**
4. **Avoid type assertions** (validate instead)

### React & Next.js
1. **Server Components by default** ('use client' only when needed)
2. **Validate all API inputs** with Zod
3. **Proper error handling** in all routes
4. **Form validation** with React Hook Form + Zod

### Database
1. **Select only needed fields**
2. **Use transactions** for multi-table operations
3. **Convert Prisma.Decimal ↔ Decimal.js** properly
4. **Add indexes** for performance

### Security
1. **Require auth** on all protected routes
2. **Validate all inputs** (never trust user data)
3. **Use Prisma** (prevents SQL injection)
4. **Role-based access control** on all mutations

---

**This document is mandatory for all development on Project_2052.**

**Violations of these standards will be caught in code review.**

**Performance and accuracy are non-negotiable.**
