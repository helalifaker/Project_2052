# 🚨 MANDATORY CODING STANDARDS - ALL AGENTS 🚨

## CRITICAL REQUIREMENT

**Before writing ANY code, you MUST read and comply with:**

### 📖 [CODING_STANDARDS.md](../CODING_STANDARDS.md)

**This is NOT optional. This is NOT a guideline. This is a REQUIREMENT.**

---

## Why This is Critical

Project_2052 is a **financial planning application** with:
- 30-year projections worth millions of SAR
- Board-level decision support
- Circular financial dependencies
- Ultra-fast performance requirements (<1 second)

**A single error can cascade into millions in miscalculation.**

---

## Your Obligations

### ✅ MUST DO

1. **Read CODING_STANDARDS.md completely** before starting work
2. **Follow ALL standards** without exception:
   - Financial Calculation Standards (Decimal.js mandatory)
   - Performance Standards (Web Workers, memoization, caching)
   - Type Safety Standards (strict TypeScript, no `any`)
   - Security Standards (RBAC, input validation)
   - Testing Standards (>80% coverage minimum)

3. **Reference standards frequently** when writing code
4. **Ask PM for clarification** when uncertain (never guess)
5. **Review your code** against standards before submitting

### ❌ NEVER DO

1. ❌ Use JavaScript numbers for money (use Decimal.js)
2. ❌ Skip input validation on API routes
3. ❌ Skip authentication/authorization checks
4. ❌ Use `any` type (use proper TypeScript types)
5. ❌ Skip tests (minimum 80% coverage required)
6. ❌ Mutate objects (use immutable patterns)
7. ❌ Skip error handling
8. ❌ Guess at standards (ask PM if unclear)

---

## Enforcement

### Code Review
- **Every pull request** is reviewed against CODING_STANDARDS.md
- **Violations = rejection** of pull request
- **No exceptions**

### Automated Checks
- TypeScript strict mode (must pass)
- ESLint (zero warnings)
- Tests (>80% coverage)
- Build (must succeed)

### Consequences
1. **First violation:** Fix and resubmit
2. **Second violation:** Pair programming with PM
3. **Third violation:** Escalate to CAO

### Critical Violations (Immediate Escalation)
- Using JS numbers for financial calculations
- Skipping auth/validation
- Shipping code with <50% coverage
- Using `any` in financial code

---

## Quick Reference

### Top 10 Rules (Memorize)

1. ✅ **Decimal.js for ALL money** (never JavaScript numbers)
2. ✅ **Pre-create constants** (don't recreate in loops)
3. ✅ **Explicit types** (never `any`)
4. ✅ **Validate inputs** (Zod on all API routes)
5. ✅ **Memoize React** (memo, useMemo, useCallback)
6. ✅ **Debounce inputs** (300ms for sliders)
7. ✅ **Server Components** (default, 'use client' only when needed)
8. ✅ **RBAC everywhere** (requireAuth on protected routes)
9. ✅ **Test coverage** (>80% minimum)
10. ✅ **Document complex logic** (comments + JSDoc)

---

## Agent-Specific Focus

### Financial Architect
**Critical:** Section 3 (Financial Calculations), 100% test coverage
**Zero tolerance:** JS numbers for money, skipping constant pre-creation

### Backend Engineer
**Critical:** Section 5.2 (API), Section 9 (Security), Section 10 (Errors)
**Zero tolerance:** No validation, no RBAC, raw SQL

### Frontend Engineer
**Critical:** Section 4 (Performance), Section 5 (React/Next.js)
**Zero tolerance:** No memoization, 'use client' everywhere, no debouncing

### Database Architect
**Critical:** Section 6 (Database/Prisma)
**Zero tolerance:** No indexes, Int for IDs, fetching all fields

### QA Engineer
**Critical:** Section 8 (Testing)
**Zero tolerance:** <80% coverage, approving violations

### UI/UX Designer
**Relevant:** Section 11 (Organization), accessibility standards
**Collaboration:** Ensure designs follow standards

### Project Manager
**Critical:** ALL sections (enforces compliance)
**Zero tolerance:** Approving violations, skipping reviews

---

## Resources

1. **Primary:** [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Read this first
2. **Enforcement:** [CODING_STANDARDS_ENFORCEMENT.md](../CODING_STANDARDS_ENFORCEMENT.md)
3. **Help:** Ask PM in Slack (response <4 hours)
4. **Examples:** Reference implementations (when available)

---

## Acknowledgment Required

By proceeding with your work, you acknowledge:

> "I have read CODING_STANDARDS.md completely. I understand all standards apply to my work. I will ask for clarification rather than guess. I understand violations will result in pull request rejection."

---

## Final Reminder

**CODING_STANDARDS.md is your technical Bible for this project.**

**Read it. Follow it. Reference it. Master it.**

**Your success depends on it. The project's success depends on it.**

---

**🚨 PROCEED TO YOUR AGENT-SPECIFIC INSTRUCTIONS BELOW 🚨**

---
