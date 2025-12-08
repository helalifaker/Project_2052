# Proposal Wizard Validation Implementation Guide

This guide documents the comprehensive validation feedback system implemented for the proposal wizard.

## Overview

The validation system provides real-time feedback to users as they complete the wizard, ensuring data quality and improving user experience with:

1. **Real-time field validation** with 300ms debouncing
2. **Visual feedback** (success checkmarks, error icons, animations)
3. **Step-level error summaries**
4. **Disabled navigation** until validation passes
5. **Full accessibility** (WCAG 2.1 AA compliant)

## Components Created

### 1. Custom Hooks

#### `/src/lib/hooks/useDebouncedValidation.ts`

Provides debounced validation to prevent excessive validation checks while user types:

```typescript
import { useDebouncedValue, useFieldValidation } from '@/lib/hooks/useDebouncedValidation';

// Usage in field validation
const { isValidating } = useFieldValidation(field.value, 300);
```

**Key Functions:**
- `useDebouncedValue<T>(value, delay)` - Returns debounced value after delay
- `useFieldValidation(fieldValue, delay)` - Tracks validation state with loading indicator

### 2. Validation Feedback Components

#### `/src/components/proposals/wizard/ValidationFeedback.tsx`

Visual components for field-level validation status:

```typescript
import { ValidationFeedback, FieldStatusIcon } from '@/components/proposals/wizard/ValidationFeedback';

// Error message with icon
<ValidationFeedback error="This field is required" />

// Success indicator
<ValidationFeedback isValid={true} />

// Inline icon in input
<FieldStatusIcon isValid={true} />
```

**Features:**
- Color-coded icons (terracotta for errors, sage for success)
- Animated checkmark and shake effects
- ARIA live regions for screen readers

### 3. Step Validation Summary

#### `/src/components/proposals/wizard/StepValidationSummary.tsx`

Displays all errors at top of step:

```typescript
import { StepValidationSummary, extractValidationErrors } from './StepValidationSummary';

const validationErrors = extractValidationErrors(
  form.formState.errors,
  FIELD_LABELS
);

<StepValidationSummary errors={validationErrors} />
```

**Features:**
- Counts errors ("1 field needs attention" vs "3 fields need attention")
- Lists all errors with field names
- Alert styling with terracotta color
- Slides down animation

### 4. Enhanced Progress Indicator

#### `/src/components/proposals/wizard/ProgressIndicator.tsx`

Progress bar with error count badges:

```typescript
import { ProgressIndicator } from '@/components/proposals/wizard/ProgressIndicator';

<ProgressIndicator
  steps={wizardSteps}
  currentStep={currentStep}
  completedSteps={completedSteps}
  stepErrors={stepErrorsMap}  // Map<stepIndex, errorCount>
  onStepClick={handleGoToStep}
/>
```

**Features:**
- Visual progress bar
- Step circles with numbers or checkmarks
- Error count badges on steps with validation issues
- Clickable steps for navigation
- Keyboard accessible

### 5. Enhanced Form Fields

#### `/src/components/forms/FormField.tsx`

Updated `InputField` with built-in validation display:

```typescript
<InputField
  name="developerName"
  label="Developer Name"
  placeholder="Enter name..."
  required
  showValidation  // Shows inline validation icon
/>
```

**New Props:**
- `showValidation?: boolean` - Show inline validation icon (default: true)
- `required?: boolean` - Adds asterisk and aria-required

**Validation Features:**
- Colored borders (terracotta for errors, sage for success)
- Inline status icons (checkmark, error, loading spinner)
- Debounced validation (300ms)
- Proper ARIA attributes

## Validation Animations

All animations added to `/src/app/globals.css`:

### Shake Animation (Error Feedback)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.animate-shake { animation: shake 0.5s ease-in-out; }
```

### Checkmark Animation (Success Feedback)
```css
@keyframes checkmark {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-checkmark { animation: checkmark 0.3s ease-out; }
```

### Slide Down Animation (Error Summary)
```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-down { animation: slide-down 0.3s ease-out; }
```

## Design Tokens Used

From `/src/lib/design-tokens/chart-colors.ts`:

```typescript
// Error states
text-financial-negative  // Terracotta (#b84233)
border-financial-negative

// Success states
text-financial-positive  // Sage (#2d7a4f)
border-financial-positive

// Focus states
focus-ring-enhanced      // Enhanced focus rings
focus-visible-copper     // Copper accent focus
```

## Implementation Pattern

### Step 1: Define Validation Schema

```typescript
import { z } from "zod";

const step1Schema = z.object({
  developerName: z
    .string()
    .min(1, "Developer name is required")
    .max(100, "Developer name must be less than 100 characters"),
  rentModel: z.enum(["Fixed", "RevShare", "Partner"], {
    errorMap: () => ({ message: "Please select a rent model" }),
  }),
});
```

### Step 2: Define Field Labels

```typescript
const FIELD_LABELS = {
  developerName: "Developer Name",
  rentModel: "Rent Model",
};
```

### Step 3: Extract Validation Errors

```typescript
const validationErrors = useMemo(() => {
  return extractValidationErrors(form.formState.errors, FIELD_LABELS);
}, [form.formState.errors]);
```

### Step 4: Add Validation Summary

```typescript
<StepValidationSummary errors={validationErrors} />
```

### Step 5: Update Form Fields

```typescript
<InputField
  name="developerName"
  label="Developer Name"
  required
  showValidation
/>
```

### Step 6: Disable Next Button

```typescript
const isStepValid = form.formState.isValid && !validationErrors.length;

<Button type="submit" disabled={!isStepValid}>
  Next
</Button>
```

### Step 7: Add Screen Reader Announcement

```typescript
<div className="sr-only" role="status" aria-live="polite">
  {isStepValid
    ? "All fields are valid. You can proceed to the next step."
    : `${validationErrors.length} fields need attention.`
  }
</div>
```

## Negotiation Validation (v2.2)

### Negotiation Creation
```typescript
const NegotiationSchema = z.object({
  developer: z.string().min(1, "Developer name is required").max(200),
  property: z.string().min(1, "Property name is required").max(200),
  notes: z.string().max(1000).optional(),
});
```

### Negotiation Status Updates
```typescript
const NegotiationStatusSchema = z.object({
  status: z.enum(["ACTIVE", "ACCEPTED", "REJECTED", "CLOSED"]),
  notes: z.string().max(1000).optional(),
});
```

### Counter-Offer Creation
```typescript
const CounterOfferSchema = z.object({
  developerName: z.string().min(1),
  rentModel: z.enum(["FIXED_ESCALATION", "REVENUE_SHARE", "PARTNER_INVESTMENT"]),
  origin: z.enum(["OUR_OFFER", "THEIR_COUNTER"]),
  // ... other proposal fields
});
```

### Timeline Reorder
```typescript
const ReorderSchema = z.object({
  proposalIds: z.array(z.string().uuid()).min(1),
});
```

## Validation Rules by Field Type

### Required Text Fields
```typescript
z.string().min(1, "This field is required")
```

### Number Ranges
```typescript
z.number()
  .positive("Must be a positive number")
  .min(0, "Must be at least 0")
  .max(100, "Must be between 0 and 100")
```

### Financial Values (SAR)
```typescript
z.number()
  .positive("Must be a positive number in SAR")
  .min(1000, "Minimum value is 1,000 SAR")
```

### Percentages
```typescript
z.number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100%")
```

### Dates
```typescript
z.number()
  .int("Year must be an integer")
  .min(2028, "Must be 2028 or later")
  .max(2057, "Must be before 2057")
```

### Enum/Select Fields
```typescript
z.enum(["Option1", "Option2", "Option3"], {
  errorMap: () => ({ message: "Please select an option" }),
})
```

## Accessibility Features

### ARIA Labels
```typescript
// Required fields
<span className="text-destructive ml-1" aria-label="required">*</span>

// Input states
<Input
  aria-invalid={hasError}
  aria-required={required}
  aria-describedby={description ? `${name}-description` : undefined}
/>
```

### ARIA Live Regions
```typescript
// Error messages
<div role="alert" aria-live="assertive">
  {error.message}
</div>

// Success messages
<div role="status" aria-live="polite">
  Valid
</div>
```

### Keyboard Navigation
- All radio groups have `role="radiogroup"`
- All cards support Enter and Space key activation
- Tab navigation through all interactive elements
- Focus rings meet WCAG contrast requirements

### Screen Reader Support
```typescript
// Status icon labels
<CheckCircle2 aria-label="Valid" />
<AlertCircle aria-label="Error" />
<Loader2 aria-label="Validating" />

// Hidden but announced
<div className="sr-only" role="status" aria-live="polite">
  Step validation status
</div>
```

## Testing Checklist

- [ ] All required fields show error when empty
- [ ] Valid fields show green checkmark
- [ ] Error messages appear below fields
- [ ] Error summary appears at top of step
- [ ] Next button disabled until step valid
- [ ] Progress indicator shows error counts
- [ ] Animations play smoothly (shake, checkmark)
- [ ] Screen readers announce validation state
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Works with reduced motion preference

## Performance Considerations

- **Debouncing:** 300ms delay prevents excessive validation
- **Memoization:** `useMemo` for validation error extraction
- **Controlled Re-renders:** Only validate on field change, not every render
- **Lazy Validation:** Only validate touched/dirty fields

## Example: Complete Validated Step

See `/src/components/proposals/wizard/Step1BasicsValidated.tsx` for a complete implementation example demonstrating all validation features.

## Migration Guide

To add validation to an existing step:

1. Import validation components
2. Define Zod schema with error messages
3. Create FIELD_LABELS mapping
4. Add `useMemo` for validation errors
5. Add `<StepValidationSummary />` at top
6. Update all `<InputField />` components with `required` and `showValidation`
7. Disable submit button based on `isStepValid`
8. Add screen reader announcement div
9. Test all validation scenarios

## Color Reference

| State | Color Variable | Hex | Usage |
|-------|----------------|-----|-------|
| Error | `--financial-negative` | #b84233 | Error messages, borders |
| Success | `--financial-positive` | #2d7a4f | Success icons, borders |
| Warning | `--financial-warning` | #c4850a | Warnings |
| Primary | `--primary` | #a47b42 | Buttons, focus |
| Destructive | `--destructive` | #b84233 | Critical errors |

## Support

For questions or issues with validation implementation, refer to:
- `/src/components/proposals/wizard/Step1BasicsValidated.tsx` - Complete example
- `/CLAUDE.md` - Project guidelines
- `/src/lib/design-tokens/chart-colors.ts` - Color tokens
