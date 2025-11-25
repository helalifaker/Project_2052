# Project Zeta - Agents

## Purpose
- Single front-door for the 7-agent team defined in `05_AGENTS_SPECIFICATION.md` and enforced by `.cursorrules`.
- Summarizes non-negotiable engineering rules, roles, and activation steps so new agents (human or AI) can start without hunting through multiple files.
- Pair this with the detailed role playbooks in `/agents` and the orchestration details in `/agents/orchestration-config.md`.

## Non-Negotiables (from `.cursorrules`)
- Use `Decimal.js` for **all** financial values; pre-create constants; never coerce to JS numbers.
- TypeScript: no `any`, strict types everywhere; document complex logic with JSDoc where clarity is needed.
- APIs: require auth/RBAC, validate input with Zod, handle errors consistently, and return proper status codes.
- React/Next.js: default to Server Components; use memoization for expensive work; debounce interactive inputs (~300ms); offload heavy calculations to workers.
- Database: UUID ids, enums for fixed values, select only needed fields, wrap multi-table work in transactions, add indexes on FK/high-usage fields.
- Testing: >85% overall, 100% for financial code; API ≥90%, components ≥80%, utilities ≥90%.
- Never ship violations: JS numbers for money, missing auth/validation, `any` in financial paths, unnecessary `use client`, skipped transactions, coverage <80%.

## Team Roster & Critical Outputs
| Agent (ID) | Role | Critical Focus | Key Outputs |
| --- | --- | --- | --- |
| Project Manager (pm-001) | Orchestrator | Planning, dependencies, status, approvals | Daily/weekly reports, task assignments, phase sign-offs |
| Financial Architect (fa-001) | Financial modeling | Three-period engine, circular solver, BS/CF validation | Calculation engine, validation suite, formula docs |
| Backend Engineer (be-001) | API & services | RBAC + Zod on all routes, engine integration, file ingest | REST API, service layer, uploads, exports |
| Frontend Engineer (fe-001) | UX implementation | Next.js flows, performant components, client validation | App routes, forms, tables/charts, comparison views |
| Database Architect (da-001) | Data model | Schema design, migrations, query optimization | ERD, migrations, seed data, indexing plan |
| UI/UX Designer (ux-001) | Design system | Flows, wireframes, visual system, accessibility | Design system, mockups, responsive specs |
| QA/Validation Engineer (qa-001) | Quality gate | Financial reconciliation, automated tests, regression | Test plan, automated suite, perf/validation reports |

## Operating Model
- Phases: Foundation → Core Financial Engine → UI & Workflows → Polish & Production (see `05_AGENTS_SPECIFICATION.md` for timelines).
- PM owns orchestration and escalations; specialists escalate rule/PRD changes to PM, who escalates to CAO as needed.
- Enforcement layers: documentation, pre-commit, code review, CI gates, weekly audits, phase certification (per `.cursorrules`).

## Activation Playbook
1. **Read-first set (all agents):** `01_BCD.md`, `02_PRD.md`, `.cursorrules`, `AGENT_IMPLEMENTATION_GUIDE.md`.
2. **Role onboarding:** Open your file in `/agents/<role>.agent.md`; note success metrics and deliverables.
3. **Coordination:** PM and all agents read `/agents/orchestration-config.md` for dependencies, handoffs, and communication templates.
4. **Start-of-day:** Follow standup format in `05_AGENTS_SPECIFICATION.md` (9:00 AM Riyadh); PM consolidates and shares blockers/risks.
5. **Tasking:** PM assigns work using the task template in `AGENT_IMPLEMENTATION_GUIDE.md`; agents confirm acceptance, raise blockers immediately.
6. **Delivery:** Agents include acceptance-criteria checklist, references, and decisions in completion reports (see guide templates); QA validates before sign-off when applicable.

## Handoff & Communication Rules
- Daily standup and weekly sprint review cadence per `05_AGENTS_SPECIFICATION.md`; escalation matrix there governs response times.
- Cross-agent dependencies must be recorded in `/agents/orchestration-config.md` before work starts; PM tracks progress and blockers daily.
- Blockers >4 hours go to PM; business rule or scope questions escalate to PM → CAO.

## Quality Gates (use before phase sign-off)
- Coverage meets thresholds (overall >85%, financial 100%); financial statements reconcile and balance sheets balance.
- API routes: auth + Zod + error handling verified; DB migrations reviewed by da-001.
- Frontend: memoization/debounce applied where needed; accessibility and responsiveness confirmed against design specs.
- Performance: 30-year calculation <1s; API <200ms average for non-calculation endpoints.

## Reference Stack
- Detailed role guides: `/agents/*.agent.md`
- Orchestration & dependencies: `/agents/orchestration-config.md`
- Coding standards: `CODING_STANDARDS.md`, `README_CODING_STANDARDS.md`, `CODING_STANDARDS_ENFORCEMENT.md`
- Financial rules: `04_FINANCIAL_RULES.md`
- Tech stack usage patterns: `STACK_DOCUMENTATION.md`
- Design system requirements: `06_UI_UX_SPECIFICATION.md`

**Usage:** Start here to align the team, then dive into the `/agents` playbooks and phase plans. PM enforces `.cursorrules` on every deliverable—no exceptions.
