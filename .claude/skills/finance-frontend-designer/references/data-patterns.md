# Data Patterns

TypeScript interfaces, utilities, and data handling patterns for finance applications. Clean types, robust transformations, and multi-currency support.

## Philosophy

- **Type everything**: No `any`, no guessing
- **Immutable by default**: Transform, don't mutate
- **Fail gracefully**: Handle missing data elegantly
- **Currency-aware**: Money has context, treat it as such

---

## Core Financial Types

```tsx
// Base monetary value with currency context
interface Money {
  amount: number;
  currency: CurrencyCode;
}

type CurrencyCode = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';

// Period identifiers
type PeriodType = 'month' | 'quarter' | 'year';

interface Period {
  type: PeriodType;
  year: number;
  index?: number; // 1-12 for months, 1-4 for quarters
}

// Financial statement line item
interface LineItem {
  id: string;
  code: string;
  label: string;
  type: 'debit' | 'credit' | 'calculated';
  level: number;
  parentId?: string;
  values: PeriodValue[];
}

interface PeriodValue {
  period: Period;
  actual?: Money;
  budget?: Money;
  forecast?: Money;
  priorYear?: Money;
}
```

---

## Variance & Comparison Types

```tsx
interface Variance {
  absolute: Money;
  percentage: number;
  status: 'favorable' | 'unfavorable' | 'neutral';
  significance: 'material' | 'immaterial';
}

// Threshold for materiality (configurable)
const MATERIALITY_THRESHOLD = 0.05; // 5%

const calculateVariance = (
  actual: Money,
  compareTo: Money,
  favorableDirection: 'higher' | 'lower' = 'higher'
): Variance => {
  const diff = actual.amount - compareTo.amount;
  const pct = compareTo.amount !== 0
    ? (diff / Math.abs(compareTo.amount)) * 100
    : 0;

  const isFavorable = favorableDirection === 'higher' ? diff > 0 : diff < 0;

  return {
    absolute: { amount: diff, currency: actual.currency },
    percentage: pct,
    status: Math.abs(pct) < 0.1 ? 'neutral' : isFavorable ? 'favorable' : 'unfavorable',
    significance: Math.abs(pct) >= MATERIALITY_THRESHOLD * 100 ? 'material' : 'immaterial',
  };
};
```

---

## Multi-Currency Utilities

```tsx
interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  asOf: Date;
}

class CurrencyConverter {
  private rates: Map<string, ExchangeRate> = new Map();

  constructor(rates: ExchangeRate[]) {
    rates.forEach(r => {
      this.rates.set(`${r.from}-${r.to}`, r);
      // Also store inverse
      this.rates.set(`${r.to}-${r.from}`, {
        ...r,
        from: r.to,
        to: r.from,
        rate: 1 / r.rate,
      });
    });
  }

  convert(money: Money, to: CurrencyCode): Money {
    if (money.currency === to) return money;

    const key = `${money.currency}-${to}`;
    const rate = this.rates.get(key);

    if (!rate) {
      throw new Error(`No exchange rate found for ${key}`);
    }

    return {
      amount: money.amount * rate.rate,
      currency: to,
    };
  }

  // Convert array of values to single currency
  normalize(values: Money[], to: CurrencyCode): Money[] {
    return values.map(v => this.convert(v, to));
  }
}

// Usage
const converter = new CurrencyConverter([
  { from: 'USD', to: 'SAR', rate: 3.75, asOf: new Date() },
  { from: 'EUR', to: 'SAR', rate: 4.10, asOf: new Date() },
]);
```

---

## Formatting Utilities

```tsx
interface FormatOptions {
  notation?: 'standard' | 'compact' | 'scientific';
  showSign?: boolean;
  showCurrency?: boolean;
  decimals?: number;
  locale?: string;
}

const formatMoney = (
  money: Money,
  options: FormatOptions = {}
): string => {
  const {
    notation = 'standard',
    showSign = false,
    showCurrency = true,
    decimals = notation === 'compact' ? 1 : 0,
    locale = 'en-US',
  } = options;

  return new Intl.NumberFormat(locale, {
    style: showCurrency ? 'currency' : 'decimal',
    currency: money.currency,
    notation,
    maximumFractionDigits: decimals,
    minimumFractionDigits: notation === 'standard' ? decimals : 0,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(money.amount);
};

// Shorthand formatters
const formatCompact = (value: number, currency: CurrencyCode = 'SAR'): string =>
  formatMoney({ amount: value, currency }, { notation: 'compact' });

const formatFull = (value: number, currency: CurrencyCode = 'SAR'): string =>
  formatMoney({ amount: value, currency }, { notation: 'standard' });

const formatDelta = (value: number, currency: CurrencyCode = 'SAR'): string =>
  formatMoney({ amount: value, currency }, { notation: 'compact', showSign: true });

// Percentage formatting
const formatPercentage = (
  value: number,
  options: { decimals?: number; showSign?: boolean } = {}
): string => {
  const { decimals = 1, showSign = false } = options;
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};
```

---

## Period Utilities

```tsx
// Period comparison and navigation
const periodToString = (period: Period): string => {
  if (period.type === 'year') return period.year.toString();
  if (period.type === 'quarter') return `Q${period.index} ${period.year}`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[(period.index || 1) - 1]} ${period.year}`;
};

const periodToKey = (period: Period): string => {
  if (period.type === 'year') return `${period.year}`;
  if (period.type === 'quarter') return `${period.year}-Q${period.index}`;
  return `${period.year}-${String(period.index).padStart(2, '0')}`;
};

const comparePeriods = (a: Period, b: Period): number => {
  if (a.year !== b.year) return a.year - b.year;
  return (a.index || 0) - (b.index || 0);
};

const getPriorPeriod = (period: Period): Period => {
  if (period.type === 'year') {
    return { type: 'year', year: period.year - 1 };
  }

  if (period.type === 'quarter') {
    const newIndex = (period.index || 1) - 1;
    if (newIndex < 1) {
      return { type: 'quarter', year: period.year - 1, index: 4 };
    }
    return { type: 'quarter', year: period.year, index: newIndex };
  }

  const newIndex = (period.index || 1) - 1;
  if (newIndex < 1) {
    return { type: 'month', year: period.year - 1, index: 12 };
  }
  return { type: 'month', year: period.year, index: newIndex };
};

// Generate range of periods
const generatePeriodRange = (
  start: Period,
  end: Period
): Period[] => {
  const periods: Period[] = [];
  let current = { ...start };

  while (comparePeriods(current, end) <= 0) {
    periods.push({ ...current });
    current = getNextPeriod(current);
  }

  return periods;
};

const getNextPeriod = (period: Period): Period => {
  if (period.type === 'year') {
    return { type: 'year', year: period.year + 1 };
  }

  const maxIndex = period.type === 'quarter' ? 4 : 12;
  const newIndex = (period.index || 1) + 1;

  if (newIndex > maxIndex) {
    return { type: period.type, year: period.year + 1, index: 1 };
  }
  return { type: period.type, year: period.year, index: newIndex };
};
```

---

## Data Aggregation

```tsx
// Aggregate line items by period
const aggregateByPeriod = (
  items: LineItem[],
  aggregation: 'sum' | 'average' | 'latest'
): Map<string, Money> => {
  const grouped = new Map<string, Money[]>();

  items.forEach(item => {
    item.values.forEach(pv => {
      if (!pv.actual) return;
      const key = periodToKey(pv.period);
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, pv.actual]);
    });
  });

  const result = new Map<string, Money>();

  grouped.forEach((values, key) => {
    const currency = values[0].currency;
    let amount: number;

    switch (aggregation) {
      case 'sum':
        amount = values.reduce((sum, v) => sum + v.amount, 0);
        break;
      case 'average':
        amount = values.reduce((sum, v) => sum + v.amount, 0) / values.length;
        break;
      case 'latest':
        amount = values[values.length - 1].amount;
        break;
    }

    result.set(key, { amount, currency });
  });

  return result;
};

// Roll up child items to parent
const rollUpHierarchy = (items: LineItem[]): LineItem[] => {
  const itemMap = new Map(items.map(i => [i.id, { ...i }]));

  // Sort by level descending (process children first)
  const sorted = [...items].sort((a, b) => b.level - a.level);

  sorted.forEach(item => {
    if (!item.parentId) return;

    const parent = itemMap.get(item.parentId);
    if (!parent) return;

    // Add child values to parent
    item.values.forEach((pv, index) => {
      if (!pv.actual) return;

      const parentPv = parent.values[index];
      if (parentPv?.actual) {
        parentPv.actual.amount += pv.actual.amount;
      }
    });
  });

  return Array.from(itemMap.values());
};
```

---

## Transformation Pipelines

```tsx
// Composable data transformations
type Transform<T> = (data: T) => T;

const pipe = <T>(...transforms: Transform<T>[]): Transform<T> => {
  return (data: T) => transforms.reduce((acc, fn) => fn(acc), data);
};

// Common transforms for financial data
const filterByPeriod = (start: Period, end: Period): Transform<LineItem[]> => {
  return (items) => items.map(item => ({
    ...item,
    values: item.values.filter(pv =>
      comparePeriods(pv.period, start) >= 0 &&
      comparePeriods(pv.period, end) <= 0
    ),
  }));
};

const convertCurrency = (
  converter: CurrencyConverter,
  to: CurrencyCode
): Transform<LineItem[]> => {
  return (items) => items.map(item => ({
    ...item,
    values: item.values.map(pv => ({
      ...pv,
      actual: pv.actual ? converter.convert(pv.actual, to) : undefined,
      budget: pv.budget ? converter.convert(pv.budget, to) : undefined,
      forecast: pv.forecast ? converter.convert(pv.forecast, to) : undefined,
    })),
  }));
};

const addVariances = (): Transform<LineItem[]> => {
  return (items) => items.map(item => ({
    ...item,
    values: item.values.map(pv => ({
      ...pv,
      varianceToBudget: pv.actual && pv.budget
        ? calculateVariance(pv.actual, pv.budget, item.type === 'credit' ? 'higher' : 'lower')
        : undefined,
    })),
  }));
};

// Usage: Compose transformations
const prepareData = pipe(
  filterByPeriod({ type: 'year', year: 2024 }, { type: 'year', year: 2024 }),
  convertCurrency(converter, 'SAR'),
  addVariances()
);

const processedData = prepareData(rawData);
```

---

## State Management Types

```tsx
// For Zustand or similar
interface FinanceStore {
  // Filters
  filters: {
    period: Period;
    entities: string[];
    currency: CurrencyCode;
    scenario: string;
  };

  // Data
  data: {
    lineItems: LineItem[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };

  // Derived (computed with selectors)
  // Don't store derived data, compute it

  // Actions
  setFilter: <K extends keyof FinanceStore['filters']>(
    key: K,
    value: FinanceStore['filters'][K]
  ) => void;
  fetchData: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Selector pattern for derived data
const selectTotalRevenue = (state: FinanceStore): Money | null => {
  const revenueItems = state.data.lineItems.filter(i => i.code.startsWith('REV'));
  if (revenueItems.length === 0) return null;

  const total = revenueItems.reduce((sum, item) => {
    const current = item.values.find(v =>
      periodToKey(v.period) === periodToKey(state.filters.period)
    );
    return sum + (current?.actual?.amount || 0);
  }, 0);

  return { amount: total, currency: state.filters.currency };
};
```

---

## API Response Types

```tsx
// Standardized API response shapes
interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Financial data API shapes
interface FinancialDataRequest {
  entities: string[];
  periods: Period[];
  accounts?: string[];
  currency?: CurrencyCode;
  includeVariances?: boolean;
}

interface FinancialDataResponse {
  lineItems: LineItem[];
  exchangeRates: ExchangeRate[];
  metadata: {
    generatedAt: string;
    baseCurrency: CurrencyCode;
    periodsCovered: Period[];
  };
}
```

---

## Validation Utilities

```tsx
// Runtime validation for financial data
const validateMoney = (value: unknown): value is Money => {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.amount === 'number' &&
    !isNaN(obj.amount) &&
    typeof obj.currency === 'string' &&
    ['SAR', 'USD', 'EUR', 'GBP', 'AED'].includes(obj.currency)
  );
};

const sanitizeMoney = (value: unknown, fallback: Money): Money => {
  if (validateMoney(value)) return value;
  return fallback;
};

// Ensure numeric values are safe
const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed) && isFinite(parsed)) return parsed;
  }
  return fallback;
};

// Percentage bounds
const clampPercentage = (value: number, min = -100, max = 1000): number => {
  return Math.max(min, Math.min(max, value));
};
```

---

## Quick Reference

```tsx
// Import all utilities
import {
  // Types
  type Money,
  type Period,
  type LineItem,
  type Variance,

  // Currency
  CurrencyConverter,

  // Formatting
  formatMoney,
  formatCompact,
  formatFull,
  formatDelta,
  formatPercentage,

  // Periods
  periodToString,
  periodToKey,
  comparePeriods,
  getPriorPeriod,
  generatePeriodRange,

  // Data
  calculateVariance,
  aggregateByPeriod,
  rollUpHierarchy,

  // Transforms
  pipe,
  filterByPeriod,
  convertCurrency,
  addVariances,

  // Validation
  validateMoney,
  sanitizeMoney,
  safeNumber,
} from '@/lib/finance';
```
