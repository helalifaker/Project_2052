# Monitoring & Observability Guide

Complete guide for monitoring, observability, and incident management for Project 2052.

## Table of Contents

- [Overview](#overview)
- [Monitoring Stack](#monitoring-stack)
- [Sentry Error Tracking](#sentry-error-tracking)
- [Vercel Analytics](#vercel-analytics)
- [Uptime Monitoring](#uptime-monitoring)
- [Performance Monitoring](#performance-monitoring)
- [Alerting & Notifications](#alerting--notifications)
- [Dashboards](#dashboards)
- [Incident Response](#incident-response)
- [Runbooks](#runbooks)

## Overview

### Monitoring Philosophy

Our monitoring strategy follows the "Four Golden Signals" of SRE:

1. **Latency** - How long it takes to serve a request
2. **Traffic** - How much demand is being placed on the system
3. **Errors** - Rate of requests that fail
4. **Saturation** - How "full" the service is

### Key Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Uptime | > 99.9% | < 99.9% | < 99.5% |
| API Response Time (p95) | < 500ms | > 500ms | > 1000ms |
| Error Rate | < 0.1% | > 0.1% | > 1% |
| Database Query Time | < 100ms | > 100ms | > 500ms |
| Build Time | < 3min | > 3min | > 5min |
| LCP (Largest Contentful Paint) | < 2.5s | > 2.5s | > 4s |
| FID (First Input Delay) | < 100ms | > 100ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.1 | > 0.25 |

## Monitoring Stack

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Production System                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Next.js    │  │   Database   │  │  Supabase    │ │
│  │   (Vercel)   │  │  (Postgres)  │  │   Storage    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          ▼                 ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │  Sentry  │      │  Vercel  │      │  Uptime  │
    │  Error   │      │ Analytics│      │  Robot   │
    │ Tracking │      │          │      │          │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                  │
         │                 ▼                  │
         │           ┌──────────┐            │
         │           │   Logs   │            │
         │           │ (Vercel) │            │
         │           └──────────┘            │
         │                                    │
         └────────────────┬───────────────────┘
                         │
                         ▼
                   ┌──────────┐
                   │  Alerts  │
                   │  (Slack/ │
                   │  Email)  │
                   └──────────┘
```

### Tool Comparison

| Tool | Purpose | Cost | Setup Complexity |
|------|---------|------|------------------|
| **Sentry** | Error tracking, performance | Free tier: 5K events/month | Medium |
| **Vercel Analytics** | Web vitals, traffic | Included with Pro plan | Low |
| **UptimeRobot** | Uptime monitoring | Free: 50 monitors | Low |
| **Better Uptime** | Advanced uptime monitoring | $18/month | Medium |
| **LogRocket** | Session replay | $99/month | Medium |
| **Datadog** | Full observability | $15/host/month | High |

**Recommended Stack:**
- Sentry (Error tracking)
- Vercel Analytics (Performance)
- UptimeRobot (Uptime)

## Sentry Error Tracking

### Setup Instructions

#### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in
3. Create organization: `your-company`

#### 2. Create Project

1. Click "Create Project"
2. Platform: **Next.js**
3. Project name: `project-2052-prod`
4. Alert frequency: **On every new issue**
5. Copy the DSN

#### 3. Configure Environments

Create three environments in Sentry:

- **production** - Live production environment
- **staging** - Pre-production environment
- **development** - Local development

Configure in Sentry: **Settings > Environments**

#### 4. Set Environment Variables

Add to Vercel environment variables:

```bash
# Production
NEXT_PUBLIC_SENTRY_DSN="https://[key]@[org].ingest.sentry.io/[project]"
SENTRY_ENVIRONMENT="production"
SENTRY_ORG="your-company"
SENTRY_PROJECT="project-2052-prod"
SENTRY_AUTH_TOKEN="[your-auth-token]"

# Staging
NEXT_PUBLIC_SENTRY_DSN="https://[key]@[org].ingest.sentry.io/[project]"
SENTRY_ENVIRONMENT="staging"
SENTRY_ORG="your-company"
SENTRY_PROJECT="project-2052-staging"
SENTRY_AUTH_TOKEN="[your-auth-token]"
```

#### 5. Generate Auth Token

1. Go to **Settings > Account > Auth Tokens**
2. Click "Create New Token"
3. Scopes: `project:releases`, `org:read`
4. Copy token and add to Vercel

### Features Enabled

#### Client-Side Monitoring

- **Error Tracking:** Unhandled exceptions
- **Performance Monitoring:** Page load times, API calls
- **Session Replay:** 10% of sessions, 100% with errors
- **Breadcrumbs:** User actions leading to errors

#### Server-Side Monitoring

- **API Error Tracking:** Failed API requests
- **Database Query Tracking:** Slow queries via Prisma integration
- **Performance Profiling:** 10% of transactions
- **Request Context:** Headers, query params (sanitized)

### Error Filtering

Configured to ignore:

- Browser extension errors
- ResizeObserver errors
- CORS errors from external domains
- Known harmless errors

### Alerts Configuration

#### Critical Alerts

**Trigger:** New issue detected OR error spike (10+ errors in 5 minutes)

**Actions:**
- Send to Slack channel: `#production-alerts`
- Email on-call engineer
- Create PagerDuty incident (if configured)

**Example Configuration:**

1. Go to **Alerts > Create Alert**
2. Metric: **Error count**
3. Threshold: **10 errors in 5 minutes**
4. Environment: **production**
5. Actions: **Slack notification + Email**

#### Warning Alerts

**Trigger:** Error rate increase (50% above baseline)

**Actions:**
- Send to Slack channel: `#monitoring`
- Email dev team

#### Info Alerts

**Trigger:** New error type detected

**Actions:**
- Send to Slack channel: `#sentry-updates`

### Dashboard Widgets

Create custom dashboard in Sentry:

1. **Error Rate Over Time** - Line chart
2. **Most Frequent Errors** - Table
3. **Errors by Release** - Bar chart
4. **Affected Users** - Number
5. **Response Time (p95)** - Line chart

### Best Practices

1. **Tag Everything:**
   ```typescript
   Sentry.setTag('feature', 'proposals');
   Sentry.setTag('user_role', 'admin');
   ```

2. **Add Context:**
   ```typescript
   Sentry.setContext('proposal', {
     id: proposalId,
     status: 'draft',
   });
   ```

3. **Capture User Feedback:**
   ```typescript
   Sentry.captureUserFeedback({
     event_id: errorEventId,
     email: user.email,
     comments: 'What happened',
   });
   ```

4. **Manual Error Capture:**
   ```typescript
   try {
     // risky operation
   } catch (error) {
     Sentry.captureException(error, {
       level: 'error',
       tags: { feature: 'calculation' },
     });
   }
   ```

## Vercel Analytics

### Features

#### Web Vitals

Automatically tracks Core Web Vitals:

- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)
- **FCP** (First Contentful Paint)

#### Traffic Analytics

- Page views
- Unique visitors
- Top pages
- Traffic sources
- Geographic distribution

#### Speed Insights

- Performance scores per page
- Recommendations for optimization
- Historical trends

### Setup

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Analytics** tab
4. Click **Enable Analytics**
5. Upgrade to Pro plan if needed (recommended)

No code changes needed - automatically integrated!

### Custom Events (Optional)

Track custom events:

```typescript
import { track } from '@vercel/analytics';

// Track custom event
track('proposal_created', {
  category: 'engagement',
  label: proposalId,
});

// Track conversion
track('proposal_submitted', {
  value: 1,
});
```

Install package (if using custom events):

```bash
pnpm add @vercel/analytics
```

Add to `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Vercel Logs

Access logs in Vercel Dashboard:

1. Go to **Deployments**
2. Click on a deployment
3. Navigate to **Functions** tab
4. View logs for each serverless function

**Log Retention:**
- Hobby plan: 1 hour
- Pro plan: 1 day
- Enterprise: 30 days

**Tip:** Use Sentry for long-term log retention and analysis.

## Uptime Monitoring

### UptimeRobot Setup (Recommended)

#### 1. Create Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Verify email

#### 2. Create Monitors

**Production Health Check:**

```
Monitor Type: HTTP(s)
Friendly Name: Project 2052 - Production Health
URL: https://project-2052.vercel.app/healthz
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET
Alert When: Down / Response time > 2000ms
```

**API Endpoint Check:**

```
Monitor Type: HTTP(s)
Friendly Name: Project 2052 - API Health
URL: https://project-2052.vercel.app/api/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET
Alert When: Down / Response time > 2000ms
```

**Database Connectivity:**

```
Monitor Type: HTTP(s)
Friendly Name: Project 2052 - Database
URL: https://project-2052.vercel.app/api/health
Monitoring Interval: 10 minutes
Monitor Timeout: 30 seconds
Keyword Check: "ok" (in response body)
```

**Staging Environment:**

```
Monitor Type: HTTP(s)
Friendly Name: Project 2052 - Staging
URL: https://project-2052-staging.vercel.app/healthz
Monitoring Interval: 10 minutes
Monitor Timeout: 30 seconds
```

#### 3. Configure Alerts

**Alert Contacts:**

1. Go to **My Settings > Alert Contacts**
2. Add alert contacts:
   - Email: `ops-team@your-company.com`
   - Slack: Connect Slack webhook
   - SMS: Add phone number (optional)

**Alert Timing:**

- Send alert: **Immediately** when monitor goes down
- Send "up" notification: **When back up**
- Email me if: **First down / every down**

#### 4. Create Status Page (Optional)

1. Go to **Public Status Pages**
2. Click **Add New Public Status Page**
3. Select monitors to display
4. Customize branding
5. Publish at custom subdomain: `status.your-domain.com`

### Better Uptime (Alternative)

Premium alternative with more features:

**Features:**
- Incident management
- On-call schedules
- Heartbeat monitoring
- SSL certificate monitoring
- Domain expiration alerts
- Status pages

**Pricing:** $18/month

**Setup:** Similar to UptimeRobot but with advanced options

## Performance Monitoring

### Key Metrics to Track

#### Frontend Performance

```typescript
// Track custom performance metrics
if (typeof window !== 'undefined' && window.performance) {
  const navigation = performance.getEntriesByType('navigation')[0];

  console.log('Page Load Metrics:', {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    domInteractive: navigation.domInteractive,
  });
}
```

#### API Performance

Monitor in Sentry or create custom logging:

```typescript
// src/lib/monitoring/performance.ts
export async function trackAPIPerformance<T>(
  endpoint: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API error: ${endpoint} failed after ${duration}ms`, error);
    throw error;
  }
}
```

#### Database Performance

Prisma automatically logs slow queries:

```typescript
// prisma.config.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn('Slow query:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

### Performance Budgets

Set performance budgets in `next.config.ts`:

```typescript
const nextConfig = {
  // Performance budgets
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Warn if bundle exceeds 500KB
      config.performance = {
        maxAssetSize: 500000,
        maxEntrypointSize: 500000,
        hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      };
    }
    return config;
  },
};
```

## Alerting & Notifications

### Alert Channels

#### Slack Integration

**Setup:**

1. Create Slack app or use webhook
2. Generate webhook URL
3. Add to Vercel secrets: `SLACK_WEBHOOK_URL`
4. Configure in alert systems

**Channels:**
- `#production-alerts` - Critical production issues
- `#monitoring` - Warnings and info
- `#deployments` - Deployment notifications
- `#sentry-updates` - New error types

#### Email Alerts

Configure email groups:

- **Critical:** `oncall@your-company.com`
- **Warning:** `dev-team@your-company.com`
- **Info:** `dev-notifications@your-company.com`

#### PagerDuty (Optional)

For enterprise-grade incident management:

1. Create PagerDuty account
2. Set up escalation policies
3. Configure on-call schedules
4. Integrate with Sentry and UptimeRobot

### Alert Routing Matrix

| Severity | Condition | Slack | Email | PagerDuty | SMS |
|----------|-----------|-------|-------|-----------|-----|
| **Critical** | Production down | ✅ | ✅ | ✅ | ✅ |
| **Critical** | Error rate > 1% | ✅ | ✅ | ✅ | ❌ |
| **Critical** | Database down | ✅ | ✅ | ✅ | ✅ |
| **Warning** | Slow response time | ✅ | ✅ | ❌ | ❌ |
| **Warning** | Error rate > 0.1% | ✅ | ✅ | ❌ | ❌ |
| **Warning** | High memory usage | ✅ | ❌ | ❌ | ❌ |
| **Info** | New deployment | ✅ | ❌ | ❌ | ❌ |
| **Info** | New error type | ✅ | ❌ | ❌ | ❌ |

## Dashboards

### Sentry Dashboard

**Widgets to add:**

1. Error rate over time (7 days)
2. Most frequent errors (top 10)
3. Errors by release
4. Affected users
5. Response time (p50, p95, p99)
6. Transaction volume
7. Database query time

### Custom Grafana Dashboard (Optional)

For advanced visualization:

```yaml
# Example metrics to track
metrics:
  - name: api_response_time
    type: histogram
    labels: [endpoint, method, status]

  - name: database_query_time
    type: histogram
    labels: [table, operation]

  - name: error_rate
    type: counter
    labels: [type, severity]

  - name: active_users
    type: gauge
```

### Monitoring Dashboard Checklist

Create a bookmark folder with quick links:

- [ ] Vercel Dashboard: `https://vercel.com/dashboard`
- [ ] Sentry Dashboard: `https://sentry.io/organizations/[org]/issues/`
- [ ] UptimeRobot: `https://uptimerobot.com/dashboard`
- [ ] Supabase Dashboard: `https://app.supabase.com/project/[project]/editor`
- [ ] GitHub Actions: `https://github.com/[org]/[repo]/actions`

## Incident Response

### Incident Severity Levels

#### P0 - Critical

**Definition:** Production completely down or major functionality unavailable

**Examples:**
- Site returns 500 errors
- Database unavailable
- Cannot access any pages

**Response Time:** < 15 minutes
**Communication:** Immediate notification to all stakeholders

#### P1 - High

**Definition:** Significant degradation affecting many users

**Examples:**
- Slow response times (> 5s)
- High error rate (> 1%)
- Core feature broken

**Response Time:** < 1 hour
**Communication:** Notify dev team and stakeholders

#### P2 - Medium

**Definition:** Minor issues affecting some users

**Examples:**
- Non-critical feature broken
- UI bug
- Slow but functional

**Response Time:** < 4 hours
**Communication:** Create ticket, notify dev team

#### P3 - Low

**Definition:** Cosmetic issues, minor bugs

**Examples:**
- Typos
- Minor UI inconsistencies
- Enhancement requests

**Response Time:** Next sprint
**Communication:** Create ticket

### Incident Response Process

```
┌──────────────────┐
│ Alert Triggered  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Acknowledge    │ ← Acknowledge in 5 minutes
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Investigate   │ ← Assess severity
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Create Incident │ ← Document in incident log
│    Document      │
└────────┬─────────┘
         │
         ├─────────────┬─────────────┐
         ▼             ▼             ▼
    ┌────────┐   ┌────────┐   ┌────────┐
    │Rollback│   │  Fix   │   │ Scale  │
    └────┬───┘   └───┬────┘   └───┬────┘
         │           │            │
         └───────────┴────────────┘
                     │
                     ▼
            ┌──────────────┐
            │   Resolve    │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │   Monitor    │ ← Monitor for 1 hour
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ Post-Mortem  │ ← Within 24 hours
            └──────────────┘
```

## Runbooks

### Common Scenarios

#### High Error Rate

**Symptoms:** Sentry alert for high error rate

**Investigation:**
1. Check Sentry dashboard for error details
2. Identify affected endpoints
3. Check recent deployments
4. Review error messages and stack traces

**Resolution:**
```bash
# Option 1: Rollback
vercel rollback

# Option 2: Fix and deploy
# Make fix
git commit -m "fix: resolve high error rate"
git push
# Wait for deployment

# Verify
curl https://project-2052.vercel.app/healthz
```

#### Slow Response Times

**Symptoms:** UptimeRobot alert for slow response

**Investigation:**
1. Check Vercel function logs
2. Review database query times
3. Check Supabase connection pooling
4. Review recent code changes

**Resolution:**
- Optimize slow database queries
- Increase connection pool size
- Add caching where appropriate
- Scale database if needed

#### Database Connection Errors

**Symptoms:** Health check fails, database errors in Sentry

**Investigation:**
1. Check Supabase dashboard
2. Verify connection strings
3. Check connection pool status
4. Review recent migrations

**Resolution:**
```bash
# Verify connection from local
psql $DATABASE_URL

# Check Supabase status
# Visit Supabase dashboard

# Restart connection pool (if needed)
# Done automatically by Supabase
```

---

## Quick Reference

### Essential Commands

```bash
# Check production health
curl https://project-2052.vercel.app/healthz

# View recent deployments
vercel ls

# Rollback to previous version
vercel rollback

# View logs
vercel logs project-2052 --prod

# View Sentry errors
open https://sentry.io/organizations/[org]/issues/

# Check uptime status
open https://uptimerobot.com/dashboard
```

### Emergency Contacts

- **DevOps Lead:** [Name] - [Email] - [Phone]
- **Engineering Lead:** [Name] - [Email] - [Phone]
- **On-Call Rotation:** Check PagerDuty schedule
- **Vercel Support:** support@vercel.com
- **Supabase Support:** support@supabase.com

---

Last Updated: 2025-11-24
Version: 1.0.0
Maintained By: DevOps Team
