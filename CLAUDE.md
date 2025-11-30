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
pnpm test:e2e               # Run Playwright E2E tests (requires dev server)
pnpm test:e2e:headed        # E2E tests with browser visible
pnpm test:e2e:debug         # E2E tests in debug mode

# Database
npx prisma db push          # Push schema to database
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
- **Testing**: Vitest (unit), Playwright (E2E)

## Architecture

### Calculation Engine (`src/lib/engine/`)

The core financial engine calculates 30-year projections across three periods:

1. **Historical (2023-2024)**: Immutable actual data from database
2. **Transition (2025-2027)**: Bridges historical to dynamic with growth projections
3. **Dynamic (2028-2053)**: Full projections using enrollment, curriculum, and rent models

Key files:
- `index.ts` - Main orchestrator that coordinates all period calculations
- `core/types.ts` - TypeScript interfaces for all financial data structures
- `core/constants.ts` - Pre-created Decimal constants (ZERO, ONE, rates)
- `core/decimal-utils.ts` - Decimal.js helper functions
- `periods/historical.ts`, `transition.ts`, `dynamic.ts` - Period calculators
- `solvers/circular.ts` - Resolves Interest ↔ Zakat ↔ Debt circular dependencies
- `statements/` - P&L, Balance Sheet, Cash Flow statement builders

### Rent Models

Three lease proposal types handled in `periods/dynamic.ts`:
- **FIXED_ESCALATION**: Base rent with periodic escalation
- **REVENUE_SHARE**: Percentage of total revenue
- **PARTNER_INVESTMENT**: Investment-yield model (land + construction costs × yield rate)

### API Routes (`src/app/api/`)

All routes require:
1. Authentication via Supabase
2. RBAC authorization (use `requireAuth()` from `src/middleware/rbac.ts`)
3. Zod input validation
4. Proper error handling with appropriate status codes

### Database Schema

Key models in `prisma/schema.prisma`:
- `LeaseProposal` - Main entity with negotiation tracking
- `Scenario` - What-if scenarios with adjustable parameters
- `SensitivityAnalysis` - Tornado chart data for variable impact analysis
- `SystemConfig` - Global rates (zakat, interest, deposit)
- `TransitionConfig` - 2025-2027 student/tuition assumptions

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
import { ZERO, ONE, ZAKAT_RATE } from '@/lib/engine/core/constants';
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
- E2E tests in `tests/e2e/`
- Security tests in `tests/security/`
- Coverage thresholds: 80% lines/functions/branches/statements
- Financial engine code should target 100% coverage
- always use Direct url for the database migration.