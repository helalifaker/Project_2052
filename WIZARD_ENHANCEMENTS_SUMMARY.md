# Proposal Wizard Enhancements - Implementation Summary

**Date:** November 30, 2025
**Feature:** Error States, Step Summaries, and Progress Persistence
**Sprint:** Wave 2 - Mega Sprint

---

## Overview

This implementation adds comprehensive error handling, step summaries, and automatic progress persistence to the proposal creation wizard at `/proposals/new`.

---

## 1. Error States Implemented

### A. Error Types

Created a robust error handling system with multiple error types:

```typescript
type WizardError =
  | { type: "network"; message: string; retry?: () => void }
  | { type: "validation"; message: string; field?: string }
  | { type: "calculation"; message: string; retry?: () => void }
  | { type: "generic"; message: string };
```

### B. Error Scenarios Covered

#### Network Errors
- **Trigger:** API call failures (500s, connection issues)
- **Display:** Full-page `<ErrorState>` with retry button
- **Recovery:** User can retry the failed operation
- **User Message:** "Server error occurred. Please try again or contact support if the issue persists."

#### Validation Errors
- **Trigger:** Invalid form data (400 responses)
- **Display:** Inline error messages with field-specific feedback
- **Recovery:** User corrects invalid fields and resubmits
- **User Message:** "Invalid input data. Please review your entries and try again."

#### Calculation Errors
- **Trigger:** Engine failures during 30-year projection
- **Display:** Compact `<ErrorState>` within step
- **Recovery:** Retry button or contact support
- **User Message:** Context-specific error from calculation engine

#### Permission Errors
- **Trigger:** Insufficient user role (401/403)
- **Display:** Toast notification + disabled Calculate button
- **User Message:** "You don't have permission to perform this calculation. Please contact your administrator."

#### Pre-fill Load Errors
- **Trigger:** Failed to load previous proposal data
- **Display:** Toast notification, wizard continues with defaults
- **Recovery:** User can manually enter data or try loading again
- **User Message:** "Failed to load proposal data"

### C. Error State Component Usage

```tsx
// Full-page network error
<ErrorState
  title="Failed to Load Proposal"
  description={error.message}
  reset={error.retry}
  showBackButton
  size="full-page"
/>

// Compact inline error
<ErrorState
  title="Validation Error"
  description={error.message}
  reset={error.retry}
  size="compact"
/>
```

### D. Enhanced Step7Review Error Handling

Updated `Step7Review.tsx` with:
- **Status-based error messages:** Different messages for 400, 401/403, 500+ errors
- **Network error detection:** Catches `TypeError` for fetch failures
- **Longer toast duration:** 5 seconds for error messages
- **Graceful degradation:** Handles malformed API responses

---

## 2. Step Summary Cards

### A. Component: `StepSummaryCard`

**Location:** `/src/components/proposals/wizard/StepSummaryCard.tsx`

**Features:**
- Collapsible content (expand/collapse)
- Edit button to jump back to step
- Visual highlight for current step
- Displays key data from each completed step

### B. Summary Data by Step

#### Step 1 - Proposal Basics
```
Developer: ABC Corp
Rent Model: Fixed Escalation
Contract Period: 30 years
```

#### Step 2 - Enrollment
```
Total Capacity: 1000 students
French / IB: 1000 / 0
Year 1 Ramp-up: FR 20% / IB 10%
```

#### Step 3 - Curriculum
```
French Program: 100% @ SAR 30.0K
IB Program: Disabled
```

#### Step 4 - Rent Model
```
Base Rent: SAR 10.0M
Growth Rate: 3%
```

#### Step 5 - Operating Costs
```
Staff Ratios: 14:1 / 50:1
Other OpEx: 10%
CPI Rate: 3%
```

### C. UI Design

```tsx
<StepSummaryCard
  stepNumber={1}
  title="Proposal Basics"
  data={formData}
  onEdit={() => setCurrentStep(0)}
  isCurrentStep={currentStep === 0}
/>
```

**Visual States:**
- **Collapsed:** Shows step number, title, Edit button, expand chevron
- **Expanded:** Reveals key data in grid layout
- **Current step:** Blue ring (`ring-2 ring-primary`), shadow lift
- **Completed step:** Muted colors, no ring

### D. Navigation

Users can:
- Click "Edit" button to jump back to any completed step
- Expand/collapse to view details without losing context
- See all completed steps above current step

---

## 3. Progress Persistence

### A. Hook: `useWizardPersistence`

**Location:** `/src/lib/hooks/useWizardPersistence.ts`

**Storage Mechanism:**
- Uses `localStorage` with key `"proposal-wizard-draft"`
- Auto-saves with 1-second debounce on form data change
- Stores: `currentStep`, `formData`, `lastSaved` timestamp

### B. Auto-Save Behavior

**When it saves:**
- User updates any form field (debounced 1s)
- User navigates between steps
- Excludes empty forms (no developer name + no rent model)

**Storage Format:**
```typescript
interface WizardState {
  currentStep: number;
  formData: Partial<ProposalFormData>;
  lastSaved: string; // ISO timestamp
}
```

### C. Auto-Restore Behavior

**On page load:**
1. Check if draft exists and is not expired (< 7 days old)
2. If user is on step 0 with empty form:
   - Show browser confirm dialog: "You have an unsaved draft. Would you like to resume where you left off?"
   - If Yes: Restore `currentStep` and `formData`
   - If No: Clear draft from localStorage

**Expiry:**
- Drafts expire after 7 days
- Expired drafts are automatically deleted

### D. Manual Controls

**Clear & Restart:**
- Button in header (shows when draft exists)
- Opens confirmation dialog
- Clears localStorage + resets form to defaults
- Shows trash icon (Lucide `Trash2`)

**Save Draft:**
- Saves to database via `/api/proposals` POST
- Clears localStorage after successful save
- Redirects to proposal detail page

### E. User Indicators

**Auto-save indicator:**
```tsx
<Alert className="bg-blue-500/5 border-blue-500/20">
  <AlertCircle className="h-4 w-4 text-blue-500" />
  <AlertDescription>
    Your progress is automatically saved. You can safely leave and return later.
  </AlertDescription>
</Alert>
```

Shows only when `hasDraft()` returns true.

---

## 4. Error Recovery Flows

### Flow 1: Network Error During Pre-fill
1. User clicks "Load from most recent proposal"
2. API fails with 500 error
3. Full-page `<ErrorState>` displays
4. User clicks "Try Again"
5. Retry function re-attempts fetch
6. On success, form populates; on failure, error persists

### Flow 2: Validation Error on Calculate
1. User clicks "Calculate 30 Years"
2. API returns 400 with validation details
3. Toast shows: "Invalid input data. Please review your entries and try again."
4. User goes back to offending step
5. Corrects data
6. Returns to Review step
7. Successfully calculates

### Flow 3: Permission Denied
1. Viewer-role user reaches Step 7
2. "Calculate" button is disabled
3. Warning text shows: "Calculations require Admin or Planner permissions."
4. User cannot proceed until role is elevated

### Flow 4: Lost Progress Recovery
1. User fills Steps 1-3, closes browser
2. Returns to `/proposals/new` next day
3. Confirm dialog: "You have an unsaved draft. Would you like to resume where you left off?"
4. User clicks OK
5. Wizard restores to Step 3 with all data intact
6. User continues from where they left off

---

## 5. Files Modified/Created

### Created
- `/src/components/proposals/wizard/StepSummaryCard.tsx` - Step summary UI component
- `/src/lib/hooks/useWizardPersistence.ts` - Persistence hook
- `/src/app/proposals/new/page-enhanced.tsx` - Enhanced wizard (now active)
- `/src/app/proposals/new/page.backup.tsx` - Backup of original

### Modified
- `/src/app/proposals/new/page.tsx` - Replaced with enhanced version
- `/src/components/proposals/wizard/Step7Review.tsx` - Enhanced error handling

### Dependencies
All existing UI components used:
- `<ErrorState>` from `/src/components/states/ErrorState.tsx`
- `<Alert>`, `<AlertDialog>` from shadcn/ui
- `<Card>`, `<Button>` from shadcn/ui

---

## 6. Design System Compliance

### Colors
- Error states: `destructive` (Terracotta)
- Info alerts: `blue-500` with 5% opacity background
- Current step: `primary` (Blue)
- Muted text: `muted-foreground`

### Typography
- Step titles: `text-lg font-semibold`
- Summary data: `text-sm`
- Error titles: `text-xl` (default), `text-2xl` (full-page)

### Spacing
- Card padding: `p-4` (summary cards), `p-6` (main content)
- Gap between summaries: `space-y-3`
- Sticky preview: `sticky top-6`

### Animations
- Smooth scroll on step change: `window.scrollTo({ behavior: "smooth" })`
- Auto-save debounce: 1 second
- Success toast + redirect delay: 500ms

---

## 7. Testing Recommendations

### Manual Tests

1. **Error Handling:**
   - [ ] Disconnect network, click Calculate → shows network error
   - [ ] Submit invalid data → shows validation error
   - [ ] Access as Viewer → shows permission error
   - [ ] Load non-existent pre-fill → shows 404 error

2. **Step Summaries:**
   - [ ] Complete Step 1 → summary card appears
   - [ ] Expand/collapse cards → content toggles
   - [ ] Click "Edit" on Step 2 → jumps back correctly
   - [ ] Current step has blue ring highlight

3. **Persistence:**
   - [ ] Fill Step 1-3, refresh page → draft restore prompt
   - [ ] Accept restore → wizard resumes at Step 3
   - [ ] Decline restore → draft clears, starts fresh
   - [ ] Click "Clear & Restart" → confirmation dialog → clears all
   - [ ] Wait 8 days → draft auto-expires

4. **Recovery Flows:**
   - [ ] Network error → click "Try Again" → succeeds
   - [ ] Validation error → go back → fix → recalculate → succeeds

### E2E Tests (Playwright)

```typescript
test("should restore draft after page refresh", async ({ page }) => {
  await page.goto("/proposals/new");
  await page.fill('[name="developerName"]', "Test Corp");
  await page.click('text=Fixed Rent');
  await page.click('text=Next');

  // Refresh page
  await page.reload();

  // Check for restore prompt
  await page.click('text=OK'); // Accept restore

  // Verify data persists
  await expect(page.locator('[name="developerName"]')).toHaveValue("Test Corp");
});

test("should show error state on network failure", async ({ page }) => {
  // Mock network failure
  await page.route("/api/proposals/calculate", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) })
  );

  // Fill wizard and calculate
  // ... fill steps ...
  await page.click('text=Calculate 30 Years');

  // Verify error state
  await expect(page.locator('text=Server error occurred')).toBeVisible();
  await expect(page.locator('text=Try Again')).toBeVisible();
});
```

---

## 8. Performance Impact

- **localStorage writes:** Debounced to 1/second, minimal impact
- **Step summaries:** Only render completed steps (max 5 cards)
- **Error states:** Lazy loaded, no overhead when no errors
- **Auto-save:** Does not block UI, runs in background

---

## 9. Success Criteria Met

### 1. Error States
- [x] API call failures handled (network errors, 500s)
- [x] Calculation engine errors caught and displayed
- [x] Validation errors shown with clear messages
- [x] `<ErrorState>` component used with retry functionality

### 2. Step Summary Cards
- [x] Show summary of completed steps
- [x] Display key data from each step
- [x] "Edit" button to jump back to step
- [x] Collapse/expand functionality

### 3. Progress Persistence
- [x] Save wizard state to localStorage
- [x] Auto-restore if user leaves and returns
- [x] "Resume Draft" functionality
- [x] "Clear and Restart" button

### 4. Error Recovery
- [x] "Try Again" for failed API calls
- [x] "Contact Support" messaging for calculation errors
- [x] "Go Back" to previous step on error
- [x] Clear error state when user fixes issue

---

## 10. Next Steps

### Immediate
1. Test with real users to gather feedback
2. Monitor localStorage usage (shouldn't exceed 5MB)
3. Add analytics to track error frequency

### Future Enhancements
1. **Cloud persistence:** Save drafts to database instead of localStorage
2. **Draft management:** List all saved drafts, delete old ones
3. **Field-level validation:** Real-time validation as user types
4. **Progress indicators:** Show completion percentage per step
5. **Undo/Redo:** Allow users to undo changes within wizard

---

## 11. Breaking Changes

**None.** This is a fully backward-compatible enhancement. The original wizard flow remains intact for users who prefer not to use drafts or summaries.

---

## Conclusion

This implementation provides a robust, user-friendly wizard experience with comprehensive error handling, progress tracking, and automatic recovery. Users can now safely navigate away from the wizard without losing progress, handle errors gracefully, and quickly review their inputs before calculation.

All success criteria have been met, and the implementation follows the established design system and TypeScript patterns.
