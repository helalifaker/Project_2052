# Error Handling System

Comprehensive error boundary system for Project 2052 financial planning application.

## Overview

The application uses Next.js error boundaries to catch and handle errors at different levels of the component tree. This provides a graceful user experience when errors occur and enables proper error tracking.

## Error Boundary Hierarchy

```
global-error.tsx (Root level - catches everything)
  └─ error.tsx (App level)
      ├─ dashboard/error.tsx (Dashboard-specific)
      ├─ proposals/error.tsx (Proposals list)
      │   ├─ [id]/error.tsx (Proposal detail)
      │   └─ new/error.tsx (Proposal creation)
      ├─ admin/error.tsx (Admin panel)
      └─ negotiations/error.tsx (War room)
```

## Error Boundary Files

### 1. Global Error Boundary (`/src/app/global-error.tsx`)

**Purpose:** Last line of defense for unhandled errors at the root level.

**Features:**
- Catches errors that escape all other boundaries
- Must include `<html>` and `<body>` tags (Next.js requirement)
- Logs errors with CRITICAL severity
- Shows full-page error state with home button

**When it triggers:**
- Root layout errors
- Errors during initial app load
- Unhandled promise rejections (if configured)

### 2. Root Error Boundary (`/src/app/error.tsx`)

**Purpose:** Default error boundary for the app.

**Features:**
- Error classification (network, permission, calculation, database, unknown)
- Intelligent error messaging based on error type
- Conditional reset button (only for recoverable errors)
- Full error tracking with context

**Error Types:**
- **Network**: Fetch failures, connection issues
- **Permission**: Unauthorized, forbidden, RBAC errors
- **Calculation**: Financial engine, Decimal.js errors
- **Database**: Prisma, query failures
- **Unknown**: Catch-all for unclassified errors

### 3. Dashboard Error Boundary (`/src/app/dashboard/error.tsx`)

**Purpose:** Handle dashboard-specific errors.

**Common Errors:**
- Failed to fetch dashboard metrics
- Chart rendering failures
- KPI calculation errors
- Data aggregation issues

**Recovery:**
- Reset triggers full dashboard data refetch
- Navigation to proposals or home

### 4. Proposals List Error Boundary (`/src/app/proposals/error.tsx`)

**Purpose:** Handle errors on proposals listing page.

**Common Errors:**
- Failed to fetch proposals
- Filtering/sorting errors
- Search failures
- Deletion errors

**Recovery:**
- Reset triggers proposals refetch
- Navigation to dashboard or create new proposal

### 5. Proposal Detail Error Boundary (`/src/app/proposals/[id]/error.tsx`)

**Purpose:** Handle errors on individual proposal pages.

**Common Errors:**
- Proposal not found (404)
- Failed to load proposal data
- Calculation engine failures
- Tab rendering errors
- Chart/visualization errors
- Scenario/sensitivity analysis failures

**Error Types:**
- **not-found**: Proposal doesn't exist
- **calculation**: Financial engine errors
- **analysis**: Scenario/sensitivity failures
- **visualization**: Chart rendering issues
- **data-load**: Fetch failures

**Recovery:**
- Reset triggers proposal refetch + recalculation
- Navigation back to proposals list
- Critical errors: Contact support message

### 6. Proposal Creation Error Boundary (`/src/app/proposals/new/error.tsx`)

**Purpose:** Handle errors during proposal creation wizard.

**Common Errors:**
- Form validation failures
- Calculation engine errors
- Failed to save draft
- API submission errors
- Wizard step navigation errors

**Error Types:**
- **validation**: Missing/invalid fields
- **calculation**: Financial projection failures
- **submission**: API/save errors
- **form**: Wizard navigation issues

**Warning:** Reset clears form data - user must start over

### 7. Admin Error Boundary (`/src/app/admin/error.tsx`)

**Purpose:** Handle errors in admin panel.

**Common Errors:**
- Permission denied (non-admin users)
- Configuration update failures
- Historical data import errors
- System settings errors

**Error Types:**
- **permission**: No admin access (no reset button)
- **configuration**: Config validation errors
- **import**: Data file import failures
- **database**: Save failures

**High Priority:** Admin errors logged with HIGH severity

### 8. Negotiations Error Boundary (`/src/app/negotiations/error.tsx`)

**Purpose:** Handle errors in war room/comparison page.

**Common Errors:**
- Failed to load proposals for comparison
- Comparison calculation errors
- Chart rendering failures
- Side-by-side analysis errors

**Recovery:**
- Reset triggers refetch + comparison recalculation

## Error Tracking Utility

**File:** `/src/lib/error-tracking.ts`

### Features

1. **Error Classification**
   - Automatic error type detection based on error message
   - 7 error types: network, permission, calculation, validation, database, not-found, unknown

2. **Severity Levels**
   - **Critical**: Application-breaking errors (global boundary)
   - **High**: Calculation failures, database errors
   - **Medium**: Permission errors, not found, unknown
   - **Low**: Network errors, validation errors

3. **Environment-Specific Logging**
   - **Development**: Color-coded console logging with full stack traces
   - **Production**: Ready for integration with error tracking services

4. **User-Friendly Messages**
   - Maps error types to actionable user messages
   - Provides title + description for each error type

5. **Recoverability Detection**
   - Determines if error is recoverable (user can retry)
   - Non-recoverable errors hide the reset button

### Usage

```typescript
import { logError, classifyError, getUserFriendlyMessage } from '@/lib/error-tracking';

// Log error with context
logError(error, {
  context: 'proposal-calculation',
  severity: 'high',
  digest: error.digest,
  additionalData: { proposalId: '123' }
});

// Classify error
const errorType = classifyError(error); // 'calculation' | 'network' | etc.

// Get user-friendly message
const { title, description } = getUserFriendlyMessage(errorType);
```

## Error State Component

**File:** `/src/components/states/ErrorState.tsx`

Reusable error display component used by all error boundaries.

### Features

- Three size variants: `compact`, `default`, `full-page`
- Optional error details (development mode only)
- Navigation buttons: Try Again, Go Back, Home
- Accessible with ARIA labels
- Terracotta accent for error indication
- Smooth fade-in animation

### Props

```typescript
interface ErrorStateProps {
  error?: Error | string;
  reset?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean; // Default: dev mode only
  showBackButton?: boolean;
  showHomeButton?: boolean;
  size?: "default" | "compact" | "full-page";
  className?: string;
}
```

### Preset Error States

```typescript
import { ErrorStates } from '@/components/states/ErrorState';

// Network Error
<ErrorStates.NetworkError reset={refetch} />

// Not Found
<ErrorStates.NotFound resource="proposal" />

// Permission Denied
<ErrorStates.PermissionDenied />

// Calculation Error
<ErrorStates.CalculationError reset={recalculate} />

// Data Load Error
<ErrorStates.DataLoadError reset={refetch} />

// Generic Error
<ErrorStates.Generic error={error} reset={reset} />
```

## Best Practices

### 1. Error Boundary Placement

- Place error boundaries at route level for page-specific handling
- Use nested boundaries for complex pages with multiple concerns
- Global boundary is the fallback - don't rely on it for expected errors

### 2. Error Messages

- **User-facing:** Clear, actionable, no technical jargon
- **Development:** Full stack traces and context
- **Production:** Generic messages + error tracking

### 3. Reset Functionality

- Reset should clear error state and retry the failed operation
- For forms: Warn users that data will be lost
- For API calls: Refetch data or recalculate
- For non-recoverable errors: Don't show reset button

### 4. Error Logging

- Always log errors with appropriate context
- Include relevant IDs (proposalId, userId, etc.)
- Use correct severity levels
- Add custom data for debugging

### 5. Navigation Options

- **showBackButton:** When user can return to previous page
- **showHomeButton:** For critical errors or not-found scenarios
- Both buttons: When multiple recovery paths exist

## Integration with Error Tracking Services

The error tracking utility is ready for integration with services like Sentry, LogRocket, or Datadog.

### Sentry Example

```typescript
// In src/lib/error-tracking.ts, uncomment and configure:

function logToService(error: Error, context: ErrorContext): void {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      level: mapSeverityToSentryLevel(context.severity),
      tags: {
        context: context.context,
        page: context.page,
      },
      extra: {
        digest: context.digest,
        additionalData: context.additionalData,
      },
      user: context.userId ? { id: context.userId } : undefined,
    });
  }
}
```

## Testing Error Boundaries

### Manual Testing

1. **Network Errors:** Disconnect network, attempt API call
2. **Calculation Errors:** Enter invalid proposal data
3. **Permission Errors:** Access admin page as non-admin user
4. **Not Found:** Navigate to `/proposals/invalid-id`
5. **Validation Errors:** Submit incomplete form

### Automated Testing (Playwright)

```typescript
test('should show error boundary on proposal not found', async ({ page }) => {
  await page.goto('/proposals/non-existent-id');

  await expect(page.getByRole('heading', { name: 'Proposal Not Found' })).toBeVisible();
  await expect(page.getByText(/doesn't exist or has been deleted/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go Back' })).toBeVisible();
});
```

## Performance Considerations

- Error boundaries are client components (`'use client'`)
- useEffect for logging runs only once per error
- Error classification is lightweight (string matching)
- No network calls in error boundaries (except for tracking)

## Accessibility

All error boundaries use `ErrorState` component with:
- `role="alert"` for screen readers
- `aria-live="assertive"` for immediate announcement
- Keyboard navigation support
- High contrast error icons
- Focus management on buttons

## Future Enhancements

1. **Error Recovery Strategies:**
   - Automatic retry with exponential backoff
   - Offline queue for failed mutations
   - Service worker for network resilience

2. **Enhanced Error Tracking:**
   - User session replay (LogRocket)
   - Error clustering and deduplication
   - Error rate alerting

3. **User Feedback:**
   - "Report Issue" button
   - Error feedback form
   - Copy error details to clipboard

4. **Smart Error Handling:**
   - ML-based error classification
   - Contextual recovery suggestions
   - A/B testing error messages

## Related Documentation

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [ErrorState Component](../src/components/states/ErrorState.tsx)
- [Error Tracking Utility](../src/lib/error-tracking.ts)

## Support

For issues or questions about error handling:
1. Check error boundary logs in development mode
2. Review error tracking dashboard (when configured)
3. Contact the development team with error digest
