# CODING STANDARDS ENFORCEMENT
## Project_2052 - Mandatory Compliance Policy

**Version:** 1.0
**Date:** November 22, 2025
**Status:** ACTIVE - Zero Tolerance Policy
**Authority:** CAO (Chief Accounting Officer)

---

## MANDATE

**ALL agents working on Project_2052 MUST comply with [CODING_STANDARDS.md](CODING_STANDARDS.md) without exception.**

This is not optional. This is not a guideline. This is a **REQUIREMENT**.

---

## WHY THIS MATTERS

Project_2052 is a **financial planning application** dealing with:
- 30-year projections (2023-2053)
- Millions of SAR in calculations
- Board-level decision support
- Circular financial dependencies
- Three distinct calculation periods

**A single rounding error can cascade into millions of SAR in miscalculation.**

**A single performance issue can make the tool unusable.**

**A single type error can crash production during a board presentation.**

Therefore, coding standards are **non-negotiable**.

---

## ENFORCEMENT MECHANISMS

### 1. Pre-Commit Validation

**Before ANY code is committed:**

- [ ] TypeScript compilation passes with strict mode
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied
- [ ] All tests pass
- [ ] No `any` types (checked by ESLint rule)
- [ ] No JavaScript numbers used for money (custom ESLint rule)

**Tools:**
```bash
# Pre-commit hook (.husky/pre-commit)
pnpm lint
pnpm type-check
pnpm test
pnpm format:check
```

### 2. Code Review Checklist

**Every pull request MUST be reviewed against CODING_STANDARDS.md.**

**Reviewer checklist:**

- [ ] **Financial Precision:** All money uses Decimal.js (no JS numbers)
- [ ] **Performance:** Expensive operations are memoized/cached
- [ ] **Type Safety:** All functions have explicit types, no `any`
- [ ] **Immutability:** No mutations, const by default
- [ ] **Error Handling:** Proper try-catch, custom error classes
- [ ] **Security:** Input validation, RBAC enforced
- [ ] **Testing:** New code has tests, coverage >80%
- [ ] **Documentation:** Complex logic has comments

**If ANY item fails: Request changes. Do not approve.**

### 3. Automated Linting Rules

**Custom ESLint rules for Project_2052:**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Enforce Decimal.js for money
    'no-restricted-syntax': [
      'error',
      {
        selector: 'BinaryExpression[operator=/[+\\-*\\/]/] > Identifier[name=/revenue|rent|cash|debt|equity|zakat|interest/]',
        message: 'Use Decimal.js methods (.plus(), .minus(), .times(), .dividedBy()) for financial calculations'
      }
    ],

    // No 'any' type
    '@typescript-eslint/no-explicit-any': 'error',

    // Require return types
    '@typescript-eslint/explicit-function-return-type': 'error',

    // No unused variables
    '@typescript-eslint/no-unused-vars': 'error',

    // Require Zod validation for API inputs
    'no-restricted-imports': [
      'error',
      {
        paths: [{
          name: 'next/server',
          message: 'Always validate request body with Zod before processing'
        }]
      }
    ]
  }
};
```

### 4. CI/CD Pipeline Gates

**GitHub Actions / CI pipeline MUST enforce:**

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install dependencies
        run: pnpm install

      - name: Type check (strict mode)
        run: pnpm type-check
        # MUST pass, no warnings allowed

      - name: Lint
        run: pnpm lint
        # MUST pass, zero warnings

      - name: Test
        run: pnpm test
        # MUST pass, >80% coverage

      - name: Build
        run: pnpm build
        # MUST succeed

      - name: Performance test (financial engine)
        run: pnpm test:performance
        # 30-year calculation MUST complete <1s
```

**If ANY step fails: Block merge. No exceptions.**

---

## AGENT-SPECIFIC REQUIREMENTS

### Financial Architect (fa-001)

**Critical Standards:**
- ✅ Section 3: Financial Calculation Standards (100% compliance)
- ✅ Section 4.1: Web Workers for calculations
- ✅ Section 8: Testing (100% coverage for financial code)
- ✅ Section 12: Documentation (all formulas documented)

**Zero Tolerance:**
- ❌ Never use JavaScript numbers for money
- ❌ Never skip pre-creating Decimal constants
- ❌ Never compare Decimals with < > === operators

**Review frequency:** Daily during calculation engine development

---

### Backend Engineer (be-001)

**Critical Standards:**
- ✅ Section 5.2: API Route Handlers (validation mandatory)
- ✅ Section 6: Database & Prisma (select fields, transactions)
- ✅ Section 7: API Design (RESTful, proper status codes)
- ✅ Section 9: Security (RBAC, input validation, SQL injection prevention)
- ✅ Section 10: Error Handling (custom errors, logging)

**Zero Tolerance:**
- ❌ Never skip Zod validation on API inputs
- ❌ Never skip RBAC checks on protected routes
- ❌ Never use raw SQL without parameterization
- ❌ Never return 200 for errors

**Review frequency:** Every pull request

---

### Frontend Engineer (fe-001)

**Critical Standards:**
- ✅ Section 2.2: Type Everything Explicitly
- ✅ Section 4.2: Memoization (React.memo, useMemo, useCallback)
- ✅ Section 4.3: Debounce sliders (300ms)
- ✅ Section 5.1: Server vs Client Components
- ✅ Section 5.3: Form Handling (React Hook Form + Zod)

**Zero Tolerance:**
- ❌ Never use 'use client' unnecessarily
- ❌ Never skip form validation
- ❌ Never recalculate on every render (use memoization)
- ❌ Never skip debouncing for interactive inputs

**Review frequency:** Every pull request

---

### Database Architect (da-001)

**Critical Standards:**
- ✅ Section 6.1: Schema Design (UUID, enums, indexes)
- ✅ Section 6.2: Query Optimization (select fields, transactions)
- ✅ Section 6.3: Decimal Handling (Prisma.Decimal ↔ Decimal.js)

**Zero Tolerance:**
- ❌ Never use Int for IDs (use UUID)
- ❌ Never skip indexes on foreign keys
- ❌ Never fetch all fields when only few needed
- ❌ Never skip transactions for multi-table operations

**Review frequency:** Every schema change

---

### QA/Validation Engineer (qa-001)

**Critical Standards:**
- ✅ Section 8: Testing Standards (coverage requirements)
- ✅ Section 8.1: Unit Tests (100% for calculations)
- ✅ Section 8.2: Integration Tests
- ✅ All sections for test case creation

**Zero Tolerance:**
- ❌ Never approve code with <80% coverage
- ❌ Never skip testing financial calculations
- ❌ Never approve code violating standards

**Review frequency:** Every pull request + phase gates

---

### UI/UX Designer (ux-001)

**Relevant Standards:**
- ✅ Section 11.1: Directory Structure (component organization)
- ✅ Accessibility (WCAG AA compliance)
- ✅ Responsive design patterns

**Collaboration:**
- Work with frontend engineer to ensure designs are implementable per standards
- Review implemented UI against standards

**Review frequency:** Design handoffs + weekly design reviews

---

### Project Manager (pm-001)

**Responsibility:**
- **Enforce** CODING_STANDARDS.md across all agents
- **Review** pull requests for standards compliance
- **Block** merges that violate standards
- **Report** violations to CAO
- **Update** standards as needed (with CAO approval)

**Zero Tolerance:**
- ❌ Never approve code violating standards
- ❌ Never skip code review
- ❌ Never merge without passing CI/CD

**Review frequency:** Every pull request, every handoff

---

## VIOLATION CONSEQUENCES

### First Violation
- **Action:** Pull request rejected
- **Requirement:** Fix and resubmit
- **Documentation:** Log violation in team notes
- **Training:** Review relevant CODING_STANDARDS.md section

### Second Violation (Same Agent, Same Rule)
- **Action:** Pull request rejected
- **Requirement:** Pair programming session with PM or peer agent
- **Documentation:** Formal note in agent file
- **Training:** Deep dive on violated standard

### Third Violation (Same Agent, Same Rule)
- **Action:** Pull request rejected
- **Escalation:** Report to CAO
- **Requirement:** Agent may be reassigned or replaced
- **Documentation:** Formal warning

### Critical Violations (Any Instance)

**These violations are NEVER acceptable and escalate immediately:**

1. **Using JavaScript numbers for money**
   - Impact: Financial calculation errors, data corruption
   - Consequence: Code rejected, immediate fix required

2. **Skipping authentication/authorization checks**
   - Impact: Security vulnerability
   - Consequence: Code rejected, security review required

3. **No input validation on API endpoints**
   - Impact: Data corruption, SQL injection risk
   - Consequence: Code rejected, security review required

4. **Shipping code with <50% test coverage**
   - Impact: Production bugs, unreliable software
   - Consequence: Code rejected, tests required before review

5. **Using `any` type in financial calculations**
   - Impact: Type safety lost, runtime errors
   - Consequence: Code rejected, types required

---

## COMPLIANCE VERIFICATION

### Weekly Audit

**Every Friday, PM runs compliance audit:**

```bash
# Type safety audit
pnpm tsc --noEmit --strict

# Code quality audit
pnpm lint --max-warnings 0

# Test coverage audit
pnpm test:coverage --threshold=80

# Performance audit
pnpm test:performance

# Decimal.js usage audit (custom script)
pnpm audit:decimal-usage
```

**Results reported in weekly sprint review.**

### Phase Gate Compliance

**At each phase gate, QA Engineer certifies:**

- [ ] All code follows CODING_STANDARDS.md
- [ ] All automated checks pass
- [ ] All tests pass with >80% coverage
- [ ] No known standards violations exist
- [ ] All critical violations resolved

**Without this certification, phase gate FAILS.**

---

## TRAINING & SUPPORT

### Resources

1. **CODING_STANDARDS.md** - Primary reference (read thoroughly)
2. **Example Code** - Reference implementations showing standards
3. **ESLint Rules** - Automated checking
4. **Pair Programming** - Work with PM or peer on standards
5. **Office Hours** - PM available for standards questions

### Quick Reference Card

**Top 10 Rules (Memorize These):**

1. ✅ Always use Decimal.js for money
2. ✅ Pre-create Decimal constants
3. ✅ Explicit types, never `any`
4. ✅ Validate all API inputs with Zod
5. ✅ Memoize expensive React computations
6. ✅ Debounce interactive inputs (300ms)
7. ✅ Server Components by default
8. ✅ RBAC on all protected routes
9. ✅ >80% test coverage
10. ✅ Document complex logic

---

## UPDATES TO STANDARDS

**CODING_STANDARDS.md is a living document.**

### How to Propose Changes

1. Agent identifies issue or improvement
2. Agent creates proposal document:
   - Current standard
   - Proposed change
   - Justification
   - Impact assessment
3. Agent submits to PM
4. PM reviews with relevant agents
5. If approved: PM updates CODING_STANDARDS.md
6. If rejected: PM documents reason
7. All agents notified of changes

**All changes require CAO approval for financial/security standards.**

### Change Log

Track all changes to CODING_STANDARDS.md:

| Date | Section | Change | Reason | Approver |
|------|---------|--------|--------|----------|
| 2025-11-22 | All | Initial version | Project kickoff | CAO |
| | | | | |

---

## ACKNOWLEDGMENT

**All agents must acknowledge:**

> "I have read and understand CODING_STANDARDS.md in its entirety. I commit to following all standards without exception. I understand that violations will result in pull request rejection and potential escalation. I will ask for clarification when uncertain rather than guess."

**Agent Signatures:**

- [ ] fa-001 (Financial Architect): _______________
- [ ] be-001 (Backend Engineer): _______________
- [ ] fe-001 (Frontend Engineer): _______________
- [ ] da-001 (Database Architect): _______________
- [ ] ux-001 (UI/UX Designer): _______________
- [ ] qa-001 (QA/Validation Engineer): _______________
- [ ] pm-001 (Project Manager): _______________

---

## SUMMARY

**Three things to remember:**

1. **CODING_STANDARDS.md is MANDATORY** - Not optional, not a guideline
2. **Violations are SERIOUS** - Financial accuracy and security depend on compliance
3. **Ask when uncertain** - PM is available to clarify standards

**When in doubt, refer to CODING_STANDARDS.md.**

**When still in doubt, ask PM.**

**Never guess. Never skip. Never compromise.**

---

**This enforcement policy is effective immediately and remains in effect for the entire duration of Project_2052.**

**CAO Authority: [Signature Required]**
**PM Enforcement: pm-001**
**Last Updated: 2025-11-22**
