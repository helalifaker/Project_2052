# System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Layers](#application-layers)
4. [Calculation Engine Architecture](#calculation-engine-architecture)
5. [Performance Architecture](#performance-architecture)
6. [Security Architecture](#security-architecture)
7. [Data Flow](#data-flow)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

The School Lease Financial Planning System is a full-stack web application that enables schools to evaluate lease proposals from property developers by generating 30-year financial projections with scenario analysis and sensitivity testing.

### Purpose

**Primary Goal:** Help schools make informed real estate decisions by modeling the long-term financial impact of different lease structures.

**Key Capabilities:**
- 30-year financial projections (2023-2053) in <1 second
- Three lease models: Fixed, Revenue Share, Partner (Hybrid)
- Full negotiation workflow with timeline tracking and counter-offers
- Interactive scenario analysis with real-time (<200ms) calculations
- Sensitivity analysis with tornado charts
- Proposal comparison matrices (up to 5 proposals)
- PDF and Excel export for Board presentations

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                           │
│  (Browser - React 19 + Next.js 16 App Router + TypeScript)  │
│                                                                │
│  - UI Components (shadcn/ui + Tailwind CSS)                  │
│  - State Management (Zustand + React Hook Form)              │
│  - Client-side Validation (Zod)                              │
│  - Charts & Visualizations (Recharts)                        │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTPS (TLS 1.3)
┌────────────────────▼─────────────────────────────────────────┐
│                       APPLICATION TIER                        │
│          (Next.js 16 API Routes - Serverless Functions)      │
│                                                                │
│  - Authentication & Authorization (Middleware)                │
│  - API Endpoints (REST-like, JSON)                           │
│  - Request Validation (Zod schemas)                          │
│  - Business Logic Orchestration                              │
│  - Calculation Engine Invocation                             │
│  - Export Generation (PDF, Excel)                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                      CALCULATION ENGINE                       │
│             (Pure TypeScript + Decimal.js)                    │
│                                                                │
│  - 3-Period Calculator (Historical, Transition, Dynamic)     │
│  - Rent Model Factory (Fixed, RevShare, Partner)             │
│  - Circular Dependency Solver (Interest ↔ Zakat ↔ Debt)    │
│  - CapEx & Depreciation Tracker (OLD vs NEW assets)          │
│  - Financial Statement Generator (P&L, BS, CF)               │
│  - Scenario Modifier (real-time what-if analysis)            │
│  - Sensitivity Analyzer (tornado charts)                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                         DATA TIER                             │
│           (PostgreSQL 14+ via Prisma ORM)                     │
│                                                                │
│  - User & Authentication (users, roles)                       │
│  - Negotiations (developer + property groupings)              │
│  - System Configuration (zakat rate, interest rates)          │
│  - Historical Data (2023-2024 actuals)                        │
│  - Proposals (transition, enrollment, curriculum, rent)       │
│  - Scenarios & Sensitivity Analyses (saved results)           │
│  - CapEx Assets & Categories (manual items, reinvestment)     │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

**Framework:**
- **Next.js 16** (App Router with React Server Components)
- **React 19.2** (latest stable)
- **TypeScript 5** (strict mode)

**UI Components:**
- **shadcn/ui** (Radix UI primitives + custom styling)
- **Tailwind CSS 4** (utility-first styling)
- **Lucide React** (icon library)
- **Framer Motion** (animations)

**Charts & Visualization:**
- **Recharts 3** (line charts, bar charts, area charts)
- **Custom tornado charts** (for sensitivity analysis)

**Form Management:**
- **React Hook Form 7** (performance-optimized forms)
- **Zod 4** (schema validation)
- **@hookform/resolvers** (Zod integration)

**State Management:**
- **Zustand 5** (lightweight global state)
- **React Context** (for component-level state)
- **URL state** (for filters, pagination)

**Data Fetching:**
- **Native fetch** (Next.js extends fetch with caching)
- **React Server Components** (server-side data fetching)
- **Server Actions** (form submissions)

### Backend

**Runtime:**
- **Node.js 20+** (LTS)
- **Next.js 16 API Routes** (serverless functions)

**Database:**
- **PostgreSQL 14+** (primary database)
- **Supabase** (managed PostgreSQL + Auth)
- **Prisma 7** (ORM with type-safe queries)
- **@prisma/adapter-pg** (connection pooling)

**Authentication:**
- **Supabase Auth** (optional, for multi-tenant)
- **Custom middleware** (role-based access control)
- **Session management** (HTTP-only cookies)

**Calculation Engine:**
- **Decimal.js 10** (arbitrary-precision math, avoids floating-point errors)
- **Pure TypeScript** (no external dependencies for calculations)

**Export Generation:**
- **jsPDF 3** (PDF generation)
- **ExcelJS 4** (Excel workbook generation)

### Development Tools

**Testing:**
- **Vitest 4** (unit tests, integration tests)
- **@vitest/coverage-v8** (code coverage)
- **Playwright 1.56** (E2E tests)
- **@axe-core/playwright** (accessibility tests)

**Code Quality:**
- **ESLint 9** (linting)
- **Prettier 3** (code formatting)
- **Husky 9** (git hooks)
- **lint-staged 16** (pre-commit checks)

**Monitoring:**
- **Sentry 10** (error tracking, performance monitoring)
- **Vercel Analytics** (if deployed on Vercel)

**Build & Bundle:**
- **Next.js built-in bundler** (webpack under the hood)
- **@next/bundle-analyzer** (bundle size analysis)
- **Babel React Compiler** (experimental, React 19 optimization)

---

## Application Layers

### 1. Presentation Layer

**Responsibility:** User interface, user interactions, visual feedback

**Components:**
- **Pages:** `/app/page.tsx`, `/app/proposals/[id]/page.tsx`, etc.
- **Layouts:** `/app/layout.tsx` (root layout with navigation)
- **UI Components:** `/src/components/ui/` (reusable primitives)
- **Feature Components:** `/src/components/proposals/`, `/src/components/dashboard/`, `/src/components/negotiations/`

**Key patterns:**
- **Server Components** for initial data loading (faster)
- **Client Components** for interactivity (sliders, forms, charts)
- **Composition** over inheritance (component flexibility)
- **Accessibility** (ARIA labels, keyboard navigation, focus management)

**Example structure:**
```typescript
// Server Component (default in App Router)
export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await getProposal(params.id); // Server-side fetch
  return <ProposalDetailClient proposal={proposal} />;
}

// Client Component (interactive)
"use client";
export function ProposalDetailClient({ proposal }) {
  const [activeTab, setActiveTab] = useState("overview");
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>...</TabsList>
      <TabsContent value="overview">...</TabsContent>
    </Tabs>
  );
}
```

### 2. API Layer

**Responsibility:** HTTP request handling, validation, authorization, orchestration

**Endpoints:** `/src/app/api/` (Next.js API Routes)

**Key endpoints:**
- `GET /api/proposals` - List proposals
- `GET /api/proposals/[id]` - Get proposal details
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/[id]` - Update proposal
- `DELETE /api/proposals/[id]` - Delete proposal
- `POST /api/proposals/calculate` - Calculate 30-year projection
- `POST /api/proposals/[id]/scenarios` - Run scenario
- `POST /api/proposals/[id]/sensitivity` - Run sensitivity analysis
- `GET /api/proposals/compare` - Compare proposals
- `GET /api/proposals/[id]/export/pdf` - Export to PDF
- `GET /api/proposals/[id]/export/excel` - Export to Excel

**Pattern:**
```typescript
// API Route: /api/proposals/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 1. Authentication check
  const user = await authenticateRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Authorization check
  if (!canViewProposal(user, params.id)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Fetch data
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: params.id },
    include: { creator: true, scenarios: true }
  });

  // 4. Return response
  return Response.json({ proposal });
}
```

**Validation:**
- Zod schemas for request/response validation
- Type safety from TypeScript
- Error handling with try/catch and error responses

**Rate Limiting:**
- Vercel provides automatic rate limiting
- Custom rate limiting for sensitive endpoints (calculation engine)

### 3. Business Logic Layer

**Responsibility:** Core business rules, calculation orchestration, data transformations

**Key modules:**
- **Calculation Engine:** `/src/lib/engine/` (financial projections)
- **Rent Model Factory:** `/src/lib/engine/periods/dynamic.ts` (model selection)
- **Scenario Modifier:** `/src/lib/engine/scenario-modifier.ts` (what-if analysis)
- **Sensitivity Analyzer:** `/src/lib/engine/sensitivity-analyzer.ts` (tornado charts)
- **Validation:** `/src/lib/validation/` (business rule validation)

**Separation of Concerns:**
- Business logic is independent of HTTP layer (testable)
- Pure functions where possible (no side effects)
- Dependency injection for external services (database, external APIs)

**Example:**
```typescript
// Business logic: Calculate financial projections
export async function calculateFinancialProjections(
  input: CalculationEngineInput
): Promise<CalculationEngineOutput> {
  // Pure calculation - no database, no HTTP, just math
  const periods = [];

  // Historical period
  for (const hist of input.historicalPeriods) {
    const period = calculateHistoricalPeriod(hist, input.systemConfig);
    periods.push(period);
  }

  // Transition period
  // ...

  // Dynamic period
  // ...

  return { periods, metrics, validation, performance };
}
```

### 4. Data Access Layer

**Responsibility:** Database interactions, data persistence, caching

**ORM:** Prisma 7
- Type-safe queries
- Automatic migrations
- Connection pooling
- Query optimization

**Key services:**
- **User Service:** User CRUD, authentication
- **Proposal Service:** Proposal CRUD, lifecycle management
- **Scenario Service:** Scenario CRUD, comparison
- **Config Service:** System configuration management
- **Historical Data Service:** Historical data CRUD, validation

**Example:**
```typescript
// Data access service
export class ProposalService {
  async create(input: CreateProposalInput, userId: string): Promise<LeaseProposal> {
    return await prisma.leaseProposal.create({
      data: {
        name: input.name,
        rentModel: input.rentModel,
        createdBy: userId,
        transition: input.transition,
        enrollment: input.enrollment,
        // ...
      }
    });
  }

  async findById(id: string): Promise<LeaseProposal | null> {
    return await prisma.leaseProposal.findUnique({
      where: { id },
      include: {
        creator: true,
        scenarios: true,
        sensitivityAnalyses: true,
        assets: true
      }
    });
  }
}
```

---

## Calculation Engine Architecture

The calculation engine is the heart of the system, generating 30-year financial projections in <1 second.

### Design Principles

1. **Pure functions:** No side effects, fully deterministic
2. **Immutable data:** No mutation, functional programming style
3. **Type safety:** TypeScript ensures correctness
4. **Performance:** <1 second for 30 years
5. **Accuracy:** Decimal.js prevents floating-point errors
6. **Modularity:** Each period, each model, each statement is a separate module

### 3-Period Structure

```
┌──────────────────┐
│ HISTORICAL       │  2023-2024 (2 years)
│ (Actual Data)    │  - Uses actual financial statements from admin
│                  │  - No projections, just data entry
└────────┬─────────┘
         │
┌────────▼─────────┐
│ TRANSITION       │  2025-2027 (3 years)
│ (Ramp-up)        │  - Manual revenue/cost inputs
│                  │  - School establishing operations
│                  │  - Working capital ratios calculated from 2024
└────────┬─────────┘
         │
┌────────▼─────────┐
│ DYNAMIC          │  2028-2053 (26 years)
│ (Full Projection)│  - Enrollment-driven projections
│                  │  - Curriculum & tuition modeling
│                  │  - Rent model application (Fixed/RevShare/Partner)
│                  │  - Staff cost projections (student-teacher ratio)
│                  │  - CapEx & depreciation
└──────────────────┘
```

### Period Continuity

**Challenge:** Ensure balance sheet continuity between years

**Solution:** Each year's opening balance = prior year's closing balance

```typescript
// Year N opening balance comes from Year N-1 closing balance
const openingCash = previousPeriod?.balanceSheet.cash ?? ZERO;
const openingDebt = previousPeriod?.balanceSheet.debtBalance ?? ZERO;
const openingEquity = previousPeriod?.balanceSheet.totalEquity ?? ZERO;
// ...
```

### Rent Model Factory

**Pattern:** Factory pattern for rent model selection

**Models:**
1. **Fixed Rent:** `Rent = BaseRent × (1 + CPI)^(Year - 1)`
2. **Revenue Share:** `Rent = max(MinRent, min(MaxRent, Revenue × SharePercent))`
3. **Partner:** `Rent = FixedBase + max(0, (Revenue - Threshold) × SharePercent)`

**Implementation:**
```typescript
export function calculateRent(
  rentModel: RentModel,
  rentParams: RentParams,
  year: number,
  revenue: Decimal
): Decimal {
  switch (rentModel) {
    case "Fixed":
      return calculateFixedRent(rentParams, year);
    case "RevShare":
      return calculateRevShareRent(rentParams, revenue);
    case "Partner":
      return calculatePartnerRent(rentParams, revenue);
    default:
      throw new Error(`Unknown rent model: ${rentModel}`);
  }
}
```

### Circular Dependency Solver

**Challenge:** Circular dependencies in financial calculations
- Interest Expense depends on Debt Balance
- Zakat depends on Equity
- Net Income depends on Interest and Zakat
- Equity depends on Net Income
- Debt Balance depends on Equity (balance sheet plug)

**Solution:** Fixed-point iteration with relaxation

**Algorithm:**
```
1. Initial guess: Debt(t) = Debt(t-1)
2. Loop (max 100 iterations):
   a. Calculate Interest(Debt(t))
   b. Calculate EBT = EBIT + Net Interest
   c. Calculate Zakat(Equity(t))
   d. Calculate Net Income = EBT - Zakat
   e. Calculate Equity(t) = Equity(t-1) + Net Income
   f. Calculate Required Debt (balance sheet plug)
   g. If |Required Debt - Guessed Debt| < ε: CONVERGED ✓
   h. Else: Debt(t) = α × Debt(t-1) + (1-α) × Required Debt (relaxation)
3. Return converged values
```

**Convergence:**
- Tolerance: 1 SAR (0.000001 M)
- Relaxation factor: 0.5 (prevents oscillation)
- Typical iterations: 2-5
- Performance: <10ms per year

**Code location:** `/src/lib/engine/solvers/circular.ts`

### CapEx & Depreciation Tracker

**Challenge:** Track fixed assets over 30 years with accurate depreciation

**Solution:** Separate OLD and NEW asset tracking

**OLD Assets (Pre-2025):**
- Entered via historical data
- Depreciation continues on original schedule
- Cannot be modified (historical fact)

**NEW Assets (2025+):**
- Configured via CapEx module
- Depreciation starts in purchase year
- Can be edited for scenario analysis

**PPE Tracker:**
```typescript
export class PPETracker {
  private oldAssets: Asset[] = []; // from historical data
  private newAssets: Asset[] = []; // from CapEx config

  addCapEx(year: number, asset: Asset) {
    if (year < 2025) {
      this.oldAssets.push(asset);
    } else {
      this.newAssets.push(asset);
    }
  }

  calculateDepreciation(year: number): { old: Decimal; new: Decimal } {
    const oldDep = this.oldAssets
      .filter(a => a.purchaseYear <= year && a.purchaseYear + a.usefulLife > year)
      .reduce((sum, a) => sum.plus(this.depreciateAsset(a, year)), ZERO);

    const newDep = this.newAssets
      .filter(a => a.purchaseYear <= year && a.purchaseYear + a.usefulLife > year)
      .reduce((sum, a) => sum.plus(this.depreciateAsset(a, year)), ZERO);

    return { old: oldDep, new: newDep };
  }
}
```

### Financial Statement Generation

**Three statements generated for each year:**

**1. Profit & Loss (Income Statement)**
```
Revenue
- Operating Expenses (Rent, Staff, Other, Depreciation)
= EBIT
+ Interest Income
- Interest Expense
= EBT
- Zakat
= Net Income
```

**2. Balance Sheet**
```
ASSETS
  Current Assets (Cash, AR, Prepaid)
  Non-Current Assets (Net PPE)
= Total Assets

LIABILITIES
  Current Liabilities (AP, Accrued, Deferred Revenue)
  Non-Current Liabilities (Debt)
= Total Liabilities

EQUITY
  Retained Earnings
= Total Equity

Balance Check: Assets = Liabilities + Equity
```

**3. Cash Flow Statement (Indirect Method)**
```
OPERATING ACTIVITIES
  Net Income
  + Depreciation
  +/- Changes in Working Capital
= Operating Cash Flow

INVESTING ACTIVITIES
  - CapEx
= Investing Cash Flow

FINANCING ACTIVITIES
  +/- Debt Issuance/Repayment
= Financing Cash Flow

Net Change in Cash
```

**Code location:** `/src/lib/engine/statements/`

---

## Performance Architecture

### Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| 30-year calculation | <1 second | 300-800ms | ✅ |
| Scenario calculation | <200ms | 50-150ms | ✅ |
| Page load (initial) | <2 seconds | 1-1.5s | ✅ |
| Page load (navigation) | <500ms | 200-400ms | ✅ |
| Dashboard load | <1 second | 500-800ms | ✅ |
| Export PDF | <5 seconds | 2-4s | ✅ |
| Export Excel | <3 seconds | 1-2s | ✅ |

### Performance Optimizations

#### 1. Calculation Engine

**Decimal.js:**
- High-precision decimal arithmetic
- Faster than naive BigDecimal implementations
- Prevents floating-point errors (0.1 + 0.2 = 0.3 exactly)

**Pure functions:**
- No I/O during calculations (fully in-memory)
- No database queries (data pre-loaded)
- Deterministic (same input = same output)

**Efficient algorithms:**
- Circular solver converges in 2-5 iterations (not 100)
- Relaxation factor prevents oscillation
- Early termination when converged

#### 2. Frontend Performance

**React Server Components:**
- Initial HTML rendered on server (faster first paint)
- Reduced JavaScript bundle size (server-only code excluded)
- Automatic code splitting

**Code splitting:**
- Each page is a separate bundle
- Components lazy-loaded when needed
- Shared chunks extracted automatically

**Image optimization:**
- Next.js Image component with automatic optimization
- WebP format with PNG fallback
- Lazy loading with intersection observer

**Bundle size:**
- Tree-shaking (unused code eliminated)
- Minification (production build)
- Compression (gzip/brotli)

**Monitoring:**
```bash
pnpm analyze  # Generate bundle size report
```

#### 3. Database Performance

**Prisma optimizations:**
- Connection pooling (reuse connections)
- Query batching (combine multiple queries)
- Select only needed fields (`select: { id: true, name: true }`)
- Avoid N+1 queries (use `include` for related data)

**Indexes:**
- Primary keys (automatic)
- Foreign keys (automatic)
- Custom indexes on frequently queried fields
  - `developer, property, negotiationRound` for negotiation threads
  - `status` for filtering proposals

**Caching:**
- Next.js fetch cache (default: cache everything)
- Revalidation strategies:
  - `revalidate: 60` for config data (1 minute cache)
  - `cache: 'no-store'` for user-specific data
  - On-demand revalidation with `revalidatePath()`

#### 4. API Performance

**Serverless functions:**
- Auto-scaling (handle concurrent requests)
- Cold start optimization (minimal dependencies)
- Edge functions for static content (future)

**Response optimization:**
- JSON compression (gzip)
- Streaming responses for large data
- Pagination for list endpoints

---

## Security Architecture

### Authentication

**Current implementation:**
- Optional Supabase Auth (multi-tenant)
- Custom middleware for single-tenant
- Session-based (HTTP-only cookies)

**Auth flow:**
```
1. User logs in with email/password
2. Server validates credentials
3. Server creates session (JWT stored in HTTP-only cookie)
4. Client includes cookie in all requests (automatic)
5. Server validates session on each request (middleware)
```

### Authorization (RBAC)

**Three roles:**
- **ADMIN**: Full access
- **PLANNER**: Create/edit proposals, run scenarios
- **VIEWER**: Read-only access

**Permission matrix:**

| Action | ADMIN | PLANNER | VIEWER |
|--------|-------|---------|--------|
| View proposals | ✓ | ✓ | ✓ |
| Create proposal | ✓ | ✓ | ✗ |
| Edit own proposal | ✓ | ✓ | ✗ |
| Edit other's proposal | ✓ | ✗ | ✗ |
| Delete own proposal | ✓ | ✓ | ✗ |
| Delete other's proposal | ✓ | ✗ | ✗ |
| Configure system | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Export reports | ✓ | ✓ | ✓ |

**Implementation:**
```typescript
// Middleware: /src/middleware/auth.ts
export async function checkPermission(
  user: User,
  action: Action,
  resource?: Resource
): Promise<boolean> {
  if (user.role === "ADMIN") return true; // Admins can do anything

  if (action === "VIEW") return true; // All roles can view

  if (action === "CREATE" && user.role === "PLANNER") return true;

  if (action === "EDIT" || action === "DELETE") {
    if (user.role === "PLANNER" && resource?.createdBy === user.id) {
      return true; // Planners can edit/delete own proposals
    }
  }

  return false; // Default: deny
}
```

### Data Security

**Encryption:**
- HTTPS/TLS 1.3 for all traffic
- Database connection encrypted (SSL)
- Passwords hashed (bcrypt or Supabase Auth)
- Session tokens signed (JWT)

**Input validation:**
- Zod schemas for all inputs
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React automatic escaping)
- CSRF protection (SameSite cookies)

**Rate limiting:**
- Vercel automatic rate limiting (by IP)
- Custom rate limiting for calculation endpoints
- Exponential backoff for failed login attempts

**Secrets management:**
- Environment variables (`.env.local`)
- Vercel environment variables (production)
- No secrets in code or version control
- Rotate secrets regularly

### Audit Trail

**What's logged:**
- User login/logout
- Configuration changes
- Proposal create/edit/delete
- Scenario and sensitivity analysis runs
- Export actions

**Log format:**
```json
{
  "timestamp": "2024-11-24T10:30:00Z",
  "user": { "id": "abc123", "email": "user@example.com", "role": "PLANNER" },
  "action": "CREATE_PROPOSAL",
  "resource": { "type": "LeaseProposal", "id": "xyz789" },
  "metadata": { "proposalName": "Developer A - Round 1" }
}
```

**Storage:**
- Database table: `AuditLog` (roadmap feature)
- External logging: Sentry (errors), Vercel Logs (requests)

---

## Data Flow

### Proposal Creation Flow

```
1. User fills out wizard (7 steps)
   ↓
2. Form data validated (Zod schema)
   ↓
3. POST /api/proposals (with form data)
   ↓
4. API validates request + authenticates user
   ↓
5. Calculate 30-year projection:
   - Historical period (2023-2024)
   - Transition period (2025-2027)
   - Dynamic period (2028-2053)
   ↓
6. Save proposal + financials to database
   ↓
7. Return proposal ID + metrics
   ↓
8. Redirect to /proposals/[id]
```

### Scenario Calculation Flow (Real-time)

```
1. User adjusts slider (e.g., Enrollment % = 120%)
   ↓
2. Debounce 300ms (wait for user to stop moving slider)
   ↓
3. POST /api/proposals/[id]/scenarios (with slider values)
   ↓
4. Load base proposal from database
   ↓
5. Apply scenario modifiers:
   - Scale enrollment by 120%
   - Adjust CPI, tuition growth, rent escalation
   ↓
6. Recalculate 30 years (in-memory, no DB)
   ↓
7. Compare metrics (Baseline vs Current)
   ↓
8. Return comparison table (50-150ms)
   ↓
9. UI updates instantly (React state update)
```

### Export Flow

```
1. User clicks "Export PDF"
   ↓
2. GET /api/proposals/[id]/export/pdf
   ↓
3. Load proposal from database
   ↓
4. Generate PDF:
   - jsPDF library
   - Add charts (Recharts → Canvas → Image → PDF)
   - Add tables (financial statements)
   - Add summary
   ↓
5. Return PDF as blob
   ↓
6. Browser downloads file
```

---

## Deployment Architecture

### Development Environment

```
Local Machine
  ├── Next.js Dev Server (localhost:3000)
  ├── PostgreSQL (local or Docker)
  └── Environment: .env.local
```

### Production Environment (Vercel)

```
┌─────────────────────────────────────────┐
│          Vercel Edge Network            │
│  (CDN for static assets + edge cache)   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Vercel Serverless Functions       │
│  (Next.js App Router + API Routes)      │
│                                          │
│  - Auto-scaling                          │
│  - Cold start optimization               │
│  - Automatic HTTPS                       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          Supabase (Managed)             │
│  - PostgreSQL 14+ (with connection pool)│
│  - Auth (optional)                       │
│  - Automatic backups                     │
│  - SSL encryption                        │
└──────────────────────────────────────────┘
```

### Alternative: Self-Hosted

```
┌─────────────────────────────────────────┐
│              Load Balancer              │
│  (NGINX or Cloud Load Balancer)         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Next.js Server Instances        │
│  (PM2 or Kubernetes pods)               │
│                                          │
│  - Multiple instances (HA)               │
│  - Health checks                         │
│  - Graceful shutdown                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        PostgreSQL Cluster               │
│  - Primary + Replicas (HA)              │
│  - Connection pooling (PgBouncer)       │
│  - Automated backups                     │
└──────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub Repository
   ↓
   [Push to main branch]
   ↓
GitHub Actions
   ├── Run tests (Vitest)
   ├── Run linters (ESLint, Prettier)
   ├── Type check (TypeScript)
   ├── Build (next build)
   └── Run E2E tests (Playwright)
   ↓
   [All checks pass ✓]
   ↓
Vercel Deployment
   ├── Automatic deployment (preview for PRs)
   ├── Production deployment (main branch)
   └── Automatic rollback on error
```

### Environment Variables

**Required for Production:**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Sentry (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx

# Next.js
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## Scalability Considerations

### Current Capacity

- **Users:** Designed for <1000 concurrent users
- **Proposals:** Unlimited (database constraint)
- **Calculations:** ~10-20 concurrent calculations at a time (CPU-bound)

### Scaling Strategies

**Horizontal scaling:**
- Add more serverless function instances (automatic on Vercel)
- Add database read replicas for read-heavy workloads

**Vertical scaling:**
- Increase database instance size (more CPU, RAM)
- Use faster hardware for calculations

**Caching:**
- Cache frequently accessed proposals
- Cache system configuration (changes rarely)
- Cache scenario results (if slider values identical)

**Optimization:**
- Lazy load financial statements (only fetch visible years)
- Paginate proposal lists (50 per page)
- Stream large exports (don't load all in memory)

---

## Future Architecture Enhancements

**Planned improvements:**
1. **Background Jobs:** Offload long-running calculations (scenario batches)
2. **WebSockets:** Real-time collaboration (multiple planners editing same proposal)
3. **GraphQL:** More flexible API for complex queries
4. **Edge Functions:** Deploy calculation engine to edge for lower latency
5. **Message Queue:** Decouple export generation (RabbitMQ or SQS)
6. **Microservices:** Split calculation engine into separate service (if needed)

---

## Related Documentation

- [Database Schema](DATABASE_SCHEMA.md) - Detailed database design
- [API Reference](API_REFERENCE.md) - Complete API documentation
- [Calculation Formulas](CALCULATION_FORMULAS.md) - Financial formula details
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Document Version:** 2.0
**Last Updated:** December 2025
**Maintained By:** Documentation Agent
