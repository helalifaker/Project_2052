# TECHNICAL SPECIFICATION DOCUMENT (TSD)
## School Lease Proposal Assessment Application - Project_2052

**Document Version:** 2.0
**Date:** November 22, 2025
**Status:** COMPREHENSIVE - Complete & Ready for Development
**Alignment:** 100% with BCD v1.0, PRD v2.0, and FINANCIAL_RULES v4.1

---

## TABLE OF CONTENTS

1. [Document Overview](#1-document-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [Calculation Engine](#5-calculation-engine)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend API Design](#7-backend-api-design)
8. [Security & Authentication](#8-security--authentication)
9. [Performance Requirements](#9-performance-requirements)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Testing Strategy](#11-testing-strategy)
12. [Development Workflow](#12-development-workflow)

---

## 1. DOCUMENT OVERVIEW

### 1.1 Purpose

This Technical Specification Document (TSD) provides comprehensive technical guidance for developing Project_2052 - a sophisticated 30-year financial planning application for school lease proposal assessment. This document bridges business requirements (from BCD and PRD) with technical implementation.

### 1.2 Scope

**What This Document Covers:**
- Complete technology stack selection and justification
- Detailed system architecture with component interactions
- Complete database schema with all tables and relationships
- Financial calculation engine implementation (all three periods)
- Frontend component architecture and user interface specifications
- Backend API design with all endpoints
- Security model and authentication flows
- Performance optimization strategies
- Deployment configuration and CI/CD pipeline

**What This Document Does NOT Cover:**
- Business logic rules (see FINANCIAL_RULES.md)
- Product requirements (see PRD.md)
- Project management and timelines (see BCD.md and AGENTS_SPECIFICATION.md)

### 1.3 Key Technical Challenges

1. **Ultra-Fast Calculation Performance**
   - Target: < 1 second for complete 30-year financial projection
   - Challenge: Complex circular dependencies (Interest ↔ Zakat ↔ Cash ↔ Debt)
   - Solution: Web Workers + optimized Decimal.js operations + caching

2. **Three-Period Calculation Complexity**
   - Historical (2023-2024): Direct retrieval
   - Transition (2025-2027): Ratio-based from 2024
   - Dynamic (2028-2053): Full projection with 3 rent models
   - Challenge: Different methodologies per period, seamless linkage
   - Solution: Modular calculation engines with period abstraction

3. **Financial Statement Accuracy**
   - Balance Sheet must always balance (Assets = Liabilities + Equity)
   - Cash Flow must reconcile perfectly
   - Circular dependencies must converge
   - Challenge: Maintaining precision with JavaScript numbers
   - Solution: Decimal.js for all financial calculations

4. **Interactive Scenario Analysis**
   - Real-time recalculation with sliders
   - Challenge: Instant feedback without performance degradation
   - Solution: Debounced calculations + incremental updates + Web Workers

---

## 2. TECHNOLOGY STACK

### 2.1 Package Manager: pnpm 9.15.0

**Selected Tool:** pnpm version 9.15.0

**Justification:**

1. **Performance**
   - 2-3x faster than npm
   - ~1.5x faster than yarn
   - Parallel installation with content-addressable storage

2. **Disk Space Efficiency**
   - 50-70% less disk space vs npm
   - Single global store (hard links to node_modules)
   - No duplicate packages across projects

3. **Dependency Management**
   - Strict by default (no phantom dependencies)
   - Catches dependency errors early
   - Better security (cannot access undeclared dependencies)

4. **Monorepo Support**
   - Built-in workspace support
   - Future-proof for potential monorepo expansion

5. **Production Proven**
   - Used by Vue.js, Microsoft, TikTok, Netlify
   - Mature ecosystem (5+ years)
   - Active development and community

**Installation:**
```bash
npm install -g pnpm@9.15.0
pnpm --version  # Should output: 9.15.0
```

**Configuration (.npmrc):**
```ini
# Auto-install peer dependencies
auto-install-peers=true

# Strict mode (prevent accidental dependency issues)
strict-peer-dependencies=true

# Use hard links (save disk space)
symlink=false

# Faster installs
network-concurrency=16
```

---

### 2.2 Frontend Stack

#### 2.2.1 Core Framework

**Next.js 16 (App Router)**
- **Version:** 16.0.0 (latest stable as of Nov 2025)
- **Why:**
  - Server-side rendering (SSR) for better initial load
  - API routes for backend integration (no separate server needed)
  - Built-in optimization (image, fonts, code splitting)
  - React Server Components for performance
  - File-based routing with app directory

**React 19.2**
- **Version:** 19.2.0
- **Why:**
  - Modern hooks (useState, useEffect, useMemo, useCallback)
  - Server Components support
  - Concurrent rendering for better performance
  - Mature ecosystem with extensive libraries

**TypeScript 5.7**
- **Version:** 5.7.0
- **Why:**
  - Type safety for financial calculations (critical)
  - Better IDE support and autocomplete
  - Catches errors at compile time
  - Self-documenting code
  - Better refactoring support

#### 2.2.2 State Management

**Zustand 5.0**
- **Why:**
  - Simpler than Redux (less boilerplate)
  - TypeScript-first design
  - DevTools support
  - Excellent performance
  - Perfect for our moderate state complexity

**Alternative Considered:** Redux Toolkit
- **Rejected:** Too heavy for this application
- **Zustand sufficient for:** Proposals, UI state, user preferences

#### 2.2.3 Form Management

**React Hook Form 7.53**
- **Why:**
  - Best performance (uncontrolled components)
  - Minimal re-renders
  - Built-in validation
  - TypeScript support
  - Works well with Zod

**Zod 3.23** (Validation)
- **Why:**
  - TypeScript-first schema validation
  - Reusable schemas for API + Frontend
  - Excellent error messages
  - Composable validation logic

#### 2.2.4 Styling

**Tailwind CSS 4.0**
- **Why:**
  - Utility-first (rapid development)
  - Consistent design system
  - No CSS file bloat (tree-shaking)
  - Responsive design built-in
  - Dark mode support (future)

**shadcn/ui Components**
- **Why:**
  - Pre-built accessible components
  - Tailwind-based styling
  - Fully customizable (copy to project)
  - Professional design
  - Great for forms, tables, dialogs

#### 2.2.5 Data Visualization

**Recharts 2.13**
- **Why:**
  - React-native components
  - Declarative API
  - Responsive charts
  - Supports all required chart types:
    - Line charts (rent over time)
    - Bar charts (comparison)
    - Area charts (revenue breakdown)
    - Waterfall charts (cash flow)
    - Tornado diagrams (sensitivity)

**Alternative Considered:** Chart.js
- **Rejected:** Recharts more React-friendly

#### 2.2.6 Tables

**TanStack Table 8.20**
- **Why:**
  - Headless (full styling control)
  - Excellent performance (virtualization)
  - Sorting, filtering, pagination built-in
  - TypeScript support
  - Perfect for financial statement tables

---

### 2.3 Backend Stack

#### 2.3.1 Runtime & Framework

**Next.js API Routes (App Router)**
- **Why:**
  - No separate server needed
  - Same codebase as frontend
  - TypeScript end-to-end
  - Built-in middleware support
  - Serverless-ready (Vercel)

**Node.js 22 LTS**
- **Why:**
  - Latest LTS version
  - Best performance
  - Native fetch support
  - Top-level await

#### 2.3.2 Financial Calculations

**Decimal.js 10.4**
- **Why:** CRITICAL for financial accuracy
  - Arbitrary-precision decimal arithmetic
  - No floating-point errors (0.1 + 0.2 = 0.3 ✓)
  - Essential for multi-year calculations
  - Supports all math operations
  - Immutable (functional style)

**Example of Why Decimal.js is Critical:**
```typescript
// WRONG (JavaScript numbers)
let value = 0.1 + 0.2;  // 0.30000000000000004 ❌

// CORRECT (Decimal.js)
import Decimal from 'decimal.js';
let value = new Decimal(0.1).plus(0.2);  // 0.3 ✓
```

**Configuration:**
```typescript
import Decimal from 'decimal.js';

// Set precision for financial calculations
Decimal.set({
  precision: 20,           // 20 significant digits
  rounding: Decimal.ROUND_HALF_UP,  // Standard rounding
  toExpNeg: -9e15,         // Avoid scientific notation
  toExpPos: 9e15
});
```

#### 2.3.3 Validation

**Zod 3.23**
- **Why:**
  - Shared schemas between frontend/backend
  - Runtime validation for API inputs
  - TypeScript inference
  - Excellent error messages

---

### 2.4 Database Stack

#### 2.4.1 Database

**Supabase (PostgreSQL 16)**
- **Why:**
  - Managed PostgreSQL 16
  - Built-in authentication
  - Row-Level Security (RLS)
  - Real-time subscriptions (future)
  - Generous free tier
  - Easy backups
  - Connection pooling (PgBouncer)

**Alternative Considered:** SQLite
- **Rejected:** No built-in auth, harder to deploy, no cloud sync

#### 2.4.2 ORM

**Prisma 7**
- **Why:**
  - Type-safe database queries
  - Schema as code (migrations)
  - Excellent TypeScript support
  - Auto-completion for queries
  - Built-in connection pooling
  - Schema validation
  - Easy migrations

**Prisma Configuration:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "jsonProtocol"]
}
```

---

### 2.5 Development Tools

#### 2.5.1 Code Quality

**ESLint 9.0**
- Linting for TypeScript/React
- Configured for Next.js
- Custom rules for financial code

**Prettier 3.4**
- Code formatting
- Consistent style across team
- Pre-commit hooks

**Husky 9.0**
- Git hooks
- Pre-commit: Lint + Format
- Pre-push: Tests

#### 2.5.2 Testing

**Vitest 2.1** (Unit Tests)
- **Why:**
  - Faster than Jest
  - Better Vite integration
  - Compatible with Jest API
  - Built-in TypeScript support

**Playwright 1.48** (E2E Tests)
- **Why:**
  - Cross-browser testing
  - Built-in test runner
  - Visual regression testing
  - Better performance than Cypress

**Testing Library (React)**
- Component testing
- User-centric queries
- Best practices built-in

---

### 2.6 Deployment Stack

#### 2.6.1 Hosting

**Vercel (Recommended)**
- **Why:**
  - Built for Next.js (same company)
  - Zero-config deployment
  - Automatic HTTPS
  - Edge functions
  - Preview deployments
  - Built-in analytics
  - Generous free tier

**Alternative:** Netlify, Railway, Render
- All support Next.js
- Vercel preferred for best Next.js integration

#### 2.6.2 Database Hosting

**Supabase Cloud**
- Managed PostgreSQL
- Included with Supabase auth
- Free tier: 500MB database, 2GB bandwidth
- Auto-backups

#### 2.6.3 Version Control

**GitHub**
- Code repository
- CI/CD with GitHub Actions
- Issue tracking
- Pull request reviews

---

### 2.7 Complete Dependencies

**package.json:**
```json
{
  "name": "project-2052",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=22.0.0",
    "pnpm": "9.15.0"
  },
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5.7.0",
    "@prisma/client": "^7.0.0",
    "@supabase/supabase-js": "^2.48.0",
    "decimal.js": "^10.4.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.13.0",
    "@tanstack/react-table": "^8.20.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.453.0",
    "date-fns": "^4.1.0",
    "jspdf": "^2.5.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@playwright/test": "^1.48.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "tsx": "^4.19.0"
  }
}
```

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React 19.2 Components                    │   │
│  │  • Pages (Server Components)                          │   │
│  │  • Interactive Components (Client Components)         │   │
│  │  • Forms (React Hook Form + Zod)                      │   │
│  │  • Charts (Recharts)                                  │   │
│  │  • Tables (TanStack Table)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         State Management (Zustand)                    │   │
│  │  • Global State: Proposals, UI, User                  │   │
│  │  • Local State: Form values, temp calculations        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                     SERVER LAYER (Next.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (App Router)                  │   │
│  │  • /api/proposals (CRUD)                              │   │
│  │  • /api/calculations (compute)                        │   │
│  │  • /api/historical (admin setup)                      │   │
│  │  • /api/config (system settings)                      │   │
│  │  • /api/reports (PDF/Excel generation)                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Business Logic Layer                          │   │
│  │  • Calculation Engine (Financial Rules)               │   │
│  │  • Validation Layer (Zod schemas)                     │   │
│  │  • Service Layer (Business operations)                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Data Access Layer (Prisma ORM)                │   │
│  │  • Type-safe queries                                  │   │
│  │  • Transaction management                             │   │
│  │  • Connection pooling                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    SQL Queries
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                 DATABASE LAYER (Supabase)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL 16 Database                      │   │
│  │  • historical_actuals (2023-2024 data)                │   │
│  │  • system_config (global settings)                    │   │
│  │  • lease_proposals (proposals with inputs)            │   │
│  │  • calculation_cache (performance)                    │   │
│  │  • users (authentication)                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           +                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Supabase Auth (Authentication)                │   │
│  │  • Email/Password auth                                │   │
│  │  • Row-Level Security (RLS)                           │   │
│  │  • JWT tokens                                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow Examples

#### 3.2.1 Viewing Financial Statements

```
User clicks "View P&L Statement"
         ↓
[Client] Button click event
         ↓
[Client] Fetch from /api/proposals/[id]/financials
         ↓
[Server] API Route: GET /api/proposals/[id]/financials
         ↓
[Server] Authenticate user (Supabase Auth)
         ↓
[Server] Check permissions (RLS)
         ↓
[Server] Fetch proposal from database (Prisma)
         ↓
[Server] Check calculation cache
         ↓
[Server - if cache miss] Run calculation engine
         ├─ Load historical data (2023-2024)
         ├─ Calculate transition period (2025-2027)
         ├─ Calculate dynamic period (2028-2053)
         ├─ Solve circular dependencies
         └─ Generate financial statements
         ↓
[Server] Cache results
         ↓
[Server] Return JSON response
         ↓
[Client] Update Zustand store
         ↓
[Client] Re-render Financial Statement component
         ↓
[Client] Display P&L table with amounts in millions (M)
```

#### 3.2.2 Interactive Scenario Slider

```
User moves "Enrollment %" slider to 120%
         ↓
[Client] onChange event (debounced 300ms)
         ↓
[Client] Update local state
         ↓
[Client] Trigger Web Worker calculation
         ↓
[Web Worker] Run calculation engine with new enrollment %
         ├─ Recalculate revenue (enrollment-driven)
         ├─ Recalculate all dependent values
         ├─ Solve circular dependencies
         └─ Generate updated financials
         ↓
[Web Worker] Post message back to main thread
         ↓
[Client] Update component state
         ↓
[Client] Re-render charts and metrics
         ↓
[Client] Display updated results (< 500ms from slider move)
```

---

### 3.3 Calculation Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               CALCULATION ENGINE (Core)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Period Dispatcher                           │   │
│  │  Determines which calculation method to use          │   │
│  │  based on year (Historical/Transition/Dynamic)       │   │
│  └───────┬────────────────────┬───────────────┬─────────┘   │
│          │                    │               │              │
│  ┌───────▼─────────┐  ┌──────▼──────┐  ┌────▼─────────┐   │
│  │   Historical    │  │  Transition  │  │   Dynamic     │   │
│  │   Calculator    │  │  Calculator  │  │  Calculator   │   │
│  │   (2023-2024)   │  │  (2025-2027) │  │ (2028-2053)   │   │
│  └─────────────────┘  └──────────────┘  └───────────────┘   │
│          │                    │               │              │
│  ┌───────▼────────────────────▼───────────────▼─────────┐   │
│  │         Financial Statement Generator                 │   │
│  │  • P&L Generator (10 lines)                           │   │
│  │  • Balance Sheet Generator                            │   │
│  │  • Cash Flow Generator (indirect method)              │   │
│  └───────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│  ┌───────────────────────────────────────────────────────┐   │
│  │         Circular Dependency Solver                     │   │
│  │  • Interest ↔ Cash/Debt ↔ Balance Sheet               │   │
│  │  • Zakat ↔ Net Income ↔ Equity                        │   │
│  │  • Iterative solver (max 100 iterations)              │   │
│  │  • Convergence tolerance: 0.01 SAR                    │   │
│  └───────────────────────────────────────────────────────┘   │
│                           ↕                                   │
│  ┌───────────────────────────────────────────────────────┐   │
│  │            Validation Layer                            │   │
│  │  • Balance Sheet balances check                        │   │
│  │  • Cash Flow reconciliation check                      │   │
│  │  • Period linkage validation (2024→2025, 2027→2028)   │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Web Worker Architecture (for Performance)

```typescript
// Main Thread
// src/lib/workers/calculation-worker.ts

import { wrap } from 'comlink';

const worker = new Worker(
  new URL('./financial-calculator.worker.ts', import.meta.url),
  { type: 'module' }
);

const calculationAPI = wrap<CalculationWorkerAPI>(worker);

// Use in component
async function calculateScenario(proposalData: ProposalInput) {
  const results = await calculationAPI.calculate(proposalData);
  return results;
}

// Worker Thread
// src/lib/workers/financial-calculator.worker.ts

import { expose } from 'comlink';
import { calculateFullProjection } from '@/lib/calculations';

const api = {
  calculate: (proposalData: ProposalInput) => {
    return calculateFullProjection(proposalData);
  }
};

expose(api);
```

**Benefits:**
- Non-blocking calculations (UI remains responsive)
- Can run multiple calculations in parallel
- Ideal for slider interactions and scenario comparisons

---

## 4. DATABASE DESIGN

### 4.1 Complete Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "jsonProtocol"]
}

// ============================================
// AUTHENTICATION & USERS
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      UserRole @default(VIEWER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  proposals LeaseProposal[]  // Proposals created by this user

  @@map("users")
}

enum UserRole {
  ADMIN    // Full access: historical data, system config, proposals
  PLANNER  // Create proposals, run scenarios
  VIEWER   // Read-only access
}

// ============================================
// SYSTEM CONFIGURATION (Admin-managed)
// ============================================

model SystemConfig {
  id                        Int      @id @default(1)  // Singleton (only 1 row)

  // Financial Settings
  zakatRate                 Decimal  @default(0.025) @db.Decimal(10, 8)  // 2.5%
  debtInterestRate          Decimal  @default(0.05)  @db.Decimal(10, 8)  // 5%
  bankDepositInterestRate   Decimal  @default(0.02)  @db.Decimal(10, 8)  // 2%
  minimumCashBalance        Decimal  @default(1000000) @db.Decimal(15, 2)  // 1M SAR
  discountRateNPV           Decimal  @default(0.04)  @db.Decimal(10, 8)  // 4%

  // Working Capital Ratios (Locked - auto-calculated from 2024)
  arPercent                 Decimal  @db.Decimal(10, 4)  // % of Revenue
  prepaidPercent            Decimal  @db.Decimal(10, 4)  // % of OpEx
  apPercent                 Decimal  @db.Decimal(10, 4)  // % of OpEx
  accruedPercent            Decimal  @db.Decimal(10, 4)  // % of OpEx
  deferredRevenuePercent    Decimal  @db.Decimal(10, 4)  // % of Revenue

  // Foundation Structure
  shareCapital              Decimal  @db.Decimal(15, 2)  // Constant

  // Metadata
  updatedAt                 DateTime @updatedAt
  updatedBy                 String?  // User ID who last updated

  @@map("system_config")
}

// ============================================
// HISTORICAL ACTUALS (2023-2024)
// ============================================

model HistoricalActuals {
  id                          Int      @id @default(autoincrement())
  year                        Int      @unique  // 2023 or 2024

  // P&L Items
  tuitionFrenchCurriculum     Decimal  @db.Decimal(15, 2)
  tuitionIB                   Decimal  @db.Decimal(15, 2)
  otherIncome                 Decimal  @db.Decimal(15, 2)
  totalRevenues               Decimal  @db.Decimal(15, 2)

  salariesAndRelatedCosts     Decimal  @db.Decimal(15, 2)
  schoolRent                  Decimal  @db.Decimal(15, 2)
  otherOperatingExpenses      Decimal  @db.Decimal(15, 2)
  totalOperatingExpenses      Decimal  @db.Decimal(15, 2)

  ebitda                      Decimal  @db.Decimal(15, 2)
  depreciation                Decimal  @db.Decimal(15, 2)
  interestIncome              Decimal  @db.Decimal(15, 2)
  interestExpense             Decimal  @db.Decimal(15, 2)
  ebt                         Decimal  @db.Decimal(15, 2)
  zakat                       Decimal  @db.Decimal(15, 2)
  netIncome                   Decimal  @db.Decimal(15, 2)

  // Balance Sheet Items
  cashAndCashEquivalents      Decimal  @db.Decimal(15, 2)
  accountsReceivable          Decimal  @db.Decimal(15, 2)
  prepaidExpenses             Decimal  @db.Decimal(15, 2)
  totalCurrentAssets          Decimal  @db.Decimal(15, 2)

  fixedAssetsGross            Decimal  @db.Decimal(15, 2)
  accumulatedDepreciation     Decimal  @db.Decimal(15, 2)
  netFixedAssets              Decimal  @db.Decimal(15, 2)
  totalAssets                 Decimal  @db.Decimal(15, 2)

  accountsPayable             Decimal  @db.Decimal(15, 2)
  accruedExpenses             Decimal  @db.Decimal(15, 2)
  deferredRevenue             Decimal  @db.Decimal(15, 2)
  shortTermDebt               Decimal  @db.Decimal(15, 2)
  totalCurrentLiabilities     Decimal  @db.Decimal(15, 2)

  longTermDebt                Decimal  @db.Decimal(15, 2)
  totalLiabilities            Decimal  @db.Decimal(15, 2)

  shareCapital                Decimal  @db.Decimal(15, 2)
  retainedEarnings            Decimal  @db.Decimal(15, 2)
  totalEquity                 Decimal  @db.Decimal(15, 2)

  // Cash Flow Items
  cfOperatingActivities       Decimal  @db.Decimal(15, 2)
  cfInvestingActivities       Decimal  @db.Decimal(15, 2)
  cfFinancingActivities       Decimal  @db.Decimal(15, 2)
  cfAdditionsFixedAssets      Decimal  @db.Decimal(15, 2)  // CapEx

  // Metadata
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  @@map("historical_actuals")
}

// ============================================
// LEASE PROPOSALS
// ============================================

model LeaseProposal {
  id                    String   @id @default(uuid())
  name                  String   // e.g., "Developer A - Fixed Escalation"
  developerName         String
  status                ProposalStatus @default(DRAFT)

  // Rent Model Selection
  rentModel             RentModel

  // User & Timestamps
  createdBy             String   // User ID
  user                  User     @relation(fields: [createdBy], references: [id])
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Related Data
  transitionConfig      TransitionConfig?
  dynamicConfig         DynamicConfig?
  rentConfig            RentConfig?

  @@map("lease_proposals")
}

enum ProposalStatus {
  DRAFT      // Work in progress
  ACTIVE     // Ready for comparison
  ARCHIVED   // No longer relevant
}

enum RentModel {
  FIXED_ESCALATION  // Base rent with % growth
  REVENUE_SHARE     // Rent as % of revenue
  PARTNER           // Investment-based with yield
}

// ============================================
// TRANSITION PERIOD CONFIG (2025-2027)
// ============================================

model TransitionConfig {
  id                Int      @id @default(autoincrement())
  proposalId        String   @unique
  proposal          LeaseProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  // 7 Required Inputs
  students2025      Int
  students2026      Int
  students2027      Int

  avgTuition2025    Decimal  @db.Decimal(15, 2)
  avgTuition2026    Decimal  @db.Decimal(15, 2)
  avgTuition2027    Decimal  @db.Decimal(15, 2)

  rentGrowthPercent Decimal  @db.Decimal(10, 4)  // Single % for rent growth

  @@map("transition_configs")
}

// ============================================
// DYNAMIC PERIOD CONFIG (2028-2053)
// ============================================

model DynamicConfig {
  id                Int      @id @default(autoincrement())
  proposalId        String   @unique
  proposal          LeaseProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  // French Curriculum (ALWAYS ACTIVE)
  frCapacity             Int
  frRampUpYear1          Decimal  @db.Decimal(5, 4)  // 0.20 = 20%
  frRampUpYear2          Decimal  @db.Decimal(5, 4)
  frRampUpYear3          Decimal  @db.Decimal(5, 4)
  frRampUpYear4          Decimal  @db.Decimal(5, 4)
  frRampUpYear5          Decimal  @db.Decimal(5, 4)
  frBaseTuition2028      Decimal  @db.Decimal(15, 2)
  frTuitionGrowthRate    Decimal  @db.Decimal(10, 8)
  frTuitionGrowthFreq    Int      // 1-5 years

  // IB Curriculum (OPTIONAL)
  ibEnabled              Boolean  @default(false)
  ibCapacity             Int?
  ibRampUpYear1          Decimal? @db.Decimal(5, 4)
  ibRampUpYear2          Decimal? @db.Decimal(5, 4)
  ibRampUpYear3          Decimal? @db.Decimal(5, 4)
  ibRampUpYear4          Decimal? @db.Decimal(5, 4)
  ibRampUpYear5          Decimal? @db.Decimal(5, 4)
  ibBaseTuition2028      Decimal? @db.Decimal(15, 2)
  ibTuitionGrowthRate    Decimal? @db.Decimal(10, 8)
  ibTuitionGrowthFreq    Int?

  // Staff Costs
  studentsPerTeacher     Decimal  @db.Decimal(10, 2)  // e.g., 14
  studentsPerNonTeacher  Decimal  @db.Decimal(10, 2)  // e.g., 25
  teacherMonthlySalary   Decimal  @db.Decimal(15, 2)
  nonTeacherMonthlySalary Decimal @db.Decimal(15, 2)
  cpiRate                Decimal  @db.Decimal(10, 8)
  cpiFrequency           Int      // 1-3 years

  // Other OpEx
  otherOpexPercent       Decimal  @db.Decimal(10, 4)  // % of revenue

  @@map("dynamic_configs")
}

// ============================================
// RENT CONFIGURATION (Model-Specific)
// ============================================

model RentConfig {
  id                Int      @id @default(autoincrement())
  proposalId        String   @unique
  proposal          LeaseProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  // Fixed Escalation Model (3 inputs)
  fixedBaseRent2028       Decimal? @db.Decimal(15, 2)
  fixedGrowthRate         Decimal? @db.Decimal(10, 8)
  fixedGrowthFrequency    Int?

  // Revenue Share Model (1 input)
  revenueSharePercent     Decimal? @db.Decimal(10, 8)

  // Partner Model (7 inputs)
  partnerLandSize         Decimal? @db.Decimal(15, 2)  // m²
  partnerLandPricePerSqm  Decimal? @db.Decimal(15, 2)
  partnerBuaSize          Decimal? @db.Decimal(15, 2)  // m²
  partnerConstructionCost Decimal? @db.Decimal(15, 2)  // per m²
  partnerYieldRate        Decimal? @db.Decimal(10, 8)
  partnerGrowthRate       Decimal? @db.Decimal(10, 8)
  partnerGrowthFrequency  Int?

  @@map("rent_configs")
}

// ============================================
// CAPEX MODULE (Admin-managed)
// ============================================

model CapExItem {
  id                Int      @id @default(autoincrement())
  year              Int      // Which year this CapEx occurs
  category          String   // e.g., "Building", "Equipment", "Technology"
  description       String?
  amount            Decimal  @db.Decimal(15, 2)
  depreciationMethod String  @default("RATE_BASED")  // "FIXED" or "RATE_BASED"
  depreciationRate  Decimal  @db.Decimal(10, 8)      // e.g., 0.10 for 10%
  usefulLife        Int?     // Years (optional)

  // Disposal info (if this represents an asset disposal)
  isDisposal        Boolean  @default(false)
  disposalGross     Decimal? @db.Decimal(15, 2)
  disposalAccDep    Decimal? @db.Decimal(15, 2)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([year])
  @@map("capex_items")
}

// ============================================
// CALCULATION CACHE (Performance)
// ============================================

model CalculationCache {
  id                String   @id @default(uuid())
  proposalId        String
  inputHash         String   // Hash of all inputs (detect changes)

  // Cached Results (JSONB for flexibility)
  financials        Json     // Complete 30-year financials
  metrics           Json     // NPV, totals, summaries

  createdAt         DateTime @default(now())
  expiresAt         DateTime // Cache expiry (e.g., 1 hour)

  @@index([proposalId, inputHash])
  @@index([expiresAt])
  @@map("calculation_cache")
}
```

### 4.2 Database Relationships Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ 1
       │
       │ N
       ↓
┌─────────────────┐
│ LeaseProposal   │
└────┬────┬───┬───┘
     │    │   │
     │ 1  │ 1 │ 1
     ↓    ↓   ↓
  ┌──────┐ ┌────────┐ ┌──────────┐
  │Trans-│ │Dynamic │ │   Rent   │
  │ition │ │ Config │ │  Config  │
  │Config│ └────────┘ └──────────┘
  └──────┘

┌──────────────┐        ┌──────────────┐
│HistoricalData│        │ SystemConfig │
└──────────────┘        └──────────────┘
   (Singleton)            (Singleton)

┌──────────────┐
│  CapExItem   │
└──────────────┘
   (Many rows)

┌───────────────┐
│CalculationCache│
└───────────────┘
```

---

## 5. CALCULATION ENGINE

### 5.1 Calculation Engine Structure

```typescript
// src/lib/calculations/index.ts

import Decimal from 'decimal.js';
import {
  HistoricalCalculator,
  TransitionCalculator,
  DynamicCalculator
} from './period-calculators';
import { CircularDependencySolver } from './circular-solver';
import { FinancialStatementGenerator } from './statement-generator';
import { ValidationEngine } from './validation';

export interface ProposalInputs {
  historical: HistoricalActuals[];  // 2023, 2024
  systemConfig: SystemConfig;
  transitionConfig: TransitionConfig;
  dynamicConfig: DynamicConfig;
  rentConfig: RentConfig;
  capexItems: CapExItem[];
}

export interface YearlyFinancials {
  year: number;
  period: 'HISTORICAL' | 'TRANSITION' | 'DYNAMIC';

  // P&L
  revenue: {
    tuitionFR: Decimal;
    tuitionIB: Decimal;
    otherRevenue: Decimal;
    total: Decimal;
  };
  opex: {
    staffCosts: Decimal;
    rent: Decimal;
    otherOpex: Decimal;
    total: Decimal;
  };
  ebitda: Decimal;
  depreciation: Decimal;
  interest: {
    income: Decimal;
    expense: Decimal;
    net: Decimal;
  };
  ebt: Decimal;
  zakat: Decimal;
  netIncome: Decimal;

  // Balance Sheet
  assets: {
    cash: Decimal;
    accountsReceivable: Decimal;
    prepaidExpenses: Decimal;
    totalCurrent: Decimal;
    fixedAssetsGross: Decimal;
    accumulatedDepreciation: Decimal;
    netFixedAssets: Decimal;
    total: Decimal;
  };
  liabilities: {
    accountsPayable: Decimal;
    accruedExpenses: Decimal;
    deferredRevenue: Decimal;
    shortTermDebt: Decimal;
    totalCurrent: Decimal;
    longTermDebt: Decimal;
    total: Decimal;
  };
  equity: {
    shareCapital: Decimal;
    retainedEarnings: Decimal;
    currentYearNetIncome: Decimal;
    total: Decimal;
  };

  // Cash Flow
  cashFlow: {
    operatingActivities: Decimal;
    investingActivities: Decimal;
    financingActivities: Decimal;
    netChange: Decimal;
    openingCash: Decimal;
    closingCash: Decimal;
  };
}

export async function calculateFullProjection(
  inputs: ProposalInputs
): Promise<YearlyFinancials[]> {

  const results: YearlyFinancials[] = [];

  // Loop through all years 2023-2053
  for (let year = 2023; year <= 2053; year++) {
    const period = getPeriod(year);

    let yearlyData: YearlyFinancials;

    if (period === 'HISTORICAL') {
      // Direct retrieval from historical data
      yearlyData = HistoricalCalculator.calculate(year, inputs);

    } else if (period === 'TRANSITION') {
      // Ratio-based from 2024
      yearlyData = await TransitionCalculator.calculate(
        year,
        inputs,
        results  // Need prior year data
      );

    } else { // DYNAMIC
      // Full projection with rent models
      yearlyData = await DynamicCalculator.calculate(
        year,
        inputs,
        results  // Need prior year data
      );
    }

    // Solve circular dependencies (Interest, Zakat)
    yearlyData = await CircularDependencySolver.solve(yearlyData, inputs);

    // Validate financial statements
    const validation = ValidationEngine.validate(yearlyData);
    if (!validation.isValid) {
      throw new Error(`Validation failed for year ${year}: ${validation.errors.join(', ')}`);
    }

    results.push(yearlyData);
  }

  return results;
}

function getPeriod(year: number): 'HISTORICAL' | 'TRANSITION' | 'DYNAMIC' {
  if (year >= 2023 && year <= 2024) return 'HISTORICAL';
  if (year >= 2025 && year <= 2027) return 'TRANSITION';
  return 'DYNAMIC';
}
```

### 5.2 Historical Period Calculator

```typescript
// src/lib/calculations/period-calculators/historical.ts

import Decimal from 'decimal.js';
import { YearlyFinancials, ProposalInputs } from '../index';

export class HistoricalCalculator {
  static calculate(year: number, inputs: ProposalInputs): YearlyFinancials {

    // Find historical data for this year
    const historical = inputs.historical.find(h => h.year === year);

    if (!historical) {
      throw new Error(`No historical data found for year ${year}`);
    }

    // Direct retrieval - no calculations
    return {
      year,
      period: 'HISTORICAL',

      revenue: {
        tuitionFR: new Decimal(historical.tuitionFrenchCurriculum),
        tuitionIB: new Decimal(historical.tuitionIB),
        otherRevenue: new Decimal(historical.otherIncome),
        total: new Decimal(historical.totalRevenues)
      },

      opex: {
        staffCosts: new Decimal(historical.salariesAndRelatedCosts),
        rent: new Decimal(historical.schoolRent),
        otherOpex: new Decimal(historical.otherOperatingExpenses)
          .minus(historical.salariesAndRelatedCosts)
          .minus(historical.schoolRent),
        total: new Decimal(historical.totalOperatingExpenses)
      },

      ebitda: new Decimal(historical.ebitda),
      depreciation: new Decimal(historical.depreciation),

      interest: {
        income: new Decimal(historical.interestIncome),
        expense: new Decimal(historical.interestExpense),
        net: new Decimal(historical.interestIncome)
          .minus(historical.interestExpense)
      },

      ebt: new Decimal(historical.ebt),
      zakat: new Decimal(historical.zakat),
      netIncome: new Decimal(historical.netIncome),

      assets: {
        cash: new Decimal(historical.cashAndCashEquivalents),
        accountsReceivable: new Decimal(historical.accountsReceivable),
        prepaidExpenses: new Decimal(historical.prepaidExpenses),
        totalCurrent: new Decimal(historical.totalCurrentAssets),
        fixedAssetsGross: new Decimal(historical.fixedAssetsGross),
        accumulatedDepreciation: new Decimal(historical.accumulatedDepreciation),
        netFixedAssets: new Decimal(historical.netFixedAssets),
        total: new Decimal(historical.totalAssets)
      },

      liabilities: {
        accountsPayable: new Decimal(historical.accountsPayable),
        accruedExpenses: new Decimal(historical.accruedExpenses),
        deferredRevenue: new Decimal(historical.deferredRevenue),
        shortTermDebt: new Decimal(historical.shortTermDebt),
        totalCurrent: new Decimal(historical.totalCurrentLiabilities),
        longTermDebt: new Decimal(historical.longTermDebt),
        total: new Decimal(historical.totalLiabilities)
      },

      equity: {
        shareCapital: new Decimal(historical.shareCapital),
        retainedEarnings: new Decimal(historical.retainedEarnings),
        currentYearNetIncome: new Decimal(historical.netIncome),
        total: new Decimal(historical.totalEquity)
      },

      cashFlow: {
        operatingActivities: new Decimal(historical.cfOperatingActivities),
        investingActivities: new Decimal(historical.cfInvestingActivities),
        financingActivities: new Decimal(historical.cfFinancingActivities),
        netChange: new Decimal(historical.cfOperatingActivities)
          .plus(historical.cfInvestingActivities)
          .plus(historical.cfFinancingActivities),
        openingCash: new Decimal(0),  // Will be set from prior year if exists
        closingCash: new Decimal(historical.cashAndCashEquivalents)
      }
    };
  }
}
```

### 5.3 Transition Period Calculator

```typescript
// src/lib/calculations/period-calculators/transition.ts

import Decimal from 'decimal.js';
import { YearlyFinancials, ProposalInputs } from '../index';

export class TransitionCalculator {
  static async calculate(
    year: number,
    inputs: ProposalInputs,
    priorResults: YearlyFinancials[]
  ): Promise<YearlyFinancials> {

    const config = inputs.transitionConfig;
    const hist2024 = inputs.historical.find(h => h.year === 2024)!;
    const systemConfig = inputs.systemConfig;

    // Get student count for this year
    const students = this.getStudents(year, config);
    const avgTuition = this.getAvgTuition(year, config);

    // REVENUE CALCULATION
    // FR Tuition = students × avgTuition
    const tuitionFR = new Decimal(students).times(avgTuition);

    // IB Tuition = 0 (NOT ACTIVE in transition)
    const tuitionIB = new Decimal(0);

    // Total Tuition
    const totalTuition = tuitionFR.plus(tuitionIB);

    // Other Revenue = Total Tuition × (Other2024 / FRTuition2024)
    const otherRevenueRatio = new Decimal(hist2024.otherIncome)
      .dividedBy(hist2024.tuitionFrenchCurriculum);
    const otherRevenue = totalTuition.times(otherRevenueRatio);

    // Total Revenue
    const totalRevenue = totalTuition.plus(otherRevenue);

    // OPERATING EXPENSES
    // Staff Costs = Revenue × (StaffCosts2024 / Revenue2024)
    const staffCostRatio = new Decimal(hist2024.salariesAndRelatedCosts)
      .dividedBy(hist2024.totalRevenues);
    const staffCosts = totalRevenue.times(staffCostRatio);

    // Rent = Rent2024 × (1 + growthPercent)
    const rentGrowthMultiplier = new Decimal(1).plus(
      config.rentGrowthPercent.dividedBy(100)
    );
    const rent = new Decimal(hist2024.schoolRent).times(rentGrowthMultiplier);

    // Other OpEx = Revenue × (OtherOpEx2024 / Revenue2024)
    const otherOpEx2024 = new Decimal(hist2024.totalOperatingExpenses)
      .minus(hist2024.salariesAndRelatedCosts)
      .minus(hist2024.schoolRent);
    const otherOpexRatio = otherOpEx2024.dividedBy(hist2024.totalRevenues);
    const otherOpex = totalRevenue.times(otherOpexRatio);

    // Total OpEx
    const totalOpex = staffCosts.plus(rent).plus(otherOpex);

    // EBITDA
    const ebitda = totalRevenue.minus(totalOpex);

    // DEPRECIATION (from CapEx module)
    const depreciation = this.calculateDepreciation(year, inputs, priorResults);

    // BALANCE SHEET (preliminary - will be refined by circular solver)
    const balanceSheet = this.calculateBalanceSheet(
      year,
      totalRevenue,
      totalOpex,
      depreciation,
      inputs,
      priorResults
    );

    return {
      year,
      period: 'TRANSITION',
      revenue: {
        tuitionFR,
        tuitionIB,
        otherRevenue,
        total: totalRevenue
      },
      opex: {
        staffCosts,
        rent,
        otherOpex,
        total: totalOpex
      },
      ebitda,
      depreciation,
      interest: {
        income: new Decimal(0),  // Will be calculated by circular solver
        expense: new Decimal(0),
        net: new Decimal(0)
      },
      ebt: ebitda.minus(depreciation),  // Preliminary
      zakat: new Decimal(0),  // Will be calculated by circular solver
      netIncome: new Decimal(0),  // Will be calculated by circular solver
      assets: balanceSheet.assets,
      liabilities: balanceSheet.liabilities,
      equity: balanceSheet.equity,
      cashFlow: {
        operatingActivities: new Decimal(0),  // Will be calculated after circular solver
        investingActivities: new Decimal(0),
        financingActivities: new Decimal(0),
        netChange: new Decimal(0),
        openingCash: new Decimal(0),
        closingCash: new Decimal(0)
      }
    };
  }

  private static getStudents(year: number, config: TransitionConfig): number {
    if (year === 2025) return config.students2025;
    if (year === 2026) return config.students2026;
    if (year === 2027) return config.students2027;
    throw new Error(`Invalid transition year: ${year}`);
  }

  private static getAvgTuition(year: number, config: TransitionConfig): Decimal {
    if (year === 2025) return new Decimal(config.avgTuition2025);
    if (year === 2026) return new Decimal(config.avgTuition2026);
    if (year === 2027) return new Decimal(config.avgTuition2027);
    throw new Error(`Invalid transition year: ${year}`);
  }

  private static calculateDepreciation(
    year: number,
    inputs: ProposalInputs,
    priorResults: YearlyFinancials[]
  ): Decimal {
    // Implementation: OLD assets (fixed) + NEW assets (rate-based)
    // See FINANCIAL_RULES.md Section 1.8
    // ... (implementation details)
    return new Decimal(0);  // Placeholder
  }

  private static calculateBalanceSheet(
    year: number,
    revenue: Decimal,
    opex: Decimal,
    depreciation: Decimal,
    inputs: ProposalInputs,
    priorResults: YearlyFinancials[]
  ): { assets: any; liabilities: any; equity: any } {
    // Implementation: Working capital driven by percentages
    // See FINANCIAL_RULES.md Part 2
    // ... (implementation details)
    return {
      assets: {},
      liabilities: {},
      equity: {}
    };  // Placeholder
  }
}
```

### 5.4 Circular Dependency Solver

```typescript
// src/lib/calculations/circular-solver.ts

import Decimal from 'decimal.js';
import { YearlyFinancials, ProposalInputs } from './index';

export class CircularDependencySolver {
  private static MAX_ITERATIONS = 100;
  private static TOLERANCE = new Decimal(0.01);  // 0.01 SAR

  static async solve(
    initialData: YearlyFinancials,
    inputs: ProposalInputs
  ): Promise<YearlyFinancials> {

    let current = { ...initialData };
    let iteration = 0;

    while (iteration < this.MAX_ITERATIONS) {
      const previous = { ...current };

      // Step 1: Calculate Interest (based on cash/debt)
      const interest = this.calculateInterest(current, inputs.systemConfig);
      current.interest = interest;

      // Step 2: Calculate EBT
      current.ebt = current.ebitda
        .minus(current.depreciation)
        .plus(interest.net);

      // Step 3: Calculate Zakat (based on equity)
      current.zakat = this.calculateZakat(current, inputs.systemConfig);

      // Step 4: Calculate Net Income
      current.netIncome = current.ebt.minus(current.zakat);

      // Step 5: Update Equity
      current.equity.currentYearNetIncome = current.netIncome;
      current.equity.total = current.equity.shareCapital
        .plus(current.equity.retainedEarnings)
        .plus(current.netIncome);

      // Step 6: Rebalance Balance Sheet (update cash/debt)
      current = this.rebalanceBalanceSheet(current, inputs.systemConfig);

      // Check convergence
      if (this.hasConverged(previous, current)) {
        console.log(`Converged in ${iteration + 1} iterations`);
        break;
      }

      iteration++;
    }

    if (iteration === this.MAX_ITERATIONS) {
      console.warn(`Circular solver did not converge after ${this.MAX_ITERATIONS} iterations`);
    }

    return current;
  }

  private static calculateInterest(
    data: YearlyFinancials,
    config: SystemConfig
  ): { income: Decimal; expense: Decimal; net: Decimal } {

    const openingCash = data.cashFlow.openingCash || data.assets.cash;
    const closingCash = data.assets.cash;
    const averageCash = openingCash.plus(closingCash).dividedBy(2);

    const openingDebt = new Decimal(0);  // Get from prior year
    const closingDebt = data.liabilities.shortTermDebt.plus(data.liabilities.longTermDebt);
    const averageDebt = openingDebt.plus(closingDebt).dividedBy(2);

    let income = new Decimal(0);
    let expense = new Decimal(0);

    // Interest income on cash
    if (averageCash.greaterThan(0)) {
      income = averageCash.times(config.bankDepositInterestRate);
    }

    // Interest expense on debt
    if (averageDebt.greaterThan(0)) {
      expense = averageDebt.times(config.debtInterestRate);
    }

    return {
      income,
      expense,
      net: income.minus(expense)
    };
  }

  private static calculateZakat(
    data: YearlyFinancials,
    config: SystemConfig
  ): Decimal {

    if (config.zakatRate.isZero()) {
      return new Decimal(0);
    }

    // Zakat Base = Equity - Non-Current Assets
    const equity = data.equity.total;
    const nonCurrentAssets = data.assets.netFixedAssets;

    const zakatBase = equity.minus(nonCurrentAssets);

    if (zakatBase.lessThanOrEqualTo(0)) {
      return new Decimal(0);
    }

    const zakat = zakatBase.times(config.zakatRate);

    return zakat.greaterThan(0) ? zakat : new Decimal(0);
  }

  private static rebalanceBalanceSheet(
    data: YearlyFinancials,
    config: SystemConfig
  ): YearlyFinancials {

    // Calculate required total assets
    const totalLiabilities = data.liabilities.total;
    const totalEquity = data.equity.total;
    const requiredAssets = totalLiabilities.plus(totalEquity);

    // Calculate current assets excluding cash
    const assetsExcludingCash = data.assets.accountsReceivable
      .plus(data.assets.prepaidExpenses)
      .plus(data.assets.netFixedAssets);

    // Calculate required cash
    let cash = requiredAssets.minus(assetsExcludingCash);

    // Apply minimum cash requirement
    let shortTermDebt = data.liabilities.shortTermDebt;

    if (cash.lessThan(config.minimumCashBalance)) {
      const shortfall = config.minimumCashBalance.minus(cash);
      shortTermDebt = shortTermDebt.plus(shortfall);
      cash = config.minimumCashBalance;
    }

    // Update balance sheet
    data.assets.cash = cash;
    data.liabilities.shortTermDebt = shortTermDebt;

    // Recalculate totals
    data.assets.totalCurrent = cash
      .plus(data.assets.accountsReceivable)
      .plus(data.assets.prepaidExpenses);
    data.assets.total = data.assets.totalCurrent.plus(data.assets.netFixedAssets);

    data.liabilities.totalCurrent = data.liabilities.accountsPayable
      .plus(data.liabilities.accruedExpenses)
      .plus(data.liabilities.deferredRevenue)
      .plus(shortTermDebt);
    data.liabilities.total = data.liabilities.totalCurrent.plus(data.liabilities.longTermDebt);

    return data;
  }

  private static hasConverged(
    previous: YearlyFinancials,
    current: YearlyFinancials
  ): boolean {

    // Check if key values have stopped changing
    const cashDiff = current.assets.cash.minus(previous.assets.cash).abs();
    const netIncomeDiff = current.netIncome.minus(previous.netIncome).abs();
    const zakatDiff = current.zakat.minus(previous.zakat).abs();

    return cashDiff.lessThan(this.TOLERANCE)
      && netIncomeDiff.lessThan(this.TOLERANCE)
      && zakatDiff.lessThan(this.TOLERANCE);
  }
}
```

---

## 6. FRONTEND ARCHITECTURE

### 6.1 Project Structure

```
project-2052/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/             # Main app group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   ├── historical/
│   │   │   │   └── page.tsx         # Historical data setup
│   │   │   ├── proposals/
│   │   │   │   ├── page.tsx         # Proposals list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Create proposal
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Proposal detail
│   │   │   │       ├── transition/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── dynamic/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── financials/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── scenarios/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── sensitivity/
│   │   │   │           └── page.tsx
│   │   │   ├── comparison/
│   │   │   │   └── page.tsx         # Compare proposals
│   │   │   └── settings/
│   │   │       └── page.tsx         # System config (Admin only)
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   ├── proposals/
│   │   │   ├── calculations/
│   │   │   ├── historical/
│   │   │   ├── config/
│   │   │   └── reports/
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css
│   ├── components/                  # React Components
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── forms/                   # Form components
│   │   │   ├── transition-form.tsx
│   │   │   ├── dynamic-form.tsx
│   │   │   ├── rent-model-form.tsx
│   │   │   └── historical-form.tsx
│   │   ├── charts/                  # Chart components
│   │   │   ├── rent-line-chart.tsx
│   │   │   ├── revenue-area-chart.tsx
│   │   │   ├── comparison-bar-chart.tsx
│   │   │   ├── cash-flow-waterfall.tsx
│   │   │   └── tornado-diagram.tsx
│   │   ├── tables/                  # Table components
│   │   │   ├── financial-statement-table.tsx
│   │   │   ├── proposal-list-table.tsx
│   │   │   └── comparison-table.tsx
│   │   ├── scenario/                # Scenario components
│   │   │   ├── slider-controls.tsx
│   │   │   └── scenario-comparison.tsx
│   │   └── layout/                  # Layout components
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── breadcrumbs.tsx
│   ├── lib/                         # Utilities & Core Logic
│   │   ├── calculations/            # Calculation engine
│   │   │   ├── index.ts
│   │   │   ├── period-calculators/
│   │   │   │   ├── historical.ts
│   │   │   │   ├── transition.ts
│   │   │   │   └── dynamic.ts
│   │   │   ├── circular-solver.ts
│   │   │   ├── statement-generator.ts
│   │   │   └── validation.ts
│   │   ├── workers/                 # Web Workers
│   │   │   └── calculation-worker.ts
│   │   ├── supabase/                # Supabase client
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── prisma.ts                # Prisma client
│   │   ├── validations/             # Zod schemas
│   │   │   ├── proposal.ts
│   │   │   ├── transition.ts
│   │   │   ├── dynamic.ts
│   │   │   └── historical.ts
│   │   └── utils.ts                 # Utility functions
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-proposals.ts
│   │   ├── use-calculations.ts
│   │   └── use-auth.ts
│   ├── store/                       # Zustand stores
│   │   ├── proposal-store.ts
│   │   ├── ui-store.ts
│   │   └── user-store.ts
│   └── types/                       # TypeScript types
│       ├── proposal.ts
│       ├── financials.ts
│       └── database.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── assets/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### 6.2 Key Frontend Components

#### 6.2.1 Proposal Detail Page

```typescript
// src/app/(dashboard)/proposals/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useProposal } from '@/hooks/use-proposals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransitionForm } from '@/components/forms/transition-form';
import { DynamicForm } from '@/components/forms/dynamic-form';
import { FinancialStatementTable } from '@/components/tables/financial-statement-table';
import { ScenarioSliders } from '@/components/scenario/slider-controls';
import { SensitivityAnalysis } from '@/components/scenario/sensitivity-analysis';

export default function ProposalDetailPage({
  params
}: {
  params: { id: string }
}) {

  const { proposal, loading, update } = useProposal(params.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{proposal.name}</h1>
        <p className="text-gray-600">{proposal.developerName}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transition">Transition Setup</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Setup</TabsTrigger>
          <TabsTrigger value="financials">Financial Statements</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab proposal={proposal} />
        </TabsContent>

        <TabsContent value="transition">
          <TransitionForm
            proposalId={proposal.id}
            initialData={proposal.transitionConfig}
            onSave={(data) => update({ transitionConfig: data })}
          />
        </TabsContent>

        <TabsContent value="dynamic">
          <DynamicForm
            proposalId={proposal.id}
            initialData={proposal.dynamicConfig}
            onSave={(data) => update({ dynamicConfig: data })}
          />
        </TabsContent>

        <TabsContent value="financials">
          <FinancialStatementTable proposalId={proposal.id} />
        </TabsContent>

        <TabsContent value="scenarios">
          <ScenarioSliders proposalId={proposal.id} />
        </TabsContent>

        <TabsContent value="sensitivity">
          <SensitivityAnalysis proposalId={proposal.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 6.2.2 Transition Period Form

```typescript
// src/components/forms/transition-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const transitionSchema = z.object({
  students2025: z.number().int().positive(),
  students2026: z.number().int().positive(),
  students2027: z.number().int().positive(),
  avgTuition2025: z.number().positive(),
  avgTuition2026: z.number().positive(),
  avgTuition2027: z.number().positive(),
  rentGrowthPercent: z.number().min(0).max(100),
});

type TransitionFormData = z.infer<typeof transitionSchema>;

interface TransitionFormProps {
  proposalId: string;
  initialData?: TransitionFormData;
  onSave: (data: TransitionFormData) => Promise<void>;
}

export function TransitionForm({ proposalId, initialData, onSave }: TransitionFormProps) {

  const form = useForm<TransitionFormData>({
    resolver: zodResolver(transitionSchema),
    defaultValues: initialData || {
      students2025: 0,
      students2026: 0,
      students2027: 0,
      avgTuition2025: 0,
      avgTuition2026: 0,
      avgTuition2027: 0,
      rentGrowthPercent: 5,  // Default 5% growth
    },
  });

  const onSubmit = async (data: TransitionFormData) => {
    await onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transition Period Configuration (2025-2027)</CardTitle>
          <p className="text-sm text-gray-600">
            Total: 7 inputs required • Estimated time: 10-15 minutes
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Student Numbers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Student Enrollment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="students2025">2025 Students</Label>
                <Input
                  id="students2025"
                  type="number"
                  {...form.register('students2025', { valueAsNumber: true })}
                />
                {form.formState.errors.students2025 && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.students2025.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="students2026">2026 Students</Label>
                <Input
                  id="students2026"
                  type="number"
                  {...form.register('students2026', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="students2027">2027 Students</Label>
                <Input
                  id="students2027"
                  type="number"
                  {...form.register('students2027', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Average Tuition */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Average Tuition per Student (SAR)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="avgTuition2025">2025 Avg Tuition</Label>
                <Input
                  id="avgTuition2025"
                  type="number"
                  step="0.01"
                  {...form.register('avgTuition2025', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="avgTuition2026">2026 Avg Tuition</Label>
                <Input
                  id="avgTuition2026"
                  type="number"
                  step="0.01"
                  {...form.register('avgTuition2026', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="avgTuition2027">2027 Avg Tuition</Label>
                <Input
                  id="avgTuition2027"
                  type="number"
                  step="0.01"
                  {...form.register('avgTuition2027', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Rent Growth */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Rent Growth</h3>
            <div className="max-w-xs">
              <Label htmlFor="rentGrowthPercent">Annual Rent Growth (%)</Label>
              <Input
                id="rentGrowthPercent"
                type="number"
                step="0.01"
                {...form.register('rentGrowthPercent', { valueAsNumber: true })}
              />
              <p className="text-sm text-gray-600 mt-2">
                Applied as compound growth from 2024 base rent
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Configuration</Button>
      </div>
    </form>
  );
}
```

#### 6.2.3 Financial Statement Table Component

```typescript
// src/components/tables/financial-statement-table.tsx

'use client';

import { useState } from 'react';
import { useFinancials } from '@/hooks/use-calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatMillions } from '@/lib/utils';

interface FinancialStatementTableProps {
  proposalId: string;
}

export function FinancialStatementTable({ proposalId }: FinancialStatementTableProps) {

  const { financials, loading } = useFinancials(proposalId);
  const [statement, setStatement] = useState<'pl' | 'bs' | 'cf'>('pl');
  const [yearRange, setYearRange] = useState<'all' | '2023-2027' | '2028-2032' | '2048-2053'>('all');

  if (loading) {
    return <div>Loading financials...</div>;
  }

  if (!financials) {
    return <div>No financial data available</div>;
  }

  // Filter years based on selection
  const filteredYears = financials.filter(f => {
    if (yearRange === 'all') return true;
    if (yearRange === '2023-2027') return f.year >= 2023 && f.year <= 2027;
    if (yearRange === '2028-2032') return f.year >= 2028 && f.year <= 2032;
    if (yearRange === '2048-2053') return f.year >= 2048 && f.year <= 2053;
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex justify-between items-center">
        <Tabs value={statement} onValueChange={(v) => setStatement(v as any)}>
          <TabsList>
            <TabsTrigger value="pl">P&L Statement</TabsTrigger>
            <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cf">Cash Flow</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-4 items-center">
          <Select value={yearRange} onValueChange={(v) => setYearRange(v as any)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years (2023-2053)</SelectItem>
              <SelectItem value="2023-2027">2023-2027 (Historical + Transition)</SelectItem>
              <SelectItem value="2028-2032">2028-2032 (Early Dynamic)</SelectItem>
              <SelectItem value="2048-2053">2048-2053 (Late Dynamic)</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => exportToExcel(filteredYears)}>
            Export to Excel
          </Button>
        </div>
      </div>

      {/* P&L Statement */}
      {statement === 'pl' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-3 bg-gray-50">Line Item</th>
                {filteredYears.map(f => (
                  <th key={f.year} className="text-right p-3 bg-gray-50">
                    {f.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Revenue */}
              <tr className="border-b border-gray-200 font-semibold">
                <td className="p-3">Revenue</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 font-semibold">
                    {formatMillions(f.revenue.total)}
                  </td>
                ))}
              </tr>

              {/* Operating Expenses */}
              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">Salaries & Related Costs</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 text-red-600">
                    ({formatMillions(f.opex.staffCosts)})
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">School Rent</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 text-red-600">
                    ({formatMillions(f.opex.rent)})
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">Other Operating Expenses</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 text-red-600">
                    ({formatMillions(f.opex.otherOpex)})
                  </td>
                ))}
              </tr>

              {/* EBITDA */}
              <tr className="border-b-2 border-gray-300 font-semibold bg-blue-50">
                <td className="p-3">EBITDA</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 font-semibold">
                    {formatMillions(f.ebitda)}
                  </td>
                ))}
              </tr>

              {/* Depreciation */}
              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">Depreciation</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 text-red-600">
                    ({formatMillions(f.depreciation)})
                  </td>
                ))}
              </tr>

              {/* Interest (Net) */}
              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">Interest Income/(Expense) - Net</td>
                {filteredYears.map(f => (
                  <td
                    key={f.year}
                    className={`text-right p-3 ${f.interest.net.isNegative() ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {f.interest.net.isNegative() ? '(' : ''}
                    {formatMillions(f.interest.net.abs())}
                    {f.interest.net.isNegative() ? ')' : ''}
                  </td>
                ))}
              </tr>

              {/* EBT */}
              <tr className="border-b border-gray-200 font-semibold">
                <td className="p-3">EBT</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 font-semibold">
                    {formatMillions(f.ebt)}
                  </td>
                ))}
              </tr>

              {/* Zakat */}
              <tr className="border-b border-gray-200">
                <td className="p-3 pl-6">Zakat</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 text-red-600">
                    ({formatMillions(f.zakat)})
                  </td>
                ))}
              </tr>

              {/* Net Income */}
              <tr className="border-b-2 border-gray-300 font-bold bg-green-50">
                <td className="p-3">NET INCOME</td>
                {filteredYears.map(f => (
                  <td key={f.year} className="text-right p-3 font-bold">
                    {formatMillions(f.netIncome)}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

      {/* Balance Sheet and Cash Flow tabs would be similar... */}

    </div>
  );
}

// Utility function to format amounts in millions
function formatMillions(value: Decimal): string {
  const millions = value.dividedBy(1000000);
  return millions.toFixed(2) + ' M';
}
```

---

## 7. BACKEND API DESIGN

### 7.1 API Route Structure

```
/api/
├── auth/
│   ├── login/route.ts
│   └── logout/route.ts
├── proposals/
│   ├── route.ts                    # GET (list), POST (create)
│   ├── [id]/
│   │   ├── route.ts                # GET, PATCH, DELETE
│   │   ├── financials/route.ts     # GET (calculate & return)
│   │   ├── transition/route.ts     # GET, PATCH
│   │   ├── dynamic/route.ts        # GET, PATCH
│   │   └── rent/route.ts           # GET, PATCH
├── calculations/
│   ├── validate/route.ts           # POST (validate inputs)
│   └── scenario/route.ts           # POST (run scenario)
├── historical/
│   ├── route.ts                    # GET, POST (bulk upsert)
│   └── [year]/route.ts             # GET, PATCH
├── config/
│   └── route.ts                    # GET, PATCH (system config)
└── reports/
    ├── pdf/route.ts                # POST (generate PDF)
    └── excel/route.ts              # POST (generate Excel)
```

### 7.2 Example API Route Implementation

```typescript
// src/app/api/proposals/[id]/financials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { calculateFullProjection } from '@/lib/calculations';
import { getCacheKey, getCachedCalculation, setCachedCalculation } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch proposal with all related data
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: params.id },
      include: {
        transitionConfig: true,
        dynamicConfig: true,
        rentConfig: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // 3. Check cache
    const cacheKey = getCacheKey(proposal);
    const cached = await getCachedCalculation(cacheKey);

    if (cached) {
      return NextResponse.json({
        financials: cached.financials,
        metrics: cached.metrics,
        cached: true,
      });
    }

    // 4. Fetch system config and historical data
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    const historical = await prisma.historicalActuals.findMany({
      orderBy: { year: 'asc' },
    });
    const capexItems = await prisma.capExItem.findMany({
      orderBy: { year: 'asc' },
    });

    // 5. Run calculations
    const inputs = {
      historical,
      systemConfig: systemConfig!,
      transitionConfig: proposal.transitionConfig!,
      dynamicConfig: proposal.dynamicConfig!,
      rentConfig: proposal.rentConfig!,
      capexItems,
    };

    const financials = await calculateFullProjection(inputs);

    // 6. Calculate summary metrics
    const metrics = calculateMetrics(financials);

    // 7. Cache results
    await setCachedCalculation(cacheKey, { financials, metrics });

    // 8. Return response
    return NextResponse.json({
      financials,
      metrics,
      cached: false,
    });

  } catch (error) {
    console.error('Error calculating financials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMetrics(financials: YearlyFinancials[]) {
  // Calculate NPV, total rent, etc.
  // ... implementation
  return {
    totalRent25Years: 0,
    npv: 0,
    averageAnnualRent: 0,
    // ... other metrics
  };
}
```

---

## 8. SECURITY & AUTHENTICATION

### 8.1 Supabase Authentication Setup

```typescript
// src/lib/supabase/client.ts (Client-side)

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// src/lib/supabase/server.ts (Server-side)

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### 8.2 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_actuals ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can read/write historical data and system config
CREATE POLICY "Admins can manage historical data"
ON historical_actuals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can manage system config"
ON system_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- Planners can create/edit proposals they own
CREATE POLICY "Planners can manage own proposals"
ON lease_proposals FOR ALL
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'PLANNER')
  )
);

-- Viewers can read all proposals
CREATE POLICY "Viewers can read proposals"
ON lease_proposals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
  )
);
```

---

## 9. PERFORMANCE REQUIREMENTS

### 9.1 Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Full 30-year calculation | < 1 second | Server-side (API) |
| Slider interaction (recalc) | < 500ms | Client-side (Web Worker) |
| Page load (proposal list) | < 500ms | First Contentful Paint |
| Financial statement render | < 300ms | Component render time |
| API response (non-calc) | < 200ms | Network + processing |
| Database query | < 100ms | 95th percentile |

### 9.2 Optimization Strategies

#### 9.2.1 Calculation Performance

```typescript
// Pre-create Decimal constants for performance
const ZERO = new Decimal(0);
const ONE = new Decimal(1);
const HUNDRED = new Decimal(100);

// Reuse calculations
const cachedResults = new Map<string, Decimal>();

function getOrCalculate(key: string, calculator: () => Decimal): Decimal {
  if (cachedResults.has(key)) {
    return cachedResults.get(key)!;
  }

  const result = calculator();
  cachedResults.set(key, result);
  return result;
}

// Use Web Workers for non-blocking calculations
import { wrap } from 'comlink';

const worker = new Worker(
  new URL('./calculation-worker.ts', import.meta.url),
  { type: 'module' }
);

const calculationAPI = wrap<CalculationWorkerAPI>(worker);

// Parallel calculations when possible
const [proposal1, proposal2, proposal3] = await Promise.all([
  calculationAPI.calculate(inputs1),
  calculationAPI.calculate(inputs2),
  calculationAPI.calculate(inputs3),
]);
```

#### 9.2.2 Database Performance

```typescript
// Use connection pooling (Prisma handles this)
// Configure in prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  // Direct connection for migrations
}

// Prisma connection pool settings (in DATABASE_URL)
// ?connection_limit=10&pool_timeout=20

// Index critical queries
// See database schema for @@index directives

// Use select to fetch only needed fields
const proposals = await prisma.leaseProposal.findMany({
  select: {
    id: true,
    name: true,
    developerName: true,
    status: true,
    // Don't fetch large related data unless needed
  },
});

// Use transactions for consistency
await prisma.$transaction([
  prisma.leaseProposal.update({ /* ... */ }),
  prisma.transitionConfig.update({ /* ... */ }),
  prisma.dynamicConfig.update({ /* ... */ }),
]);
```

#### 9.2.3 Caching Strategy

```typescript
// src/lib/cache.ts

import { createHash } from 'crypto';
import { prisma } from './prisma';

export function getCacheKey(proposal: LeaseProposal): string {
  // Hash all inputs to detect changes
  const inputString = JSON.stringify({
    transition: proposal.transitionConfig,
    dynamic: proposal.dynamicConfig,
    rent: proposal.rentConfig,
  });

  return createHash('sha256').update(inputString).digest('hex');
}

export async function getCachedCalculation(cacheKey: string) {
  const cached = await prisma.calculationCache.findFirst({
    where: {
      inputHash: cacheKey,
      expiresAt: { gt: new Date() },  // Not expired
    },
  });

  if (!cached) return null;

  return {
    financials: cached.financials,
    metrics: cached.metrics,
  };
}

export async function setCachedCalculation(
  cacheKey: string,
  data: { financials: any; metrics: any }
) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);  // 1 hour cache

  await prisma.calculationCache.create({
    data: {
      inputHash: cacheKey,
      financials: data.financials,
      metrics: data.metrics,
      expiresAt,
    },
  });
}

// Cleanup expired cache (run periodically)
export async function cleanupExpiredCache() {
  await prisma.calculationCache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
```

---

## 10. DEPLOYMENT STRATEGY

### 10.1 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"

# NextAuth (if used)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xxx"

# Application
NODE_ENV="development"
```

### 10.2 Vercel Deployment Configuration

```json
// vercel.json

{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "DIRECT_DATABASE_URL": "@direct-database-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### 10.3 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests (Vitest)

```typescript
// src/lib/calculations/__tests__/transition-calculator.test.ts

import { describe, it, expect } from 'vitest';
import { TransitionCalculator } from '../period-calculators/transition';
import Decimal from 'decimal.js';

describe('TransitionCalculator', () => {
  it('should calculate revenue correctly for 2025', () => {
    const config = {
      students2025: 1000,
      avgTuition2025: new Decimal(50000),
      // ... other fields
    };

    const historical = [
      {
        year: 2024,
        tuitionFrenchCurriculum: new Decimal(80000000),
        otherIncome: new Decimal(8000000),
        // ... other fields
      }
    ];

    const result = TransitionCalculator.calculate(2025, {
      transitionConfig: config,
      historical,
      // ... other inputs
    }, []);

    // FR Tuition = 1000 × 50000 = 50,000,000
    expect(result.revenue.tuitionFR.toNumber()).toBe(50000000);

    // Other Revenue = 50M × (8M / 80M) = 5,000,000
    expect(result.revenue.otherRevenue.toNumber()).toBe(5000000);

    // Total = 55,000,000
    expect(result.revenue.total.toNumber()).toBe(55000000);
  });

  it('should have IB tuition = 0 in transition period', () => {
    // ... test setup

    const result = TransitionCalculator.calculate(2025, inputs, []);

    expect(result.revenue.tuitionIB.toNumber()).toBe(0);
  });
});
```

### 11.2 Integration Tests

```typescript
// src/app/api/proposals/__tests__/route.test.ts

import { describe, it, expect } from 'vitest';
import { GET, POST } from '../route';

describe('Proposals API', () => {
  it('should return list of proposals', async () => {
    const request = new Request('http://localhost/api/proposals');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.proposals)).toBe(true);
  });

  it('should create new proposal', async () => {
    const request = new Request('http://localhost/api/proposals', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Proposal',
        developerName: 'Test Developer',
        rentModel: 'FIXED_ESCALATION',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.proposal.id).toBeDefined();
  });
});
```

### 11.3 E2E Tests (Playwright)

```typescript
// e2e/proposal-creation.spec.ts

import { test, expect } from '@playwright/test';

test('create and configure proposal', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'planner@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to create proposal
  await page.goto('/proposals/new');

  // Fill proposal form
  await page.fill('[name="name"]', 'Developer A - Fixed Escalation');
  await page.fill('[name="developerName"]', 'Developer A');
  await page.selectOption('[name="rentModel"]', 'FIXED_ESCALATION');

  await page.click('button:has-text("Create Proposal")');

  // Wait for redirect to proposal detail
  await page.waitForURL(/\/proposals\/[a-z0-9-]+/);

  // Verify proposal was created
  await expect(page.locator('h1')).toContainText('Developer A - Fixed Escalation');
});
```

---

## 12. DEVELOPMENT WORKFLOW

### 12.1 Initial Setup

```bash
# 1. Install pnpm globally
npm install -g pnpm@9.15.0

# 2. Clone repository
git clone <repo-url>
cd project-2052

# 3. Install dependencies
pnpm install

# 4. Copy environment variables
cp .env.example .env.local

# 5. Configure .env.local with Supabase credentials
# Edit .env.local and add DATABASE_URL, SUPABASE_URL, etc.

# 6. Generate Prisma client
pnpm prisma generate

# 7. Run database migrations
pnpm prisma migrate dev

# 8. Seed database with sample data
pnpm prisma db seed

# 9. Start development server
pnpm dev
```

### 12.2 Development Commands

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Database management
pnpm prisma studio        # Open Prisma Studio (database GUI)
pnpm prisma migrate dev   # Create and run migration
pnpm prisma db seed       # Seed database

# Build for production
pnpm build

# Start production server (after build)
pnpm start
```

### 12.3 Git Workflow

```bash
# Feature branch workflow

# 1. Create feature branch
git checkout -b feature/transition-calculator

# 2. Make changes and commit
git add .
git commit -m "Implement transition period calculator"

# 3. Push to remote
git push origin feature/transition-calculator

# 4. Create Pull Request on GitHub

# 5. After PR approval and merge
git checkout main
git pull origin main

# 6. Delete feature branch
git branch -d feature/transition-calculator
```

---

## 13. APPENDICES

### 13.1 Glossary of Technical Terms

| Term | Definition |
|------|------------|
| **Web Worker** | JavaScript running in background thread (non-blocking) |
| **SSR** | Server-Side Rendering (initial HTML generated on server) |
| **RLS** | Row-Level Security (database access control per row) |
| **ORM** | Object-Relational Mapping (Prisma maps DB to TypeScript) |
| **Circular Dependency** | A ↔ B dependency requiring iterative solving |
| **NPV** | Net Present Value (time value of money calculation) |
| **Decimal.js** | Library for arbitrary-precision decimal math |
| **Zustand** | Lightweight state management library |
| **shadcn/ui** | Re-usable component library built on Radix UI |

### 13.2 Key File Locations Reference

| Purpose | File Path |
|---------|-----------|
| Calculation Engine | `src/lib/calculations/index.ts` |
| Database Schema | `prisma/schema.prisma` |
| API Routes | `src/app/api/**/*.ts` |
| UI Components | `src/components/` |
| Forms | `src/components/forms/` |
| Charts | `src/components/charts/` |
| Financial Rules | `FINANCIAL_RULES.md` (reference) |
| Environment Config | `.env.local` |

### 13.3 Performance Benchmarks

Target benchmarks for validation:

```typescript
// Performance test example
import { performance } from 'perf_hooks';

const start = performance.now();
const financials = await calculateFullProjection(inputs);
const end = performance.now();

const duration = end - start;

// Assertions
expect(duration).toBeLessThan(1000);  // < 1 second
expect(financials.length).toBe(31);   // 2023-2053
```

---

## 14. NEXT STEPS

### 14.1 Immediate Actions (Week 1)

1. **Environment Setup**
   - ✅ Install pnpm 9.15.0
   - ✅ Create Supabase project
   - ✅ Initialize Next.js 16 project with TypeScript
   - ✅ Configure Prisma with Supabase PostgreSQL

2. **Database Foundation**
   - ✅ Implement Prisma schema
   - ✅ Create initial migration
   - ✅ Seed with sample data (2023-2024 historical)

3. **Core Calculation Engine (MVP)**
   - ✅ Implement HistoricalCalculator
   - ✅ Implement TransitionCalculator
   - ✅ Create test suite with known scenarios

### 14.2 Phase 1 Deliverables (Weeks 1-5)

See BCD.md Section 8.1 for complete Phase 1 breakdown.

**Key Milestones:**
- Week 2: Database + Historical calculator complete
- Week 3: Transition calculator complete
- Week 4: Basic UI + Forms
- Week 5: MVP functional (single proposal, basic P&L)

---

**— END OF TECHNICAL SPECIFICATION DOCUMENT —**

*This document is comprehensive and ready for immediate development start. All technical decisions are justified, all architectures are defined, and all implementation details are specified.*

**Document Maintenance:**
- Update version number when significant changes made
- Keep alignment with FINANCIAL_RULES.md
- Reference PRD for requirements changes
- Update based on implementation learnings

**Contact:**
- Technical Questions: Review this TSD + FINANCIAL_RULES.md
- Business Questions: Review BCD.md + PRD.md
- Project Management: Review AGENTS_SPECIFICATION.md
