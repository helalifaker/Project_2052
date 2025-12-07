# Database Schema Documentation

## Overview

The system uses **PostgreSQL 14+** as the primary database with **Prisma ORM** for type-safe database access.

**Schema Location:** `/prisma/schema.prisma`

---

## Entity-Relationship Diagram (ERD)

```
┌──────────────┐
│     User     │
│─────────────────┐
│ id (PK)      │
│ email (UNIQUE)│
│ name         │
│ role         │──────┐
│ createdAt    │      │
└──────────────┘      │
       │              │
       │ creates      │
       │              │
       ▼              │
┌──────────────────────────────┐
│      LeaseProposal           │
│──────────────────────────────┤
│ id (PK)                      │
│ name                         │
│ rentModel                    │
│ createdBy (FK → User)        │◄─────┘
│ transition (JSON)            │
│ enrollment (JSON)            │
│ curriculum (JSON)            │
│ staff (JSON)                 │
│ rentParams (JSON)            │
│ otherOpex                    │
│ financials (JSON)            │
│ metrics (JSON)               │
│ developer                    │
│ property                     │
│ negotiationRound             │
│ parentProposalId (FK self)   │──┐
│ origin (ENUM)                │  │
│ status (ENUM)                │  │
│ createdAt, updatedAt         │  │
└──────────────┬───────────────┘  │
               │                  │ parent-child
               │                  │ relationship
               │ ◄────────────────┘
               │
               ├──► has many ───┐
               │                │
               │                ▼
               │         ┌──────────────┐
               │         │  Scenario    │
               │         │──────────────┤
               │         │ id (PK)      │
               │         │ proposalId   │
               │         │ name         │
               │         │ createdBy    │
               │         │ variables    │
               │         │ metrics      │
               │         └──────────────┘
               │
               ├──► has many ───┐
               │                │
               │                ▼
               │         ┌────────────────────┐
               │         │SensitivityAnalysis │
               │         │────────────────────┤
               │         │ id (PK)            │
               │         │ proposalId         │
               │         │ name               │
               │         │ variable           │
               │         │ rangeMin/Max       │
               │         │ impactMetric       │
               │         │ dataPoints (JSON)  │
               │         └────────────────────┘
               │
               └──► has many ───┐
                                │
                                ▼
                         ┌──────────────┐
                         │  CapExAsset  │
                         │──────────────┤
                         │ id (PK)      │
                         │ proposalId   │
                         │ year         │
                         │ assetName    │
                         │ amount       │
                         │ usefulLife   │
                         │ method       │
                         │ nbv          │
                         └──────────────┘

┌──────────────────┐
│ SystemConfig     │
│──────────────────┤
│ id (PK)          │
│ zakatRate        │
│ debtInterestRate │
│ depositIntRate   │
│ minCashBalance   │
│ confirmedAt      │
│ updatedBy (FK)   │
└──────────────────┘

┌──────────────────────┐
│ HistoricalData       │
│──────────────────────┤
│ id (PK)              │
│ year                 │
│ statementType        │
│ lineItem             │
│ amount               │
│ confirmed            │
│ UNIQUE(year, type,   │
│        lineItem)     │
└──────────────────────┘

┌──────────────────────┐
│ WorkingCapitalRatios │
│──────────────────────┤
│ id (PK)              │
│ arPercent            │
│ prepaidPercent       │
│ apPercent            │
│ accruedPercent       │
│ deferredRevPercent   │
│ locked               │
│ calculatedFrom2024   │
└──────────────────────┘

┌──────────────────────┐
│ CapExConfig          │
│──────────────────────┤
│ id (PK)              │
│ autoReinvestEnabled  │
│ reinvestFrequency    │
│ reinvestAmount       │
│ reinvestAmountPercent│
└──────────────────────┘
```

---

## Table Descriptions

### 1. User

**Purpose:** Store user accounts and authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Unique user identifier |
| email | String | UNIQUE, NOT NULL | User's email (login) |
| name | String | NOT NULL | User's full name |
| role | Enum (Role) | DEFAULT VIEWER | User role (ADMIN, PLANNER, VIEWER) |
| createdAt | DateTime | DEFAULT now() | Account creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**Relationships:**
- `proposalsCreated`: One-to-many with LeaseProposal
- `configUpdates`: One-to-many with SystemConfig
- `scenariosCreated`: One-to-many with Scenario
- `sensitivityAnalysesCreated`: One-to-many with SensitivityAnalysis

---

### 2. LeaseProposal

**Purpose:** Store lease proposals with inputs and calculated results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Unique proposal identifier |
| name | String | NOT NULL | Proposal display name |
| rentModel | String | NOT NULL | "Fixed", "RevShare", or "Partner" |
| createdBy | String (UUID) | FK → User.id | Creator user ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| transition | JSON | NOT NULL | Transition period inputs (2025-2027) |
| enrollment | JSON | NOT NULL | Enrollment projections |
| curriculum | JSON | NOT NULL | Curriculum & tuition |
| staff | JSON | NOT NULL | Staff cost assumptions |
| rentParams | JSON | NOT NULL | Rent model parameters |
| otherOpex | Decimal | NOT NULL | Other operating expenses |
| financials | JSON | NULLABLE | Calculated financial statements (30 years) |
| metrics | JSON | NULLABLE | Calculated metrics (NPV, IRR, etc.) |
| calculatedAt | DateTime | NULLABLE | When financials were last calculated |
| developer | String | NULLABLE | Developer/landlord name |
| property | String | NULLABLE | Property name |
| negotiationRound | Int | DEFAULT 1 | Negotiation round number |
| version | String | NULLABLE | Proposal version |
| origin | Enum | DEFAULT OUR_OFFER | "OUR_OFFER" or "THEIR_COUNTER" |
| status | Enum | DEFAULT DRAFT | Proposal status (see enum below) |
| parentProposalId | String (UUID) | FK → LeaseProposal.id | Parent proposal (for counters) |
| submittedDate | DateTime | NULLABLE | When submitted to developer |
| responseReceivedDate | DateTime | NULLABLE | When response received |
| negotiationNotes | String | NULLABLE | Internal negotiation notes |
| boardComments | String | NULLABLE | Board comments |

**Indexes:**
- Primary key on `id`
- Index on `(developer, property, negotiationRound)` for negotiation threads
- Index on `status` for filtering

**Relationships:**
- `creator`: Many-to-one with User
- `assets`: One-to-many with CapExAsset
- `parentProposal`: Self-referential (parent-child negotiation sequence)
- `childProposals`: Reverse of parentProposal
- `scenarios`: One-to-many with Scenario
- `sensitivityAnalyses`: One-to-many with SensitivityAnalysis

**Enums:**

**ProposalOrigin:**
- `OUR_OFFER`: Proposal originated from us
- `THEIR_COUNTER`: Counter-proposal from developer

**ProposalStatus:**
- `DRAFT`: Work in progress
- `READY_TO_SUBMIT`: Complete, pending submission
- `SUBMITTED`: Sent to developer
- `UNDER_REVIEW`: Developer reviewing
- `COUNTER_RECEIVED`: Developer sent counter
- `EVALUATING_COUNTER`: We're analyzing counter
- `ACCEPTED`: Deal agreed
- `REJECTED`: Deal declined
- `NEGOTIATION_CLOSED`: Discussion ended (no deal)

---

### 3. SystemConfig

**Purpose:** Store global system configuration (Zakat rate, interest rates, minimum cash)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Config version ID |
| zakatRate | Decimal | DEFAULT 0.025 | Zakat rate (e.g., 0.025 = 2.5%) |
| debtInterestRate | Decimal | DEFAULT 0.05 | Debt interest rate (e.g., 0.05 = 5%) |
| depositInterestRate | Decimal | DEFAULT 0.02 | Deposit interest rate (e.g., 0.02 = 2%) |
| minCashBalance | Decimal | DEFAULT 1000000 | Minimum cash balance (SAR) |
| confirmedAt | DateTime | NULLABLE | When config was confirmed |
| updatedBy | String (UUID) | FK → User.id | User who updated config |

**Indexes:**
- Primary key on `id`

**Relationships:**
- `updater`: Many-to-one with User

**Usage:**
- Only one active config at a time (latest record)
- Historical configs preserved for audit trail

---

### 4. HistoricalData

**Purpose:** Store actual historical financial data (2023-2024)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Data point ID |
| year | Int | NOT NULL | Year (2023 or 2024) |
| statementType | String | NOT NULL | "PL", "BS", or "CF" |
| lineItem | String | NOT NULL | Line item name (e.g., "Revenue", "Cash") |
| amount | Decimal | NOT NULL | Amount in SAR |
| confirmed | Boolean | DEFAULT false | Whether data is confirmed/locked |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Indexes:**
- Primary key on `id`
- **Unique index** on `(year, statementType, lineItem)` to prevent duplicates

**Common Line Items:**

**Profit & Loss (statementType = "PL"):**
- Revenue
- RentExpense
- StaffCosts
- OtherOpEx
- Depreciation
- InterestExpense
- InterestIncome
- ZakatExpense
- NetIncome

**Balance Sheet (statementType = "BS"):**
- Cash
- AccountsReceivable
- PrepaidExpenses
- GrossPPE
- AccumulatedDepreciation
- AccountsPayable
- AccruedExpenses
- DeferredRevenue
- DebtBalance
- TotalEquity

---

### 5. WorkingCapitalRatios

**Purpose:** Store working capital ratios calculated from 2024 data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Ratios ID |
| arPercent | Decimal | NOT NULL | AR as % of Revenue |
| prepaidPercent | Decimal | NOT NULL | Prepaid as % of Revenue |
| apPercent | Decimal | NOT NULL | AP as % of OpEx |
| accruedPercent | Decimal | NOT NULL | Accrued as % of OpEx |
| deferredRevenuePercent | Decimal | NOT NULL | Deferred Revenue as % of Revenue |
| locked | Boolean | DEFAULT true | Whether ratios are locked (confirmed) |
| calculatedFrom2024 | DateTime | NOT NULL | When calculated from 2024 data |

**Indexes:**
- Primary key on `id`

**Usage:**
- Only one active set of ratios (latest record)
- Used for all dynamic period (2028-2053) projections

---

### 6. CapExAsset

**Purpose:** Store capital expenditure assets (both OLD and NEW)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Asset ID |
| proposalId | String (UUID) | FK → LeaseProposal.id, NULLABLE | Linked proposal (NULL for global assets) |
| year | Int | NOT NULL | Purchase year |
| assetName | String | NOT NULL | Asset description |
| amount | Decimal | NOT NULL | Purchase price (SAR) |
| usefulLife | Int | NOT NULL | Depreciation period (years) |
| depreciationMethod | String | NOT NULL | "SL" (Straight-Line) or "DB" (Declining Balance) |
| fixedAmount | Decimal | NULLABLE | Fixed depreciation amount (SL) |
| rate | Decimal | NULLABLE | Depreciation rate (DB) |
| nbv | Decimal | NOT NULL | Net Book Value |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key on `proposalId`

**Relationships:**
- `proposal`: Many-to-one with LeaseProposal (optional)

**Usage:**
- **Global assets** (proposalId = NULL): Apply to all proposals (e.g., from historical data)
- **Proposal-specific assets** (proposalId set): Apply only to that proposal (what-if analysis)

---

### 7. CapExConfig

**Purpose:** Configure automatic capital reinvestment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Config ID |
| autoReinvestEnabled | Boolean | DEFAULT false | Whether auto-reinvestment is enabled |
| reinvestFrequency | Int | NULLABLE | Reinvestment frequency (years) |
| reinvestAmount | Decimal | NULLABLE | Fixed reinvestment amount (SAR) |
| reinvestAmountPercent | Decimal | NULLABLE | Reinvestment as % of revenue |

**Indexes:**
- Primary key on `id`

**Usage:**
- Only one active config (latest record)
- Either `reinvestAmount` OR `reinvestAmountPercent` is set (not both)

---

### 8. Scenario

**Purpose:** Store saved scenario analyses (what-if projections)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Scenario ID |
| proposalId | String (UUID) | FK → LeaseProposal.id | Linked proposal |
| name | String | NOT NULL | Scenario display name |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| createdBy | String (UUID) | FK → User.id | Creator user ID |
| enrollmentPercent | Decimal | NOT NULL | Enrollment as % of baseline (e.g., 120) |
| cpiPercent | Decimal | NOT NULL | CPI growth % (e.g., 3.0) |
| tuitionGrowthPercent | Decimal | NOT NULL | Tuition growth % (e.g., 5.0) |
| rentEscalationPercent | Decimal | NOT NULL | Rent escalation % (e.g., 3.0) |
| totalRent | Decimal | NULLABLE | Calculated total rent (30 years) |
| npv | Decimal | NULLABLE | Calculated NPV |
| totalEbitda | Decimal | NULLABLE | Calculated total EBITDA |
| finalCash | Decimal | NULLABLE | Calculated final cash balance |
| maxDebt | Decimal | NULLABLE | Calculated maximum debt |

**Indexes:**
- Primary key on `id`
- Foreign key on `proposalId`
- Index on `proposalId` for fast lookup

**Relationships:**
- `proposal`: Many-to-one with LeaseProposal
- `creator`: Many-to-one with User

---

### 9. SensitivityAnalysis

**Purpose:** Store saved sensitivity analyses (tornado charts)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Analysis ID |
| proposalId | String (UUID) | FK → LeaseProposal.id | Linked proposal |
| name | String | NULLABLE | Analysis display name |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| createdBy | String (UUID) | FK → User.id | Creator user ID |
| variable | String | NOT NULL | Variable tested (e.g., "enrollment") |
| rangeMin | Decimal | NOT NULL | Minimum value (e.g., -20) |
| rangeMax | Decimal | NOT NULL | Maximum value (e.g., +20) |
| impactMetric | String | NOT NULL | Metric measured (e.g., "npv") |
| dataPoints | JSON | NULLABLE | Array of {inputValue, outputValue} |
| tornadoData | JSON | NULLABLE | Processed tornado chart data |

**Indexes:**
- Primary key on `id`
- Foreign key on `proposalId`
- Index on `proposalId` for fast lookup

**Relationships:**
- `proposal`: Many-to-one with LeaseProposal
- `creator`: Many-to-one with User

---

## Migrations

**Location:** `/prisma/migrations/`

**Migration Strategy:**
- Prisma Migrate for schema changes
- Manual SQL for data migrations (if needed)

**Common Commands:**
```bash
# Create new migration
npx prisma migrate dev --name add_negotiation_tracking

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client (after schema changes)
npx prisma generate
```

---

## Performance Considerations

### Indexes

**Existing indexes:**
- All primary keys (automatic B-tree indexes)
- All foreign keys (automatic indexes for referential integrity)
- `User.email` (unique index for fast login lookup)
- `HistoricalData(year, statementType, lineItem)` (unique constraint + index)
- `LeaseProposal(developer, property, negotiationRound)` (negotiation thread lookup)
- `LeaseProposal(status)` (filtering proposals by status)
- `Scenario(proposalId)` (fetch scenarios for proposal)
- `SensitivityAnalysis(proposalId)` (fetch analyses for proposal)

**Future indexes (if needed):**
- `LeaseProposal(createdAt)` for chronological sorting
- `LeaseProposal(updatedAt)` for "recent activity" queries

### Query Optimization

**Best practices:**
- Use `select` to fetch only needed fields
- Use `include` to avoid N+1 queries
- Use pagination (`take` and `skip`) for large result sets
- Use connection pooling (PgBouncer or Prisma Accelerate)

**Example:**
```typescript
// BAD: N+1 query (fetches proposals, then scenarios for each)
const proposals = await prisma.leaseProposal.findMany();
for (const proposal of proposals) {
  const scenarios = await prisma.scenario.findMany({ where: { proposalId: proposal.id } });
}

// GOOD: Single query with include
const proposals = await prisma.leaseProposal.findMany({
  include: { scenarios: true }
});
```

---

## Data Types

### Decimal vs Float

**Use Decimal for:**
- Financial amounts (revenue, rent, cash)
- Percentages (zakat rate, interest rates)
- Ratios (working capital ratios)

**Why?**
- Avoids floating-point precision errors
- Ensures 0.1 + 0.2 = 0.3 exactly (not 0.30000000000000004)

**Prisma type:**
```prisma
model SystemConfig {
  zakatRate Decimal @default(0.025)
}
```

**TypeScript type (with Decimal.js):**
```typescript
import Decimal from 'decimal.js';

const config = await prisma.systemConfig.findFirst();
const zakatRate = new Decimal(config.zakatRate); // Convert Prisma Decimal to Decimal.js
```

### JSON Fields

**Use JSON for:**
- Complex nested data (enrollment, curriculum, financials)
- Variable structure (rentParams differ by model)
- Large data (30 years of financials)

**Pros:**
- Flexible schema
- Easy to store complex objects
- No need for many join tables

**Cons:**
- Can't query inside JSON easily (use PostgreSQL JSON operators)
- No type safety (use Zod for runtime validation)

**Example:**
```typescript
// Storing
await prisma.leaseProposal.create({
  data: {
    // ...
    financials: {
      periods: [
        { year: 2023, profitLoss: {...}, balanceSheet: {...}, cashFlow: {...} },
        // ... 29 more years
      ]
    }
  }
});

// Retrieving
const proposal = await prisma.leaseProposal.findUnique({ where: { id } });
const financials = proposal.financials as FinancialsData; // Type assertion
```

---

## Backup & Recovery

**Backup Strategy:**
- Automated daily backups (Supabase provides this)
- Point-in-time recovery (PITR) for last 7 days
- Manual backups before major migrations

**Backup Command (PostgreSQL):**
```bash
pg_dump -h hostname -U username -d dbname > backup.sql
```

**Restore Command:**
```bash
psql -h hostname -U username -d dbname < backup.sql
```

---

## Related Documentation

- [Architecture](ARCHITECTURE.md) - System architecture overview
- [API Reference](API_REFERENCE.md) - API endpoints using this schema
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Database setup instructions

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Maintained By:** Documentation Agent
