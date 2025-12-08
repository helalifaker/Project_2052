# API Reference

## Overview

The School Lease Financial Planning System provides a REST-like JSON API via Next.js 16 API Routes.

**Base URL:** `https://yourapp.com/api`
**Authentication:** Session-based (HTTP-only cookies)
**Content-Type:** `application/json`

---

## Authentication

All endpoints require authentication except login/logout.

**Session Management:**
- Login returns session token in HTTP-only cookie
- All requests must include cookie
- Sessions expire after 24 hours of inactivity

---

## Endpoints

### Proposals

#### `GET /api/proposals`

**Description:** List all proposals (with filtering and pagination)

**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, SUBMITTED, etc.)
- `rentModel` (optional): Filter by rent model (Fixed, RevShare, Partner)
- `developer` (optional): Filter by developer name
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): Sort direction (asc, desc)

**Response:** `200 OK`
```json
{
  "proposals": [
    {
      "id": "abc123",
      "name": "Developer A - Round 1",
      "developer": "Developer A",
      "property": "Downtown Campus",
      "rentModel": "Fixed",
      "status": "SUBMITTED",
      "negotiationRound": 1,
      "origin": "OUR_OFFER",
      "metrics": {
        "totalRent": 450000000,
        "npv": 125000000,
        "totalEbitda": 380000000,
        "finalCash": 95000000,
        "maxDebt": 45000000
      },
      "createdBy": "user123",
      "createdAt": "2024-11-20T10:00:00Z",
      "updatedAt": "2024-11-23T15:30:00Z"
    }
    // ... more proposals
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

---

#### `GET /api/proposals/[id]`

**Description:** Get proposal details by ID

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Response:** `200 OK`
```json
{
  "proposal": {
    "id": "abc123",
    "name": "Developer A - Round 1",
    "rentModel": "Fixed",
    "createdBy": "user123",
    "transition": {
      "2025": { "revenue": 45000000, "rent": 10000000, "staffCosts": 18000000, "otherOpex": 8000000 },
      "2026": { "revenue": 50000000, "rent": 11000000, "staffCosts": 20000000, "otherOpex": 9000000 },
      "2027": { "revenue": 55000000, "rent": 12000000, "staffCosts": 22000000, "otherOpex": 10000000 }
    },
    "enrollment": { "starting": 1200, "growthModel": "S-Curve", "maxCapacity": 2000 },
    "curriculum": { "grades": ["KG1", "KG2", "1-6", "7-9", "10-12"], "tuition": {...} },
    "staff": { "studentTeacherRatio": 15, "avgSalary": 120000, "nonTeacherPercent": 0.30, "cpiGrowth": 0.03 },
    "rentParams": { "year1Rent": 15000000, "cpiEscalation": 0.03 },
    "otherOpex": 10000000,
    "financials": { "periods": [ ... 30 years of P&L, BS, CF ... ] },
    "metrics": { "totalRent": 450000000, "npv": 125000000, "totalEbitda": 380000000 },
    "calculatedAt": "2024-11-23T15:30:00Z",
    "developer": "Developer A",
    "property": "Downtown Campus",
    "negotiationRound": 1,
    "status": "SUBMITTED",
    "createdAt": "2024-11-20T10:00:00Z",
    "updatedAt": "2024-11-23T15:30:00Z"
  }
}
```

---

#### `POST /api/proposals`

**Description:** Create a new proposal

**Auth Required:** Yes (PLANNER or ADMIN)

**Request Body:**
```json
{
  "name": "Developer A - Round 1",
  "developer": "Developer A",
  "property": "Downtown Campus",
  "rentModel": "Fixed",
  "transition": {
    "2025": { "revenue": 45000000, "rent": 10000000, "staffCosts": 18000000, "otherOpex": 8000000 },
    "2026": { "revenue": 50000000, "rent": 11000000, "staffCosts": 20000000, "otherOpex": 9000000 },
    "2027": { "revenue": 55000000, "rent": 12000000, "staffCosts": 22000000, "otherOpex": 10000000 }
  },
  "enrollment": { "starting": 1200, "growthModel": "S-Curve", "maxCapacity": 2000 },
  "curriculum": { "grades": ["KG1", "KG2", "1-6", "7-9", "10-12"], "tuition": {...} },
  "staff": { "studentTeacherRatio": 15, "avgSalary": 120000, "nonTeacherPercent": 0.30, "cpiGrowth": 0.03 },
  "rentParams": { "year1Rent": 15000000, "cpiEscalation": 0.03 },
  "otherOpex": 10000000
}
```

**Response:** `201 Created`
```json
{
  "proposal": {
    "id": "abc123",
    "name": "Developer A - Round 1",
    // ... full proposal object with calculated financials
  }
}
```

---

#### `PUT /api/proposals/[id]`

**Description:** Update an existing proposal

**Auth Required:** Yes (own proposals for PLANNER, any for ADMIN)

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Request Body:** Same as POST (any fields to update)

**Response:** `200 OK`

---

#### `DELETE /api/proposals/[id]`

**Description:** Delete a proposal

**Auth Required:** Yes (own proposals for PLANNER, any for ADMIN)

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Response:** `204 No Content`

---

### Calculation

#### `POST /api/proposals/calculate`

**Description:** Calculate 30-year financial projections for a proposal

**Auth Required:** Yes

**Request Body:** Same as POST /api/proposals (proposal inputs)

**Response:** `200 OK`
```json
{
  "periods": [
    {
      "year": 2023,
      "periodType": "HISTORICAL",
      "profitLoss": {
        "revenue": 50000000,
        "rentExpense": 12000000,
        "staffCosts": 20000000,
        "otherOpex": 8000000,
        "depreciation": 2000000,
        "ebit": 8000000,
        "interestExpense": 500000,
        "interestIncome": 100000,
        "ebt": 7600000,
        "zakat": 190000,
        "netIncome": 7410000
      },
      "balanceSheet": {
        "cash": 5000000,
        "accountsReceivable": 2000000,
        "prepaidExpenses": 500000,
        "grossPPE": 20000000,
        "accumulatedDepreciation": 5000000,
        "netPPE": 15000000,
        "totalAssets": 22500000,
        "accountsPayable": 1000000,
        "accruedExpenses": 800000,
        "deferredRevenue": 3000000,
        "debtBalance": 10000000,
        "totalLiabilities": 14800000,
        "totalEquity": 7700000,
        "balanceDifference": 0
      },
      "cashFlow": {
        "operatingCashFlow": 9500000,
        "investingCashFlow": -1000000,
        "financingCashFlow": 0,
        "netCashFlow": 8500000,
        "beginningCash": 0,
        "endingCash": 5000000
      },
      "iterationsRequired": 3
    }
    // ... 29 more years
  ],
  "metrics": {
    "totalNetIncome": 380000000,
    "averageROE": 0.15,
    "peakDebt": 45000000,
    "finalCash": 95000000,
    "npv": null,
    "irr": null
  },
  "validation": {
    "allPeriodsBalanced": true,
    "allCashFlowsReconciled": true,
    "maxBalanceDifference": 0.000001,
    "maxCashDifference": 0.000001
  },
  "performance": {
    "calculationTimeMs": 750,
    "totalIterations": 87,
    "averageIterationsPerYear": 2.9
  },
  "calculatedAt": "2024-11-24T10:15:30Z"
}
```

---

### Scenarios

#### `POST /api/proposals/[id]/scenarios`

**Description:** Run a scenario (what-if analysis) with variable adjustments

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Request Body:**
```json
{
  "enrollmentPercent": 120,
  "cpiPercent": 4.0,
  "tuitionGrowthPercent": 7.0,
  "rentEscalationPercent": 3.5
}
```

**Response:** `200 OK`
```json
{
  "metrics": {
    "totalRent": "472500000",
    "npv": "152300000",
    "totalEbitda": "445000000",
    "finalCash": "128000000",
    "maxDebt": "38000000"
  },
  "comparison": {
    "totalRent": {
      "baseline": "450000000",
      "current": "472500000",
      "absoluteChange": "22500000",
      "percentChange": "5.00"
    },
    "npv": {
      "baseline": "125000000",
      "current": "152300000",
      "absoluteChange": "27300000",
      "percentChange": "21.84"
    }
    // ... other metrics
  },
  "performance": {
    "totalTimeMs": 125
  }
}
```

---

#### `GET /api/proposals/[id]/scenarios/saved`

**Description:** Get all saved scenarios for a proposal

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Response:** `200 OK`
```json
{
  "scenarios": [
    {
      "id": "scenario123",
      "name": "Optimistic Growth",
      "enrollmentPercent": 120,
      "cpiPercent": 3.0,
      "tuitionGrowthPercent": 7.0,
      "rentEscalationPercent": 3.0,
      "totalRent": 472500000,
      "npv": 152300000,
      "createdAt": "2024-11-23T10:00:00Z",
      "createdBy": "user123"
    }
    // ... more scenarios
  ]
}
```

---

#### `POST /api/proposals/[id]/scenarios/saved`

**Description:** Save a scenario

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Optimistic Growth",
  "enrollmentPercent": 120,
  "cpiPercent": 3.0,
  "tuitionGrowthPercent": 7.0,
  "rentEscalationPercent": 3.0,
  "metrics": {
    "totalRent": 472500000,
    "npv": 152300000,
    "totalEbitda": 445000000,
    "finalCash": 128000000,
    "maxDebt": 38000000
  }
}
```

**Response:** `201 Created`

---

### Sensitivity Analysis

#### `POST /api/proposals/[id]/sensitivity`

**Description:** Run sensitivity analysis (tornado chart)

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Request Body:**
```json
{
  "variable": "enrollment",
  "rangeMin": -20,
  "rangeMax": 20,
  "impactMetric": "npv"
}
```

**Response:** `200 OK`
```json
{
  "dataPoints": [
    { "inputValue": -20, "outputValue": 98500000 },
    { "inputValue": -16, "outputValue": 104000000 },
    { "inputValue": -12, "outputValue": 109500000 },
    // ... 11 points total
    { "inputValue": 20, "outputValue": 152300000 }
  ],
  "tornadoData": {
    "baselineValue": 125000000,
    "minImpact": -26500000,
    "maxImpact": 27300000,
    "range": 53800000
  },
  "performance": {
    "totalTimeMs": 3200
  }
}
```

---

### Comparison

#### `GET /api/proposals/compare`

**Description:** Compare multiple proposals side-by-side

**Auth Required:** Yes

**Query Parameters:**
- `ids`: Comma-separated list of proposal IDs (2-5 proposals)

**Example:** `/api/proposals/compare?ids=abc123,def456,ghi789`

**Response:** `200 OK`
```json
{
  "proposals": [
    {
      "id": "abc123",
      "name": "Proposal A",
      "developer": "Developer A",
      "rentModel": "Fixed",
      "metrics": {
        "totalRent": 420000000,
        "npv": 110000000,
        "avgEbitda": 12500000,
        "finalCash": 85000000,
        "maxDebt": 32000000,
        "irr": 0.115,
        "paybackPeriod": 7.2
      }
    },
    {
      "id": "def456",
      "name": "Proposal B",
      "developer": "Developer B",
      "rentModel": "RevShare",
      "metrics": {
        "totalRent": 475000000,
        "npv": 135000000,
        "avgEbitda": 14800000,
        "finalCash": 105000000,
        "maxDebt": 48000000,
        "irr": 0.142,
        "paybackPeriod": 8.5
      }
    }
    // ... more proposals
  ],
  "winners": {
    "totalRent": "abc123",
    "npv": "def456",
    "avgEbitda": "def456",
    "finalCash": "def456",
    "maxDebt": "abc123",
    "irr": "def456",
    "paybackPeriod": "abc123"
  }
}
```

---

### Export

#### `GET /api/proposals/[id]/export/pdf`

**Description:** Export proposal as PDF

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Response:** `200 OK` (Content-Type: application/pdf)
- Returns PDF blob for download

---

#### `GET /api/proposals/[id]/export/excel`

**Description:** Export proposal as Excel workbook

**Auth Required:** Yes

**Path Parameters:**
- `id`: Proposal ID (UUID)

**Response:** `200 OK` (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Returns Excel blob for download

---

#### `GET /api/proposals/compare/export`

**Description:** Export comparison as PDF or Excel

**Auth Required:** Yes

**Query Parameters:**
- `ids`: Comma-separated list of proposal IDs
- `format`: "pdf" or "excel"

**Response:** `200 OK` (PDF or Excel blob)

---

### Negotiations

Negotiations group proposals by developer + property combination, enabling timeline tracking and counter-offer management.

#### `GET /api/negotiations`

**Description:** List all negotiations with filtering

**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, ACCEPTED, REJECTED, CLOSED)
- `developer` (optional): Filter by developer name
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response:** `200 OK`
```json
{
  "negotiations": [
    {
      "id": "neg123",
      "developer": "Developer A",
      "property": "Downtown Campus",
      "status": "ACTIVE",
      "notes": "Initial discussions ongoing",
      "createdBy": "user123",
      "createdAt": "2024-11-20T10:00:00Z",
      "updatedAt": "2024-11-25T14:30:00Z",
      "_count": {
        "proposals": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

---

#### `POST /api/negotiations`

**Description:** Create a new negotiation

**Auth Required:** Yes (PLANNER or ADMIN)

**Request Body:**
```json
{
  "developer": "Developer A",
  "property": "Downtown Campus",
  "notes": "Initial negotiation with Developer A"
}
```

**Response:** `201 Created`
```json
{
  "negotiation": {
    "id": "neg123",
    "developer": "Developer A",
    "property": "Downtown Campus",
    "status": "ACTIVE",
    "notes": "Initial negotiation with Developer A",
    "createdBy": "user123",
    "createdAt": "2024-11-20T10:00:00Z",
    "updatedAt": "2024-11-20T10:00:00Z"
  }
}
```

**Errors:**
- `409 Conflict`: Negotiation for this developer+property already exists

---

#### `GET /api/negotiations/[id]`

**Description:** Get negotiation details with linked proposals

**Auth Required:** Yes

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Response:** `200 OK`
```json
{
  "negotiation": {
    "id": "neg123",
    "developer": "Developer A",
    "property": "Downtown Campus",
    "status": "ACTIVE",
    "notes": "Initial discussions ongoing",
    "createdBy": "user123",
    "createdAt": "2024-11-20T10:00:00Z",
    "updatedAt": "2024-11-25T14:30:00Z",
    "proposals": [
      {
        "id": "prop1",
        "name": "Initial Offer",
        "offerNumber": 1,
        "origin": "OUR_OFFER",
        "status": "SUBMITTED",
        "metrics": { "npv": 125000000, "totalRent": 450000000 }
      },
      {
        "id": "prop2",
        "name": "Counter 1",
        "offerNumber": 2,
        "origin": "THEIR_COUNTER",
        "status": "EVALUATING_COUNTER",
        "metrics": { "npv": 118000000, "totalRent": 480000000 }
      }
    ]
  }
}
```

---

#### `PATCH /api/negotiations/[id]`

**Description:** Update negotiation status or notes

**Auth Required:** Yes (PLANNER or ADMIN)

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Request Body:**
```json
{
  "status": "ACCEPTED",
  "notes": "Deal finalized on 2024-12-01"
}
```

**Response:** `200 OK`

**Valid Status Transitions:**
- `ACTIVE` → `ACCEPTED`, `REJECTED`, `CLOSED`
- `ACCEPTED`, `REJECTED`, `CLOSED` cannot be changed back to `ACTIVE`

---

#### `DELETE /api/negotiations/[id]`

**Description:** Delete a negotiation (and unlink its proposals)

**Auth Required:** Yes (ADMIN only)

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Response:** `204 No Content`

**Note:** Linked proposals are NOT deleted, only unlinked (negotiationId set to null)

---

#### `POST /api/negotiations/[id]/proposals`

**Description:** Link an existing proposal to a negotiation

**Auth Required:** Yes (PLANNER or ADMIN)

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Request Body:**
```json
{
  "proposalId": "prop123",
  "offerNumber": 3,
  "origin": "OUR_OFFER"
}
```

**Response:** `200 OK`
```json
{
  "proposal": {
    "id": "prop123",
    "negotiationId": "neg123",
    "offerNumber": 3,
    "origin": "OUR_OFFER",
    "purpose": "NEGOTIATION"
  }
}
```

---

#### `POST /api/negotiations/[id]/counter`

**Description:** Create a counter-offer proposal within a negotiation

**Auth Required:** Yes (PLANNER or ADMIN)

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Request Body:**
```json
{
  "name": "Counter Offer 2",
  "origin": "THEIR_COUNTER",
  "baseProposalId": "prop123",
  "rentParams": {
    "year1Rent": 16500000,
    "cpiEscalation": 0.035
  }
}
```

**Response:** `201 Created`
```json
{
  "proposal": {
    "id": "prop456",
    "name": "Counter Offer 2",
    "negotiationId": "neg123",
    "offerNumber": 4,
    "origin": "THEIR_COUNTER",
    "purpose": "NEGOTIATION",
    "status": "DRAFT"
  }
}
```

**Note:** If `baseProposalId` is provided, the new proposal copies most fields from the base proposal

---

#### `PATCH /api/negotiations/[id]/reorder`

**Description:** Reorder offers in a negotiation timeline

**Auth Required:** Yes (PLANNER or ADMIN)

**Path Parameters:**
- `id`: Negotiation ID (UUID)

**Request Body:**
```json
{
  "proposalOrder": [
    { "proposalId": "prop1", "offerNumber": 1 },
    { "proposalId": "prop3", "offerNumber": 2 },
    { "proposalId": "prop2", "offerNumber": 3 }
  ]
}
```

**Response:** `200 OK`
```json
{
  "updated": 3
}
```

---

### Configuration

#### `GET /api/config`

**Description:** Get current system configuration

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "config": {
    "id": "config123",
    "zakatRate": 0.025,
    "debtInterestRate": 0.05,
    "depositInterestRate": 0.02,
    "discountRate": 0.08,
    "minCashBalance": 1000000,
    "confirmedAt": "2024-11-01T10:00:00Z",
    "updatedBy": "admin123"
  }
}
```

---

#### `POST /api/config`

**Description:** Update system configuration

**Auth Required:** Yes (ADMIN only)

**Request Body:**
```json
{
  "zakatRate": 0.025,
  "debtInterestRate": 0.05,
  "depositInterestRate": 0.02,
  "discountRate": 0.08,
  "minCashBalance": 1000000
}
```

**Response:** `200 OK`

---

### Historical Data

#### `GET /api/historical`

**Description:** Get historical data (2023-2024)

**Auth Required:** Yes

**Query Parameters:**
- `year` (optional): Filter by year (2023 or 2024)
- `statementType` (optional): Filter by statement type (PL, BS, CF)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "hist123",
      "year": 2023,
      "statementType": "PL",
      "lineItem": "Revenue",
      "amount": 50000000,
      "confirmed": true
    }
    // ... more line items
  ]
}
```

---

#### `POST /api/historical`

**Description:** Create or update historical data

**Auth Required:** Yes (ADMIN only)

**Request Body:**
```json
{
  "year": 2023,
  "statementType": "PL",
  "lineItem": "Revenue",
  "amount": 50000000
}
```

**Response:** `201 Created` or `200 OK` (if updating)

---

### Dashboard Metrics

#### `GET /api/dashboard/metrics`

**Description:** Get aggregate dashboard metrics

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "metrics": {
    "totalProposals": 127,
    "activeNegotiations": 15,
    "averageNPV": 118000000,
    "recentActivity": [
      {
        "proposalId": "abc123",
        "proposalName": "Developer A - Round 2",
        "action": "UPDATED",
        "timestamp": "2024-11-24T09:30:00Z",
        "user": "user123"
      }
      // ... more recent activity
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "enrollmentPercent",
      "message": "Must be between 50 and 150"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please log in to access this resource"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Proposal not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Calculation endpoints:** 10 requests per minute per user
- **Export endpoints:** 5 requests per minute per user
- **Other endpoints:** 60 requests per minute per user

**Rate limit headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700832000
```

---

## Related Documentation

- [Architecture](ARCHITECTURE.md) - System architecture
- [Database Schema](DATABASE_SCHEMA.md) - Database structure
- [Calculation Formulas](CALCULATION_FORMULAS.md) - Financial formulas

---

**Document Version:** 2.0
**Last Updated:** December 2025
**Maintained By:** Documentation Agent
