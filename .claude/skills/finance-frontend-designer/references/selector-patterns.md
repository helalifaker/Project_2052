# Selector Patterns

Selectors are the navigation layer of finance apps. Period pickers, entity filters, currency toggles — they're everywhere, and they're usually ugly. These patterns make them feel intentional.

## Philosophy

- **Compact but not cramped**: Every pixel earns its place
- **State is obvious**: Active selections are unmistakable
- **Keyboard-first**: Power users navigate without a mouse
- **Transitions matter**: State changes feel smooth, not jarring

---

## Period Selector

The most common control. Make it elegant:

```tsx
type Period = 'MTD' | 'QTD' | 'YTD' | 'TTM' | 'ALL';

const PeriodSelector = ({ value, onChange }: {
  value: Period;
  onChange: (p: Period) => void;
}) => {
  const periods: Period[] = ['MTD', 'QTD', 'YTD', 'TTM', 'ALL'];

  return (
    <div className="inline-flex items-center p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`
            relative px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-200
            ${value === period
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          {value === period && (
            <span
              className="absolute inset-0 bg-[var(--bg-card)] rounded-md shadow-sm"
              style={{
                animation: 'fadeSlide 150ms ease-out',
              }}
            />
          )}
          <span className="relative">{period}</span>
        </button>
      ))}
    </div>
  );
};

// Animation keyframes (add to globals.css)
// @keyframes fadeSlide {
//   from { opacity: 0; transform: scale(0.95); }
//   to { opacity: 1; transform: scale(1); }
// }
```

---

## Year/Month Picker

For drilling into specific periods:

```tsx
const YearMonthPicker = ({
  year,
  month,
  onChange
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="flex items-center gap-4">
      {/* Year stepper */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(year - 1, month)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="w-16 text-center text-sm font-medium tabular-nums text-[var(--text-primary)]">
          {year}
        </span>

        <button
          onClick={() => onChange(year + 1, month)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-0.5 p-1 bg-[var(--bg-elevated)] rounded-lg">
        {months.map((m, i) => (
          <button
            key={m}
            onClick={() => onChange(year, i)}
            className={`
              px-2 py-1.5 text-[10px] font-medium rounded-md transition-all duration-150
              ${month === i
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## Entity Selector

For multi-entity/subsidiary selection:

```tsx
interface Entity {
  id: string;
  name: string;
  code: string;
  type: 'parent' | 'subsidiary';
}

const EntitySelector = ({
  entities,
  selected,
  onChange,
}: {
  entities: Entity[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const selectedEntities = entities.filter(e => selected.includes(e.id));
  const displayText = selected.length === 0
    ? 'All Entities'
    : selected.length === 1
      ? selectedEntities[0].name
      : `${selected.length} Entities`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)]
                   rounded-xl hover:border-[var(--accent)] transition-colors min-w-[200px]"
      >
        <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="flex-1 text-left text-sm text-[var(--text-primary)]">
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 left-0 w-72 bg-[var(--bg-card)] border border-[var(--border)]
                          rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
            {/* Quick actions */}
            <div className="p-2 border-b border-[var(--border)] flex gap-2">
              <button
                onClick={() => onChange(entities.map(e => e.id))}
                className="flex-1 px-3 py-1.5 text-xs text-[var(--text-secondary)]
                           hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg"
              >
                Select All
              </button>
              <button
                onClick={() => onChange([])}
                className="flex-1 px-3 py-1.5 text-xs text-[var(--text-secondary)]
                           hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg"
              >
                Clear
              </button>
            </div>

            {/* Entity list */}
            <div className="max-h-64 overflow-y-auto p-2">
              {entities.map((entity) => {
                const isSelected = selected.includes(entity.id);
                return (
                  <button
                    key={entity.id}
                    onClick={() => {
                      onChange(
                        isSelected
                          ? selected.filter(id => id !== entity.id)
                          : [...selected, entity.id]
                      );
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isSelected
                        ? 'bg-[var(--accent-subtle)]'
                        : 'hover:bg-[var(--bg-elevated)]'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                      ${isSelected
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'border-[var(--border)]'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm text-[var(--text-primary)]">{entity.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{entity.code}</p>
                    </div>

                    {entity.type === 'parent' && (
                      <span className="px-2 py-0.5 text-[10px] bg-[var(--accent-subtle)]
                                       text-[var(--accent)] rounded-full">
                        Parent
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## Currency Toggle

Simple but essential for multi-currency views:

```tsx
type Currency = 'SAR' | 'USD' | 'EUR';

const CurrencyToggle = ({
  value,
  onChange,
  rates,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  rates?: Record<Currency, number>;
}) => {
  const currencies: { code: Currency; symbol: string }[] = [
    { code: 'SAR', symbol: '﷼' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[var(--bg-elevated)] rounded-lg">
      {currencies.map((currency) => (
        <button
          key={currency.code}
          onClick={() => onChange(currency.code)}
          className={`
            group relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150
            ${value === currency.code
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          <span className="mr-1.5">{currency.symbol}</span>
          <span>{currency.code}</span>

          {/* Rate tooltip on hover */}
          {rates && value !== currency.code && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1
                             bg-[var(--bg-card)] border border-[var(--border)] rounded-md
                             text-xs text-[var(--text-secondary)] whitespace-nowrap
                             opacity-0 group-hover:opacity-100 transition-opacity">
              1 {value} = {rates[currency.code].toFixed(4)} {currency.code}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
```

---

## Scenario Selector

For comparing forecasts, budgets, actuals:

```tsx
interface Scenario {
  id: string;
  name: string;
  type: 'actual' | 'budget' | 'forecast' | 'custom';
  color: string;
}

const ScenarioSelector = ({
  scenarios,
  selected,
  onChange,
  maxSelections = 3,
}: {
  scenarios: Scenario[];
  selected: string[];
  onChange: (ids: string[]) => void;
  maxSelections?: number;
}) => {
  const typeIcons = {
    actual: '●',
    budget: '◐',
    forecast: '○',
    custom: '◇',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {scenarios.map((scenario) => {
        const isSelected = selected.includes(scenario.id);
        const isDisabled = !isSelected && selected.length >= maxSelections;

        return (
          <button
            key={scenario.id}
            disabled={isDisabled}
            onClick={() => {
              onChange(
                isSelected
                  ? selected.filter(id => id !== scenario.id)
                  : [...selected, scenario.id]
              );
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
              ${isSelected
                ? 'border-transparent shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
            style={{
              backgroundColor: isSelected ? `${scenario.color}15` : 'transparent',
              borderColor: isSelected ? scenario.color : undefined,
            }}
          >
            <span
              className="text-sm"
              style={{ color: isSelected ? scenario.color : 'var(--text-secondary)' }}
            >
              {typeIcons[scenario.type]}
            </span>
            <span className={`text-sm font-medium ${isSelected ? '' : 'text-[var(--text-secondary)]'}`}>
              {scenario.name}
            </span>
            {isSelected && (
              <X className="w-3 h-3 text-[var(--text-secondary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
```

---

## Date Range Picker

For custom date ranges:

```tsx
const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  presets,
}: {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  presets?: { label: string; getValue: () => [Date, Date] }[];
}) => {
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const defaultPresets = [
    { label: 'Last 7 days', getValue: () => [subDays(new Date(), 7), new Date()] as [Date, Date] },
    { label: 'Last 30 days', getValue: () => [subDays(new Date(), 30), new Date()] as [Date, Date] },
    { label: 'This Quarter', getValue: () => [startOfQuarter(new Date()), new Date()] as [Date, Date] },
    { label: 'This Year', getValue: () => [startOfYear(new Date()), new Date()] as [Date, Date] },
  ];

  const allPresets = presets || defaultPresets;

  return (
    <div className="flex items-center gap-3">
      {/* Presets */}
      <div className="flex items-center gap-1">
        {allPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const [start, end] = preset.getValue();
              onChange(start, end);
            }}
            className="px-3 py-1.5 text-xs text-[var(--text-secondary)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]
                       rounded-lg transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[var(--border)]" />

      {/* Custom range display */}
      <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]
                         border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
        <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-sm tabular-nums text-[var(--text-primary)]">
          {formatDate(startDate)}
        </span>
        <span className="text-[var(--text-secondary)]">→</span>
        <span className="text-sm tabular-nums text-[var(--text-primary)]">
          {formatDate(endDate)}
        </span>
      </button>
    </div>
  );
};
```

---

## Scope Selector (Company-wide patterns)

For filtering by department, cost center, project:

```tsx
const ScopeSelector = ({
  scopes,
  value,
  onChange,
  placeholder = 'All Scopes',
}: {
  scopes: { id: string; name: string; count?: number }[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative inline-block">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-card)] border border-[var(--border)]
                   rounded-xl text-sm text-[var(--text-primary)] cursor-pointer
                   hover:border-[var(--accent)] focus:outline-none focus:border-[var(--accent)]
                   transition-colors"
      >
        <option value="">{placeholder}</option>
        {scopes.map((scope) => (
          <option key={scope.id} value={scope.id}>
            {scope.name} {scope.count !== undefined && `(${scope.count})`}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4
                              text-[var(--text-secondary)] pointer-events-none" />
    </div>
  );
};
```

---

## Combined Filter Bar

Putting it all together in a cohesive toolbar:

```tsx
const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)]
                    rounded-2xl border border-[var(--border)]">
      <div className="flex items-center gap-4">
        <PeriodSelector
          value={filters.period}
          onChange={(p) => onFilterChange({ ...filters, period: p })}
        />

        <div className="w-px h-8 bg-[var(--border)]" />

        <EntitySelector
          entities={filters.entities}
          selected={filters.selectedEntities}
          onChange={(ids) => onFilterChange({ ...filters, selectedEntities: ids })}
        />

        <ScopeSelector
          scopes={filters.scopes}
          value={filters.selectedScope}
          onChange={(id) => onFilterChange({ ...filters, selectedScope: id })}
        />
      </div>

      <div className="flex items-center gap-3">
        <CurrencyToggle
          value={filters.currency}
          onChange={(c) => onFilterChange({ ...filters, currency: c })}
        />

        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:bg-[var(--bg-card)] rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

---

## Keyboard Navigation

Add keyboard support for power users:

```tsx
const useKeyboardNavigation = (
  items: string[],
  selected: string,
  onSelect: (item: string) => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.indexOf(selected);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[(currentIndex + 1) % items.length];
        onSelect(next);
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[(currentIndex - 1 + items.length) % items.length];
        onSelect(prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selected, onSelect]);
};
```
