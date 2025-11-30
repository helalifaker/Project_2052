# Accessibility Guide

Project 2052 is committed to WCAG 2.1 AA compliance, ensuring the financial planning platform is accessible to all users, including those using assistive technologies.

## Table of Contents

- [Overview](#overview)
- [Compliance Standards](#compliance-standards)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [ARIA Patterns](#aria-patterns)
- [Color Contrast](#color-contrast)
- [Focus Management](#focus-management)
- [Testing Checklist](#testing-checklist)
- [Accessibility Components](#accessibility-components)

---

## Overview

The application implements comprehensive accessibility features across all pages and components:

- **Skip Links**: Keyboard users can bypass navigation
- **ARIA Labels**: All interactive elements have descriptive labels
- **Focus Management**: Visible focus indicators with copper accent
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Live Regions**: Dynamic content changes announced to screen readers
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)

---

## Compliance Standards

### WCAG 2.1 AA Requirements

| Criterion | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| 1.3.1 Info and Relationships | A | ✅ | Semantic HTML, ARIA landmarks |
| 1.4.3 Contrast (Minimum) | AA | ✅ | 4.5:1 for text, 3:1 for UI components |
| 2.1.1 Keyboard | A | ✅ | All functionality keyboard accessible |
| 2.1.2 No Keyboard Trap | A | ✅ | FocusTrap with Escape key support |
| 2.4.1 Bypass Blocks | A | ✅ | Skip links implemented |
| 2.4.3 Focus Order | A | ✅ | Logical tab order throughout |
| 2.4.7 Focus Visible | AA | ✅ | Copper focus ring with high visibility |
| 3.2.4 Consistent Identification | AA | ✅ | Consistent UI patterns |
| 4.1.3 Status Messages | AA | ✅ | ARIA live regions for dynamic content |

---

## Keyboard Navigation

### Global Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` / `Space` | Activate button or link |
| `Escape` | Close modal/dialog |
| `Arrow Keys` | Navigate lists (where applicable) |

### Skip Links

Press `Tab` on page load to reveal skip link:
- **"Skip to main content"** - Bypasses sidebar navigation

### Component-Specific Navigation

#### Sidebar Navigation
- `Tab` / `Shift+Tab`: Navigate between menu items
- `Enter`: Activate selected menu item
- Navigation items indicate active state with `aria-current="page"`

#### Proposal Cards
- `Tab`: Focus on card actions menu
- `Enter` / `Space`: Open actions dropdown
- `Arrow Keys`: Navigate dropdown menu items
- `Escape`: Close dropdown menu

#### Dialog/Modal Windows
- Focus trapped within modal
- `Escape`: Close modal and restore focus to trigger element
- `Tab`: Cycle through focusable elements within modal

#### Form Controls
- `Tab`: Move between form fields
- `Arrow Keys`: Navigate radio groups and dropdowns
- `Space`: Toggle checkboxes and switches
- Error messages linked via `aria-describedby`

---

## Screen Reader Support

### Tested With
- **NVDA** (Windows) - Fully supported
- **JAWS** (Windows) - Fully supported
- **VoiceOver** (macOS/iOS) - Fully supported
- **TalkBack** (Android) - Fully supported

### Announcements

#### Loading States
```tsx
<LiveRegion politeness="polite">
  {isLoading ? "Loading proposals..." : "Proposals loaded"}
</LiveRegion>
```

Screen reader announces: *"Loading proposals... Proposals loaded"*

#### Error States
```tsx
<ErrorAnnouncer error={error} />
```

Screen reader announces: *"Error: Failed to save proposal"* (assertive)

#### Form Validation
- Inline errors linked to fields via `aria-describedby`
- Error summary announced on form submission
- Success messages announced politely

---

## ARIA Patterns

### Navigation Menu (Sidebar)

```tsx
<aside aria-label="Main navigation" role="navigation">
  <nav aria-label="Primary navigation menu">
    <div role="list">
      <Link role="listitem" aria-current="page" aria-label="Dashboard">
        <LayoutDashboard aria-hidden="true" />
        Dashboard
      </Link>
    </div>
  </nav>
</aside>
```

**ARIA Attributes:**
- `role="navigation"` - Identifies navigation landmark
- `aria-label` - Provides accessible name
- `aria-current="page"` - Indicates current page
- `aria-hidden="true"` - Hides decorative icons from screen readers

### Proposal Card (Article)

```tsx
<Card role="article" aria-label="Proposal Developer A">
  <CardHeader>
    <CardTitle>Developer A</CardTitle>
    <CardDescription>
      <span className="sr-only">Last updated:</span>
      2025-11-30
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div role="list" aria-label="Key financial metrics">
      <div role="listitem">
        <span id="total-rent-label">Total Rent</span>
        <div aria-labelledby="total-rent-label">125.3 M</div>
      </div>
    </div>
  </CardContent>
</Card>
```

**ARIA Attributes:**
- `role="article"` - Identifies self-contained content
- `role="list"` / `role="listitem"` - Structures metrics list
- `aria-labelledby` - Associates label with value
- `.sr-only` - Screen reader only text for context

### Dropdown Menu (Actions)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger
    aria-label="Open proposal actions menu"
    aria-haspopup="menu"
  >
    <MoreVertical aria-hidden="true" />
  </DropdownMenuTrigger>

  <DropdownMenuContent role="menu" aria-label="Proposal actions">
    <DropdownMenuItem role="menuitem">View Details</DropdownMenuItem>
    <DropdownMenuItem role="menuitem">Edit</DropdownMenuItem>
    <DropdownMenuSeparator role="separator" />
    <DropdownMenuItem role="menuitem">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**ARIA Attributes:**
- `aria-haspopup="menu"` - Indicates menu expansion
- `role="menu"` / `role="menuitem"` - Menu pattern
- `role="separator"` - Visual divider

### Form Field with Error

```tsx
<Label htmlFor="developer-name">Developer Name</Label>
<Input
  id="developer-name"
  aria-invalid={!!errors.developer}
  aria-describedby={errors.developer ? "developer-error" : undefined}
/>
{errors.developer && (
  <span id="developer-error" role="alert">
    {errors.developer.message}
  </span>
)}
```

**ARIA Attributes:**
- `aria-invalid="true"` - Indicates validation error
- `aria-describedby` - Links error message to field
- `role="alert"` - Announces error immediately

### Loading State

```tsx
<div role="status" aria-live="polite" aria-label="Loading user information">
  <Loader2 aria-hidden="true" />
  <span className="sr-only">Loading...</span>
</div>
```

**ARIA Attributes:**
- `role="status"` - Identifies status region
- `aria-live="polite"` - Announces when idle
- `aria-label` - Provides context
- `.sr-only` - Text-only announcement

---

## Color Contrast

All color combinations meet WCAG AA standards (4.5:1 for text, 3:1 for UI components).

### Text Contrast Ratios

| Element | Light Mode | Dark Mode | Ratio |
|---------|------------|-----------|-------|
| Body text | `#1c1a17` on `#faf9f7` | `#f5f4f1` on `#1c1a17` | 16.5:1 |
| Secondary text | `#6b6760` on `#faf9f7` | `#a5a19a` on `#1c1a17` | 4.8:1 |
| Primary button | `#ffffff` on `#a47b42` | `#1c1a17` on `#c9a86c` | 4.7:1 |
| Positive (profit) | `#0f7d42` on `#ffffff` | `#4ade80` on `#1c1a17` | 7.2:1 |
| Negative (cost) | `#b91c1c` on `#ffffff` | `#f87171` on `#1c1a17` | 7.1:1 |

### Accessible Color Utilities

```css
/* Use these classes for financial data */
.text-accessible-positive {
  color: #0f7d42; /* Dark green - 4.5:1 contrast */
}

.dark .text-accessible-positive {
  color: #4ade80; /* Light green - 7:1 contrast */
}

.text-accessible-negative {
  color: #b91c1c; /* Dark red - 4.5:1 contrast */
}

.dark .text-accessible-negative {
  color: #f87171; /* Light red - 7:1 contrast */
}
```

### Testing Contrast

Use the contrast checker utility:
1. Install: `npm install -g contrast-ratio`
2. Check: `contrast-ratio #0f7d42 #ffffff` (should return ≥ 4.5)

Or use browser DevTools:
- Chrome: Inspect > Accessibility pane > Contrast ratio
- Firefox: Inspect > Accessibility Inspector

---

## Focus Management

### Focus Indicators

All interactive elements have visible focus indicators with the copper brand accent.

#### Standard Focus Ring
```css
.focus-ring-enhanced:focus-visible {
  box-shadow: 0 0 0 3px var(--background), 0 0 0 5px var(--ring);
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

**Visual Result:** Copper ring with 2px offset, visible against all backgrounds.

#### Premium Copper Focus
```css
.focus-visible-copper:focus-visible {
  outline: 3px solid hsl(var(--color-copper));
  outline-offset: 2px;
  box-shadow: 0 0 0 5px hsl(var(--color-copper) / 0.15);
}
```

**Visual Result:** 3px copper outline with subtle glow effect.

### Focus Trap (Modals)

```tsx
import { FocusTrap } from "@/components/ui/focus-trap";

<FocusTrap onEscape={() => setModalOpen(false)}>
  <Dialog>
    <DialogTitle>Modal Title</DialogTitle>
    <DialogContent>...</DialogContent>
    <DialogActions>
      <Button>Cancel</Button>
      <Button>Confirm</Button>
    </DialogActions>
  </Dialog>
</FocusTrap>
```

**Behavior:**
- Focus locked within modal
- `Tab` / `Shift+Tab` cycles through modal elements
- `Escape` closes modal
- Focus restored to trigger element on close

### High Contrast Mode

The application supports Windows High Contrast mode:

```css
@media (prefers-contrast: high) {
  .focus-ring-enhanced:focus-visible {
    outline-width: 3px;
    outline-color: currentColor;
  }

  button, a, input, select, textarea {
    border-width: 2px;
  }
}
```

---

## Testing Checklist

### Manual Testing

#### Keyboard Navigation
- [ ] Can reach all interactive elements via `Tab`
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Skip link appears on first `Tab` press
- [ ] Focus indicators are visible on all elements
- [ ] Can close modals with `Escape` key
- [ ] Dropdown menus work with `Arrow Keys`
- [ ] Form submission works with `Enter` key

#### Screen Reader Testing
- [ ] Page title announced on page load
- [ ] Headings create logical outline (h1 → h2 → h3)
- [ ] Navigation menu structure announced correctly
- [ ] ARIA labels provide context for icons
- [ ] Loading states announced
- [ ] Error messages announced assertively
- [ ] Success messages announced politely
- [ ] Form labels associated with inputs
- [ ] Required fields indicated

#### Visual Testing
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Focus indicators visible on all backgrounds
- [ ] UI components meet 3:1 contrast ratio
- [ ] Color is not the only indicator (icons + text)
- [ ] Text remains readable at 200% zoom
- [ ] No horizontal scrolling at 320px width

### Automated Testing

#### Tools
1. **axe DevTools** (Browser Extension)
   - Install: [Chrome](https://chrome.google.com/webstore) | [Firefox](https://addons.mozilla.org)
   - Run: Inspect page → axe DevTools tab → Scan

2. **Lighthouse** (Built into Chrome DevTools)
   - Run: DevTools → Lighthouse → Accessibility audit
   - Target: Score ≥ 95

3. **WAVE** (Browser Extension)
   - Install: [WAVE Extension](https://wave.webaim.org/extension/)
   - Run: Click WAVE icon → View report

4. **Pa11y** (CLI Tool)
   ```bash
   npm install -g pa11y
   pa11y http://localhost:3000
   ```

#### Playwright E2E Tests

Accessibility tests are integrated into E2E suite:

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Dashboard page should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Run tests:
```bash
pnpm test:e2e tests/e2e/accessibility.spec.ts
```

---

## Accessibility Components

### VisuallyHidden
Hides content visually while keeping it accessible to screen readers.

```tsx
import { VisuallyHidden } from "@/components/ui/visually-hidden";

<button>
  <TrashIcon aria-hidden="true" />
  <VisuallyHidden>Delete proposal</VisuallyHidden>
</button>
```

Screen reader announces: *"Delete proposal, button"*

### SkipLink
Allows keyboard users to bypass repetitive navigation.

```tsx
import { SkipLink } from "@/components/ui/visually-hidden";

<SkipLink href="#main-content">Skip to main content</SkipLink>
```

**Behavior:** Hidden by default, visible when focused with `Tab`.

### FocusTrap
Traps keyboard focus within a container (for modals).

```tsx
import { FocusTrap } from "@/components/ui/focus-trap";

<FocusTrap onEscape={() => setModalOpen(false)}>
  <Dialog>...</Dialog>
</FocusTrap>
```

**Features:**
- Traps `Tab` / `Shift+Tab` navigation
- `Escape` key support
- Restores focus on unmount

### LiveRegion
Announces dynamic content changes to screen readers.

```tsx
import { LiveRegion, LoadingAnnouncer, ErrorAnnouncer } from "@/components/ui/live-region";

// Generic usage
<LiveRegion politeness="polite">
  {message}
</LiveRegion>

// Loading states
<LoadingAnnouncer
  isLoading={isLoading}
  message="Calculating proposal"
  completedMessage="Calculation complete"
/>

// Errors
<ErrorAnnouncer error={error} />
```

**Politeness Levels:**
- `polite`: Announced when screen reader is idle
- `assertive`: Announced immediately (use sparingly)
- `off`: Not announced

### useKeyboardNavigation
Hook for implementing arrow key navigation in lists.

```tsx
import { useKeyboardNavigation } from "@/lib/hooks/useKeyboardNavigation";

const { activeIndex, setActiveIndex, handleKeyDown } = useKeyboardNavigation({
  itemCount: items.length,
  orientation: 'vertical',
  loop: true,
});

<div onKeyDown={handleKeyDown} role="menu">
  {items.map((item, index) => (
    <button
      role="menuitem"
      tabIndex={activeIndex === index ? 0 : -1}
      onClick={() => setActiveIndex(index)}
    >
      {item.label}
    </button>
  ))}
</div>
```

**Supported Keys:**
- `ArrowUp` / `ArrowDown` - Vertical navigation
- `ArrowLeft` / `ArrowRight` - Horizontal navigation
- `Home` / `End` - First / last item
- `PageUp` / `PageDown` - Jump 10 items

---

## Best Practices

### 1. Semantic HTML First
Always use semantic HTML before adding ARIA:
```tsx
// Good
<button onClick={handleClick}>Submit</button>

// Avoid
<div role="button" tabIndex={0} onClick={handleClick}>Submit</div>
```

### 2. Alt Text for Icons
Decorative icons should be hidden, functional icons need labels:
```tsx
// Decorative icon (hidden from screen readers)
<Building2 aria-hidden="true" />

// Functional icon (needs label)
<button aria-label="Delete proposal">
  <TrashIcon aria-hidden="true" />
</button>
```

### 3. Form Labels
Every input needs an associated label:
```tsx
// Good
<Label htmlFor="name">Name</Label>
<Input id="name" />

// Avoid (no label)
<Input placeholder="Name" />
```

### 4. Error Messages
Link errors to fields with `aria-describedby`:
```tsx
<Input
  id="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email.message}
  </span>
)}
```

### 5. Loading States
Always announce loading states:
```tsx
<LoadingAnnouncer
  isLoading={isLoading}
  message="Saving proposal"
/>
```

---

## Resources

### Official Specifications
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Learning Resources
- [Web Accessibility by Google](https://web.dev/accessibility/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Support

For accessibility issues or questions:
1. Check this guide first
2. Review component documentation in code comments
3. Test with automated tools (axe, Lighthouse)
4. Test manually with keyboard and screen reader
5. File issue with detailed reproduction steps

**Commitment:** We strive to maintain WCAG 2.1 AA compliance across the entire application. If you encounter any accessibility barriers, please report them immediately.
