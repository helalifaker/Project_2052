# Planning Patterns

Financial planning interfaces are notoriously complex: multi-year grids, scenario comparisons, DCF models, rolling forecasts. These patterns make them navigable and even beautiful.

## Philosophy

- **Structure creates clarity**: Clear visual hierarchy tames complexity
- **Edit-in-place**: Don't force modal dialogs for every input
- **Show the math**: Make calculations transparent, not black boxes
- **Confidence indicators**: Show where numbers come from (actual vs. derived)

---

## Multi-Year Planning Grid

The backbone of financial planning — make it scannable:

```tsx
interface PlanningRow {
  id: string;
  label: string;
  level: number; // 0 = header, 1 = category, 2 = line item
  type: 'header' | 'sum' | 'input' | 'calculated';
  values: Record<string, number>; // year -> value
}

const PlanningGrid = ({
  rows,
  years,
  onCellEdit,
  highlightVariance = false,
}: {
  rows: PlanningRow[];
  years: number[];
  onCellEdit?: (rowId: string, year: number, value: number) => void;
  highlightVariance?: boolean;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--bg-primary)] w-64 p-4 text-left">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Account
              </span>
            </th>
            {years.map((year) => (
              <th key={year} className="p-4 text-right min-w-[120px]">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                  {year}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={`
                border-t border-[var(--border)]
                ${row.type === 'header' ? 'bg-[var(--bg-elevated)]' : ''}
                ${row.type === 'sum' ? 'bg-[var(--bg-card)] font-medium' : ''}
              `}
            >
              {/* Row label with indentation */}
              <td
                className="sticky left-0 z-10 bg-inherit p-4"
                style={{ paddingLeft: `${16 + row.level * 24}px` }}
              >
                <span className={`
                  ${row.type === 'header' ? 'text-xs uppercase tracking-wider font-semibold' : 'text-sm'}
                  ${row.type === 'sum' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}
                `}>
                  {row.label}
                </span>
              </td>

              {/* Value cells */}
              {years.map((year, yearIndex) => {
                const value = row.values[year] || 0;
                const prevValue = yearIndex > 0 ? row.values[years[yearIndex - 1]] : null;
                const variance = prevValue ? ((value - prevValue) / prevValue) * 100 : null;

                return (
                  <td key={year} className="p-2 text-right">
                    {row.type === 'input' ? (
                      <EditableCell
                        value={value}
                        onChange={(v) => onCellEdit?.(row.id, year, v)}
                      />
                    ) : (
                      <div className="px-2 py-2">
                        <span className={`
                          text-sm tabular-nums
                          ${row.type === 'sum' ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}
                        `}>
                          {formatCompact(value)}
                        </span>

                        {/* Variance indicator */}
                        {highlightVariance && variance !== null && Math.abs(variance) > 0.1 && (
                          <span className={`
                            ml-2 text-[10px] tabular-nums
                            ${variance > 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}
                          `}>
                            {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Editable Cell Component

Inline editing that feels native:

```tsx
const EditableCell = ({
  value,
  onChange,
  format = 'currency',
}: {
  value: number;
  onChange: (value: number) => void;
  format?: 'currency' | 'percentage' | 'number';
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  const handleSubmit = () => {
    const parsed = parseFloat(draft.replace(/[^0-9.-]/g, ''));
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-full px-2 py-1.5 text-right text-sm tabular-nums bg-[var(--bg-primary)]
                   border border-[var(--accent)] rounded-md outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value.toString());
        setEditing(true);
      }}
      className="w-full px-2 py-1.5 text-right text-sm tabular-nums text-[var(--text-primary)]
                 hover:bg-[var(--accent-subtle)] rounded-md transition-colors cursor-text"
    >
      {format === 'currency' && formatCompact(value)}
      {format === 'percentage' && `${value.toFixed(1)}%`}
      {format === 'number' && value.toLocaleString()}
    </button>
  );
};
```

---

## Scenario Comparison View

Side-by-side scenario analysis:

```tsx
const ScenarioComparison = ({
  scenarios,
  baseScenarioId,
  metrics,
}: {
  scenarios: { id: string; name: string; values: Record<string, number> }[];
  baseScenarioId: string;
  metrics: { key: string; label: string; format: 'currency' | 'percentage' }[];
}) => {
  const baseScenario = scenarios.find(s => s.id === baseScenarioId);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="p-4 text-left w-48">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Metric
              </span>
            </th>
            {scenarios.map((scenario) => (
              <th key={scenario.id} className="p-4 text-right min-w-[160px]">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {scenario.name}
                  </span>
                  {scenario.id === baseScenarioId && (
                    <span className="text-[10px] text-[var(--accent)] uppercase tracking-wider">
                      Base
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key} className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)]">
              <td className="p-4">
                <span className="text-sm text-[var(--text-secondary)]">{metric.label}</span>
              </td>

              {scenarios.map((scenario) => {
                const value = scenario.values[metric.key];
                const baseValue = baseScenario?.values[metric.key];
                const delta = baseValue && scenario.id !== baseScenarioId
                  ? ((value - baseValue) / baseValue) * 100
                  : null;

                return (
                  <td key={scenario.id} className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm tabular-nums font-medium text-[var(--text-primary)]">
                        {metric.format === 'currency'
                          ? formatCompact(value)
                          : `${value.toFixed(1)}%`
                        }
                      </span>

                      {delta !== null && (
                        <span className={`
                          text-[10px] tabular-nums px-1.5 py-0.5 rounded-full
                          ${delta > 0
                            ? 'bg-[var(--positive)]/10 text-[var(--positive)]'
                            : delta < 0
                              ? 'bg-[var(--negative)]/10 text-[var(--negative)]'
                              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                          }
                        `}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## DCF Model Interface

Discounted Cash Flow with clear structure:

```tsx
const DCFModel = ({
  projectionYears,
  cashFlows,
  discountRate,
  terminalGrowth,
  onParameterChange,
}: {
  projectionYears: number[];
  cashFlows: Record<number, number>;
  discountRate: number;
  terminalGrowth: number;
  onParameterChange: (key: string, value: number) => void;
}) => {
  // Calculate derived values
  const discountedCashFlows = projectionYears.map((year, i) => ({
    year,
    cf: cashFlows[year],
    discountFactor: Math.pow(1 + discountRate / 100, i + 1),
    dcf: cashFlows[year] / Math.pow(1 + discountRate / 100, i + 1),
  }));

  const sumDCF = discountedCashFlows.reduce((sum, d) => sum + d.dcf, 0);
  const lastCF = cashFlows[projectionYears[projectionYears.length - 1]];
  const terminalValue = (lastCF * (1 + terminalGrowth / 100)) /
                        ((discountRate - terminalGrowth) / 100);
  const pvTerminal = terminalValue /
                     Math.pow(1 + discountRate / 100, projectionYears.length);
  const enterpriseValue = sumDCF + pvTerminal;

  return (
    <div className="space-y-8">
      {/* Key Assumptions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">
            Discount Rate (WACC)
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={discountRate}
              onChange={(e) => onParameterChange('discountRate', parseFloat(e.target.value))}
              className="w-24 text-3xl font-light tabular-nums bg-transparent
                         border-b-2 border-[var(--border)] focus:border-[var(--accent)]
                         outline-none text-[var(--text-primary)]"
              step="0.1"
            />
            <span className="text-xl text-[var(--text-secondary)]">%</span>
          </div>
        </div>

        <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">
            Terminal Growth Rate
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={terminalGrowth}
              onChange={(e) => onParameterChange('terminalGrowth', parseFloat(e.target.value))}
              className="w-24 text-3xl font-light tabular-nums bg-transparent
                         border-b-2 border-[var(--border)] focus:border-[var(--accent)]
                         outline-none text-[var(--text-primary)]"
              step="0.1"
            />
            <span className="text-xl text-[var(--text-secondary)]">%</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Projections */}
      <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-6">
          Cash Flow Projections
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <td className="pb-4 text-xs text-[var(--text-secondary)]">Year</td>
                {discountedCashFlows.map(d => (
                  <td key={d.year} className="pb-4 text-center text-xs text-[var(--text-secondary)]">
                    {d.year}
                  </td>
                ))}
                <td className="pb-4 text-center text-xs text-[var(--accent)]">Terminal</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 text-sm text-[var(--text-secondary)]">Free Cash Flow</td>
                {discountedCashFlows.map(d => (
                  <td key={d.year} className="py-3 text-center text-sm tabular-nums text-[var(--text-primary)]">
                    {formatCompact(d.cf)}
                  </td>
                ))}
                <td className="py-3 text-center text-sm tabular-nums text-[var(--accent)]">
                  {formatCompact(terminalValue)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-[var(--text-secondary)]">Discount Factor</td>
                {discountedCashFlows.map(d => (
                  <td key={d.year} className="py-3 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                    {d.discountFactor.toFixed(3)}
                  </td>
                ))}
                <td className="py-3 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                  {Math.pow(1 + discountRate / 100, projectionYears.length).toFixed(3)}
                </td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="py-3 text-sm font-medium text-[var(--text-primary)]">Present Value</td>
                {discountedCashFlows.map(d => (
                  <td key={d.year} className="py-3 text-center text-sm tabular-nums font-medium text-[var(--text-primary)]">
                    {formatCompact(d.dcf)}
                  </td>
                ))}
                <td className="py-3 text-center text-sm tabular-nums font-medium text-[var(--accent)]">
                  {formatCompact(pvTerminal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Summary */}
      <div className="grid grid-cols-3 gap-4">
        <ValueCard
          label="Sum of DCF"
          value={sumDCF}
          sublabel={`${((sumDCF / enterpriseValue) * 100).toFixed(0)}% of EV`}
        />
        <ValueCard
          label="PV of Terminal"
          value={pvTerminal}
          sublabel={`${((pvTerminal / enterpriseValue) * 100).toFixed(0)}% of EV`}
        />
        <ValueCard
          label="Enterprise Value"
          value={enterpriseValue}
          highlighted
        />
      </div>
    </div>
  );
};

const ValueCard = ({ label, value, sublabel, highlighted }: {
  label: string;
  value: number;
  sublabel?: string;
  highlighted?: boolean;
}) => (
  <div className={`
    p-6 rounded-2xl border transition-all
    ${highlighted
      ? 'bg-[var(--accent)] border-[var(--accent)]'
      : 'bg-[var(--bg-card)] border-[var(--border)]'
    }
  `}>
    <p className={`text-[10px] uppercase tracking-[0.15em] mb-2 ${
      highlighted ? 'text-white/70' : 'text-[var(--text-secondary)]'
    }`}>
      {label}
    </p>
    <p className={`text-3xl font-light tabular-nums ${
      highlighted ? 'text-white' : 'text-[var(--text-primary)]'
    }`}>
      {formatCompact(value)}
    </p>
    {sublabel && (
      <p className={`text-xs mt-2 ${
        highlighted ? 'text-white/60' : 'text-[var(--text-secondary)]'
      }`}>
        {sublabel}
      </p>
    )}
  </div>
);
```

---

## Rolling Forecast View

Show how forecasts evolve over time:

```tsx
const RollingForecast = ({
  forecasts,
  actuals,
}: {
  forecasts: { asOf: string; values: Record<string, number> }[];
  actuals: Record<string, number>;
}) => {
  const periods = Object.keys(actuals);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
          <span className="text-[var(--text-secondary)]">Actual</span>
        </div>
        {forecasts.map((f, i) => (
          <div key={f.asOf} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                borderColor: `var(--text-secondary)`,
                opacity: 0.3 + (i * 0.2),
              }}
            />
            <span className="text-[var(--text-secondary)]">F{forecasts.length - i}</span>
          </div>
        ))}
      </div>

      <div className="relative h-64">
        <ResponsiveContainer>
          <LineChart margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickFormatter={(v) => formatCompact(v)}
            />

            {/* Forecast lines - increasingly transparent */}
            {forecasts.map((forecast, i) => (
              <Line
                key={forecast.asOf}
                data={periods.map(p => ({ period: p, value: forecast.values[p] }))}
                dataKey="value"
                stroke="var(--text-secondary)"
                strokeWidth={1}
                strokeOpacity={0.2 + (i * 0.15)}
                strokeDasharray="4 4"
                dot={false}
              />
            ))}

            {/* Actuals - solid and prominent */}
            <Line
              data={periods.map(p => ({ period: p, value: actuals[p] }))}
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--accent)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

---

## Sensitivity Table

Two-way sensitivity analysis:

```tsx
const SensitivityTable = ({
  baseValue,
  xAxis,
  yAxis,
  calculateValue,
}: {
  baseValue: number;
  xAxis: { label: string; values: number[]; baseIndex: number };
  yAxis: { label: string; values: number[]; baseIndex: number };
  calculateValue: (x: number, y: number) => number;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-right">
              <span className="text-[10px] text-[var(--text-secondary)]">
                {yAxis.label} ↓ / {xAxis.label} →
              </span>
            </th>
            {xAxis.values.map((x, xi) => (
              <th
                key={x}
                className={`p-3 text-center text-xs tabular-nums ${
                  xi === xAxis.baseIndex
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {x.toFixed(1)}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yAxis.values.map((y, yi) => (
            <tr key={y}>
              <td className={`p-3 text-right text-xs tabular-nums ${
                yi === yAxis.baseIndex
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {y.toFixed(1)}%
              </td>
              {xAxis.values.map((x, xi) => {
                const value = calculateValue(x, y);
                const isBase = xi === xAxis.baseIndex && yi === yAxis.baseIndex;
                const delta = ((value - baseValue) / baseValue) * 100;

                return (
                  <td
                    key={x}
                    className={`p-3 text-center text-sm tabular-nums ${
                      isBase
                        ? 'bg-[var(--accent)] text-white font-semibold'
                        : delta > 5
                          ? 'bg-[var(--positive)]/10 text-[var(--positive)]'
                          : delta < -5
                            ? 'bg-[var(--negative)]/10 text-[var(--negative)]'
                            : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {formatCompact(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Helper: Format Compact

```tsx
const formatCompact = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};
```
