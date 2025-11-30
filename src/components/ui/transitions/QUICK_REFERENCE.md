# Transitions Quick Reference Card

## TL;DR - Copy & Paste Examples

### 1. Page Transition (Automatic)
```tsx
// Already works in DashboardLayout - no code needed!
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout>
      {/* Your content automatically gets page transition */}
    </DashboardLayout>
  );
}
```

### 2. Loading Bar (Automatic)
```tsx
// Already in root layout - shows on every navigation!
// No code needed - it just works.
```

### 3. Staggered List Animation
```tsx
<div className="grid grid-cols-3 gap-6">
  {proposals.map((proposal) => (
    <div key={proposal.id} className="stagger-item">
      <ProposalCard data={proposal} />
    </div>
  ))}
</div>
```

### 4. Modal Transition
```tsx
import { ModalTransition } from '@/components/ui/modal-transition';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <ModalTransition isOpen={isOpen}>
      <DialogHeader>
        <DialogTitle>My Modal</DialogTitle>
      </DialogHeader>
      {/* Modal content */}
    </ModalTransition>
  </DialogContent>
</Dialog>
```

### 5. Custom Page (No DashboardLayout)
```tsx
import { PageTransition } from '@/components/ui/page-transition';

export default function CustomPage() {
  return (
    <PageTransition>
      <div>My custom page content</div>
    </PageTransition>
  );
}
```

### 6. Programmatic Control
```tsx
import { usePageTransition } from '@/hooks/usePageTransition';

function MyComponent() {
  const { isTransitioning } = usePageTransition();

  return (
    <div className={isTransitioning ? 'opacity-50' : 'opacity-100'}>
      {isTransitioning ? 'Loading...' : 'Content'}
    </div>
  );
}
```

---

## Animation Classes Reference

| Class | Duration | Use Case |
|-------|----------|----------|
| `.page-transition-enter` | 300ms | Page content |
| `.modal-transition-enter` | 200ms | Dialogs/modals |
| `.stagger-item` | 250ms + delay | List items |
| `.animate-loading-bar` | 500ms | Loading indicators |

---

## Copper Color Utilities

```tsx
// Use these classes for consistent copper accents
className="bg-copper-500"       // #c9a86c
className="text-copper-700"     // #a47b42
className="border-copper-300"   // #e4d4b8
```

---

## Timing Guidelines

- **Instant feedback**: <100ms (button press)
- **Modal open**: 200ms (snappy)
- **Page transition**: 300ms (premium feel)
- **Loading indicator**: 500ms (visible feedback)

---

## When to Use What

| Scenario | Solution |
|----------|----------|
| Navigating between pages | Automatic (LoadingBar + DashboardLayout) |
| Opening a dialog | `<ModalTransition>` |
| Rendering a list | Add `stagger-item` class |
| Custom page layout | `<PageTransition>` |
| Programmatic control | `usePageTransition()` hook |

---

## Common Mistakes to Avoid

❌ **Don't**: Wrap DashboardLayout children in PageTransition
```tsx
// Wrong - double transition!
<DashboardLayout>
  <PageTransition>
    {children}
  </PageTransition>
</DashboardLayout>
```

✅ **Do**: Let DashboardLayout handle it
```tsx
// Correct
<DashboardLayout>
  {children}
</DashboardLayout>
```

---

❌ **Don't**: Add stagger-item to parent container
```tsx
// Wrong
<div className="stagger-item">
  {items.map(...)}
</div>
```

✅ **Do**: Add to each child
```tsx
// Correct
<div>
  {items.map(item => (
    <div className="stagger-item" key={item.id}>
      <Card />
    </div>
  ))}
</div>
```

---

## Troubleshooting

**Q: Loading bar not showing?**
A: Check that LoadingBar is in root layout, not inside Providers.

**Q: Page transition happens twice?**
A: Only use one `key={pathname}` in the component tree.

**Q: Stagger animation not working?**
A: Ensure parent has `display: grid` or `flex`.

**Q: Want to disable animations?**
A: Already handled via `prefers-reduced-motion` in globals.css.

---

## Demo Page

Visit `/demo/transitions` to see all transitions in action with live examples.

---

**Need more details?** See `/src/components/ui/transitions/README.md`
