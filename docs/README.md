# Project Zeta Documentation

Welcome to the Project Zeta documentation hub. This index helps you navigate all available documentation for the School Lease Financial Planning System.

---

## Quick Start

**New to the system?** Start here:
1. **Admins**: Read the [Administrator Guide](user-guide/ADMIN_GUIDE.md) for initial setup
2. **Planners**: Read the [Planner Guide](user-guide/PLANNER_GUIDE.md) to start creating proposals
3. **Viewers**: Read the [Viewer Guide](user-guide/VIEWER_GUIDE.md) to understand read-only access

---

## User Guides

Role-based documentation for different user types:

### [Administrator Guide](user-guide/ADMIN_GUIDE.md)
Complete guide for administrators covering:
- Historical data input (2023-2024)
- System configuration (Zakat rates, interest rates)
- CapEx module setup
- User management
- System maintenance

**Who should read this:** System administrators, IT managers, financial controllers

### [Financial Planner Guide](user-guide/PLANNER_GUIDE.md)
Complete guide for financial planners covering:
- Creating lease proposals (7-step wizard)
- Running interactive scenarios
- Performing sensitivity analysis
- Comparing proposals
- Exporting reports

**Who should read this:** Financial analysts, planning team members, proposal creators

### [Viewer Guide](user-guide/VIEWER_GUIDE.md)
Guide for read-only users covering:
- Viewing proposals and financial statements
- Understanding metrics and charts
- Exporting reports for meetings
- Navigation tips

**Who should read this:** Board members, executives, stakeholders with read-only access

### [FAQ](user-guide/FAQ.md)
Frequently asked questions and answers for all user roles.

---

## Technical Documentation

Comprehensive technical documentation for developers and system administrators:

### Architecture & Design

- **[Architecture Overview](technical/ARCHITECTURE.md)**
  - System architecture
  - Component structure
  - Data flow
  - Technology stack

- **[Database Schema](technical/DATABASE_SCHEMA.md)**
  - Complete Prisma schema documentation
  - Table relationships
  - Indexes and constraints
  - Data types and enums

- **[Calculation Formulas](technical/CALCULATION_FORMULAS.md)**
  - Financial calculation formulas
  - Business rules
  - Period-specific calculations
  - Validation rules

### API Documentation

- **[API Reference](technical/API_REFERENCE.md)**
  - Complete API endpoint documentation
  - Request/response formats
  - Authentication requirements
  - Error handling

### Deployment & Operations

- **[Deployment Guide](technical/DEPLOYMENT_GUIDE.md)**
  - Step-by-step deployment instructions
  - Environment configuration
  - Vercel deployment
  - Database migrations

- **[CI/CD Setup Checklist](technical/CI_CD_SETUP_CHECKLIST.md)**
  - GitHub Actions configuration
  - Automated testing
  - Deployment automation
  - Pipeline troubleshooting

- **[Monitoring Guide](technical/MONITORING_GUIDE.md)**
  - Sentry error tracking setup
  - Vercel Analytics
  - Health check endpoints
  - Performance monitoring

- **[Sentry Setup](technical/SENTRY_SETUP.md)**
  - Error tracking configuration
  - Alert setup
  - Performance monitoring
  - User feedback integration

- **[GitHub Secrets Setup](technical/GITHUB_SECRETS_SETUP.md)**
  - Required environment variables
  - Secrets configuration
  - Security best practices

### Security & Access Control

- **[RLS Architecture](RLS_ARCHITECTURE.md)**
  - Row-Level Security overview
  - Policy design
  - Security model

- **[RLS Setup Guide](RLS_SETUP_GUIDE.md)**
  - Step-by-step RLS configuration
  - Policy implementation
  - Testing procedures

- **[RLS Quick Reference](RLS_QUICK_REFERENCE.md)**
  - Quick lookup for RLS policies
  - Common patterns
  - Troubleshooting tips

- **[RLS Deployment Checklist](RLS_DEPLOYMENT_CHECKLIST.md)**
  - Pre-deployment checks
  - Policy verification
  - Security audit

### Email & Authentication

- **[Email Verification Flow](EMAIL_VERIFICATION_FLOW.md)**
  - User registration process
  - Email verification workflow
  - Account activation

---

## Documentation by Topic

### Getting Started
- [Administrator Guide - Getting Started](user-guide/ADMIN_GUIDE.md#getting-started)
- [Planner Guide - Getting Started](user-guide/PLANNER_GUIDE.md#getting-started)
- [Viewer Guide - Getting Started](user-guide/VIEWER_GUIDE.md#getting-started)

### Financial Calculations
- [Calculation Formulas](technical/CALCULATION_FORMULAS.md)
- [Administrator Guide - System Configuration](user-guide/ADMIN_GUIDE.md#system-configuration)
- [Planner Guide - Creating Proposals](user-guide/PLANNER_GUIDE.md#creating-a-new-proposal)

### System Administration
- [Administrator Guide - Historical Data](user-guide/ADMIN_GUIDE.md#historical-data-management)
- [Administrator Guide - CapEx Module](user-guide/ADMIN_GUIDE.md#capex-module)
- [Deployment Guide](technical/DEPLOYMENT_GUIDE.md)
- [Monitoring Guide](technical/MONITORING_GUIDE.md)

### Development
- [Architecture Overview](technical/ARCHITECTURE.md)
- [API Reference](technical/API_REFERENCE.md)
- [Database Schema](technical/DATABASE_SCHEMA.md)
- [CI/CD Setup](technical/CI_CD_SETUP_CHECKLIST.md)

### Security
- [RLS Architecture](RLS_ARCHITECTURE.md)
- [RLS Setup Guide](RLS_SETUP_GUIDE.md)
- [Email Verification Flow](EMAIL_VERIFICATION_FLOW.md)

---

## Quick Links

### For Users
- [FAQ](user-guide/FAQ.md) - Common questions and answers
- [Administrator Guide](user-guide/ADMIN_GUIDE.md) - System setup and configuration
- [Planner Guide](user-guide/PLANNER_GUIDE.md) - Creating and analyzing proposals
- [Viewer Guide](user-guide/VIEWER_GUIDE.md) - Read-only access guide

### For Developers
- [Architecture Overview](technical/ARCHITECTURE.md) - System design
- [API Reference](technical/API_REFERENCE.md) - API endpoints
- [Database Schema](technical/DATABASE_SCHEMA.md) - Database structure
- [Deployment Guide](technical/DEPLOYMENT_GUIDE.md) - Deployment instructions

### For System Administrators
- [Deployment Guide](technical/DEPLOYMENT_GUIDE.md) - Production deployment
- [Monitoring Guide](technical/MONITORING_GUIDE.md) - System monitoring
- [RLS Setup Guide](RLS_SETUP_GUIDE.md) - Security configuration
- [CI/CD Setup](technical/CI_CD_SETUP_CHECKLIST.md) - Automation setup

---

## Contributing to Documentation

Documentation is maintained as part of the codebase. To update documentation:

1. Edit the relevant `.md` file in the `docs/` directory
2. Follow the existing documentation style
3. Include screenshots where helpful (store in `docs/images/`)
4. Update this index if adding new documentation files
5. Submit a pull request with documentation changes

---

## Support

For questions or issues:
- **User Questions**: Check the [FAQ](user-guide/FAQ.md) first
- **Technical Issues**: See [Deployment Guide - Troubleshooting](technical/DEPLOYMENT_GUIDE.md#troubleshooting)
- **Security Questions**: Review [RLS Architecture](RLS_ARCHITECTURE.md) and [RLS Setup Guide](RLS_SETUP_GUIDE.md)

---

**Last Updated:** November 2025  
**Documentation Version:** 1.0

