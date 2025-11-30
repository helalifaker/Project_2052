# Page Transitions & Loading States

Premium transition system for Project 2052, implementing executive luxury aesthetics with smooth animations.

## Components

### 1. LoadingBar

Top-mounted progress bar that appears during route changes.

**Features:**
- Copper accent color gradient
- 100ms delay to prevent flicker
- 500ms animation duration
- Automatic show/hide on pathname change
- z-index: 100 to stay above content

**Usage:**
```tsx
// Already integrated in root layout
import { LoadingBar } from '@/components/ui/loading-bar';

<LoadingBar />
```

**Design Details:**
- Height: 2px
- Background: `copper-100` (light mode) / `copper-900/20` (dark mode)
- Gradient: `copper-500` → `copper-700` → `copper-900`
- Box shadow: Copper glow effect
- Animation: `loading-bar` keyframe (cubic-bezier)

---

### 2. PageTransition

Wrapper component for page-level content with fade-in animation.

**Features:**
- 300ms fade-in with subtle slide-up (8px)
- Smooth cubic-bezier easing
- Key-based re-animation on pathname change
- Minimal layout shift

**Usage:**
```tsx
import { PageTransition } from '@/components/ui/page-transition';

<PageTransition>
  <YourPageContent />
</PageTransition>
```

**Alternative: Direct CSS Class**
```tsx
// Already integrated in DashboardLayout
<div key={pathname} className="page-transition-enter">
  {children}
</div>
```

---

### 3. ModalTransition

Fast transition for modals and dialogs.

**Features:**
- 200ms animation (faster than page transitions)
- Slide-up + scale effect
- Conditional rendering based on `isOpen`
- Exit animation support

**Usage:**
```tsx
import { ModalTransition } from '@/components/ui/modal-transition';
import { Dialog, DialogContent } from '@/components/ui/dialog';

<Dialog open={isOpen}>
  <DialogContent>
    <ModalTransition isOpen={isOpen}>
      <YourModalContent />
    </ModalTransition>
  </DialogContent>
</Dialog>
```

---

### 4. Stagger Animation (CSS Utility)

For animating lists with sequential delays.

**Usage:**
```tsx
<div className="grid grid-cols-3 gap-6">
  {items.map((item, index) => (
    <div key={item.id} className="stagger-item">
      <YourCard data={item} />
    </div>
  ))}
</div>
```

**Timing:**
- Base animation: 250ms fade-in + slide-up (4px)
- Delay increment: 50ms per item
- Supports up to 8 items with predefined delays
- Extend in `globals.css` for more items

---

## Hooks

### usePageTransition

Custom hook for programmatic transition control.

```tsx
import { usePageTransition } from '@/hooks/usePageTransition';

function MyComponent() {
  const { isTransitioning } = usePageTransition();

  return (
    <div className={isTransitioning ? 'opacity-50' : 'opacity-100'}>
      {/* Your content */}
    </div>
  );
}
```

---

## Animation Keyframes

All animations defined in `/src/app/globals.css`:

### `page-fade-in`
```css
@keyframes page-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Duration: 300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### `modal-slide-up`
```css
@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```
- Duration: 200ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### `loading-bar`
```css
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(-50%); }
  100% { transform: translateX(0%); }
}
```
- Duration: 500ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### `stagger-fade-in`
```css
@keyframes stagger-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Duration: 250ms per item
- Delay: 50ms increments

---

## Integration Points

### Root Layout
```tsx
// /src/app/layout.tsx
import { LoadingBar } from '@/components/ui/loading-bar';

<LoadingBar />
<Providers>{children}</Providers>
```

### Dashboard Layout
```tsx
// /src/components/layout/DashboardLayout.tsx
<div key={pathname} className="page-transition-enter">
  {children}
</div>
```

---

## Performance Considerations

### Timing Strategy
- **100ms delay**: Prevents flicker on instant (<100ms) navigation
- **300ms page transition**: Feels premium without slowing perception
- **200ms modal transition**: Snappy for user-triggered actions
- **500ms loading bar**: Provides visual feedback for slower routes

### Browser Performance
- Uses `transform` and `opacity` (GPU-accelerated)
- No layout reflow (transform-only animations)
- `will-change` avoided (let browser optimize)
- Respects `prefers-reduced-motion` (add if needed)

### Accessibility
```tsx
// Loading bar ARIA attributes
<div
  role="progressbar"
  aria-label="Page loading"
  aria-busy={loading}
>
```

**Future Enhancement:**
Add `prefers-reduced-motion` support:
```css
@media (prefers-reduced-motion: reduce) {
  .page-transition-enter,
  .modal-transition-enter {
    animation: none;
  }
}
```

---

## Design Tokens

Uses Sahara Twilight theme colors:

```css
/* Copper accent */
--copper-900: #7a5c2e;  /* Active states */
--copper-700: #a47b42;  /* Primary buttons */
--copper-500: #c9a86c;  /* Accent borders */
--copper-300: #e4d4b8;  /* Subtle highlights */
--copper-100: #f7f3eb;  /* Tinted backgrounds */
```

---

## Examples

### Basic Page
```tsx
// No changes needed - automatic via DashboardLayout
export default function MyPage() {
  return (
    <DashboardLayout>
      <h1>My Page</h1>
    </DashboardLayout>
  );
}
```

### Staggered Grid
```tsx
export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="stagger-item">
            <ProposalCard data={proposal} />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
```

### Modal with Transition
```tsx
function DeleteConfirmDialog({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <ModalTransition isOpen={isOpen}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          {/* Dialog content */}
        </ModalTransition>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Testing

### Manual Testing Checklist
- [ ] Navigate between pages - loading bar appears
- [ ] Fast navigation (<100ms) - no loading bar flicker
- [ ] Page content fades in smoothly
- [ ] Modal dialogs slide up on open
- [ ] Staggered lists animate sequentially
- [ ] Dark mode - copper colors adjust correctly
- [ ] No layout shift during animations

### E2E Tests (Future)
```typescript
test('should show loading bar on navigation', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('a[href="/proposals"]');

  // Loading bar should be visible
  const loadingBar = page.locator('[role="progressbar"]');
  await expect(loadingBar).toBeVisible();

  // Should disappear after navigation
  await expect(loadingBar).not.toBeVisible();
});
```

---

## Troubleshooting

### Issue: Loading bar not appearing
**Solution:** Check that `LoadingBar` is in root layout, not inside a Suspense boundary.

### Issue: Page transition happens twice
**Solution:** Ensure only one `key={pathname}` in the component tree.

### Issue: Stagger animation not visible
**Solution:** Verify parent has `display: grid` or `flex`, and items have `stagger-item` class.

### Issue: Animations jank on slow devices
**Solution:** Consider adding `@media (prefers-reduced-motion: reduce)` to disable animations.

---

## Credits

Designed for Project 2052 (Project_2052) - Wave 3 Mega Sprint
Executive luxury aesthetic with Sahara Twilight theme
Built with Next.js 16, React 19, Tailwind CSS 4
