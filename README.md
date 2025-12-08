# Project Zeta

A financial planning application for 30-year lease proposal analysis (2023-2053) in Saudi Arabian Riyals (SAR).

## Overview

Project Zeta provides board-level decision support for evaluating school facility lease proposals through:
- Three calculation periods (Historical, Transition, Dynamic)
- Three rent models (Fixed Escalation, Revenue Share, Partner Investment)
- Full negotiation workflow management with timeline tracking
- Interactive scenario analysis with real-time recalculation
- Complete financial statements (P&L, Balance Sheet, Cash Flow)

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Generate Prisma client
npx prisma generate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

**All documentation is in the [docs/](docs/README.md) folder.**

| Guide | For |
|-------|-----|
| [docs/specifications/](docs/specifications/) | Project specifications |
| [docs/user-guide/](docs/user-guide/) | User guides by role |
| [docs/technical/](docs/technical/) | Technical reference |
| [docs/development/](docs/development/) | Development standards |
| [docs/features/negotiations/](docs/features/negotiations/) | Negotiation workflow guide |

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Language:** TypeScript 5 (strict)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Supabase Auth with RBAC
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Financial Math:** Decimal.js
- **Testing:** Vitest, Playwright

## Commands

```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests
pnpm lint          # Run linter
```

## License

Private - All rights reserved.
