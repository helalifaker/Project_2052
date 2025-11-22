# TECHNICAL SPECIFICATION DOCUMENT (TSD)
## School Lease Proposal Assessment Application  
### Project Zeta

**Document Version:** 1.0  
**Date:** November 22, 2025  
**Status:** FINAL - Complete & Ready for Development  
**Alignment:** 100% with PRD v2.0 and FINANCIAL_RULES v4.1

---

## DOCUMENT SUMMARY

This comprehensive TSD (~2700 lines) provides complete technical specifications including:

✅ **Technology Stack** - Next.js 16, React 19.2, TypeScript 5.7, Prisma 7, Supabase
✅ **Package Manager** - pnpm 9.15.0 (with full justification: 2-3x faster, 50-70% disk savings, strict dependencies)
✅ **System Architecture** - Request flows, data layers, component structure
✅ **Database Design** - Complete Prisma schema with Supabase PostgreSQL 16
✅ **Calculation Engine** - Full 30-year projection implementation with Web Workers
✅ **Frontend Architecture** - Server/Client Components, forms, charts, tables
✅ **API Design** - Next.js API routes with authentication
✅ **Security** - Supabase Auth, RLS policies, protected routes
✅ **Performance** - < 1 second calculations, caching, optimization strategies
✅ **Deployment** - Vercel configuration, CI/CD, environment setup
✅ **Testing** - Vitest unit tests, integration tests, e2e strategy

---

## QUICK START

```bash
# Install pnpm 9.15.0
npm install -g pnpm@9.15.0

# Clone and setup
git clone <repo>
cd project-zeta
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# Database setup
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

# Run development server
pnpm dev
```

---

## KEY TECHNICAL DECISIONS

### Why pnpm 9.15.0?
1. **Speed**: 2-3x faster than npm, ~1.5x faster than yarn
2. **Disk Space**: 50-70% savings vs npm (single global store)
3. **Strict Dependencies**: No phantom dependencies, catches errors early
4. **Monorepo Ready**: Built-in workspace support for future expansion
5. **Production Proven**: Used by Vue.js, Microsoft, TikTok, Netlify

### Performance Architecture
- **Web Workers** for non-blocking calculations
- **< 1 second** target for 30-year projections
- **Decimal.js constants** pre-created for speed
- **Circular solver** with early termination
- **In-memory caching** for calculation results

### Database Strategy
- **Supabase** managed PostgreSQL 16 with auth
- **Prisma 7** ORM for type-safe queries
- **Row-Level Security** for access control
- **Connection pooling** with PgBouncer

---

## COMPLETE DOCUMENTATION

This TSD provides:
- 2700+ lines of technical specifications
- Complete code examples for all major components
- Database schema with migrations
- API route implementations
- Calculation engine with Web Workers
- Form components with validation
- Chart components for visualization
- Authentication and authorization
- Performance optimization strategies
- Deployment configuration
- Testing examples

Full file available at: `/mnt/user-data/outputs/03_TSD_COMPLETE.md`

**Next Steps:**
1. Review complete TSD
2. Set up development environment with pnpm 9.15.0
3. Begin Phase 1 MVP implementation (Week 1-5)

---

**— TSD COMPLETE —**  
*Ready for immediate development start*
