# Database Connection Fix Required

## Issues Found

1. **Missing SSL Mode**: The `DATABASE_URL` is missing `sslmode=require`
2. **DNS Resolution**: The hostname `db.ssxwmxqvafesyldycqzy.supabase.co` is not resolving

## Required Format

Your `DATABASE_URL` should be:

```bash
DATABASE_URL=postgresql://postgres.ssxwmxqvafesyldycqzy:L%40tifa-1959-@db.ssxwmxqvafesyldycqzy.supabase.co:5432/postgres?sslmode=require
SHADOW_DATABASE_URL=postgresql://postgres.ssxwmxqvafesyldycqzy:L%40tifa-1959-@db.ssxwmxqvafesyldycqzy.supabase.co:5432/postgres?sslmode=require
```

**Key points:**
- Must end with `?sslmode=require` (or `&sslmode=require` if there are other query params)
- User: `postgres.ssxwmxqvafesyldycqzy`
- Host: `db.ssxwmxqvafesyldycqzy.supabase.co`
- Port: `5432`

## Verify Hostname

If DNS is not resolving, please:

1. **Check Supabase Dashboard**:
   - Go to Settings → Database
   - Copy the exact connection string from the dashboard
   - Verify the hostname format

2. **Alternative Hostname Formats** (if the above doesn't work):
   - Try: `aws-1-ap-southeast-1.pooler.supabase.com` (pooler)
   - Or check if there's a different direct connection hostname

3. **Network/Firewall**:
   - Ensure your network allows outbound connections to Supabase
   - Check if a VPN or firewall is blocking the connection

## Test After Fix

Once you've updated the connection string with `sslmode=require`, run:

```bash
pnpm tsx tmp/final-db-test.ts
```

