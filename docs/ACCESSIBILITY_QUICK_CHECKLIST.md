# Accessibility Quick Checklist

Use this checklist when developing new features or reviewing existing components.

## Before Committing Code

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus indicators visible (use `.focus-ring-enhanced`)
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys work in lists/menus (if applicable)

### ARIA Labels
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Navigation items use `aria-current="page"` when active
- [ ] Form fields have associated labels (`htmlFor` / `id`)
- [ ] Error messages linked via `aria-describedby`
- [ ] Loading states have `role="status"` and `aria-live`

### Semantic HTML
- [ ] Use `<button>` not `<div role="button">`
- [ ] Use `<nav>` for navigation
- [ ] Use `<main>` for main content
- [ ] Use proper heading levels (h1 → h2 → h3)
- [ ] Use `<label>` for form fields

### Color & Contrast
- [ ] Text contrast ≥ 4.5:1 (use `.text-accessible-positive/negative`)
- [ ] UI contrast ≥ 3:1
- [ ] Don't rely on color alone (use icons + text)
- [ ] Test in dark mode

### Screen Readers
- [ ] Run with NVDA/VoiceOver
- [ ] Loading states announced
- [ ] Errors announced
- [ ] All content understandable without visuals

## Component Checklist

### When Creating a Button

```tsx
// ✅ Good
<Button
  onClick={handleClick}
  aria-label="Delete proposal"
  className="focus-ring-enhanced"
>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete</span>
</Button>

// ❌ Bad
<div onClick={handleClick}>
  <TrashIcon />
</div>
```

### When Creating a Modal

```tsx
// ✅ Good
<FocusTrap onEscape={() => setOpen(false)}>
  <Dialog role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <DialogTitle id="dialog-title">Confirm Delete</DialogTitle>
    <DialogContent>...</DialogContent>
  </Dialog>
</FocusTrap>

// ❌ Bad
<div className="modal">
  <h2>Confirm Delete</h2>
  ...
</div>
```

### When Showing Loading State

```tsx
// ✅ Good
<LoadingAnnouncer
  isLoading={isLoading}
  message="Saving proposal"
  completedMessage="Proposal saved"
/>
{isLoading && (
  <div role="status" aria-label="Loading">
    <Loader2 aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>
)}

// ❌ Bad
{isLoading && <Loader2 />}
```

### When Displaying Error

```tsx
// ✅ Good
<ErrorAnnouncer error={error} />
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <span id="email-error" role="alert">
    {error.message}
  </span>
)}

// ❌ Bad
{error && <div>{error.message}</div>}
```

### When Building Navigation

```tsx
// ✅ Good
<nav aria-label="Main navigation">
  <div role="list">
    <Link
      href="/dashboard"
      role="listitem"
      aria-current="page"
      className="focus-ring-enhanced"
    >
      <LayoutDashboard aria-hidden="true" />
      Dashboard
    </Link>
  </div>
</nav>

// ❌ Bad
<div>
  <a href="/dashboard">
    <LayoutDashboard />
    Dashboard
  </a>
</div>
```

## Testing Commands

```bash
# Automated tests
pnpm test:e2e tests/e2e/accessibility.spec.ts

# Lighthouse audit
npm run lighthouse

# Pa11y scan
npx pa11y http://localhost:3000

# Contrast check
# Use browser DevTools > Inspect > Accessibility pane
```

## Common Utilities

```tsx
import { VisuallyHidden, SkipLink } from "@/components/ui/visually-hidden";
import { FocusTrap } from "@/components/ui/focus-trap";
import {
  LiveRegion,
  LoadingAnnouncer,
  ErrorAnnouncer,
  SuccessAnnouncer,
} from "@/components/ui/live-region";
import { useKeyboardNavigation } from "@/lib/hooks/useKeyboardNavigation";
```

## CSS Classes

```tsx
// Focus styles
className="focus-ring-enhanced"
className="focus-visible-copper"
className="focus-within-ring"

// Screen reader
className="sr-only"
className="sr-only-focusable"

// Accessible colors
className="text-accessible-positive"
className="text-accessible-negative"

// Financial data
className="tabular-nums"
```

## Quick Reference

**Need help?** See `/docs/ACCESSIBILITY.md` for complete guide.

**Found an issue?** File bug with "a11y" label.

**WCAG Standard:** 2.1 AA (minimum 4.5:1 contrast, keyboard accessible, screen reader friendly)
