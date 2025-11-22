# Coding Standards - Quick Start Guide
## Project_2052

**🚨 READ THIS FIRST 🚨**

---

## For All Agents

### Step 1: Read the Standards (30-45 minutes)

📖 **[CODING_STANDARDS.md](CODING_STANDARDS.md)** - Your complete technical reference

**What's inside:**
- 12 comprehensive sections
- 100+ code examples (DO ✅ and DON'T ❌)
- Specific to our stack (Next.js 16, React 19, TypeScript 5.7, Prisma, Decimal.js)
- Tailored to financial applications

**You must read this completely before writing ANY code.**

---

### Step 2: Understand the Enforcement (10 minutes)

📋 **[CODING_STANDARDS_ENFORCEMENT.md](CODING_STANDARDS_ENFORCEMENT.md)**

**What's inside:**
- Why standards matter (financial accuracy, security, performance)
- 6 layers of enforcement
- Violation consequences (3-strike system)
- Agent-specific requirements
- Weekly audits and phase gate certification

---

### Step 3: Check Your Role-Specific Requirements (5 minutes)

🎯 **Agent-Specific Sections:**

**Financial Architect (fa-001):**
- **Critical:** Section 3 (Financial Calculations)
- **Zero Tolerance:** JavaScript numbers for money, no Decimal constants
- **Test Coverage:** 100% for financial code

**Backend Engineer (be-001):**
- **Critical:** Section 5.2 (API), Section 9 (Security)
- **Zero Tolerance:** No validation, no RBAC, raw SQL
- **Test Coverage:** 90% for API routes

**Frontend Engineer (fe-001):**
- **Critical:** Section 4 (Performance), Section 5 (React/Next.js)
- **Zero Tolerance:** 'use client' everywhere, no memoization
- **Test Coverage:** 80% for components

**Database Architect (da-001):**
- **Critical:** Section 6 (Database/Prisma)
- **Zero Tolerance:** Int IDs, no indexes, fetch all fields
- **Review:** Every schema change

**QA Engineer (qa-001):**
- **Critical:** Section 8 (Testing), All sections for validation
- **Zero Tolerance:** Approving code <80% coverage
- **Review:** Every PR + all phase gates

**UI/UX Designer (ux-001):**
- **Relevant:** Section 11 (Organization), Accessibility
- **Collaboration:** Ensure designs meet standards
- **Review:** Design handoffs + weekly reviews

**Project Manager (pm-001):**
- **Critical:** ALL sections (enforces compliance)
- **Zero Tolerance:** Approving violations
- **Review:** Every PR, every handoff, every gate

---

## Top 10 Rules (Memorize These)

1. ✅ **Decimal.js for ALL money calculations** - Never use JavaScript numbers
2. ✅ **Pre-create Decimal constants** - Don't recreate in loops (performance killer)
3. ✅ **Explicit TypeScript types** - Never use `any` type
4. ✅ **Validate all API inputs** - Use Zod on every API route
5. ✅ **Memoize React computations** - Use memo, useMemo, useCallback
6. ✅ **Debounce interactive inputs** - 300ms for sliders and search
7. ✅ **Server Components by default** - 'use client' only when absolutely needed
8. ✅ **RBAC on all protected routes** - requireAuth([Role.ADMIN, Role.PLANNER])
9. ✅ **>80% test coverage minimum** - Financial code needs 100%
10. ✅ **Document complex logic** - JSDoc + inline comments

---

## Critical "Never Do" List

❌ **NEVER use JavaScript numbers for financial calculations**
```typescript
// ❌ WRONG - Will cause precision errors
const rent = revenue * 0.08;

// ✅ CORRECT - Use Decimal.js
const rent = revenue.times(0.08);
```

❌ **NEVER skip input validation on API routes**
```typescript
// ❌ WRONG - No validation
export async function POST(request: NextRequest) {
  const body = await request.json();
  await db.proposal.create({ data: body });
}

// ✅ CORRECT - Validate with Zod
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = ProposalSchema.parse(body);
  await db.proposal.create({ data: validated });
}
```

❌ **NEVER skip authentication/authorization**
```typescript
// ❌ WRONG - Anyone can delete
export async function DELETE(request: NextRequest) {
  await db.proposal.delete({ where: { id } });
}

// ✅ CORRECT - Check auth and role
export async function DELETE(request: NextRequest) {
  const user = await requireAuth(request, [Role.ADMIN]);
  await db.proposal.delete({ where: { id } });
}
```

❌ **NEVER use `any` type in TypeScript**
```typescript
// ❌ WRONG - Type safety lost
function calculate(data: any): any {
  return data.revenue - data.costs;
}

// ✅ CORRECT - Explicit types
function calculate(data: FinancialData): Decimal {
  return data.revenue.minus(data.costs);
}
```

❌ **NEVER skip memoization in React**
```typescript
// ❌ WRONG - Recalculates every render
function FinancialTable({ data }) {
  const formatted = data.map(row => formatMillions(row.revenue));
  return <Table data={formatted} />;
}

// ✅ CORRECT - Memoize expensive calculation
function FinancialTable({ data }) {
  const formatted = useMemo(
    () => data.map(row => formatMillions(row.revenue)),
    [data]
  );
  return <Table data={formatted} />;
}
```

---

## Enforcement Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Phase Gate Certification                          │
│ QA certifies compliance before advancing phases            │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Weekly Audits                                     │
│ PM runs compliance audit every Friday                      │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: CI/CD Pipeline                                    │
│ Automated gates: TypeScript, ESLint, Tests, Build         │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Code Review                                       │
│ Every PR reviewed against CODING_STANDARDS.md             │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-Commit Hooks                                  │
│ Lint, type-check, test before commit                      │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Documentation                                     │
│ CODING_STANDARDS.md - Your reference Bible                │
└─────────────────────────────────────────────────────────────┘
```

**Every layer catches violations. No code escapes without compliance.**

---

## Workflow

### Before Writing Code

1. ✅ Read CODING_STANDARDS.md relevant sections
2. ✅ Review examples for your use case
3. ✅ Set up ESLint in your IDE (real-time feedback)

### While Writing Code

1. ✅ Follow standards (reference frequently)
2. ✅ Write tests as you go (TDD recommended)
3. ✅ Run `pnpm lint` periodically
4. ✅ Ask PM if uncertain (never guess)

### Before Committing

1. ✅ Self-review against standards checklist
2. ✅ Run `pnpm lint` (must pass)
3. ✅ Run `pnpm type-check` (must pass)
4. ✅ Run `pnpm test` (must pass, >80% coverage)
5. ✅ Commit (pre-commit hooks will verify)

### Creating Pull Request

1. ✅ Title: Clear description of changes
2. ✅ Description: What changed and why
3. ✅ Checklist: Confirm standards compliance
4. ✅ Request review from PM
5. ✅ Address feedback promptly

---

## Getting Help

### Standards Questions

**If standards are unclear:**
1. Don't guess - ask PM
2. PM responds <4 hours
3. Clarification documented

**Slack:** @pm-001 "Standards question: [specific section]"

### Code Review Feedback

**If your PR is rejected:**
1. Read the feedback carefully
2. Review relevant CODING_STANDARDS.md section
3. Fix all violations
4. Resubmit for review
5. Learn from mistakes

### Technical Support

**Need help implementing standards:**
1. Ask for pair programming session
2. PM or peer agent helps you
3. Focus on learning, not just fixing

---

## Resources

### Primary Documents
- 📖 [CODING_STANDARDS.md](CODING_STANDARDS.md) - Complete reference
- 📋 [CODING_STANDARDS_ENFORCEMENT.md](CODING_STANDARDS_ENFORCEMENT.md) - Policy
- 🎯 [agents/MANDATORY_CODING_STANDARDS.md](agents/MANDATORY_CODING_STANDARDS.md) - Quick mandate
- 📊 [CODING_STANDARDS_SUMMARY.md](CODING_STANDARDS_SUMMARY.md) - Overview

### Tools
- **ESLint** - Real-time linting (set up in IDE)
- **TypeScript** - Type checking (strict mode enabled)
- **Prettier** - Code formatting (auto-format on save)
- **Vitest** - Testing framework
- **GitHub Actions** - CI/CD automation

### Examples
- Reference implementations (coming soon)
- Test examples in CODING_STANDARDS.md
- API examples in Section 5.2, 7.1

---

## Acknowledgment

**Before starting work, acknowledge:**

> "I have read CODING_STANDARDS.md. I understand all standards apply to my work. I will ask for clarification when uncertain. I understand violations result in PR rejection."

**Sign:** ________________ **Date:** ______

---

## Summary

### What You Need to Know

1. **CODING_STANDARDS.md is mandatory** - Not optional, not a guideline
2. **6 enforcement layers** - Pre-commit → Code Review → CI/CD → Audits → Phase Gates → Signatures
3. **Critical violations escalate immediately** - JS numbers, no auth, no validation = CAO notification
4. **When in doubt, ask PM** - Don't guess, don't skip, don't compromise

### What You Need to Do

1. **Read CODING_STANDARDS.md** (30-45 minutes) - Do this first
2. **Memorize Top 10 rules** (5 minutes)
3. **Set up ESLint in IDE** (10 minutes)
4. **Reference standards while coding** (ongoing)
5. **Ask questions when uncertain** (anytime)

---

## Final Words

**This project builds a financial planning tool for millions of SAR in decisions.**

**Your code quality directly impacts:**
- ✅ Financial accuracy (zero tolerance for errors)
- ✅ User trust (board members depend on this)
- ✅ Performance (ultra-fast <1s calculations)
- ✅ Security (protected financial data)
- ✅ Maintainability (clear, consistent code)

**Follow the standards. Build something excellent.**

---

**Questions? Ask pm-001**

**Ready? Read CODING_STANDARDS.md now.**

**Let's build! 🚀**
