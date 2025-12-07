# GitHub Secrets Setup Guide

Complete guide for setting up GitHub Actions secrets required for CI/CD pipelines.

## Overview

GitHub Secrets store sensitive information needed by CI/CD workflows, such as API tokens, credentials, and keys.

## Required Secrets

### 1. VERCEL_TOKEN

**Purpose:** Deploy to Vercel from GitHub Actions

**How to obtain:**

1. Log in to [Vercel](https://vercel.com)
2. Click on your profile (bottom left)
3. Select **Settings**
4. Navigate to **Tokens**
5. Click **Create Token**
6. Token name: `github-actions-deployment`
7. Scope: **Full Account**
8. Expiration: **No expiration** (or set to 1 year and rotate)
9. Click **Create**
10. **Copy the token immediately** (you won't see it again)

**Add to GitHub:**

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Name: `VERCEL_TOKEN`
5. Value: Paste the token
6. Click **Add secret**

### 2. VERCEL_ORG_ID

**Purpose:** Identify your Vercel organization

**How to obtain:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
cd /path/to/your/project
vercel link

# Get org ID from .vercel/project.json
cat .vercel/project.json
```

The `orgId` field is your organization ID.

**Alternative method:**

1. Go to Vercel Dashboard
2. Select your team/organization
3. Go to **Settings > General**
4. Copy the **Team ID** (this is your org ID)

**Add to GitHub:**

Name: `VERCEL_ORG_ID`
Value: `team_xxxxxxxxxxxxxxxxxxxxx`

### 3. VERCEL_PROJECT_ID

**Purpose:** Identify your Vercel project

**How to obtain:**

From the same `.vercel/project.json` file:

```bash
cat .vercel/project.json
```

The `projectId` field is your project ID.

**Alternative method:**

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings > General**
4. Copy the **Project ID**

**Add to GitHub:**

Name: `VERCEL_PROJECT_ID`
Value: `prj_xxxxxxxxxxxxxxxxxxxxx`

### 4. CODECOV_TOKEN (Optional)

**Purpose:** Upload test coverage reports to Codecov

**How to obtain:**

1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the **Upload Token**

**Add to GitHub:**

Name: `CODECOV_TOKEN`
Value: Paste the token

**Note:** This is optional. CI will continue to work without it.

### 5. SENTRY_AUTH_TOKEN (Optional for CD)

**Purpose:** Upload source maps to Sentry during deployment

**How to obtain:**

See [SENTRY_SETUP.md](./SENTRY_SETUP.md) Step 4.

**Add to GitHub:**

Name: `SENTRY_AUTH_TOKEN`
Value: `sntrys_xxxxxxxxxxxxxxxxxxxxx`

**Note:** This is also set in Vercel. Setting it in GitHub allows CD pipeline to upload source maps.

### 6. SLACK_WEBHOOK_URL (Optional)

**Purpose:** Send deployment notifications to Slack

**How to obtain:**

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App**
3. Select **From scratch**
4. App name: `GitHub Deployments`
5. Select your workspace
6. Click **Create App**
7. Navigate to **Incoming Webhooks**
8. Toggle **Activate Incoming Webhooks** to On
9. Click **Add New Webhook to Workspace**
10. Select channel: `#deployments`
11. Click **Allow**
12. Copy the webhook URL

**Add to GitHub:**

Name: `SLACK_WEBHOOK_URL`
Value: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

## Environment-Specific Secrets

GitHub Actions supports environment-specific secrets for production, staging, etc.

### Setup Environments

1. Go to **Settings > Environments**
2. Click **New environment**
3. Name: `production`
4. Configure protection rules:
   - ✅ Required reviewers (add team members)
   - ✅ Wait timer: 5 minutes (optional)
   - ✅ Deployment branches: Only `main`
5. Click **Save protection rules**

Repeat for `staging` environment if needed.

### Add Environment Secrets

After creating environments:

1. Click on the environment name (e.g., `production`)
2. Click **Add secret**
3. Add environment-specific secrets if needed

**Example:** Different Vercel tokens for prod/staging

```
Production environment:
  VERCEL_TOKEN: [production-token]

Staging environment:
  VERCEL_TOKEN: [staging-token]
```

## Secrets Summary Table

| Secret Name | Required | Purpose | Where to Get |
|------------|----------|---------|--------------|
| `VERCEL_TOKEN` | ✅ Yes | Deploy to Vercel | Vercel Dashboard > Settings > Tokens |
| `VERCEL_ORG_ID` | ✅ Yes | Vercel organization ID | `.vercel/project.json` or Vercel Settings |
| `VERCEL_PROJECT_ID` | ✅ Yes | Vercel project ID | `.vercel/project.json` or Vercel Settings |
| `CODECOV_TOKEN` | ❌ Optional | Upload coverage | codecov.io |
| `SENTRY_AUTH_TOKEN` | ❌ Optional | Upload source maps | Sentry Settings > Auth Tokens |
| `SLACK_WEBHOOK_URL` | ❌ Optional | Slack notifications | Slack API > Incoming Webhooks |

## Verify Secrets Setup

### Check Secrets Exist

1. Go to **Settings > Secrets and variables > Actions**
2. Verify all required secrets are listed
3. Secrets will show as `********` (you can't view them)

### Test in Workflow

Create a test workflow:

```yaml
# .github/workflows/test-secrets.yml
name: Test Secrets

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check Vercel Token
        run: |
          if [ -z "${{ secrets.VERCEL_TOKEN }}" ]; then
            echo "❌ VERCEL_TOKEN is not set"
            exit 1
          else
            echo "✅ VERCEL_TOKEN is set"
          fi

      - name: Check Vercel Org ID
        run: |
          if [ -z "${{ secrets.VERCEL_ORG_ID }}" ]; then
            echo "❌ VERCEL_ORG_ID is not set"
            exit 1
          else
            echo "✅ VERCEL_ORG_ID is set"
          fi

      - name: Check Vercel Project ID
        run: |
          if [ -z "${{ secrets.VERCEL_PROJECT_ID }}" ]; then
            echo "❌ VERCEL_PROJECT_ID is not set"
            exit 1
          else
            echo "✅ VERCEL_PROJECT_ID is set"
          fi
```

Run manually:

1. Go to **Actions** tab
2. Select "Test Secrets" workflow
3. Click **Run workflow**
4. Check results

**Delete this test workflow after verification.**

## Rotating Secrets

### When to Rotate

- Every 6-12 months (regular rotation)
- When a team member with access leaves
- If a secret is compromised
- If a secret is accidentally exposed

### How to Rotate

1. **Generate new secret** in the source system (Vercel, Sentry, etc.)
2. **Update in GitHub:**
   - Go to **Settings > Secrets and variables > Actions**
   - Click on the secret name
   - Click **Update secret**
   - Paste new value
   - Click **Update secret**
3. **Update in Vercel** (if applicable)
4. **Test** the new secret works
5. **Revoke old secret** in source system

### Rotation Schedule

Create a reminder in your calendar:

- **VERCEL_TOKEN:** Rotate every 12 months
- **SENTRY_AUTH_TOKEN:** Rotate every 12 months
- **SLACK_WEBHOOK_URL:** Rotate every 12 months
- **CODECOV_TOKEN:** Rotate every 12 months

## Security Best Practices

### Do's

✅ Use GitHub Secrets for all sensitive data
✅ Rotate secrets regularly
✅ Use environment-specific secrets when needed
✅ Limit secret access with required reviewers
✅ Audit secret usage regularly
✅ Use short-lived tokens when possible

### Don'ts

❌ Never commit secrets to the repository
❌ Never log secrets in workflow output
❌ Never use secrets in pull requests from forks
❌ Never share secrets via email or chat
❌ Never use personal access tokens for CI/CD
❌ Never grant more permissions than needed

## Troubleshooting

### Workflow Fails: "secret is not set"

**Solution:**

1. Verify secret exists in GitHub Settings
2. Check secret name matches exactly (case-sensitive)
3. Ensure secret is set in correct environment
4. Re-save the secret

### Workflow Fails: "unauthorized" or "forbidden"

**Solution:**

1. Check token has correct permissions
2. Verify token hasn't expired
3. Regenerate token if needed
4. Update in GitHub Secrets

### Vercel Deployment Fails

**Check:**

1. ✅ `VERCEL_TOKEN` is valid
2. ✅ `VERCEL_ORG_ID` matches your org
3. ✅ `VERCEL_PROJECT_ID` matches your project
4. ✅ Token has deployment permissions

**Test token:**

```bash
# Test Vercel token locally
export VERCEL_TOKEN="your-token"
vercel whoami --token=$VERCEL_TOKEN
```

### Unable to Update Secret

**If you can't update a secret:**

1. Delete the old secret
2. Create a new secret with same name
3. Paste new value

## Accessing Secrets in Workflows

### Repository Secrets

```yaml
steps:
  - name: Use secret
    env:
      MY_SECRET: ${{ secrets.MY_SECRET }}
    run: |
      echo "Secret is set"
      # Use $MY_SECRET in commands
```

### Environment Secrets

```yaml
jobs:
  deploy:
    environment: production  # This loads production environment secrets
    steps:
      - name: Use secret
        env:
          TOKEN: ${{ secrets.VERCEL_TOKEN }}  # Gets production VERCEL_TOKEN
        run: echo "Deploying..."
```

### Organization Secrets

If using GitHub Organizations:

1. Go to **Organization Settings > Secrets**
2. Add secrets available to multiple repositories
3. Select which repositories can access

## Audit Log

GitHub keeps an audit log of secret access:

1. Go to **Settings > Actions > General**
2. Scroll to **Artifact and log retention**
3. Set retention period (default: 90 days)

View audit log:

1. Go to **Settings > Logs**
2. Filter by "secrets"

## Backup Plan

**If secrets are lost:**

1. Regenerate tokens in source systems
2. Update in GitHub
3. Update in Vercel (if applicable)
4. Redeploy applications

**Keep a secure backup:**

- Use a password manager (1Password, LastPass, etc.)
- Store encrypted in secure location
- Document recovery procedures

## Resources

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

Last Updated: 2025-11-24
Version: 1.0.0
