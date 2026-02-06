# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Zeta (Project_2052) is a financial planning application for 30-year projections (2023-2053) in Saudi Arabian Riyals (SAR). It provides board-level decision support for lease proposal analysis with three distinct calculation periods, full negotiation workflow management, and scenario analysis capabilities.

## Development Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (localhost:3000)
pnpm build                  # Production build (uses env -u NODE_ENV)
pnpm lint                   # Run ESLint
pnpm analyze                # Bundle analysis (opens report in browser)

# Testing
pnpm test                   # Run Vitest in watch mode
pnpm test:run               # Run all unit tests once
pnpm test:coverage          # Run tests with coverage report
pnpm test:ui                # Vitest with browser UI
pnpm vitest run src/lib/engine/periods/dynamic.test.ts  # Run a single test file
pnpm test:e2e               # Run Playwright E2E tests (requires dev server)
pnpm test:e2e:ui            # Playwright with browser UI
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

## Git Workflow

Two-branch strategy:
- **`staging`** - Working branch. All development happens here. Auto-deploys to staging on push.
- **`main`** - Protected. Changes arrive only via PR from staging. Auto-deploys to production on merge.

Husky pre-commit hook runs `lint-staged` on every commit.

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
- **Monitoring**: Sentry (error tracking, conditional on `NEXT_PUBLIC_SENTRY_DSN`)
- **Bundle Analysis**: `@next/bundle-analyzer` (run with `pnpm analyze`)

## Architecture

### Calculation Engine (`src/lib/engine/`)

The core financial engine calculates projections across three periods:

1. **Historical (2023-2024)**: Immutable actual data from database
2. **Transition (2025-2027)**: Bridges historical to dynamic with growth projections
3. **Dynamic (2028-2052/2057)**: Full projections using enrollment, curriculum, and rent models

**Contract Period Configuration:**
- `contractPeriodYears` in LeaseProposal: 25 or 30 years
- 25-year contract: Dynamic period 2028-2052
- 30-year contract: Dynamic period 2028-2057 (default)

Key files:
- `index.ts` - Main orchestrator that coordinates all period calculations
- `core/types.ts` - TypeScript interfaces for all financial data structures
- `core/constants.ts` - Pre-created Decimal constants (ZERO, ONE, rates, year boundaries)
- `core/decimal-utils.ts` - Decimal.js helper functions (NPV, IRR, annualization)
- `periods/historical.ts`, `transition.ts`, `dynamic.ts` - Period calculators
- `solvers/circular.ts` - Resolves Interest / Zakat / Debt circular dependencies
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
- **PARTNER_INVESTMENT**: Investment-yield model (land + construction costs x yield rate)

### Negotiation Workflow (`src/components/negotiations/`)

The negotiation system (v2.2) manages lease negotiations between the school and developers.

**Key Concepts:**
- **Negotiation**: Parent entity grouping proposals for a specific developer + property
- **Proposal Purpose**: NEGOTIATION (part of workflow), STRESS_TEST (post-deal analysis), SIMULATION (standalone)
- **Proposal Origin**: OUR_OFFER or THEIR_COUNTER
- **Offer Number**: Sequential counter (1, 2, 3...) for each proposal in a negotiation

Full documentation: `docs/features/negotiations/`

### API Routes (`src/app/api/`)

All routes require:
1. Authentication via Supabase using `authenticateUserWithRole()` from `src/middleware/auth.ts`
2. Role-based authorization (ADMIN, PLANNER, VIEWER)
3. Zod input validation using schemas from `src/lib/validation/`
4. Proper error handling with appropriate status codes

```typescript
// Standard API route pattern
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

### Auth Middleware (`src/middleware/auth.ts`)

The auth middleware includes an in-memory session cache (5-minute TTL, LRU eviction, max 1000 entries) to reduce database lookups. Cache is invalidated on role changes. Use `invalidateUserCache(userId)` when modifying user roles.

### Validation Layer (`src/lib/validation/`)

Zod schemas organized by domain:
- `proposal.ts` - LeaseProposal, enrollment, curriculum, staff, rent params
- `negotiation.ts` - Negotiation CRUD, counter-offers, reordering
- `config.ts` - SystemConfig validation
- `transition.ts` - TransitionConfig (2025-2027 assumptions)
- `historical.ts` - HistoricalData validation

### State Management (`src/lib/stores/`)

Zustand stores with devtools:
- `ui-store.ts` - Sidebar, modals, command palette, loading states
- `proposal-store.ts` - Proposal filters, comparison selection, pagination, sorting

### Web Workers (`src/workers/`)

Heavy calculations offloaded to prevent UI blocking:
- `calculation.worker.ts` - Financial engine calculations
- Use `src/lib/engine/worker-runner.ts` for integration

### Database Schema

Key models in `prisma/schema.prisma`:
- `User` - With approval workflow (ApprovalStatus: PENDING, APPROVED, REJECTED)
- `Negotiation` - Parent entity for developer + property negotiations
- `LeaseProposal` - Main entity with negotiation tracking, contract period config
- `Scenario` - What-if scenarios with adjustable parameters
- `SensitivityAnalysis` - Tornado chart data for variable impact analysis
- `SystemConfig` - Global rates (zakat, interest, deposit, discount rate)
- `TransitionConfig` - 2025-2027 student/tuition assumptions
- `HistoricalData` - Immutable historical financials
- `CapExCategory`, `CapExAsset`, `CapExTransition` - Capital expenditure tracking

**Key Enums:**
- `NegotiationStatus`: ACTIVE, ACCEPTED, REJECTED, CLOSED
- `ProposalStatus`: DRAFT, READY_TO_SUBMIT, SUBMITTED, UNDER_REVIEW, COUNTER_RECEIVED, EVALUATING_COUNTER, ACCEPTED, REJECTED, NEGOTIATION_CLOSED
- `ProposalPurpose`: NEGOTIATION, STRESS_TEST, SIMULATION
- `ProposalOrigin`: OUR_OFFER, THEIR_COUNTER
- `Role`: ADMIN, PLANNER, VIEWER
- `CapExCategoryType`: IT_EQUIPMENT, FURNITURE, EDUCATIONAL_EQUIPMENT, BUILDING

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

**Converting between Prisma.Decimal and Decimal.js -- always go through string:**
```typescript
// Save to database
await prisma.systemConfig.update({
  data: { zakatRate: new Prisma.Decimal(zakatRate.toString()) }
});

// Read from database
const zakatRate = new Decimal(config.zakatRate.toString());

// WRONG - precision loss via .toNumber()
```

### ESLint Enforcement

The ESLint config (`eslint.config.mjs`) enforces financial safety:
- **`src/lib/**` and `src/app/api/**`**: `no-explicit-any` is an **error**; financial variable names matching `Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios` are blocked from using `number` type or plain number literals.
- **Test files and `src/lib/engine/**`**: `no-explicit-any` and `no-unused-vars` are relaxed.
- **`src/components/proposals/**`**: `no-explicit-any`, `no-unused-vars`, and `exhaustive-deps` are all off (legacy area).

### Type Safety

- Never use `any` type (enforced by ESLint, see above for exceptions)

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

### Database Best Practices

**Select only needed fields:**
```typescript
const proposals = await prisma.leaseProposal.findMany({
  select: { id: true, name: true, rentModel: true },
  where: { createdBy: userId }
});
```

**Use transactions for multi-table operations:**
```typescript
await prisma.$transaction(async (tx) => {
  const proposal = await tx.leaseProposal.create({ data: proposalData });
  await tx.scenario.create({ data: { ...scenarioData, proposalId: proposal.id } });
});
```

**Schema design rules:**
- Use UUID for IDs (never Int)
- Use enums for fixed values (never String)
- Add indexes on foreign keys and frequently queried fields
- Include `createdAt`/`updatedAt` timestamps

### Security Headers

`next.config.ts` applies security headers to all routes: CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, Permissions-Policy. The CSP `connect-src` allows `*.supabase.co` -- update this if adding new external API connections.

## Performance Targets

- **30-year calculation**: < 1 second
- **API response time**: < 200ms average
- **Calculation accuracy**: 100% (zero tolerance for errors)

## Testing

- Unit tests colocated with source files (`*.test.ts`)
- E2E tests in `tests/e2e/`
- Security tests in `tests/security/`
- Always use DIRECT_URL for database migrations

### Coverage Targets

| Area | Target |
|------|--------|
| Financial engine | **100%** |
| API routes | 90% |
| React components | 80% |
| Utilities | 90% |
| **Overall** | **>85%** |

## Documentation

Detailed documentation is in the `docs/` folder. Key areas: `docs/specifications/`, `docs/technical/`, `docs/development/`, `docs/security/`, `docs/features/`.
