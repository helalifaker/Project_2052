# Sentry Setup Guide

Step-by-step guide for setting up Sentry error tracking and performance monitoring.

## Prerequisites

- Sentry account (free tier available)
- Admin access to the GitHub repository
- Admin access to Vercel project

## Step 1: Create Sentry Account and Organization

1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in with GitHub
3. Create a new organization:
   - Organization name: `your-company`
   - Plan: Select appropriate plan (Developer plan is free)

## Step 2: Create Projects

### Production Project

1. Click "Create Project"
2. Select platform: **Next.js**
3. Set alert frequency: **On every new issue**
4. Project name: `project-2052-prod`
5. Team: Default team
6. Click "Create Project"
7. **IMPORTANT:** Copy the DSN (you'll need this later)

### Staging Project (Optional but Recommended)

Repeat the above steps with:
- Project name: `project-2052-staging`

## Step 3: Configure Environments

For each project:

1. Go to **Settings > Environments**
2. Add environments:
   - `production`
   - `staging`
   - `development`
3. Set default environment: `production`

## Step 4: Generate Auth Token

1. Go to **Settings > Account > Auth Tokens**
2. Click "Create New Token"
3. Token name: `project-2052-deploy`
4. Scopes:
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click "Create Token"
6. **IMPORTANT:** Copy the token immediately (you won't see it again)

## Step 5: Configure Vercel Environment Variables

### Production Environment

Go to Vercel Dashboard > Your Project > Settings > Environment Variables

Add the following variables for **Production** environment:

```bash
# Sentry DSN (from Step 2)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project-id]

# Sentry Environment
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Sentry Organization and Project
SENTRY_ORG=your-company
SENTRY_PROJECT=project-2052-prod

# Sentry Auth Token (from Step 4)
SENTRY_AUTH_TOKEN=sntrys_[your-token]

# Optional: App version (for release tracking)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Staging Environment (Preview)

Add the same variables for **Preview** environment with staging values:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[staging-project-id]
SENTRY_ENVIRONMENT=staging
NEXT_PUBLIC_SENTRY_ENVIRONMENT=staging
SENTRY_ORG=your-company
SENTRY_PROJECT=project-2052-staging
SENTRY_AUTH_TOKEN=sntrys_[your-token]
```

### Development Environment (Optional)

For **Development** environment:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[staging-project-id]
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_ORG=your-company
SENTRY_PROJECT=project-2052-staging
SENTRY_AUTH_TOKEN=sntrys_[your-token]
```

## Step 6: Configure Local Development

Add to your `.env.local` file:

```bash
# Sentry (optional for local development)
# Leave commented out to disable Sentry in local dev
# NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project-id]
# SENTRY_ENVIRONMENT=development
```

**Note:** Sentry is optional in local development. Uncomment only if you need to test Sentry integration locally.

## Step 7: Configure Alerts

### Email Alerts

1. Go to **Settings > Integrations > Email**
2. Verify your email address
3. Set email frequency: **Immediately**

### Slack Integration

1. Go to **Settings > Integrations**
2. Search for "Slack"
3. Click "Install"
4. Select Slack workspace
5. Choose channel: `#production-alerts`
6. Authorize

Configure Slack alerts:

1. Go to **Alerts > Create Alert**
2. Create alert rules:

**Critical Errors Alert:**
```
Alert name: Critical Errors - Production
Environment: production
Metric: Number of events
Threshold: is greater than 10 in 5 minutes
Actions:
  - Send a Slack notification to #production-alerts
  - Send an email to oncall@your-company.com
```

**New Issue Alert:**
```
Alert name: New Issue Detected
Environment: production
Metric: Issue is first seen
Actions:
  - Send a Slack notification to #sentry-updates
  - Send an email to dev-team@your-company.com
```

**High Error Rate Alert:**
```
Alert name: High Error Rate
Environment: production
Metric: Error rate
Threshold: is greater than 1% in 10 minutes
Actions:
  - Send a Slack notification to #production-alerts
  - Send an email to oncall@your-company.com
```

## Step 8: Test Sentry Integration

### Test Client-Side Error

Add a test button to any page:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';

export function TestSentryButton() {
  const handleError = () => {
    // This will trigger a test error
    throw new Error('Test Sentry error from client');
  };

  const handleCaptureError = () => {
    Sentry.captureException(new Error('Manually captured test error'));
  };

  return (
    <div className="space-x-2">
      <button onClick={handleError}>
        Throw Test Error
      </button>
      <button onClick={handleCaptureError}>
        Capture Test Error
      </button>
    </div>
  );
}
```

### Test Server-Side Error

Create a test API route:

```typescript
// src/app/api/sentry-test/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  // Test automatic error capture
  throw new Error('Test Sentry error from API');
}

export async function POST() {
  // Test manual error capture
  try {
    throw new Error('Test error in try-catch');
  } catch (error) {
    Sentry.captureException(error, {
      tags: { test: 'true' },
      extra: { info: 'This is a test error' },
    });

    return NextResponse.json({ error: 'Error captured' }, { status: 500 });
  }
}
```

### Verify Errors in Sentry

1. Visit your app
2. Trigger the test errors
3. Go to Sentry dashboard
4. Check **Issues** tab
5. You should see the test errors appear within 1-2 minutes

**Clean up:** Delete the test routes and buttons after verification.

## Step 9: Configure Release Tracking

Sentry automatically tracks releases when properly configured. To verify:

1. Deploy to production
2. Go to Sentry > **Releases**
3. You should see a new release created with the git commit hash
4. Click on the release to see:
   - Associated commits
   - Authors
   - Deploy time
   - Errors in this release

## Step 10: Configure Source Maps Upload

Source maps are automatically uploaded during build when `SENTRY_AUTH_TOKEN` is set.

To verify:

1. Trigger an error in production
2. Go to Sentry issue
3. Click on the error event
4. Check the stack trace
5. It should show the **original source code** (not minified)

If source maps are not working:
- Verify `SENTRY_AUTH_TOKEN` is set correctly
- Check build logs for "Uploading source maps" message
- Ensure `hideSourceMaps: true` in `next.config.ts`

## Step 11: Dashboard Setup

### Create Custom Dashboard

1. Go to **Dashboards** > **Create Dashboard**
2. Dashboard name: "Production Overview"
3. Add widgets:

**Widget 1: Error Rate**
```
Visualization: Line chart
Query: count() by time
Filter: environment:production
Time period: Last 7 days
```

**Widget 2: Most Common Errors**
```
Visualization: Table
Query: count() group by issue
Filter: environment:production
Limit: 10
```

**Widget 3: Affected Users**
```
Visualization: Big Number
Query: count_unique(user)
Filter: environment:production
Time period: Last 24 hours
```

**Widget 4: Response Time (p95)**
```
Visualization: Line chart
Query: p95(transaction.duration)
Filter: environment:production
Time period: Last 7 days
```

**Widget 5: Errors by Release**
```
Visualization: Bar chart
Query: count() group by release
Filter: environment:production
Limit: 5
```

## Step 12: Team Configuration

### Invite Team Members

1. Go to **Settings > Teams**
2. Select default team
3. Click "Add Member"
4. Enter email addresses
5. Set role:
   - **Admin:** Full access
   - **Member:** Can view and resolve issues
   - **Billing:** Billing access only

### Configure On-Call Rotation

1. Go to **Settings > Integrations**
2. Install PagerDuty integration (if using)
3. Configure escalation policies
4. Set up on-call schedules

## Troubleshooting

### Errors Not Appearing in Sentry

**Check:**
1. ✅ DSN is correctly set in environment variables
2. ✅ Application has been redeployed after adding DSN
3. ✅ Error actually occurred (check browser console)
4. ✅ Sentry is not disabled by error filters
5. ✅ Network requests to Sentry are not blocked

**Debug:**
```typescript
// Add to any page temporarily
console.log('Sentry DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN);

// Force Sentry to initialize with debug mode
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: true, // Enable debug logging
});
```

### Source Maps Not Working

**Check:**
1. ✅ `SENTRY_AUTH_TOKEN` is set
2. ✅ Token has correct scopes
3. ✅ `SENTRY_ORG` and `SENTRY_PROJECT` match Sentry project
4. ✅ Build logs show "Uploading source maps" message

**Fix:**
```bash
# Verify token works
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  https://sentry.io/api/0/organizations/[org]/projects/

# Should return list of projects
```

### High Quota Usage

If you're exceeding your quota:

**Solutions:**
1. Increase sample rates in Sentry configs
2. Add more error filters
3. Upgrade Sentry plan
4. Filter out noisy errors

**Reduce noise:**
```typescript
// sentry.client.config.ts
Sentry.init({
  tracesSampleRate: 0.05, // Sample only 5% of transactions
  beforeSend(event) {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null; // Don't send to Sentry
    }
    return event;
  },
});
```

## Maintenance

### Regular Tasks

**Weekly:**
- Review unresolved issues
- Update alert configurations
- Check quota usage

**Monthly:**
- Review release performance
- Update error filters
- Clean up resolved issues
- Review team access

**Quarterly:**
- Review Sentry plan and usage
- Update documentation
- Team training on Sentry features

## Best Practices

1. **Tag Everything:**
   - Add custom tags for better filtering
   - Tag by feature, user role, etc.

2. **Add Context:**
   - Include relevant data in error context
   - Add breadcrumbs for user actions

3. **Set Up Alerts:**
   - Create alerts for critical errors
   - Configure appropriate notification channels

4. **Review Regularly:**
   - Triage new issues daily
   - Resolve or ignore non-actionable errors

5. **Use Releases:**
   - Deploy with release tracking
   - Associate commits with releases

6. **Monitor Quota:**
   - Check quota usage regularly
   - Adjust sample rates if needed

7. **Filter Noise:**
   - Filter out browser extension errors
   - Ignore known harmless errors

8. **Document Issues:**
   - Add comments to issues
   - Link to GitHub issues/PRs

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Monitoring Best Practices](https://docs.sentry.io/product/best-practices/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Release Tracking](https://docs.sentry.io/product/releases/)

---

Last Updated: 2025-11-24
Version: 1.0.0
