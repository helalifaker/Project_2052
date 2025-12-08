# Project Zeta - AI Agent Team Documentation

## Overview

This directory contains the complete agent orchestration system for **Project Zeta**, a sophisticated 30-year financial planning application for school lease proposal assessment.

## Team Structure

**Total Team Size:** 7 Agents (1 Project Manager + 6 Specialists)

### The Team

1. **Project Manager** (`pm-001`) - Orchestrator, Progress Tracker, Stakeholder Liaison
2. **Financial Architect** (`fa-001`) - Financial Modeling Expert, Business Logic Guardian
3. **Backend Engineer** (`be-001`) - API Developer, Business Logic Integrator
4. **Frontend Engineer** (`fe-001`) - React Developer, User Interface Builder
5. **Database Architect** (`da-001`) - Data Model Designer, Schema Guardian
6. **UI/UX Designer** (`ux-001`) - User Experience Designer, Interface Specialist
7. **QA/Validation Engineer** (`qa-001`) - Quality Assurance, Financial Validation Specialist

## Document Index

### Agent Specifications

| Document | Purpose | Primary User |
|----------|---------|--------------|
| [`project-manager.agent.md`](./project-manager.agent.md) | Complete PM orchestration guide, communication protocols, phase management | Project Manager, CAO |
| [`financial-architect.agent.md`](./financial-architect.agent.md) | Financial modeling implementation, calculation engine design, business rules | Financial Architect |
| [`backend-engineer.agent.md`](./backend-engineer.agent.md) | API development, service layer, financial engine integration | Backend Engineer |
| [`frontend-engineer.agent.md`](./frontend-engineer.agent.md) | React/Next.js development, UI components, user workflows | Frontend Engineer |
| [`database-architect.agent.md`](./database-architect.agent.md) | Schema design, data model, query optimization | Database Architect |
| [`ui-ux-designer.agent.md`](./ui-ux-designer.agent.md) | Design system, wireframes, visual design, component specs | UI/UX Designer |
| [`qa-validation-engineer.agent.md`](./qa-validation-engineer.agent.md) | Test automation, financial validation, quality assurance | QA Engineer |

### Orchestration & Process

| Document | Purpose | Primary User |
|----------|---------|--------------|
| [`orchestration-config.md`](./orchestration-config.md) | Agent coordination, dependencies, handoff procedures, conflict resolution | Project Manager, All Agents |
| [`README.md`](./README.md) | This file - overview and quick start | Everyone |

## Quick Start Guide

### For the Project Manager

**Your first week:**

1. **Day 1 - Kickoff:**
   ```bash
   # Read these documents in order:
   - ../01_BCD.md (Business Case)
   - ../02_PRD.md (Product Requirements)
   - ./project-manager.agent.md (Your role)
   - ./orchestration-config.md (Coordination)
   ```

2. **Day 1 - Team Orientation:**
   - Ensure all agents have access to project documents
   - Schedule kickoff meeting (all agents + CAO)
   - Present project overview and timeline
   - Assign initial Phase 1 tasks

3. **Day 2-5 - Foundation Start:**
   - Daily standups at 9:00 AM
   - Monitor progress on initial tasks:
     - Database schema design
     - Financial engine design
     - Design system creation
   - First status report to CAO (Day 3)

4. **Day 5 - First Review:**
   - Review database schema
   - Review financial engine design
   - Review design system concepts
   - First sprint retrospective

**Key Resources:**
- Daily update template: See `project-manager.agent.md` Communication Protocol
- Task assignment template: See `orchestration-config.md` Work Assignment Protocol
- Risk register: See `orchestration-config.md` Risk Register

### For Specialist Agents

**Your first day:**

1. **Read Your Agent Specification:**
   - Understand your role and responsibilities
   - Review your key deliverables
   - Note your success criteria

2. **Read Project Context:**
   - Business Case (`../01_BCD.md`)
   - Product Requirements (`../02_PRD.md`)
   - Relevant sections of Technical Spec (`../03_TSD_COMPREHENSIVE.md`)
   - Financial Rules (if relevant to your role: `../04_FINANCIAL_RULES.md`)

3. **Understand Dependencies:**
   - Check `orchestration-config.md` for your dependency chain
   - Identify which agents you interface with
   - Note handoff requirements

4. **Set Up Environment:**
   - Development environment
   - Access to repositories
   - Communication channels

5. **First Task:**
   - Wait for PM assignment OR
   - If Phase 1: Start on foundational work (schema, engine design, design system)

**Daily Workflow:**
- 9:00 AM: Daily standup (post update)
- Work on assigned tasks
- Communicate blockers immediately to PM
- Complete tasks with full documentation
- Report completion with deliverables

## Project Timeline

### Phase 1: Foundation (Weeks 1-5)
**Goal:** Establish architecture, core infrastructure, design system

**Key Deliverables:**
- Database schema finalized
- Core API endpoints functional
- Basic calculation engine (single period)
- Design system ready
- Component library started

### Phase 2: Core Financial Engine (Weeks 5-9)
**Goal:** Complete three-period financial modeling with all rent models

**Key Deliverables:**
- Complete three-period calculation engine
- All rent models implemented
- Balance sheet auto-balancing
- Cash flow reconciliation
- Circular dependency solver

### Phase 3: User Interface & Workflows (Weeks 9-11)
**Goal:** Complete all user-facing functionality

**Key Deliverables:**
- Complete admin setup flow
- All input forms functional
- Financial statement views
- Comparison dashboards

### Phase 4: Polish & Production (Weeks 11-16)
**Goal:** Advanced features, complete testing, production deployment

**Key Deliverables:**
- Interactive scenario analysis
- PDF/Excel export
- Complete testing (>80% coverage)
- User documentation
- Production deployment

## Communication Channels

### Daily Standup
**Time:** 9:00 AM Riyadh time (async acceptable)
**Format:** See `orchestration-config.md` Communication Protocols

### Weekly Sprint Review
**Time:** Friday 10:00 AM Riyadh time
**Duration:** 30-60 minutes
**Participants:** PM + All Agents + CAO

### Integration Syncs
**When:** As needed during integration phases
**Duration:** 30-45 minutes
**Participants:** Relevant agents + PM

### Emergency Escalation
- **Level 1:** Agent-to-Agent (1 hour response)
- **Level 2:** Agent-to-PM (4 hours response)
- **Level 3:** PM-to-CAO (24 hours response)

## Key Principles

### 1. Transparency
All work visible to PM and relevant agents. No surprises.

### 2. Communication
Over-communicate rather than under-communicate. When in doubt, ask.

### 3. Documentation
Document decisions and rationale. Future you will thank present you.

### 4. Quality
Never compromise on financial accuracy. Every dollar matters.

### 5. Collaboration
Agents help each other succeed. We win as a team.

## Success Metrics

### Overall Project
- **On-time Delivery:** 95% of milestones hit target dates
- **Code Quality:** A grade (linting, test coverage, documentation)
- **CAO Satisfaction:** High (based on weekly feedback)

### Phase Completion
- **Phase 1:** 100% of foundation deliverables complete
- **Phase 2:** 100% calculation accuracy, <1s performance
- **Phase 3:** 100% user stories implemented
- **Phase 4:** >80% test coverage, zero critical bugs

### Individual Agent Performance
See agent specification documents for role-specific metrics.

## Critical Path Awareness

**Bottlenecks to watch:**

1. **Database Schema → API Development**
   - Database Architect blocks Backend Engineer
   - Target: Schema complete by Day 5

2. **Financial Engine → API Integration**
   - Financial Architect blocks Backend integration
   - Target: Core engine complete by Week 5

3. **Design System → Frontend Components**
   - UI/UX Designer blocks Frontend Engineer
   - Target: Design system approved by Week 2

4. **API Contracts → Frontend Development**
   - Backend Engineer blocks Frontend integration
   - Target: API contracts defined by Week 4

## Risk Management

### Top 5 Risks

1. **Circular Dependency Solver (Interest ↔ Zakat)**
   - **Mitigation:** Financial Architect + Backend Engineer pair programming
   - **Owner:** fa-001

2. **Balance Sheet Auto-Balancing**
   - **Mitigation:** Extensive validation testing
   - **Owner:** fa-001 + qa-001

3. **30-Year Performance (<1 second target)**
   - **Mitigation:** Early performance testing
   - **Owner:** fa-001 + be-001

4. **Period Linkages (2024→2025, 2027→2028)**
   - **Mitigation:** Dedicated validation suite
   - **Owner:** fa-001 + qa-001

5. **Scope Creep**
   - **Mitigation:** Strict PRD adherence
   - **Owner:** pm-001

## Getting Help

### Technical Questions
**Contact:** Relevant agent directly, cc: PM if urgent

### Business Logic Questions
**Contact:** PM → escalates to CAO

### Blockers
**Contact:** PM immediately (don't wait for daily standup)

### Conflicts
**Contact:** PM for mediation

## Frequently Asked Questions

### Q: What if I don't understand a requirement?
**A:** Ask PM immediately. Better to clarify early than fix later.

### Q: What if I'm blocked on another agent's work?
**A:** 1) Try to work on parallel tasks. 2) Notify PM. 3) PM will coordinate.

### Q: What if I finish early?
**A:** Great! Notify PM. Options: Help another agent, start next task, improve tests/docs.

### Q: What if I'm running late?
**A:** Notify PM as soon as you know (don't wait until deadline). We'll adjust.

### Q: Can I change the technical approach?
**A:** Minor changes: Yes, document in code comments. Major changes: Consult PM first.

### Q: What if I disagree with a design/architecture decision?
**A:** Voice concern to PM with reasoning + alternative. PM will review and decide.

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial agent team setup | pm-001 |
| 2.0 | 2025-12-08 | Added v2.2 Negotiation system documentation to all agents | pm-001 |

## Document Maintenance

**Maintained By:** Project Manager (pm-001)
**Review Frequency:** Weekly during sprint reviews
**Update Trigger:** Significant process changes, lessons learned

---

**Let's build something amazing! 🚀**

For detailed information on any topic, refer to the specific agent specification or orchestration configuration documents.
