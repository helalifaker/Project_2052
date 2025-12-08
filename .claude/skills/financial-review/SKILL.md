---
name: financial-review
description: Reviews financial calculations for accuracy and Decimal.js compliance. Use when analyzing proposal calculations, validating rent models, or checking 30-year projections for precision issues.
---

# Financial Calculation Review

## Instructions

When reviewing financial code or calculations in this project:

1. **Verify Decimal.js Usage**
   - All monetary values MUST use `Decimal` from `decimal.js`
   - Never use JavaScript `number` for financial calculations
   - Use pre-created constants from `@/lib/engine/core/constants.ts` (ZERO, ONE, ZAKAT_RATE, etc.)

2. **Check Comparison Methods**
   - Use `.greaterThan()`, `.lessThan()`, `.equals()` for Decimal comparisons
   - Never use `>`, `<`, `===` with Decimal objects

3. **Validate Period Calculations**
   - Historical (2023-2024): Should use immutable actual data
   - Transition (2025-2027): Bridge calculations with growth projections
   - Dynamic (2028-2053): Full projections using rent models

4. **Rent Model Validation**
   - FIXED_ESCALATION: Verify base rent + escalation rate logic
   - REVENUE_SHARE: Confirm percentage of total revenue calculation
   - PARTNER_INVESTMENT: Check (land + construction) × yield rate

5. **Report Findings**
   - Reference specific file paths and line numbers
   - Explain the financial impact of any issues found
   - Suggest fixes using proper Decimal.js patterns

6. **Negotiation Context (v2.2)**
   - When reviewing proposals within a negotiation thread, consider the timeline context
   - Compare counter-offers for financial consistency
   - Validate that linked proposals share correct baseline assumptions
   - Check that status transitions (ACTIVE → ACCEPTED/REJECTED) are properly reflected

## Examples

- "Review the rent calculation in this proposal"
- "Check if this projection uses proper decimal precision"
- "Validate the cash flow calculations"
- "Compare financial terms across negotiation counter-offers" (v2.2)
- "Review the financial impact of accepting this counter-offer" (v2.2)
