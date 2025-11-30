# Dashboard Integration Quick Reference

## Component Quick Reference

### PageSkeleton

**Import:**
```typescript
import { PageSkeleton } from "@/components/states/PageSkeleton";
```

**Usage:**
```typescript
<PageSkeleton variant="dashboard" />
```

**Variants:**
- `dashboard` - KPI grid + 4 chart placeholders
- `detail` - Header + tabs + content sections
- `list` - Table with rows and pagination

**When to use:**
- Full-page loading states
- Matches layout structure of actual content

---

### EmptyState

**Import:**
```typescript
import { EmptyState } from "@/components/states/EmptyState";
```

**Usage:**
```typescript
<EmptyState
  variant="folder"
  title="No Proposals Yet"
  description="Create your first proposal to get started"
  action={{
    label: "Create Proposal",
    onClick: () => router.push("/proposals/new")
  }}
  size="spacious"
/>
```

**Props:**
- `variant` - "default" | "search" | "folder" | "inbox"
- `title` - Main heading (required)
- `description` - Supporting text (required)
- `action` - Primary action button config
- `secondaryAction` - Optional secondary button
- `size` - "compact" | "default" | "spacious"
- `icon` - Custom Lucide icon (overrides variant icon)

**When to use:**
- No data available
- Search returns no results
- Empty collections or lists

---

### ErrorState

**Import:**
```typescript
import { ErrorState } from "@/components/states/ErrorState";
```

**Usage:**
```typescript
<ErrorState
  error={error}
  reset={handleRetry}
  title="Failed to Load Dashboard"
  description="We encountered an error. Please try again."
  size="default"
/>
```

**Props:**
- `error` - Error object or string
- `reset` - Retry function
- `title` - Custom error title
- `description` - Custom description
- `showDetails` - Show stack trace (dev only, default: auto)
- `showBackButton` - Show back navigation
- `showHomeButton` - Show home navigation
- `size` - "compact" | "default" | "full-page"

**When to use:**
- API call failures
- Data load errors
- Network issues
- Any error requiring user action

---

### ChartSkeleton

**Import:**
```typescript
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
```

**Usage:**
```typescript
<ChartSkeleton type="line" height={280} />
<ChartSkeleton type="bar" height={200} />
<ChartSkeleton type="area" height={350} />
```

**Props:**
- `type` - "line" | "bar" | "area"
- `height` - Height in pixels (default: 300)
- `className` - Additional CSS classes

**When to use:**
- Chart lazy loading
- Data fetching for charts
- Dynamic chart imports

---

## Integration Patterns

### Pattern 1: Loading State
```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <PageSkeleton variant="dashboard" />
    </DashboardLayout>
  );
}
```

### Pattern 2: Error State
```typescript
const [error, setError] = useState<Error | null>(null);

const handleRetry = () => {
  setError(null);
  // Re-fetch logic
};

if (error) {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <ErrorState error={error} reset={handleRetry} />
    </DashboardLayout>
  );
}
```

### Pattern 3: Empty State
```typescript
if (data?.isEmpty) {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <EmptyState
        variant="folder"
        title="No Data"
        description="Get started by creating your first item"
        action={{ label: "Create Item", onClick: handleCreate }}
      />
    </DashboardLayout>
  );
}
```

### Pattern 4: Chart Lazy Loading
```typescript
const MyChart = dynamic(
  () => import("@/components/charts/MyChart"),
  {
    loading: () => <ChartSkeleton type="line" height={300} />,
    ssr: false
  }
);
```

---

## State Flow Diagram

```
User visits page
       ↓
   [Loading]
   PageSkeleton
       ↓
   Fetch Data
       ↓
    Success? ───No──→ [Error]
       │             ErrorState
      Yes            (with retry)
       ↓
  Has Data? ───No──→ [Empty]
       │             EmptyState
      Yes            (with CTA)
       ↓
   [Success]
   Show Content
```

---

## Common Use Cases

### Dashboard Page
```typescript
// State
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
const [data, setData] = useState(null);

// Loading
if (loading) return <PageSkeleton variant="dashboard" />;

// Error
if (error) return <ErrorState error={error} reset={refetch} />;

// Empty
if (data?.isEmpty) return <EmptyState variant="folder" ... />;

// Success
return <DashboardContent data={data} />;
```

### List Page
```typescript
if (loading) return <PageSkeleton variant="list" />;
if (error) return <ErrorState error={error} reset={refetch} />;
if (items.length === 0) return <EmptyState variant="search" ... />;
return <ItemList items={items} />;
```

### Detail Page
```typescript
if (loading) return <PageSkeleton variant="detail" />;
if (error) return <ErrorState error={error} showBackButton />;
if (!item) return <ErrorState title="Not Found" showBackButton showHomeButton />;
return <ItemDetail item={item} />;
```

---

## Styling & Customization

### Sizes
- **compact** - Small, inline states (200-300px height)
- **default** - Standard size (400-500px height)
- **spacious** - Large, primary states (600-800px height)
- **full-page** - Full viewport height

### Colors (from Design System)
- Error: `text-destructive` (terracotta)
- Icon background: `bg-copper-100` (copper tint)
- Skeleton: `bg-muted` with shimmer animation
- Text: `text-foreground`, `text-muted-foreground`

### Animations
- **Fade in:** `.animate-fade-in` (500ms)
- **Shimmer:** `.animate-shimmer` (2s loop)
- **Spin:** `.animate-spin` (loading icons)

---

## Accessibility

All components include:
- ✅ Proper ARIA labels
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ Color contrast compliance (WCAG AA)

---

## Performance Tips

1. **Use PageSkeleton early** - Show structure immediately
2. **Match skeleton heights** - Reduce layout shift
3. **Lazy load charts** - Use ChartSkeleton in loading prop
4. **Memoize handlers** - Prevent unnecessary re-renders
5. **Debounce retries** - Prevent rapid retry clicks

---

## File Locations

```
/src/components/states/
  ├── PageSkeleton.tsx      # Full page skeletons
  ├── EmptyState.tsx        # Empty data states
  ├── ErrorState.tsx        # Error states with retry
  └── ProgressIndicator.tsx # Progress bars/steps

/src/components/charts/
  └── ChartSkeleton.tsx     # Chart loading skeletons

/src/app/dashboard/
  └── page.tsx              # Example integration
```

---

## Testing Checklist

### Loading State
- [ ] Skeleton shows immediately on page load
- [ ] Skeleton matches layout structure
- [ ] Smooth transition to actual content
- [ ] No layout shift when content loads

### Error State
- [ ] Error message is clear and actionable
- [ ] Retry button works correctly
- [ ] Error details show in development
- [ ] Navigation buttons work (if shown)

### Empty State
- [ ] Icon and message are appropriate
- [ ] Call-to-action button works
- [ ] Layout is centered and balanced
- [ ] Responsive on mobile/tablet

### Chart Skeletons
- [ ] Skeleton type matches chart type
- [ ] Height matches actual chart
- [ ] Shimmer animation is smooth
- [ ] Transition to chart is seamless

---

## Migration Guide

To integrate these components into any page:

1. **Add imports:**
   ```typescript
   import { PageSkeleton, EmptyState, ErrorState } from "@/components/states";
   import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
   ```

2. **Add error state:**
   ```typescript
   const [error, setError] = useState<Error | null>(null);
   ```

3. **Replace loading spinner:**
   ```typescript
   // Before: <Loader2 className="animate-spin" />
   // After:  <PageSkeleton variant="dashboard" />
   ```

4. **Replace custom empty state:**
   ```typescript
   // Before: Custom div with manual styling
   // After:  <EmptyState variant="folder" title="..." ... />
   ```

5. **Add error handling:**
   ```typescript
   // In catch block: setError(err)
   // In JSX: if (error) return <ErrorState error={error} reset={handleRetry} />
   ```

6. **Update chart imports:**
   ```typescript
   // Add: loading: () => <ChartSkeleton type="line" height={300} />
   ```

---

## Support

For questions or issues:
1. Check component prop types in source files
2. Review examples in this guide
3. See `/src/app/dashboard/page.tsx` for complete example
4. Check design system documentation in `/docs`

---

**Last Updated:** 2025-11-29
**Components Version:** v1.0.0
**Dashboard Integration:** Complete
