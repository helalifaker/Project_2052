# Transitions Architecture

## Component Hierarchy

```
Root Layout (/src/app/layout.tsx)
│
├── LoadingBar (z-index: 100, top-fixed)
│   └── Listens to: usePathname()
│
└── Providers
    └── DashboardLayout (/src/components/layout/DashboardLayout.tsx)
        │
        ├── Background Gradients (Sahara Twilight)
        ├── Sidebar
        ├── ContextBar
        │
        └── Main Content (key={pathname})
            └── .page-transition-enter
                └── Page Components
                    ├── Grids with .stagger-item
                    ├── Modals with <ModalTransition>
                    └── Custom components with usePageTransition()
```

---

## Data Flow

### Route Change Sequence

```
1. User clicks link
   └── Next.js starts route change

2. LoadingBar detects pathname change
   └── Sets loading = true (after 100ms delay)
   └── Shows copper gradient bar
   └── Animates 0% → 100% (500ms)

3. Page content loads
   └── DashboardLayout detects pathname change
   └── Creates new div with key={pathname}
   └── Triggers .page-transition-enter animation
   └── Fade-in + slide-up (300ms)

4. LoadingBar auto-hides
   └── Sets loading = false (after 600ms total)
   └── Bar disappears

5. Page fully rendered
   └── Stagger items animate sequentially
   └── Each item: 250ms + (index × 50ms) delay
```

---

## Timing Diagram

```
0ms    ──────────────────────────────────────────────────────
       User clicks link

100ms  ────┐
           │ Loading bar appears (delay prevents flicker)
           └─→ Copper bar starts animating

300ms  ────────┐
               │ Page content starts fading in
               └─→ New page becomes visible

500ms  ────────────┐
                   │ Loading bar animation completes
                   └─→ Still visible (waiting for hide timer)

600ms  ────────────────┐
                       │ Loading bar hides
                       └─→ Navigation complete

650ms  ────────────────────┐
                           │ Stagger animations complete
                           └─→ All 8 items visible
```

---

## CSS Animation Stack

### Keyframes Layer
```css
@keyframes page-fade-in { ... }       /* 300ms */
@keyframes modal-slide-up { ... }     /* 200ms */
@keyframes loading-bar { ... }        /* 500ms */
@keyframes stagger-fade-in { ... }    /* 250ms */
```

### Utility Classes Layer
```css
.page-transition-enter    → Applies page-fade-in
.modal-transition-enter   → Applies modal-slide-up
.animate-loading-bar      → Applies loading-bar
.stagger-item             → Applies stagger-fade-in + delay
```

### Component Integration
```tsx
// LoadingBar.tsx
<div className="animate-loading-bar" />

// DashboardLayout.tsx
<div className="page-transition-enter" key={pathname} />

// ProposalsPage.tsx
<div className="stagger-item" />

// MyModal.tsx
<ModalTransition><div /></ModalTransition>
```

---

## State Management

### LoadingBar Component
```tsx
const [loading, setLoading] = useState(false);
const [show, setShow] = useState(false);
const pathname = usePathname();

useEffect(() => {
  // Show after 100ms delay
  const showTimer = setTimeout(() => {
    setLoading(true);
    setShow(true);
  }, 100);

  // Hide after 600ms total
  const hideTimer = setTimeout(() => {
    setLoading(false);
    setShow(false);
  }, 600);

  return () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
  };
}, [pathname]);
```

### DashboardLayout Component
```tsx
const pathname = usePathname();

return (
  <div key={pathname} className="page-transition-enter">
    {children}
  </div>
);
```

### ModalTransition Component
```tsx
const [shouldRender, setShouldRender] = useState(isOpen);

useEffect(() => {
  if (isOpen) {
    setShouldRender(true);
  } else {
    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }
}, [isOpen]);
```

---

## Performance Considerations

### GPU Acceleration
```css
/* Uses transform & opacity (GPU-accelerated) */
transform: translateY(8px);  ✅ GPU
opacity: 0;                  ✅ GPU

/* Avoids layout-triggering properties */
margin-top: 8px;            ❌ CPU (causes reflow)
height: 100px;              ❌ CPU (causes reflow)
```

### Animation Budget
```
Total animations per navigation:
- LoadingBar:     500ms (GPU)
- PageTransition: 300ms (GPU)
- StaggerItems:   650ms (GPU, sequential)
────────────────────────────────
Maximum overlap: 800ms
Frames @ 60fps:  48 frames
GPU overhead:    Minimal (<5% on modern devices)
```

### Memory Footprint
```
Component Size (minified + gzipped):
- LoadingBar:      ~0.8 KB
- PageTransition:  ~0.6 KB
- ModalTransition: ~0.7 KB
- usePageTransition: ~0.4 KB
────────────────────────────────
Total:             ~2.5 KB
```

---

## Browser Compatibility

### CSS Features Used
- `transform`: ✅ All browsers
- `opacity`: ✅ All browsers
- `animation`: ✅ All browsers
- `cubic-bezier()`: ✅ All browsers
- `backdrop-filter`: ⚠️ Safari 9+ (LoadingBar uses solid bg)

### JavaScript Features Used
- `useState`: ✅ React 19
- `useEffect`: ✅ React 19
- `usePathname`: ✅ Next.js 16

### Fallback Strategy
```css
/* Already implemented in globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Extension Points

### Adding New Animation Classes

1. Add keyframe to `globals.css`:
```css
@keyframes my-animation {
  from { ... }
  to { ... }
}
```

2. Create utility class:
```css
.my-animation-class {
  animation: my-animation 300ms ease-out;
}
```

3. Use in components:
```tsx
<div className="my-animation-class">Content</div>
```

### Extending Stagger Items

Current: 8 items predefined
To add more:

```css
/* In globals.css */
.stagger-item:nth-child(9) { animation-delay: 400ms; }
.stagger-item:nth-child(10) { animation-delay: 450ms; }
/* etc... */
```

### Custom Transition Duration

```tsx
// Override via inline style
<div
  className="page-transition-enter"
  style={{ animationDuration: '500ms' }}
>
  {content}
</div>
```

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// usePageTransition.test.ts
describe('usePageTransition', () => {
  it('should return transitioning state on pathname change', () => {
    // Mock usePathname
    // Assert isTransitioning behavior
  });
});
```

### Component Tests (Vitest + Testing Library)
```typescript
// LoadingBar.test.tsx
describe('LoadingBar', () => {
  it('should show after 100ms delay', async () => {
    render(<LoadingBar />);
    // Assert visibility timing
  });
});
```

### E2E Tests (Playwright)
```typescript
// transitions.spec.ts
test('should show loading bar on navigation', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('a[href="/proposals"]');

  const loadingBar = page.locator('[role="progressbar"]');
  await expect(loadingBar).toBeVisible();
});
```

### Visual Regression Tests
```typescript
// Capture screenshots during transitions
await page.screenshot({ path: 'transition-start.png' });
await page.waitForTimeout(300);
await page.screenshot({ path: 'transition-end.png' });
// Compare with baseline
```

---

## Debugging

### Chrome DevTools

**Performance Tab:**
1. Start recording
2. Navigate to new page
3. Stop recording
4. Look for:
   - Animation frames (should be 60fps)
   - Paint events (should be minimal)
   - Layout shifts (should be zero)

**Animation Panel:**
1. Open DevTools → More Tools → Animations
2. Navigate to trigger animations
3. Scrub timeline to inspect keyframes
4. Verify easing curves

### React DevTools

**Profiler:**
1. Start profiling
2. Navigate to new page
3. Stop profiling
4. Check component render times
5. LoadingBar should re-render once per navigation

### Console Logging

Add to components for debugging:
```tsx
useEffect(() => {
  console.log('[LoadingBar] Pathname changed:', pathname);
  console.log('[LoadingBar] Loading state:', loading);
}, [pathname, loading]);
```

---

## Production Checklist

- [ ] All animations use GPU-accelerated properties
- [ ] No layout shift during transitions
- [ ] LoadingBar z-index doesn't conflict
- [ ] Dark mode colors correct
- [ ] `prefers-reduced-motion` respected
- [ ] ARIA attributes present
- [ ] Demo page works
- [ ] Documentation complete
- [ ] No console errors
- [ ] Build succeeds

---

**Architecture Version:** 1.0
**Last Updated:** November 30, 2025
**Maintainer:** Frontend Team
