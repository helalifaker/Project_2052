# Validation Quick Start Guide

## Add Validation to a Wizard Step in 5 Minutes

### 1. Define Schema (30 seconds)

```typescript
import { z } from "zod";

const stepSchema = z.object({
  fieldName: z.string().min(1, "This field is required"),
  amount: z.number().positive("Must be a positive number in SAR"),
  percentage: z.number().min(0).max(100, "Must be between 0 and 100"),
});

const FIELD_LABELS = {
  fieldName: "Field Name",
  amount: "Amount",
  percentage: "Percentage",
};
```

### 2. Extract Errors (30 seconds)

```typescript
import { StepValidationSummary, extractValidationErrors } from './StepValidationSummary';

const validationErrors = useMemo(() => {
  return extractValidationErrors(form.formState.errors, FIELD_LABELS);
}, [form.formState.errors]);

const isStepValid = form.formState.isValid && !validationErrors.length;
```

### 3. Add Summary (15 seconds)

```typescript
<StepValidationSummary errors={validationErrors} />
```

### 4. Update Fields (2 minutes)

```typescript
<InputField
  name="fieldName"
  label="Field Name"
  required              // ← Add this
  showValidation        // ← Add this
/>

<InputField
  name="amount"
  label="Amount"
  type="number"
  prefix="SAR"
  required
  showValidation
/>
```

### 5. Disable Next (30 seconds)

```typescript
<Button type="submit" disabled={!isStepValid}>
  Next
  <ArrowRight className="h-4 w-4 ml-2" />
</Button>
```

### 6. Add Screen Reader Support (1 minute)

```typescript
<div className="sr-only" role="status" aria-live="polite">
  {isStepValid
    ? "All fields are valid. You can proceed."
    : `${validationErrors.length} fields need attention.`}
</div>
```

## Done! 🎉

Your step now has:
- ✅ Real-time validation
- ✅ Visual feedback (icons, colors, animations)
- ✅ Error summary at top
- ✅ Disabled navigation when invalid
- ✅ Full accessibility support

## Common Validation Rules

```typescript
// Required text
z.string().min(1, "This field is required")

// Required number
z.number().positive("Must be a positive number")

// Percentage
z.number().min(0).max(100, "Must be between 0 and 100")

// SAR amount
z.number().positive("Must be a positive number in SAR").min(1000)

// Year
z.number().int().min(2028).max(2057, "Must be between 2028 and 2057")

// Email
z.string().email("Invalid email address")

// Enum/Select
z.enum(["Option1", "Option2"], {
  errorMap: () => ({ message: "Please select an option" })
})
```

## Complete Example

See: `/src/components/proposals/wizard/Step1BasicsValidated.tsx`

## Error Messages

Keep them:
- **Specific:** "Must be between 0 and 100" not "Invalid"
- **Actionable:** Tell user how to fix it
- **Concise:** One sentence max
- **Friendly:** No technical jargon
