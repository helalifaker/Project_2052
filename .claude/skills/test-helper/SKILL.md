---
name: test-helper
description: Helps run, debug, and write tests for the financial engine and application. Use when running tests, debugging test failures, or creating new test cases for calculations.
---

# Test Helper Skill

## Instructions

When working with tests in this project:

1. **Running Tests**
   - Unit tests: `pnpm test:run` (Vitest)
   - Watch mode: `pnpm test`
   - Coverage: `pnpm test:coverage`
   - E2E tests: `pnpm test:e2e` (requires dev server running)

2. **Test File Locations**
   - Unit tests: Colocated with source files (`*.test.ts`)
   - E2E tests: `tests/e2e/`
   - Security tests: `tests/security/`

3. **Financial Engine Tests**
   - Located in `src/lib/engine/`
   - Target 100% coverage for engine code
   - Use golden models in `validation/golden-models/` for regression testing

4. **Writing New Tests**
   - Always use Decimal.js for financial assertions
   - Compare Decimals with `.equals()` or `.toNumber()` for approximate comparisons
   - Include edge cases for all three rent models
   - Test all three periods (historical, transition, dynamic)

5. **Debugging Failures**
   - Check for floating-point precision issues (use Decimal.js)
   - Verify test data matches expected period calculations
   - Review golden model files for expected outputs

## Common Test Patterns

```typescript
import Decimal from 'decimal.js';
import { describe, it, expect } from 'vitest';

describe('Financial Calculation', () => {
  it('should calculate rent correctly', () => {
    const result = calculateRent(input);
    expect(result.rent.equals(new Decimal('1000000'))).toBe(true);
  });
});
```

## Examples

- "Run the financial engine tests"
- "Debug why this test is failing"
- "Write tests for the new rent calculation"
