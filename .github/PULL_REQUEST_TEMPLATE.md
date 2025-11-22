# Pull Request: [Title]

## Description
<!-- Briefly describe what this PR does and why -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Documentation update

## Related Issues
<!-- Link to related issues: Fixes #123, Related to #456 -->

---

## 🚨 CODING STANDARDS COMPLIANCE (MANDATORY) 🚨

**I confirm I have read and followed [CODING_STANDARDS.md](../CODING_STANDARDS.md)**

### Financial Precision ✅
- [ ] All financial calculations use `Decimal.js` (NO JavaScript numbers)
- [ ] Decimal constants are pre-created (not recreated in loops)
- [ ] Decimal comparisons use methods (`.greaterThan()`, not `>`)
- [ ] Division by zero is handled explicitly

### Type Safety ✅
- [ ] All functions have explicit return types
- [ ] All parameters have explicit types
- [ ] No `any` type used anywhere
- [ ] Zod schemas used for runtime validation
- [ ] Type guards used where necessary

### Performance ✅
- [ ] Heavy calculations use Web Workers
- [ ] Expensive React operations are memoized (`useMemo`, `memo`, `useCallback`)
- [ ] Interactive inputs are debounced (300ms for sliders)
- [ ] Calculation results are cached where appropriate

### React & Next.js ✅
- [ ] Server Components by default ('use client' only when needed)
- [ ] Forms use React Hook Form + Zod validation
- [ ] No unnecessary re-renders (checked with React DevTools)
- [ ] Proper error boundaries implemented

### API & Security ✅
- [ ] All API inputs validated with Zod
- [ ] RBAC enforced with `requireAuth([Role.X, Role.Y])`
- [ ] Proper HTTP status codes (201 for create, 404 for not found, etc.)
- [ ] Consistent error response format
- [ ] No raw SQL (Prisma only, or parameterized queries)

### Database ✅
- [ ] Only necessary fields selected (not `findMany()` without select)
- [ ] Transactions used for multi-table operations
- [ ] Decimal fields converted properly (Prisma.Decimal ↔ Decimal.js)
- [ ] Indexes added for foreign keys and frequently queried fields

### Error Handling ✅
- [ ] Try-catch blocks around all async operations
- [ ] Custom error classes used (NotFoundError, ValidationError, etc.)
- [ ] Errors logged with context
- [ ] User-friendly error messages

### Testing ✅
- [ ] Unit tests added for new functionality
- [ ] Integration tests for API endpoints
- [ ] Test coverage >80% (100% for financial calculations)
- [ ] All tests pass locally (`pnpm test`)
- [ ] No flaky tests

### Code Quality ✅
- [ ] No mutations (immutable patterns used)
- [ ] No magic numbers (constants defined)
- [ ] Complex logic has comments/JSDoc
- [ ] Follows directory structure from Section 11.1
- [ ] Imports ordered correctly (external → internal → relative)

### Build & Lint ✅
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm type-check` passes (TypeScript strict mode)
- [ ] `pnpm build` succeeds
- [ ] `pnpm format` applied (Prettier)

---

## Testing

### Test Coverage
- **Current coverage:** ____%
- **New code coverage:** ____%
- **Overall coverage:** ____% (target: >80%)

### Tests Added/Updated
<!-- List test files added or modified -->
- `tests/...`

### How to Test
<!-- Steps for reviewer to test this PR -->
1.
2.
3.

---

## Performance Impact

### Performance Benchmarks
- [ ] No performance impact
- [ ] Performance improved (describe below)
- [ ] Performance tested for regressions

**If applicable:**
- Calculation time: ___ms (target: <1000ms for 30-year)
- UI response time: ___ms (target: <200ms)
- Database query time: ___ms (target: <100ms)

---

## Breaking Changes
<!-- List any breaking changes and migration steps -->
- [ ] No breaking changes
- [ ] Breaking changes (describe below)

**If breaking changes:**
- What breaks:
- Migration steps:

---

## Screenshots/Videos
<!-- If UI changes, include screenshots or GIFs -->

**Before:**


**After:**


---

## Reviewer Checklist (For PM/Reviewers)

### Code Review
- [ ] Code follows CODING_STANDARDS.md
- [ ] No critical violations (JS numbers, no auth, no validation)
- [ ] Logic is clear and maintainable
- [ ] No obvious bugs or security issues

### Testing Review
- [ ] Tests are comprehensive
- [ ] Tests actually test the right things
- [ ] Coverage meets requirements
- [ ] No test-only fixes (code should be testable)

### Documentation Review
- [ ] Complex logic has comments
- [ ] Public APIs have JSDoc
- [ ] README updated if needed
- [ ] Migration guide if breaking changes

### Final Approval
- [ ] Approved for merge
- [ ] Request changes
- [ ] Needs discussion

---

## Additional Notes
<!-- Any other context, decisions made, trade-offs, future improvements, etc. -->

---

## Deployment Notes
<!-- Anything special needed for deployment? Database migrations? Config changes? -->
- [ ] No special deployment steps
- [ ] Database migration required (run `prisma migrate deploy`)
- [ ] Environment variables added/changed
- [ ] Other:

---

**Agent:** [Your Agent ID, e.g., be-001]
**Date:** [YYYY-MM-DD]
**Estimated Effort:** [Story points or hours]

---

## Acknowledgment

By submitting this PR, I acknowledge:
- ✅ I have read CODING_STANDARDS.md completely
- ✅ All standards apply to this code
- ✅ I have tested this code thoroughly
- ✅ I understand violations will result in PR rejection
- ✅ I am available to address review feedback promptly

**Signature:** ________________

---

**Ready for review? Tag @pm-001**
