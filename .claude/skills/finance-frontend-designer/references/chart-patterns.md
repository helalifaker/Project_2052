# Chart Patterns

Charts are where most finance UIs fail. Default library output screams "I used the docs example." These patterns create charts that feel designed, not generated.

## Philosophy

- **Restraint over decoration**: Remove gridlines, reduce axis noise, let data breathe
- **Purposeful color**: One accent, strategic use of opacity
- **Typography matters**: Custom fonts in charts, not Arial
- **Animation with intent**: Subtle, fast, meaningful

---

## Base Configuration

Strip Recharts to essentials, then build back intentionally:

```tsx
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Base chart wrapper — use everywhere
const ChartContainer = ({ children, className = '' }) => (
  <div className={`w-full h-[320px] ${className}`}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);
```

---

## Minimal Area Chart

The signature chart. Gradient fill, no gridlines, whisper-quiet axes:

```tsx
const MinimalAreaChart = ({ data, dataKey, color = 'var(--accent)' }) => (
  <ChartContainer>
    <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* No gridlines. The data is the story. */}

      <XAxis
        dataKey="period"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
        dy={10}
      />

      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{
          fill: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
        tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
        dx={-10}
        width={50}
      />

      <Tooltip content={<CustomTooltip />} />

      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        fill="url(#areaGradient)"
        animationDuration={800}
        animationEasing="ease-out"
      />
    </AreaChart>
  </ChartContainer>
);
```

---

## Custom Tooltip

Tooltips are often afterthoughts. Make them premium:

```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl
                    px-4 py-3 shadow-2xl shadow-black/20">
      <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1">
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-lg font-medium tabular-nums text-[var(--text-primary)]">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
            notation: 'compact',
            maximumFractionDigits: 1,
          }).format(entry.value)}
        </p>
      ))}
    </div>
  );
};
```

---

## Comparison Bar Chart

Side-by-side comparison with clear visual hierarchy:

```tsx
const ComparisonBarChart = ({ data }) => (
  <ChartContainer className="h-[400px]">
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
      barGap={4}
    >
      <XAxis
        type="number"
        axisLine={false}
        tickLine={false}
        tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
        tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
      />

      <YAxis
        type="category"
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{
          fill: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 500,
        }}
        width={120}
      />

      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-subtle)' }} />

      {/* Actual - solid, confident */}
      <Bar
        dataKey="actual"
        fill="var(--accent)"
        radius={[0, 4, 4, 0]}
        barSize={20}
      />

      {/* Budget - ghosted, reference point */}
      <Bar
        dataKey="budget"
        fill="var(--text-secondary)"
        fillOpacity={0.3}
        radius={[0, 4, 4, 0]}
        barSize={20}
      />
    </BarChart>
  </ChartContainer>
);
```

---

## Sparkline

Inline trend indicator. No axes, no labels — pure signal:

```tsx
const Sparkline = ({
  data,
  dataKey = 'value',
  width = 120,
  height = 32,
  color = 'var(--accent)',
  showDot = true,
}) => {
  const lastValue = data[data.length - 1]?.[dataKey];
  const firstValue = data[0]?.[dataKey];
  const trend = lastValue >= firstValue ? 'up' : 'down';
  const trendColor = trend === 'up' ? 'var(--positive)' : 'var(--negative)';

  return (
    <div style={{ width, height }} className="relative">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
          {showDot && (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="transparent"
              dot={(props) => {
                const isLast = props.index === data.length - 1;
                if (!isLast) return null;
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={3}
                    fill={trendColor}
                  />
                );
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## Variance Waterfall

Show the story of how you got from A to B:

```tsx
const WaterfallChart = ({ data }) => {
  // Data shape: [{ name: 'Revenue', value: 5000000, type: 'positive' }, ...]
  // type: 'positive' | 'negative' | 'total'

  const processedData = data.map((item, i) => {
    const prevTotal = i === 0 ? 0 :
      data.slice(0, i).reduce((sum, d) => sum + (d.type !== 'total' ? d.value : 0), 0);

    return {
      ...item,
      start: item.type === 'total' ? 0 : prevTotal,
      end: item.type === 'total' ? item.value : prevTotal + item.value,
    };
  });

  return (
    <ChartContainer className="h-[360px]">
      <BarChart data={processedData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
        />

        {/* Invisible spacer bar */}
        <Bar dataKey="start" stackId="waterfall" fill="transparent" />

        {/* Actual value bar */}
        <Bar
          dataKey={(d) => d.end - d.start}
          stackId="waterfall"
          radius={[4, 4, 0, 0]}
          fill={(entry) =>
            entry.type === 'total' ? 'var(--accent)' :
            entry.type === 'positive' ? 'var(--positive)' : 'var(--negative)'
          }
        >
          {processedData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.type === 'total' ? 'var(--accent)' :
                entry.type === 'positive' ? 'var(--positive)' : 'var(--negative)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
```

---

## Multi-Series with Legend

When you must show multiple series, make the legend part of the design:

```tsx
const MultiSeriesChart = ({ data, series }) => {
  // series: [{ key: 'revenue', label: 'Revenue', color: '#d4a574' }, ...]

  return (
    <div>
      {/* Integrated legend — not floating, not cramped */}
      <div className="flex items-center gap-6 mb-6">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
          </div>
        ))}
      </div>

      <ChartContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            vertical={false}
            opacity={0.5}
          />

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
            tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
          />

          <Tooltip content={<CustomTooltip />} />

          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: s.color }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
};
```

---

## Donut / Composition Chart

For portfolio allocation, expense breakdown — when proportions matter:

```tsx
const CompositionChart = ({ data, size = 240 }) => {
  // data: [{ name: 'Salaries', value: 45, color: 'var(--accent)' }, ...]

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-8">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius="65%"
              outerRadius="100%"
              dataKey="value"
              stroke="var(--bg-primary)"
              strokeWidth={2}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-light tabular-nums text-[var(--text-primary)]">
            {total}%
          </span>
          <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Vertical legend */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
              <p className="text-xs tabular-nums text-[var(--text-secondary)]">{item.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Animation Guidelines

```tsx
// Chart animation config — fast, confident
const animationConfig = {
  duration: 600,
  easing: 'ease-out',
};

// Stagger animations for multiple elements
const staggerDelay = (index: number) => index * 50;

// Number counting animation (for KPIs)
const useCountUp = (end: number, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};
```

---

## What NOT to Do

```tsx
// ❌ Default colors
<Bar fill="#8884d8" />

// ❌ Cluttered axes
<XAxis axisLine={true} tickLine={true} tick={{ fontSize: 12 }} />

// ❌ Grid overload
<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />

// ❌ Generic tooltips
<Tooltip /> // Uses default styling

// ❌ Too many data points without aggregation
data={last365Days} // Unreadable noise
```

---

## Quick Reference: Chart Type Selection

| Data Story | Chart Type | Key Config |
|------------|------------|------------|
| Trend over time | Area/Line | Gradient fill, no grid |
| Compare categories | Horizontal Bar | Clear hierarchy, spacing |
| Show composition | Donut | 65% inner radius, vertical legend |
| Variance analysis | Waterfall | Color-coded by type |
| Quick trend signal | Sparkline | No axes, end dot |
| Multi-metric comparison | Multi-line | Integrated legend |
