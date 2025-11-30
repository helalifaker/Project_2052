# Database Connection Verification

## Issue Found

The `DATABASE_URL` in `.env.local` appears to have formatting issues:
- Contains `[blocked]` text which shouldn't be in the connection string
- May be missing the project reference format

## Correct Format

Based on Supabase's new syntax, the connection strings should be:

```bash
# For Prisma (direct connection)
DATABASE_URL=postgresql://postgres.ssxwmxqvafesyldycqzy:L%40tifa-1959-@db.ssxwmxqvafesyldycqzy.supabase.co:5432/postgres?sslmode=require

# Shadow database (for migrations)
SHADOW_DATABASE_URL=postgresql://postgres.ssxwmxqvafesyldycqzy:L%40tifa-1959-@db.ssxwmxqvafesyldycqzy.supabase.co:5432/postgres?sslmode=require
```

## Key Points

1. **Format**: `postgresql://postgres.USER:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require`
2. **User**: `postgres.ssxwmxqvafesyldycqzy` (postgres. + project reference)
3. **Host**: `db.ssxwmxqvafesyldycqzy.supabase.co` (direct connection, NOT pooler)
4. **Port**: `5432` (direct port, NOT 6543)
5. **Password**: Must be URL-encoded (e.g., `@` becomes `%40`)
6. **SSL**: `sslmode=require` is required
7. **No pgbouncer**: Direct connection doesn't use pgbouncer

## Current Status

- ✅ Connection string format validation: PASS (structure is correct)
- ✅ Prisma schema validation: PASS
- ❌ Database connection: FAIL (connection string has `[blocked]` text)
- ❌ Query execution: FAIL (cannot reach database)

## Next Steps

1. Verify the `DATABASE_URL` in `.env.local` doesn't contain `[blocked]` text
2. Ensure the format is exactly: `postgresql://postgres.ssxwmxqvafesyldycqzy:PASSWORD@db.ssxwmxqvafesyldycqzy.supabase.co:5432/postgres?sslmode=require`
3. Make sure the password is URL-encoded (replace `@` with `%40`)
4. Re-run the test: `pnpm tsx tmp/test-prisma-connection.ts`

## Test Command

```bash
pnpm tsx tmp/test-prisma-connection.ts
```

