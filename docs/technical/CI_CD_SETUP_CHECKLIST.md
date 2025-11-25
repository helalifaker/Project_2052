# CI/CD Setup Checklist

Complete checklist for setting up CI/CD infrastructure for Project 2052.

## Pre-Setup Requirements

- [ ] Admin access to GitHub repository
- [ ] Admin access to Vercel account
- [ ] Sentry account created
- [ ] UptimeRobot account created (optional)
- [ ] Slack workspace access (for notifications)

## Part 1: Vercel Setup (30 minutes)

### Create Vercel Project

- [ ] Log in to [Vercel](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Configure build settings:
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Build Command: `pnpm build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `pnpm install`

### Configure Environments

- [ ] Set production branch to `main`
- [ ] Add preview branch: `staging`
- [ ] Add preview branch: `develop`
- [ ] Enable automatic deployments for all branches

### Environment Variables - Production

Add these variables to **Production** environment:

#### Database
- [ ] `DATABASE_URL` - Supabase pooled connection string
- [ ] `DIRECT_URL` - Supabase direct connection string

#### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Sentry (Optional but Recommended)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry project DSN
- [ ] `SENTRY_ENVIRONMENT` - Set to "production"
- [ ] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Set to "production"
- [ ] `SENTRY_ORG` - Your Sentry organization slug
- [ ] `SENTRY_PROJECT` - Sentry project name
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token

#### Application
- [ ] `NODE_ENV` - Set to "production"
- [ ] `NEXT_PUBLIC_APP_VERSION` - Current version (e.g., "1.0.0")

### Environment Variables - Staging

Copy all production variables but use staging values:

- [ ] Use staging database connection strings
- [ ] Use staging Supabase project
- [ ] Use staging Sentry project (or same as prod)
- [ ] Set `SENTRY_ENVIRONMENT` to "staging"

### Custom Domains (Optional)

- [ ] Add production domain: `your-domain.com`
- [ ] Add staging domain: `staging.your-domain.com`
- [ ] Configure DNS records as instructed
- [ ] Wait for SSL certificate provisioning

### Verify Vercel Setup

- [ ] Test deployment: Push to `main` branch
- [ ] Verify deployment succeeds
- [ ] Visit deployed URL
- [ ] Check all pages load correctly
- [ ] Verify database connection works

**Time: ~30 minutes**

---

## Part 2: GitHub Actions Setup (15 minutes)

### Configure GitHub Secrets

Go to **Repository Settings > Secrets and variables > Actions**

#### Required Secrets

- [ ] `VERCEL_TOKEN` - Vercel deploy token
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID

#### Optional Secrets

- [ ] `CODECOV_TOKEN` - For coverage reports
- [ ] `SLACK_WEBHOOK_URL` - For deployment notifications
- [ ] `SENTRY_AUTH_TOKEN` - For source map uploads (if different from Vercel)

### Setup Production Environment

1. Go to **Settings > Environments**
2. Create environment: `production`
3. Configure protection rules:
   - [ ] Add required reviewers (team lead)
   - [ ] Select deployment branches: `main` only
   - [ ] Optional: Add wait timer (5 minutes)

### Verify CI Workflow

- [ ] Navigate to **Actions** tab
- [ ] Locate "CI Pipeline" workflow
- [ ] Check workflow is enabled
- [ ] Review workflow configuration in `.github/workflows/ci.yml`

### Test CI Pipeline

- [ ] Create a test branch
- [ ] Make a small change
- [ ] Push to GitHub
- [ ] Create Pull Request
- [ ] Verify CI runs automatically
- [ ] Check all jobs pass (lint, build, tests, E2E)

### Verify CD Workflow

- [ ] Review workflow configuration in `.github/workflows/cd.yml`
- [ ] Workflow should be ready (will trigger on push to `main`)
- [ ] Don't test yet - wait for Sentry setup

**Time: ~15 minutes**

---

## Part 3: Sentry Setup (45 minutes)

Follow the detailed guide: [SENTRY_SETUP.md](./SENTRY_SETUP.md)

### Create Sentry Account

- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Create organization
- [ ] Select plan (Developer/Team)

### Create Projects

- [ ] Create production project: `project-2052-prod`
- [ ] Copy production DSN
- [ ] Create staging project: `project-2052-staging`
- [ ] Copy staging DSN

### Configure Environments

For each project:

- [ ] Add environment: `production`
- [ ] Add environment: `staging`
- [ ] Add environment: `development`

### Generate Auth Token

- [ ] Go to **Settings > Auth Tokens**
- [ ] Create token with required scopes
- [ ] Copy token immediately
- [ ] Save token securely

### Add to Vercel Environment Variables

Production:

- [ ] Add `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Add `SENTRY_ENVIRONMENT`
- [ ] Add `SENTRY_ORG`
- [ ] Add `SENTRY_PROJECT`
- [ ] Add `SENTRY_AUTH_TOKEN`

Staging:

- [ ] Add same variables with staging values

### Configure Alerts

- [ ] Set up email alerts
- [ ] Configure Slack integration (optional)
- [ ] Create alert rule: Critical errors
- [ ] Create alert rule: New issues
- [ ] Create alert rule: High error rate

### Test Sentry Integration

- [ ] Deploy to staging
- [ ] Trigger a test error
- [ ] Verify error appears in Sentry
- [ ] Check alert is triggered
- [ ] Verify source maps work (readable stack traces)

**Time: ~45 minutes**

---

## Part 4: Uptime Monitoring Setup (20 minutes)

### UptimeRobot Setup

- [ ] Sign up at [uptimerobot.com](https://uptimerobot.com)
- [ ] Verify email

### Create Monitors

Production Health Check:

- [ ] Monitor type: HTTP(s)
- [ ] Name: "Project 2052 - Production Health"
- [ ] URL: `https://your-domain.com/healthz`
- [ ] Interval: 5 minutes
- [ ] Alert when down

API Health Check:

- [ ] Monitor type: HTTP(s)
- [ ] Name: "Project 2052 - API Health"
- [ ] URL: `https://your-domain.com/api/health`
- [ ] Interval: 5 minutes
- [ ] Keyword check: "ok"

Staging Health Check:

- [ ] Monitor type: HTTP(s)
- [ ] Name: "Project 2052 - Staging"
- [ ] URL: `https://staging.your-domain.com/healthz`
- [ ] Interval: 10 minutes

### Configure Alert Contacts

- [ ] Add email: Operations team
- [ ] Add Slack (optional)
- [ ] Add SMS (optional)
- [ ] Set alert timing: Immediate

### Create Status Page (Optional)

- [ ] Go to **Public Status Pages**
- [ ] Create new status page
- [ ] Add monitors
- [ ] Customize branding
- [ ] Publish at: `status.your-domain.com`

### Test Uptime Monitoring

- [ ] Pause a monitor manually
- [ ] Verify alert is sent
- [ ] Resume monitor
- [ ] Verify "up" notification

**Time: ~20 minutes**

---

## Part 5: Monitoring Dashboard Setup (30 minutes)

### Sentry Dashboard

- [ ] Create custom dashboard: "Production Overview"
- [ ] Add widget: Error rate over time
- [ ] Add widget: Most common errors
- [ ] Add widget: Affected users
- [ ] Add widget: Response time (p95)
- [ ] Add widget: Errors by release
- [ ] Bookmark dashboard URL

### Vercel Analytics

- [ ] Navigate to project in Vercel
- [ ] Go to **Analytics** tab
- [ ] Enable Web Analytics
- [ ] Enable Speed Insights (Pro plan)
- [ ] Review initial data
- [ ] Bookmark analytics URL

### Create Monitoring Bookmarks Folder

Create browser bookmarks for quick access:

- [ ] Vercel Dashboard
- [ ] Sentry Dashboard
- [ ] UptimeRobot Dashboard
- [ ] Supabase Dashboard
- [ ] GitHub Actions

**Time: ~30 minutes**

---

## Part 6: Slack Integration (20 minutes)

### Create Slack Channels

- [ ] Create channel: `#production-alerts`
- [ ] Create channel: `#deployments`
- [ ] Create channel: `#monitoring`
- [ ] Create channel: `#sentry-updates`

### Configure Integrations

Sentry:

- [ ] Go to Sentry > **Settings > Integrations**
- [ ] Install Slack integration
- [ ] Connect to `#production-alerts`
- [ ] Test notification

GitHub:

- [ ] Go to Slack > **Apps**
- [ ] Install GitHub app
- [ ] Connect to repository
- [ ] Subscribe to `#deployments`
- [ ] Test notification

UptimeRobot:

- [ ] Go to UptimeRobot > **My Settings > Alert Contacts**
- [ ] Add Slack webhook
- [ ] Test notification

**Time: ~20 minutes**

---

## Part 7: Documentation & Runbooks (15 minutes)

### Review Documentation

- [ ] Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [ ] Read [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
- [ ] Read [SENTRY_SETUP.md](./SENTRY_SETUP.md)
- [ ] Read [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)

### Create Team Documentation

- [ ] Add deployment guide to team wiki
- [ ] Document on-call rotation
- [ ] Create incident response runbook
- [ ] Document rollback procedures
- [ ] Share with team

### Schedule Regular Reviews

- [ ] Add calendar reminder: Weekly monitoring review
- [ ] Add calendar reminder: Monthly secret rotation check
- [ ] Add calendar reminder: Quarterly documentation update

**Time: ~15 minutes**

---

## Part 8: Final Testing (30 minutes)

### End-to-End Testing

#### Test CI Pipeline

- [ ] Create feature branch
- [ ] Make a change
- [ ] Create Pull Request
- [ ] Verify CI runs
- [ ] Check all jobs pass
- [ ] Verify status check on PR

#### Test Staging Deployment

- [ ] Merge PR to `develop`
- [ ] Verify automatic deployment to staging
- [ ] Check staging URL
- [ ] Test application functionality
- [ ] Verify monitoring works

#### Test Production Deployment

- [ ] Create PR from `develop` to `main`
- [ ] Get approval
- [ ] Merge to `main`
- [ ] CD pipeline triggers
- [ ] Approve production deployment
- [ ] Verify deployment succeeds
- [ ] Check smoke tests pass
- [ ] Visit production URL
- [ ] Test critical flows

### Test Monitoring

- [ ] Check Sentry for deployment
- [ ] Verify new release created
- [ ] Check UptimeRobot status
- [ ] Review Vercel Analytics
- [ ] Verify alerts work

### Test Rollback

- [ ] Go to Vercel > **Deployments**
- [ ] Find previous deployment
- [ ] Click **Promote to Production**
- [ ] Verify rollback works
- [ ] Re-deploy latest version

**Time: ~30 minutes**

---

## Part 9: Team Onboarding (15 minutes)

### Share Access

- [ ] Add team to GitHub repository
- [ ] Invite to Sentry projects
- [ ] Add to Slack channels
- [ ] Share Vercel project access
- [ ] Provide documentation links

### Training Session

- [ ] Schedule team meeting
- [ ] Demo CI/CD pipeline
- [ ] Show monitoring dashboards
- [ ] Explain incident response
- [ ] Q&A session

**Time: ~15 minutes**

---

## Total Time Estimate: ~3.5 hours

## Success Criteria

At the end of setup, verify:

- [ ] ✅ CI runs on every PR
- [ ] ✅ CD deploys to production on merge to `main`
- [ ] ✅ Monitoring is active (Sentry + UptimeRobot)
- [ ] ✅ Alerts are configured and tested
- [ ] ✅ Health check endpoint responds
- [ ] ✅ Documentation is complete
- [ ] ✅ Team has access and training
- [ ] ✅ Rollback procedure tested
- [ ] ✅ All environments working (dev, staging, prod)

## Troubleshooting Common Issues

### Issue: CI Pipeline Fails

**Check:**
- Node version matches (18+)
- Dependencies install correctly
- Environment variables are set (even dummy ones)
- Tests pass locally

### Issue: Deployment Fails

**Check:**
- Vercel token is valid
- Environment variables are set in Vercel
- Database is accessible
- Build completes locally

### Issue: Monitoring Not Working

**Check:**
- Sentry DSN is correct
- Health endpoint returns 200 OK
- UptimeRobot monitors are active
- Alerts are configured

### Issue: Alerts Not Received

**Check:**
- Email address is verified
- Slack integration is connected
- Alert rules are enabled
- Test notification works

## Post-Setup Tasks

### Week 1
- [ ] Monitor deployment frequency
- [ ] Review error rates
- [ ] Check alert noise
- [ ] Gather team feedback

### Week 2
- [ ] Adjust alert thresholds
- [ ] Review monitoring dashboards
- [ ] Optimize build times
- [ ] Update documentation

### Month 1
- [ ] Review quota usage (Sentry, Vercel)
- [ ] Rotate secrets
- [ ] Audit access
- [ ] Plan improvements

## Maintenance Schedule

### Daily
- Review critical errors in Sentry
- Check uptime status

### Weekly
- Review unresolved issues
- Check deployment metrics
- Update alert configurations

### Monthly
- Rotate secrets
- Review quota usage
- Update documentation
- Team retrospective

### Quarterly
- Audit access and permissions
- Review and update runbooks
- Evaluate monitoring tools
- Plan infrastructure improvements

---

## Getting Help

If you encounter issues during setup:

1. **Check documentation:**
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
   - [SENTRY_SETUP.md](./SENTRY_SETUP.md)

2. **Review logs:**
   - GitHub Actions logs
   - Vercel deployment logs
   - Sentry error logs

3. **Contact support:**
   - Vercel Support: support@vercel.com
   - Sentry Support: support@sentry.io
   - GitHub Support: support.github.com

4. **Team resources:**
   - Slack: `#devops-help`
   - Email: devops@your-company.com

---

Last Updated: 2025-11-24
Version: 1.0.0

**Next Steps After Completing Checklist:**
1. Mark all items as complete
2. Share with team
3. Begin regular operations
4. Continuous improvement
