# Row-Level Security (RLS) Documentation

Complete documentation package for implementing and managing Row-Level Security in Project 2052.

## Quick Navigation

**New to RLS?** Start here: [RLS_INDEX.md](./RLS_INDEX.md)

**Ready to deploy?** Use: [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md)

**Need quick reference?** See: [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md)

## Documentation Package Contents

This package includes 7 comprehensive documents covering all aspects of RLS:

### 1. Core Documentation

| File | Size | Purpose | Audience |
|------|------|---------|----------|
| [RLS_INDEX.md](./RLS_INDEX.md) | 10 KB | Master index and navigation guide | Everyone |
| [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) | 7.3 KB | Complete setup and configuration | DevOps, DBAs |
| [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md) | 21 KB | Technical architecture and design | Architects, Developers |

### 2. SQL Scripts

| File | Size | Purpose | Audience |
|------|------|---------|----------|
| [supabase-rls-policies.sql](./supabase-rls-policies.sql) | 21 KB | Main RLS policy implementation | DBAs, DevOps |
| [test-rls-policies.sql](./test-rls-policies.sql) | 11 KB | Comprehensive testing script | DBAs, QA |

### 3. Reference Materials

| File | Size | Purpose | Audience |
|------|------|---------|----------|
| [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) | 5.6 KB | Quick lookup guide | All Developers |
| [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md) | 7.5 KB | Deployment checklist | DevOps, Release Managers |

**Total Package:** 7 files, ~84 KB of documentation

## What is Row-Level Security?

Row-Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in database tables. In Project 2052, RLS implements role-based access control (RBAC) at the database level, ensuring users can only access data they're authorized to see.

### Key Benefits

1. **Security at Database Level:** Cannot be bypassed from client code
2. **Role-Based Access:** Three roles (ADMIN, PLANNER, VIEWER) with different permissions
3. **Automatic Enforcement:** PostgreSQL enforces policies on every query
4. **Transparent to Application:** No application code changes needed

## Role-Based Access Control

### Role Summary

| Role | Permissions | Use Cases |
|------|-------------|-----------|
| **ADMIN** | Full CRUD on all data | System administrators, DevOps engineers |
| **PLANNER** | Create/manage own proposals, read all data | Financial planners, analysts |
| **VIEWER** | Read-only access to all data | Board members, stakeholders, executives |

### Permission Details

See [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) for complete permission matrix.

## Getting Started

### For First-Time Setup

1. **Read the Index** (5 minutes)
   - Open [RLS_INDEX.md](./RLS_INDEX.md)
   - Understand the documentation structure
   - Identify which documents you need

2. **Review Architecture** (15 minutes)
   - Open [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md)
   - Understand how RLS works
   - Review authentication flow

3. **Follow Setup Guide** (30 minutes)
   - Open [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md)
   - Follow step-by-step instructions
   - Complete verification steps

4. **Execute SQL Scripts** (10 minutes)
   - Run [supabase-rls-policies.sql](./supabase-rls-policies.sql)
   - Verify with [test-rls-policies.sql](./test-rls-policies.sql)
   - Check all tests pass

5. **Test Thoroughly** (20 minutes)
   - Create test users for each role
   - Verify access patterns
   - Test edge cases

**Total Setup Time:** ~1.5 hours

### For Daily Development

Keep these documents handy:

- [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) - Daily queries and patterns
- [RLS_INDEX.md](./RLS_INDEX.md) - Quick navigation to detailed docs

### For Deployment

Use this workflow:

1. [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md) - Pre-deployment checks
2. [supabase-rls-policies.sql](./supabase-rls-policies.sql) - Apply policies
3. [test-rls-policies.sql](./test-rls-policies.sql) - Verify deployment
4. [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md) - Post-deployment verification

## Tables with RLS

All 10 database tables have RLS enabled:

1. **User** - User accounts and roles
2. **LeaseProposal** - Lease proposals and negotiations
3. **Scenario** - What-if scenarios
4. **SensitivityAnalysis** - Sensitivity analyses
5. **SystemConfig** - System configuration
6. **HistoricalData** - Historical financial data
7. **CapExAsset** - Capital expenditure assets
8. **CapExConfig** - CapEx configuration
9. **TransitionConfig** - Transition period configuration
10. **WorkingCapitalRatios** - Working capital ratios

## Common Use Cases

### "I need to deploy RLS to production"

**Documents to use:**
1. [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md)
2. [supabase-rls-policies.sql](./supabase-rls-policies.sql)
3. [test-rls-policies.sql](./test-rls-policies.sql)

**Estimated time:** 1-2 hours

---

### "I'm getting permission denied errors"

**Documents to use:**
1. [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) - Troubleshooting section
2. [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) - Common Issues section

**Common causes:**
- User not authenticated
- User has wrong role
- User trying to access another user's data

---

### "I need to understand how RLS works"

**Documents to use:**
1. [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md)
2. [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md)

**Topics covered:**
- Authentication flow
- Helper functions
- Policy evaluation
- Performance optimization

---

### "I need to add RLS to a new table"

**Documents to use:**
1. [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) - Maintenance section
2. [supabase-rls-policies.sql](./supabase-rls-policies.sql) - Reference patterns

**Steps:**
1. Enable RLS on table
2. Create policies following existing patterns
3. Test with all three roles
4. Update documentation

---

### "I need a quick reference for writing queries"

**Document to use:**
[RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md)

**Contains:**
- Helper function reference
- Common SQL patterns
- Troubleshooting commands
- Performance tips

## Architecture Overview

```
Client (Next.js)
    ↓ JWT Token
Supabase Auth
    ↓ Validates & Extracts Email
Helper Functions (auth schema)
    ↓ Returns Role
RLS Policies (per table)
    ↓ Enforces Access
Database Tables
    ↓ Returns Filtered Data
Client Application
```

See [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md) for detailed architecture diagrams.

## Security Model

### Defense in Depth

1. **Network Layer:** HTTPS encryption, firewall rules
2. **Authentication Layer:** JWT validation, token expiration
3. **RLS Layer:** Database-level access control
4. **Application Layer:** Input validation, error handling
5. **Audit Layer:** Logging, monitoring, alerts

### Key Security Principles

1. **Client Cannot Bypass:** RLS enforced at database level
2. **Service Role Protected:** Only used in trusted backend code
3. **Role-Based:** Permissions tied to user role in database
4. **Auditable:** All access controlled and logged

See [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md) for security architecture details.

## Performance Considerations

### Optimizations Implemented

1. **Indexes on RLS columns** (email, createdBy)
2. **Function caching** (SECURITY DEFINER functions)
3. **Simple policy conditions** (avoid subqueries)
4. **JWT validation** (once per request)

### Expected Performance Impact

- **Read queries:** < 5% overhead with indexes
- **Write queries:** < 10% overhead
- **Helper functions:** < 1ms execution time

See [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) for performance tuning tips.

## Testing Strategy

### 1. Automated Testing

Run [test-rls-policies.sql](./test-rls-policies.sql) to verify:
- RLS enabled on all tables
- Helper functions exist
- Policies cover all CRUD operations
- No security gaps

### 2. Manual Testing

Follow [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md):
- Create test users for each role
- Test read access per role
- Test write access per role
- Verify edge cases

### 3. Integration Testing

From application:
- Test API endpoints with different roles
- Verify error handling
- Check performance impact
- Monitor production logs

## Maintenance

### Regular Tasks

| Task | Frequency | Reference |
|------|-----------|-----------|
| Run test script | After deployment | [test-rls-policies.sql](./test-rls-policies.sql) |
| Security audit | Monthly | [test-rls-policies.sql](./test-rls-policies.sql) Part 11 |
| Performance review | Quarterly | [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) |
| Policy review | With schema changes | [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) |

### Updating Policies

1. Edit [supabase-rls-policies.sql](./supabase-rls-policies.sql)
2. Test in development environment
3. Run [test-rls-policies.sql](./test-rls-policies.sql)
4. Deploy to staging
5. Verify in staging
6. Deploy to production
7. Monitor for issues

## Troubleshooting

### Quick Diagnostics

```sql
-- Check if authenticated
SELECT auth.jwt() IS NOT NULL;

-- Check current role
SELECT auth.get_user_role();

-- Check if admin
SELECT auth.is_admin();

-- List policies for table
SELECT policyname FROM pg_policies WHERE tablename = 'YourTable';
```

See [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) for complete troubleshooting guide.

## Support and Resources

### Internal Resources

- [RLS_INDEX.md](./RLS_INDEX.md) - Master index
- [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) - Complete guide
- [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) - Quick reference
- [Prisma Schema](/prisma/schema.prisma) - Database schema

### External Resources

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

## Document Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-11-25 | 1.0 | Initial RLS documentation package created |

## Next Steps

1. **If you're new to RLS:**
   - Start with [RLS_INDEX.md](./RLS_INDEX.md)
   - Read [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md)
   - Bookmark [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md)

2. **If you're deploying RLS:**
   - Follow [RLS_DEPLOYMENT_CHECKLIST.md](./RLS_DEPLOYMENT_CHECKLIST.md)
   - Execute [supabase-rls-policies.sql](./supabase-rls-policies.sql)
   - Verify with [test-rls-policies.sql](./test-rls-policies.sql)

3. **If you're developing:**
   - Keep [RLS_QUICK_REFERENCE.md](./RLS_QUICK_REFERENCE.md) handy
   - Reference [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) for common issues
   - Check [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md) for design patterns

## Feedback

This documentation is maintained as part of Project 2052. If you find issues or have suggestions:

1. Test your hypothesis with [test-rls-policies.sql](./test-rls-policies.sql)
2. Check [RLS_SETUP_GUIDE.md](./RLS_SETUP_GUIDE.md) troubleshooting section
3. Review [RLS_ARCHITECTURE.md](./RLS_ARCHITECTURE.md) for design rationale
4. Document your findings for the team

---

**Documentation Package Version:** 1.0
**Last Updated:** November 25, 2024
**Maintained By:** Project 2052 Team
**Status:** Production Ready
