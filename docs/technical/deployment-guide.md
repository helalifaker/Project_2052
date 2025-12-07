# Deployment Guide

This guide provides comprehensive instructions for deploying the Project 2052 Financial Modeling System to staging and production environments.

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Vercel Deployment](#vercel-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Error Tracking](#monitoring--error-tracking)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

### Architecture

- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, Vercel Analytics
- **Package Manager:** pnpm

### Environments

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| **Development** | `develop` | `https://project-2052-dev.vercel.app` | Development and testing |
| **Staging** | `staging` | `https://project-2052-staging.vercel.app` | Pre-production validation |
| **Production** | `main` | `https://project-2052.vercel.app` | Live production environment |

## Environment Setup

### Prerequisites

- Node.js 18.17 or later
- pnpm 9.x
- GitHub account with repository access
- Vercel account (Team plan recommended for production)
- Supabase account with projects for each environment

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/project-2052.git
   cd project-2052
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

4. **Run database migrations:**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

## Vercel Deployment

### Initial Setup

#### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

#### Step 2: Configure Environments

##### Production Environment

1. In Vercel Dashboard, go to **Settings > Git**
2. Set **Production Branch:** `main`
3. Enable **Automatic Deployments** for production branch

##### Staging Environment

1. Go to **Settings > Git**
2. Click **Add Branch**
3. Set **Branch Name:** `staging`
4. Select **Preview** deployment type
5. Enable automatic deployments

##### Development Environment

1. Go to **Settings > Git**
2. Click **Add Branch**
3. Set **Branch Name:** `develop`
4. Select **Preview** deployment type
5. Enable automatic deployments

#### Step 3: Custom Domains (Optional)

##### Production Domain

1. Go to **Settings > Domains**
2. Add your production domain: `your-domain.com`
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)

##### Staging Domain

1. Add staging subdomain: `staging.your-domain.com`
2. Configure DNS records
3. Wait for SSL certificate

### Vercel Configuration

The `vercel.json` file in the root directory provides:

- **Security Headers:** HSTS, X-Frame-Options, CSP
- **Caching Rules:** API routes set to no-cache
- **Health Check Rewrite:** `/healthz` → `/api/health`
- **Region:** Primary deployment region (IAD1 - Washington D.C.)

## Database Setup

### Supabase Configuration

#### Create Projects

Create separate Supabase projects for each environment:

1. **Production Database:**
   - Project name: `project-2052-prod`
   - Region: Choose closest to Vercel region
   - Plan: Pro (recommended for production)

2. **Staging Database:**
   - Project name: `project-2052-staging`
   - Region: Same as production
   - Plan: Free/Pro

3. **Development Database:**
   - Project name: `project-2052-dev`
   - Region: Same as production
   - Plan: Free

#### Connection Pooling

For each Supabase project:

1. Go to **Settings > Database**
2. Under **Connection Pooling**, enable pooling
3. Use **Transaction mode** for Prisma
4. Copy both connection strings:
   - **Pooled Connection:** For `DATABASE_URL`
   - **Direct Connection:** For `DIRECT_URL`

#### Run Migrations

```bash
# Set environment variables
export DATABASE_URL="your-supabase-pooled-connection"
export DIRECT_URL="your-supabase-direct-connection"

# Run migrations
pnpm prisma migrate deploy

# Seed database (optional, for non-production)
pnpm prisma db seed
```

## Environment Variables

### Required Variables

Configure these in Vercel for each environment:

#### Database

```bash
# Supabase pooled connection (for queries)
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"

# Supabase direct connection (for migrations)
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

#### Supabase (Client-Side)

```bash
# Public API URL
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"

# Anonymous/Public Key (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

#### Authentication (if using NextAuth)

```bash
# Secret for JWT signing (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"

# Canonical URL of your site
NEXTAUTH_URL="https://your-domain.com"
```

#### Monitoring

```bash
# Sentry DSN for error tracking
NEXT_PUBLIC_SENTRY_DSN="https://[key]@[org].ingest.sentry.io/[project]"

# Sentry environment
SENTRY_ENVIRONMENT="production" # or "staging", "development"

# Auth token for release tracking
SENTRY_AUTH_TOKEN="your-auth-token"
```

#### Application Settings

```bash
# Node environment
NODE_ENV="production" # or "staging", "development"

# Log level
LOG_LEVEL="info" # "debug" for non-production

# Enable verbose logging (staging/dev only)
VERBOSE_LOGGING="false" # "true" for debugging
```

### Setting Environment Variables in Vercel

#### Via Dashboard

1. Go to **Settings > Environment Variables**
2. Add each variable:
   - **Name:** Variable name
   - **Value:** Variable value
   - **Environments:** Select Production, Preview, or Development
3. Click **Save**

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set production variable
vercel env add DATABASE_URL production

# Set preview/staging variable
vercel env add DATABASE_URL preview

# Pull environment variables for local development
vercel env pull .env.local
```

### Environment Variable Checklist

Use this checklist when setting up a new environment:

- [ ] `DATABASE_URL` (Supabase pooled connection)
- [ ] `DIRECT_URL` (Supabase direct connection)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXTAUTH_SECRET` (if using authentication)
- [ ] `NEXTAUTH_URL` (canonical URL)
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_ENVIRONMENT`
- [ ] `SENTRY_AUTH_TOKEN` (for release tracking)
- [ ] `NODE_ENV`

## CI/CD Pipeline

### GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Pull requests to `develop` or `main`
- Pushes to `develop`

**Jobs:**
1. **Lint & Build:**
   - Checkout code
   - Setup pnpm and Node.js
   - Install dependencies
   - Run ESLint
   - Build application
   - Run unit tests with coverage
   - Upload coverage to Codecov

2. **E2E Tests:**
   - Install Playwright browsers
   - Run end-to-end tests
   - Upload test artifacts on failure

**Status Checks:**
- All jobs must pass before merging
- Minimum test coverage: 80%

#### CD Pipeline (`.github/workflows/cd.yml`)

**Triggers:**
- Pushes to `main` (production)
- Manual workflow dispatch

**Jobs:**
1. **Deploy to Production:**
   - Requires manual approval
   - Runs CI checks
   - Deploys to Vercel
   - Waits for deployment ready
   - Runs smoke tests
   - Notifies on success/failure

**Manual Approval:**
- Production deployments require approval from designated approvers
- Configure in **Settings > Environments > production**

### Deployment Process

#### Automatic Deployments (Preview)

1. Create a feature branch from `develop`
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request to `develop`
5. CI runs automatically
6. Vercel creates preview deployment
7. Review changes in preview URL
8. Merge when ready

#### Staging Deployment

1. Merge feature branch to `develop`
2. CI runs on `develop`
3. Vercel automatically deploys to staging
4. Run integration tests
5. Validate changes

#### Production Deployment

1. Create PR from `develop` to `main`
2. Review all changes carefully
3. Ensure all CI checks pass
4. Get approval from team lead
5. Merge to `main`
6. CD pipeline triggers
7. Manual approval required
8. Deployment executes
9. Smoke tests run
10. Monitor for issues

### Smoke Tests

After deployment, automated smoke tests verify:

- [ ] Health check endpoint responds (200 OK)
- [ ] Database connectivity works
- [ ] API endpoints respond correctly
- [ ] Static assets load
- [ ] Authentication flow works (if applicable)

## Monitoring & Error Tracking

### Sentry Setup

Sentry provides real-time error tracking and performance monitoring.

#### Configuration

1. **Create Sentry Project:**
   - Go to [Sentry.io](https://sentry.io)
   - Create new project: "project-2052"
   - Platform: Next.js
   - Copy DSN

2. **Configure Environments:**
   - Create separate environments for prod/staging/dev
   - Set up release tracking
   - Configure alerts

3. **Error Tracking:**
   - All unhandled errors are automatically captured
   - Custom error boundaries for graceful degradation
   - Performance transaction sampling: 10%

4. **Alerts:**
   - **Critical:** More than 10 errors in 5 minutes
   - **Warning:** Error rate increases by 50%
   - **Info:** New error type detected

#### Sentry Integration

The application automatically:
- Captures JavaScript errors
- Tracks performance metrics
- Associates errors with releases
- Captures user context (if authenticated)

### Vercel Analytics

#### Features

- **Web Vitals:** LCP, FID, CLS, TTFB, FCP
- **Page Views:** Traffic patterns and popular pages
- **Speed Insights:** Performance scores
- **Audience:** Geographic distribution

#### Setup

1. Enable in Vercel Dashboard:
   - Go to **Analytics** tab
   - Enable "Web Analytics"
   - Enable "Speed Insights"

2. No code changes needed - automatically integrated

### Uptime Monitoring

#### Recommended Services

**Option 1: Vercel Monitoring (Built-in)**
- Automatic health checks
- Incident notifications
- Status page

**Option 2: UptimeRobot**
- Free for up to 50 monitors
- 5-minute check intervals
- Multiple notification channels

**Option 3: Better Uptime**
- More advanced monitoring
- Incident management
- Status pages

#### Setup UptimeRobot (Recommended)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create new monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-domain.com/healthz`
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Email, Slack, SMS
3. Configure alerts:
   - Down: Immediate notification
   - Response time > 2000ms: Warning
4. Create status page (optional):
   - Public status page for users
   - Subscribe to updates

### Key Metrics to Monitor

#### Performance

- **Response Time (p50):** < 200ms
- **Response Time (p95):** < 500ms
- **Response Time (p99):** < 1000ms
- **Error Rate:** < 0.1%
- **Uptime:** > 99.9%

#### Application

- **Database Query Time:** < 100ms average
- **API Response Time:** < 300ms
- **Build Time:** < 3 minutes
- **Cold Start Time:** < 500ms

#### User Experience

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

### Alert Configuration

#### Critical Alerts (Immediate Response Required)

- **Production Down:** Uptime check fails
- **High Error Rate:** > 10 errors/minute
- **Database Connection Lost:** Unable to connect
- **Build Failure:** Production build fails

**Notification Channels:**
- Slack: `#production-alerts`
- Email: On-call team
- SMS: Critical incidents only

#### Warning Alerts (Monitor Closely)

- **Slow Response Times:** p95 > 1000ms
- **Increased Error Rate:** 50% increase
- **High CPU Usage:** > 80% sustained
- **High Memory Usage:** > 90% sustained

**Notification Channels:**
- Slack: `#monitoring`
- Email: Dev team

#### Info Alerts (Informational)

- **Deployment Success:** New release deployed
- **New Error Type:** Previously unseen error
- **Traffic Spike:** 2x normal traffic
- **Cache Miss Rate Increase:** > 50%

**Notification Channels:**
- Slack: `#deployments`

## Rollback Procedures

### Vercel Instant Rollback

#### Via Dashboard

1. Go to **Deployments** tab
2. Find the last known good deployment
3. Click "..." menu
4. Select **Promote to Production**
5. Confirm rollback
6. Verify health checks pass

**Time to rollback:** < 2 minutes

#### Via CLI

```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote [deployment-url]

# Or rollback to previous
vercel rollback
```

### Database Rollback

**Important:** Database migrations cannot be automatically rolled back.

#### Safe Migration Strategy

1. **Always use additive changes:** Add new columns/tables instead of modifying
2. **Multi-step migrations:** Deploy code that works with both old and new schema
3. **Backup before migration:** Take snapshot before deploying

#### Manual Rollback Process

```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Revert migration
pnpm prisma migrate resolve --rolled-back [migration-name]

# 3. Deploy rollback migration
pnpm prisma migrate deploy

# 4. Verify database state
pnpm prisma studio
```

### Rollback Decision Tree

```
Issue Detected
    │
    ├─ Frontend only?
    │   └─ Vercel instant rollback (< 2 min)
    │
    ├─ API issue (no DB changes)?
    │   └─ Vercel instant rollback (< 2 min)
    │
    ├─ Database migration issue?
    │   ├─ Is data corrupted?
    │   │   ├─ Yes → Restore from backup (30+ min)
    │   │   └─ No → Deploy fix-forward migration (10 min)
    │   └─ Deploy fix immediately
    │
    └─ Configuration issue?
        └─ Update env vars + redeploy (5 min)
```

### Incident Response Checklist

When an issue is detected:

- [ ] **Assess severity:** Critical, high, medium, low
- [ ] **Notify stakeholders:** Post in incident channel
- [ ] **Create incident document:** Track actions taken
- [ ] **Determine root cause:** Quick investigation
- [ ] **Decide: Rollback vs. Fix-forward**
- [ ] **Execute rollback/fix**
- [ ] **Verify resolution:** Run smoke tests
- [ ] **Monitor closely:** 1 hour post-resolution
- [ ] **Post-mortem:** Document learnings (24 hours)

## Troubleshooting

### Common Issues

#### Build Failures

**Issue:** Build fails with "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm build
```

**Issue:** Build fails with "Out of memory"

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

In Vercel, this is handled automatically.

#### Database Connection Issues

**Issue:** "Unable to connect to database"

**Checklist:**
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check Supabase project is not paused
- [ ] Verify IP allowlist settings (allow all for Vercel)
- [ ] Test connection from local machine
- [ ] Check Supabase status page

**Issue:** "Too many connections"

**Solution:**
- Increase connection pool size in Supabase
- Use connection pooling (pgBouncer)
- Verify `DATABASE_URL` uses pooled connection (port 6543)

#### Deployment Failures

**Issue:** Vercel deployment times out

**Solution:**
- Check build logs for specific error
- Verify all environment variables are set
- Check for circular dependencies
- Reduce build complexity

**Issue:** Deployment succeeds but app doesn't work

**Checklist:**
- [ ] Check browser console for errors
- [ ] Verify API endpoints return 200 OK
- [ ] Check Sentry for runtime errors
- [ ] Verify environment variables are correct
- [ ] Test database connectivity

#### Performance Issues

**Issue:** Slow page loads

**Troubleshooting:**
1. Check Vercel Analytics for bottlenecks
2. Review database query performance
3. Check for large bundle sizes
4. Verify CDN is working
5. Check for slow API endpoints

**Issue:** High memory usage

**Troubleshooting:**
1. Check for memory leaks in code
2. Review large data structures
3. Verify cleanup in useEffect hooks
4. Check for unclosed connections

### Support Resources

#### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

#### Internal Resources

- **Wiki:** [Internal project wiki]
- **Runbooks:** `/docs/runbooks/`
- **Architecture Docs:** `/docs/architecture/`
- **API Docs:** `/docs/api/`

#### Getting Help

- **Slack Channels:**
  - `#project-2052-dev` - Development discussions
  - `#production-alerts` - Production incidents
  - `#monitoring` - Monitoring and performance

- **On-Call Rotation:** Check PagerDuty schedule

---

## Deployment Checklist

Use this checklist for each production deployment:

### Pre-Deployment

- [ ] All tests pass (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] Database migrations tested in staging
- [ ] Environment variables verified
- [ ] Breaking changes documented
- [ ] Rollback plan prepared
- [ ] Stakeholders notified of deployment window

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests in staging
- [ ] Merge to main branch
- [ ] Wait for CI to pass
- [ ] Approve production deployment
- [ ] Monitor deployment progress
- [ ] Verify deployment completes successfully

### Post-Deployment

- [ ] Run smoke tests in production
- [ ] Verify health check responds
- [ ] Check error rates in Sentry
- [ ] Monitor response times
- [ ] Verify key user flows work
- [ ] Monitor for 30 minutes
- [ ] Update deployment log
- [ ] Notify stakeholders of completion

### Post-Mortem (If Issues Occurred)

- [ ] Document timeline of events
- [ ] Identify root cause
- [ ] Document resolution steps
- [ ] Create tickets for preventive measures
- [ ] Share learnings with team
- [ ] Update runbooks as needed

---

## Maintenance Windows

For planned maintenance requiring downtime:

1. **Schedule:** Choose low-traffic window (typically early AM UTC)
2. **Notice:** Notify users 48-72 hours in advance
3. **Status Page:** Update status page with maintenance window
4. **Monitoring:** Disable alerts during window
5. **Testing:** Test all changes in staging first
6. **Rollback:** Have rollback plan ready
7. **Communication:** Update users when complete

---

Last Updated: 2025-11-24
Version: 1.0.0
Maintained By: DevOps Team
