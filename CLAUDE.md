# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Zeta (Project_2052) is a financial planning application for 30-year projections (2023-2053) in Saudi Arabian Riyals (SAR). It provides board-level decision support for lease proposal analysis with three distinct calculation periods.

## Development Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (localhost:3000)
pnpm build                  # Production build (uses env -u NODE_ENV)
pnpm lint                   # Run ESLint

# Testing
pnpm test                   # Run Vitest in watch mode
pnpm test:run               # Run all unit tests once
pnpm test:coverage          # Run tests with coverage report
pnpm vitest run src/lib/engine/periods/dynamic.test.ts  # Run a single test file
pnpm test:e2e               # Run Playwright E2E tests (requires dev server)
pnpm test:e2e:headed        # E2E tests with browser visible
pnpm test:e2e:debug         # E2E tests in debug mode
pnpm test:load              # Run Artillery load tests
pnpm test:load:quick        # Quick load test

# Database
npx prisma db push          # Push schema to database (use DIRECT_URL)
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Create and apply migrations
tsx prisma/seed.ts          # Seed database
```

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Supabase Auth with RBAC (ADMIN, PLANNER, VIEWER roles)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State**: Zustand for client state
- **Financial Math**: Decimal.js for all monetary calculations
- **Validation**: Zod for runtime schema validation
- **Testing**: Vitest (unit), Playwright (E2E), Artillery (load)
- **Charts**: Recharts for financial visualizations
- **Export**: ExcelJS (spreadsheets), jsPDF (reports)

## Architecture

### Calculation Engine (`src/lib/engine/`)

The core financial engine calculates 30-year projections across three periods:

1. **Historical (2023-2024)**: Immutable actual data from database
2. **Transition (2025-2027)**: Bridges historical to dynamic with growth projections
3. **Dynamic (2028-2053)**: Full projections using enrollment, curriculum, and rent models

Key files:
- `index.ts` - Main orchestrator that coordinates all period calculations
- `core/types.ts` - TypeScript interfaces for all financial data structures
- `core/constants.ts` - Pre-created Decimal constants (ZERO, ONE, rates, year boundaries)
- `core/decimal-utils.ts` - Decimal.js helper functions (NPV, IRR, annualization)
- `periods/historical.ts`, `transition.ts`, `dynamic.ts` - Period calculators
- `solvers/circular.ts` - Resolves Interest ↔ Zakat ↔ Debt circular dependencies
- `statements/` - P&L, Balance Sheet, Cash Flow statement builders
- `capex/capex-calculator.ts` - CapEx and depreciation calculations
- `sensitivity-analyzer.ts` - Tornado chart variable impact analysis
- `scenario-modifier.ts` - What-if scenario adjustments

### CAPEX System

The CapEx system manages capital expenditures with:
- **Categories**: IT_EQUIPMENT, FURNITURE, EDUCATIONAL_EQUIPMENT, BUILDING (each with useful life)
- **Virtual Assets**: Track depreciation of new investments
- **Auto-Reinvestment**: Optional periodic reinvestment by category
- **Historical State**: Tracks 2024 PPE and accumulated depreciation forward

### Rent Models

Three lease proposal types handled in `periods/dynamic.ts`:
- **FIXED_ESCALATION**: Base rent with periodic escalation
- **REVENUE_SHARE**: Percentage of total revenue
- **PARTNER_INVESTMENT**: Investment-yield model (land + construction costs × yield rate)

### API Routes (`src/app/api/`)

All routes require:
1. Authentication via Supabase using `authenticateUserWithRole()` from `src/middleware/auth.ts`
2. Role-based authorization (ADMIN, PLANNER, VIEWER)
3. Zod input validation using schemas from `src/lib/validation/`
4. Proper error handling with appropriate status codes

```typescript
// Example API route pattern
export async function POST(request: Request) {
  const authResult = await authenticateUserWithRole([Role.ADMIN, Role.PLANNER]);
  if (!authResult.success) return authResult.error;

  const body = await request.json();
  const parsed = CreateProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  // ... rest of handler
}
```

### Validation Layer (`src/lib/validation/`)

Zod schemas organized by domain:
- `proposal.ts` - LeaseProposal, enrollment, curriculum, staff, rent params
- `config.ts` - SystemConfig validation
- `transition.ts` - TransitionConfig (2025-2027 assumptions)
- `historical.ts` - HistoricalData validation

### State Management (`src/lib/stores/`)

Zustand stores with devtools and persistence:
- `ui-store.ts` - Sidebar, modals, command palette, loading states

### Web Workers (`src/workers/`)

Heavy calculations offloaded to prevent UI blocking:
- `calculation.worker.ts` - Financial engine calculations
- Use `src/lib/engine/worker-runner.ts` for integration

### Database Schema

Key models in `prisma/schema.prisma`:
- `LeaseProposal` - Main entity with negotiation tracking, contract period config
- `Scenario` - What-if scenarios with adjustable parameters
- `SensitivityAnalysis` - Tornado chart data for variable impact analysis
- `SystemConfig` - Global rates (zakat, interest, deposit, discount rate)
- `TransitionConfig` - 2025-2027 student/tuition assumptions
- `CapExCategory`, `CapExAsset`, `CapExTransition` - Capital expenditure tracking

## Critical Rules

### Financial Calculations

**Always use Decimal.js for money. Never use JavaScript numbers.**

```typescript
// Correct
import Decimal from 'decimal.js';
const revenue = new Decimal('125300000');
const rent = revenue.times(0.08);

// Wrong - precision loss
const revenue = 125300000;
const rent = revenue * 0.08;
```

Use pre-created constants from `src/lib/engine/core/constants.ts`:
```typescript
import { ZERO, ONE, ZAKAT_RATE, HISTORICAL_START_YEAR, DYNAMIC_START_YEAR } from '@/lib/engine/core/constants';
```

Compare Decimals using methods:
```typescript
if (cash.greaterThanOrEqualTo(minCash)) { ... }
if (ebt.lessThanOrEqualTo(ZERO)) { ... }
```

### Type Safety

- Never use `any` type
- ESLint enforces Decimal.js for financial variable names containing: Price, Cost, Revenue, Profit, Income, Tax, Salary, Rent, Amount, Balance, Budget, Forecast

### React Patterns

- Server Components by default, `'use client'` only when needed
- Memoize expensive computations with `useMemo`, `memo`
- Debounce interactive inputs (300ms for sliders)
- Heavy calculations should use Web Workers (`src/workers/calculation.worker.ts`)

### Path Alias

Use `@/` for imports from `src/`:
```typescript
import { formatMillions } from '@/lib/formatting/millions';
```

## Testing

- Unit tests colocated with source files (`*.test.ts`)
- E2E tests in `tests/e2e/` (accessibility, performance, workflows)
- Security tests in `tests/security/`
- Coverage thresholds: 80% lines/functions/branches/statements
- Financial engine code should target 100% coverage
- Always use DIRECT_URL for database migrations

### Key E2E Test Files
- `accessibility.spec.ts` - WCAG compliance
- `performance.spec.ts` - Load time, calculation speed
- `proposal-wizard.spec.ts` - Full proposal creation flow
- `scenarios.spec.ts` - What-if scenario testing
- `sensitivity.spec.ts` - Tornado chart validation
