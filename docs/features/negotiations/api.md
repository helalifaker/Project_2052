# Negotiations API Reference

> Complete API documentation for the Negotiation Workflow System (v2.2)

---

## Base URL

```
/api/negotiations
```

## Authentication

All endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Role Requirements

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✓ | ✓ | ✓ | ✓ |
| PLANNER | ✓ | ✓ | ✓ | ✗ |
| VIEWER | ✗ | ✓ | ✗ | ✗ |

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/negotiations` | List all negotiations |
| POST | `/api/negotiations` | Create new negotiation |
| GET | `/api/negotiations/[id]` | Get negotiation details |
| PATCH | `/api/negotiations/[id]` | Update negotiation |
| DELETE | `/api/negotiations/[id]` | Delete negotiation |
| GET | `/api/negotiations/[id]/proposals` | List proposals in negotiation |
| POST | `/api/negotiations/[id]/proposals` | Link proposal to negotiation |
| POST | `/api/negotiations/[id]/counter` | Create counter-offer |
| PATCH | `/api/negotiations/[id]/reorder` | Reorder offers |

---

## List Negotiations

```http
GET /api/negotiations
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `active`, `closed`, `all`, or specific status |
| `developer` | string | Filter by developer name (case-insensitive contains) |

### Status Filter Values

- `active` - Only ACTIVE negotiations
- `closed` - ACCEPTED, REJECTED, or CLOSED negotiations
- `all` - No status filter
- `ACTIVE`, `ACCEPTED`, `REJECTED`, `CLOSED` - Specific status

### Response

```json
{
  "negotiations": [
    {
      "id": "uuid",
      "developer": "Olayan Group",
      "property": "King Fahd Road Campus",
      "status": "ACTIVE",
      "notes": "Initial contact made December 2025",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-02-01T14:30:00.000Z",
      "createdBy": "user-uuid",
      "creator": {
        "id": "user-uuid",
        "name": "John Planner"
      },
      "proposalCount": 4,
      "ourOffers": 2,
      "theirCounters": 2,
      "latestOffer": {
        "id": "proposal-uuid",
        "name": "Their Counter #4",
        "offerNumber": 4,
        "origin": "THEIR_COUNTER",
        "status": "DRAFT",
        "updatedAt": "2025-02-05T09:00:00.000Z"
      },
      "latestMetrics": {
        "totalRent": 450000000,
        "npv": 120000000,
        "irr": 0.12
      },
      "proposals": [
        {
          "id": "proposal-uuid-1",
          "name": "Our Offer #1",
          "rentModel": "FIXED_ESCALATION",
          "offerNumber": 1,
          "origin": "OUR_OFFER",
          "status": "REJECTED",
          "version": null,
          "metrics": {...},
          "createdAt": "2025-01-15T10:00:00.000Z",
          "updatedAt": "2025-01-18T14:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Example

```bash
# Get all active negotiations
curl -X GET "/api/negotiations?status=active" \
  -H "Authorization: Bearer <token>"

# Filter by developer
curl -X GET "/api/negotiations?developer=olayan" \
  -H "Authorization: Bearer <token>"
```

---

## Create Negotiation

```http
POST /api/negotiations
```

### Request Body

```json
{
  "developer": "Olayan Group",
  "property": "King Fahd Road Campus",
  "notes": "Initial contact made December 2025"
}
```

### Validation Schema

```typescript
const CreateNegotiationSchema = z.object({
  developer: z.string().min(1).max(255),
  property: z.string().min(1).max(255),
  notes: z.string().max(2000).optional()
});
```

### Response (201 Created)

```json
{
  "id": "uuid",
  "developer": "Olayan Group",
  "property": "King Fahd Road Campus",
  "status": "ACTIVE",
  "notes": "Initial contact made December 2025",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "createdBy": "user-uuid",
  "creator": {
    "id": "user-uuid",
    "name": "John Planner",
    "email": "john@example.com"
  }
}
```

### Error Responses

**409 Conflict** - Negotiation already exists:
```json
{
  "error": "A negotiation already exists for this developer and property",
  "existingId": "existing-uuid"
}
```

**400 Bad Request** - Validation failed:
```json
{
  "error": "Validation failed",
  "details": [
    { "path": ["developer"], "message": "Developer name is required" }
  ]
}
```

---

## Get Negotiation

```http
GET /api/negotiations/[id]
```

### Response

```json
{
  "id": "uuid",
  "developer": "Olayan Group",
  "property": "King Fahd Road Campus",
  "status": "ACTIVE",
  "notes": "Initial contact made December 2025",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-02-01T14:30:00.000Z",
  "createdBy": "user-uuid",
  "creator": {
    "id": "user-uuid",
    "name": "John Planner",
    "email": "john@example.com"
  },
  "proposals": [
    {
      "id": "proposal-uuid",
      "name": "Our Offer #1",
      "rentModel": "FIXED_ESCALATION",
      "offerNumber": 1,
      "origin": "OUR_OFFER",
      "status": "REJECTED",
      "purpose": "NEGOTIATION",
      "enrollment": {...},
      "curriculum": {...},
      "staff": {...},
      "rentParams": {...},
      "financials": {...},
      "metrics": {...},
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-18T14:00:00.000Z",
      "creator": {
        "id": "user-uuid",
        "name": "John Planner"
      }
    }
  ]
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Negotiation not found"
}
```

**400 Bad Request** - Invalid UUID:
```json
{
  "error": "Invalid negotiation ID"
}
```

---

## Update Negotiation

```http
PATCH /api/negotiations/[id]
```

### Request Body

```json
{
  "status": "ACCEPTED",
  "notes": "Deal closed at SAR 45M/yr with 5% escalation"
}
```

### Validation Schema

```typescript
const UpdateNegotiationSchema = z.object({
  status: z.enum(["ACTIVE", "ACCEPTED", "REJECTED", "CLOSED"]).optional(),
  notes: z.string().max(2000).nullable().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});
```

### Response

Returns the updated negotiation with all proposals.

---

## Delete Negotiation

```http
DELETE /api/negotiations/[id]
```

**Requires ADMIN role.**

### Behavior

- Unlinks all proposals (sets `negotiationId` to null)
- Clears `offerNumber` from unlinked proposals
- Does NOT delete the proposals themselves

### Response

```json
{
  "success": true,
  "message": "Negotiation deleted",
  "unlinkedProposals": 4
}
```

---

## List Proposals in Negotiation

```http
GET /api/negotiations/[id]/proposals
```

### Response

```json
{
  "proposals": [
    {
      "id": "proposal-uuid",
      "name": "Our Offer #1",
      "rentModel": "FIXED_ESCALATION",
      "offerNumber": 1,
      "origin": "OUR_OFFER",
      "status": "REJECTED",
      ...
    }
  ]
}
```

Proposals are sorted by `offerNumber ASC`, then `createdAt ASC`.

---

## Link Proposal to Negotiation

```http
POST /api/negotiations/[id]/proposals
```

Links an existing proposal to this negotiation.

### Request Body

```json
{
  "proposalId": "existing-proposal-uuid",
  "origin": "OUR_OFFER",
  "offerNumber": 2
}
```

### Validation Schema

```typescript
const LinkProposalSchema = z.object({
  proposalId: z.string().uuid(),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"]),
  offerNumber: z.number().int().positive().optional()
});
```

### Behavior

- If `offerNumber` is not provided, auto-assigns next available number
- Updates proposal's `purpose` to NEGOTIATION
- Copies `developer` and `property` from negotiation for backward compatibility

### Response

```json
{
  "id": "proposal-uuid",
  "name": "My Proposal",
  "offerNumber": 2,
  "origin": "OUR_OFFER",
  "status": "DRAFT"
}
```

### Error Responses

**409 Conflict** - Already linked:
```json
{
  "error": "Proposal is already linked to another negotiation",
  "existingNegotiationId": "other-negotiation-uuid"
}
```

---

## Create Counter-Offer

```http
POST /api/negotiations/[id]/counter
```

Duplicates a source proposal and adds it as a new offer in the timeline.

### Request Body

```json
{
  "sourceProposalId": "existing-proposal-uuid",
  "origin": "THEIR_COUNTER",
  "name": "Their Counter #3"
}
```

### Validation Schema

```typescript
const CreateCounterSchema = z.object({
  sourceProposalId: z.string().uuid(),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"]),
  name: z.string().min(1).max(255).optional()
});
```

### Behavior

1. Copies all financial data from source proposal:
   - `enrollment`, `curriculum`, `staff`, `rentParams`
   - `otherOpexPercent`, `contractPeriodYears`
2. Does NOT copy calculated fields (`financials`, `metrics`, `calculatedAt`)
3. Sets `parentProposalId` to source for traceability
4. Auto-assigns next `offerNumber`
5. Auto-generates name if not provided (e.g., "Our Offer #3")

### Response (201 Created)

```json
{
  "id": "new-proposal-uuid",
  "name": "Their Counter #3",
  "offerNumber": 3,
  "origin": "THEIR_COUNTER",
  "status": "DRAFT",
  "sourceProposalId": "existing-proposal-uuid"
}
```

---

## Reorder Offers

```http
PATCH /api/negotiations/[id]/reorder
```

Updates offer numbers for proposals in the timeline.

### Request Body

```json
{
  "offers": [
    { "proposalId": "uuid-1", "offerNumber": 1 },
    { "proposalId": "uuid-2", "offerNumber": 2 },
    { "proposalId": "uuid-3", "offerNumber": 3 }
  ]
}
```

### Validation Schema

```typescript
const ReorderOffersSchema = z.object({
  offers: z.array(z.object({
    proposalId: z.string().uuid(),
    offerNumber: z.number().int().positive()
  })).min(1)
});
```

### Validation Rules

- All proposals must belong to this negotiation
- No duplicate `offerNumber` values allowed
- Numbers must be positive integers

### Response

```json
{
  "success": true,
  "proposals": [
    { "id": "uuid-1", "name": "Our Offer #1", "offerNumber": 1, "origin": "OUR_OFFER", "status": "REJECTED" },
    { "id": "uuid-2", "name": "Their Counter #2", "offerNumber": 2, "origin": "THEIR_COUNTER", "status": "SUBMITTED" },
    { "id": "uuid-3", "name": "Our Offer #3", "offerNumber": 3, "origin": "OUR_OFFER", "status": "DRAFT" }
  ]
}
```

### Error Responses

**400 Bad Request** - Invalid proposals:
```json
{
  "error": "Some proposals do not belong to this negotiation",
  "invalidProposalIds": ["uuid-x", "uuid-y"]
}
```

**400 Bad Request** - Duplicate numbers:
```json
{
  "error": "Duplicate offer numbers not allowed"
}
```

---

## TypeScript Types

### Zod Schemas

```typescript
import { z } from "zod";

// Enums
export const NegotiationStatusSchema = z.enum([
  "ACTIVE", "ACCEPTED", "REJECTED", "CLOSED"
]);

export const ProposalOriginSchema = z.enum([
  "OUR_OFFER", "THEIR_COUNTER"
]);

export const ProposalStatusSchema = z.enum([
  "DRAFT", "READY_TO_SUBMIT", "SUBMITTED", "UNDER_REVIEW",
  "COUNTER_RECEIVED", "EVALUATING_COUNTER", "ACCEPTED",
  "REJECTED", "NEGOTIATION_CLOSED"
]);

export const ProposalPurposeSchema = z.enum([
  "NEGOTIATION", "STRESS_TEST", "SIMULATION"
]);

// Request schemas
export const CreateNegotiationSchema = z.object({
  developer: z.string().min(1).max(255),
  property: z.string().min(1).max(255),
  notes: z.string().max(2000).optional()
});

export const UpdateNegotiationSchema = z.object({
  status: NegotiationStatusSchema.optional(),
  notes: z.string().max(2000).nullable().optional()
});

export const LinkProposalSchema = z.object({
  proposalId: z.string().uuid(),
  origin: ProposalOriginSchema.optional(),
  offerNumber: z.number().int().positive().optional()
});

export const CreateCounterOfferSchema = z.object({
  sourceProposalId: z.string().uuid(),
  origin: ProposalOriginSchema,
  name: z.string().min(1).max(255).optional()
});

export const ReorderOffersSchema = z.object({
  offers: z.array(z.object({
    proposalId: z.string().uuid(),
    offerNumber: z.number().int().positive()
  })).min(1)
});
```

### Type Exports

```typescript
export type NegotiationStatus = z.infer<typeof NegotiationStatusSchema>;
export type ProposalOrigin = z.infer<typeof ProposalOriginSchema>;
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;
export type ProposalPurpose = z.infer<typeof ProposalPurposeSchema>;
export type CreateNegotiation = z.infer<typeof CreateNegotiationSchema>;
export type UpdateNegotiation = z.infer<typeof UpdateNegotiationSchema>;
export type LinkProposal = z.infer<typeof LinkProposalSchema>;
export type CreateCounterOffer = z.infer<typeof CreateCounterOfferSchema>;
export type ReorderOffers = z.infer<typeof ReorderOffersSchema>;
```

---

## Related Documentation

- [Workflow Guide](workflow.md) - User workflows
- [Status Guide](status-guide.md) - Status state machine
- [Main API Reference](/docs/technical/api-reference.md) - All API endpoints

---

**Last Updated:** December 2025
**API Version:** 2.2
