# CI/CD Quick Start Guide

Get your CI/CD pipeline running in 10 minutes!

## Prerequisites

- Admin access to GitHub repository ✅
- Vercel account (create at vercel.com)
- 10 minutes of your time

## Step 1: Vercel Setup (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click "Deploy" (accept defaults)
4. Wait for deployment to complete
5. Note your deployment URL

## Step 2: Add Environment Variables (3 minutes)

In Vercel Dashboard > Settings > Environment Variables, add:

```bash
# Required - Get from Supabase dashboard
DATABASE_URL=your-supabase-pooled-connection
DIRECT_URL=your-supabase-direct-connection
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional - For monitoring (skip for now)
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

Click "Save" for each variable.

## Step 3: GitHub Secrets (2 minutes)

Get Vercel tokens:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd your-project
vercel link

# Get IDs
cat .vercel/project.json
```

Add to GitHub > Settings > Secrets > Actions:

1. `VERCEL_TOKEN` - From Vercel Dashboard > Settings > Tokens
2. `VERCEL_ORG_ID` - From `.vercel/project.json`
3. `VERCEL_PROJECT_ID` - From `.vercel/project.json`

## Step 4: Test It! (2 minutes)

```bash
# Create test branch
git checkout -b test-ci-cd

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD setup"
git push -u origin test-ci-cd

# Create PR on GitHub
```

Watch the CI pipeline run in GitHub Actions tab!

## Done! 🎉

Your CI/CD is now active:

- ✅ CI runs on every PR
- ✅ Tests run automatically
- ✅ Deploys to Vercel on merge

## What's Next?

For full monitoring and error tracking:

1. **Set up Sentry** (optional but recommended)
   - See: `docs/technical/SENTRY_SETUP.md`
   - Time: 30 minutes

2. **Set up Uptime Monitoring** (optional)
   - See: `docs/technical/MONITORING_GUIDE.md`
   - Time: 10 minutes

3. **Review Full Documentation**
   - `docs/technical/DEPLOYMENT_GUIDE.md`
   - `docs/technical/CI_CD_SETUP_CHECKLIST.md`

## Getting Help

- 📖 Full docs: `/docs/technical/`
- 🐛 Issues: GitHub Issues
- 💬 Slack: `#devops-help`

## Common Issues

**CI fails with "secret not found"**
- Check GitHub Secrets are set correctly
- Names are case-sensitive

**Deploy fails**
- Check Vercel environment variables
- Verify database connection strings

**Tests fail**
- Run tests locally first: `pnpm test`
- Check test environment setup

---

That's it! You're now deploying like a pro! 🚀
