# Project Zeta Documentation

Welcome to the documentation hub for Project Zeta - a financial planning application for 30-year lease proposal analysis.

---

## Quick Navigation

| I want to... | Go to |
|-------------|-------|
| Understand the project | [Business Case](specifications/01-business-case.md) |
| See product requirements | [Product Requirements](specifications/02-product-requirements.md) |
| Learn the tech stack | [Technical Specification](specifications/03-technical-specification.md) |
| Set up as Admin | [Admin Guide](user-guide/admin-guide.md) |
| Create proposals as Planner | [Planner Guide](user-guide/planner-guide.md) |
| Manage negotiations | [Negotiations Guide](features/negotiations/README.md) |
| View reports as Viewer | [Viewer Guide](user-guide/viewer-guide.md) |
| Deploy the application | [Deployment Guide](technical/deployment-guide.md) |
| Understand the API | [API Reference](technical/api-reference.md) |
| Write code | [Coding Standards](development/coding-standards.md) |

---

## Documentation Structure

```
docs/
├── specifications/      # Core project specifications
├── technical/          # Technical reference docs
├── user-guide/         # Role-based user guides
├── security/           # Security & RLS documentation
├── development/        # Development guides & standards
├── features/           # Feature-specific documentation
├── archive/            # Historical status reports
└── project-history/    # Implementation reports
```

---

## Specifications

Core project definition documents.

| Document | Description |
|----------|-------------|
| [01-business-case.md](specifications/01-business-case.md) | Business case and problem statement |
| [02-product-requirements.md](specifications/02-product-requirements.md) | Complete PRD with v2.2 amendments |
| [03-technical-specification.md](specifications/03-technical-specification.md) | Comprehensive technical specification |
| [04-financial-rules.md](specifications/04-financial-rules.md) | Financial calculation rules |
| [05-agents-specification.md](specifications/05-agents-specification.md) | AI agent team specifications |
| [06-ui-ux-specification.md](specifications/06-ui-ux-specification.md) | UI/UX specifications |
| [07-ultimate-ui-ux.md](specifications/07-ultimate-ui-ux.md) | Ultimate UI/UX design guide |

---

## User Guides

Role-based documentation for different user types.

### [Admin Guide](user-guide/admin-guide.md)
For system administrators:
- Historical data input (2023-2024)
- System configuration (Zakat rates, interest rates)
- CapEx module setup
- User management

### [Planner Guide](user-guide/planner-guide.md)
For financial planners:
- Creating lease proposals (7-step wizard)
- Managing negotiations and counter-offers
- Running interactive scenarios
- Performing sensitivity analysis
- Comparing proposals

### [Viewer Guide](user-guide/viewer-guide.md)
For read-only users:
- Viewing proposals and financial statements
- Understanding metrics and charts
- Exporting reports

### [FAQ](user-guide/faq.md)
Frequently asked questions for all user roles.

---

## Technical Documentation

### Architecture & Design

| Document | Description |
|----------|-------------|
| [architecture.md](technical/architecture.md) | System architecture overview |
| [database-schema.md](technical/database-schema.md) | Complete Prisma schema documentation |
| [calculation-formulas.md](technical/calculation-formulas.md) | Financial calculation formulas |
| [api-reference.md](technical/api-reference.md) | API endpoint documentation |
| [error-handling.md](technical/error-handling.md) | Error boundary system |

### Deployment & Operations

| Document | Description |
|----------|-------------|
| [deployment-guide.md](technical/deployment-guide.md) | Step-by-step deployment |
| [ci-cd-setup.md](technical/ci-cd-setup.md) | GitHub Actions configuration |
| [monitoring-guide.md](technical/monitoring-guide.md) | System monitoring setup |
| [sentry-setup.md](technical/sentry-setup.md) | Error tracking configuration |
| [github-secrets.md](technical/github-secrets.md) | Environment secrets setup |

---

## Security Documentation

Row-Level Security (RLS) and authentication.

| Document | Description |
|----------|-------------|
| [rls-architecture.md](security/rls-architecture.md) | RLS design overview |
| [rls-setup-guide.md](security/rls-setup-guide.md) | RLS implementation guide |
| [rls-quick-reference.md](security/rls-quick-reference.md) | Quick lookup for RLS policies |
| [rls-deployment-checklist.md](security/rls-deployment-checklist.md) | Pre-deployment security checks |
| [email-verification-flow.md](security/email-verification-flow.md) | Email authentication flow |

---

## Development Guides

Standards and guides for developers.

| Document | Description |
|----------|-------------|
| [coding-standards.md](development/coding-standards.md) | Complete coding standards with enforcement policy |
| [testing-guide.md](development/testing-guide.md) | Test coverage and strategy |
| [e2e-testing.md](development/e2e-testing.md) | Playwright E2E testing quickstart |
| [validation-guide.md](development/validation-guide.md) | Form validation implementation |
| [load-testing.md](development/load-testing.md) | Artillery load testing guide |
| [linting.md](development/linting.md) | ESLint strategy and configuration |

---

## Feature Documentation

Detailed guides for specific features.

### Negotiations
- [README.md](features/negotiations/README.md) - Overview and navigation
- [workflow.md](features/negotiations/workflow.md) - Complete workflow guide
- [api.md](features/negotiations/api.md) - Detailed API reference
- [components.md](features/negotiations/components.md) - Component documentation
- [status-guide.md](features/negotiations/status-guide.md) - Status states explained

### Charts
- [migration-wave1-report.md](features/charts/migration-wave1-report.md)
- [migration-wave1-summary.md](features/charts/migration-wave1-summary.md)
- [cleanup-summary.md](features/charts/cleanup-summary.md)
- [npv-sensitivity-migration.md](features/charts/npv-sensitivity-migration.md)

### Wizard
- [enhancements-checklist.md](features/wizard/enhancements-checklist.md)
- [enhancements-summary.md](features/wizard/enhancements-summary.md)
- [visual-guide.md](features/wizard/visual-guide.md)
- [progress-indicator.md](features/wizard/progress-indicator.md)

### Dashboard
- [before-after-comparison.md](features/dashboard/before-after-comparison.md)
- [integration-summary.md](features/dashboard/integration-summary.md)

### Transitions
- [refactor-summary.md](features/transitions/refactor-summary.md)
- [page-transitions.md](features/transitions/page-transitions.md)

### Accessibility
- [overview.md](features/accessibility/overview.md)
- [checklist.md](features/accessibility/checklist.md)
- [improvements-summary.md](features/accessibility/improvements-summary.md)

---

## Related Documentation

### AI Agents
See [/agents/README.md](../agents/README.md) for AI agent team specifications.

### Component Documentation
Component-level documentation is colocated with source code:
- `src/components/charts/README.md`
- `src/components/ui/transitions/README.md`
- `src/lib/engine/CALCULATION_DEPENDENCIES.md`

### Archive
Historical development status reports are in [archive/INDEX.md](archive/INDEX.md).

### Project History
Implementation summaries are in [project-history/](project-history/).

---

## Contributing

To update documentation:
1. Edit the relevant `.md` file
2. Follow kebab-case naming convention
3. Update this index if adding new files
4. Submit a pull request

---

**Last Updated:** December 2025
**Documentation Version:** 3.0
