# Agent Activation Checklist

## Pre-Activation (Day 0)

### Project Manager Preparation
- [ ] Read all project documents:
  - [ ] [01_BCD.md](../01_BCD.md) - Business Case
  - [ ] [02_PRD.md](../02_PRD.md) - Product Requirements
  - [ ] [03_TSD_COMPREHENSIVE.md](../03_TSD_COMPREHENSIVE.md) - Technical Spec
  - [ ] [04_FINANCIAL_RULES.md](../04_FINANCIAL_RULES.md) - Financial Rules
  - [ ] [05_AGENTS_SPECIFICATION.md](../05_AGENTS_SPECIFICATION.md) - Agent Roles
  - [ ] [06_UI_UX_SPECIFICATION.md](../06_UI_UX_SPECIFICATION.md) - Design Guidelines
- [ ] Review this specification: [project-manager.agent.md](./project-manager.agent.md)
- [ ] Review orchestration: [orchestration-config.md](./orchestration-config.md)
- [ ] Set up communication channels (Slack, email, etc.)
- [ ] Prepare first week task breakdown

## Day 1: Kickoff

### Morning (9:00 AM)
- [ ] **PM**: Send kickoff message to all agents
- [ ] **PM**: Ensure all agents have document access
- [ ] **PM**: Schedule Day 1 sync meeting (optional)

### Afternoon (2:00 PM)
- [ ] **PM**: Assign Phase 1 initial tasks:
  - [ ] Task → Database Architect: Design schema
  - [ ] Task → Financial Architect: Design calculation engine
  - [ ] Task → UI/UX Designer: Create design system
- [ ] **Agents**: Acknowledge task receipt
- [ ] **Agents**: Ask clarifying questions if needed

### Evening (5:00 PM)
- [ ] **PM**: First daily status update template sent to CAO
- [ ] **Agents**: Report end-of-day progress

## Day 2-5: Foundation Work

### Database Architect
- [ ] Read assigned sections of PRD and Financial Rules
- [ ] Create ERD (Entity-Relationship Diagram)
- [ ] Draft Prisma schema
- [ ] Document all tables and relationships
- [ ] Review with PM (Day 4)

### Financial Architect
- [ ] Read entire Financial Rules document (04_FINANCIAL_RULES.md)
- [ ] Create calculation dependency diagram
- [ ] Design three-period engine architecture
- [ ] Identify circular dependencies
- [ ] Document design decisions
- [ ] Review with PM (Day 4)

### UI/UX Designer
- [ ] Read UI/UX Specification (06_UI_UX_SPECIFICATION.md)
- [ ] Create mood board / inspiration
- [ ] Define color palette in Figma
- [ ] Set up typography system
- [ ] Design base components (buttons, inputs, cards)
- [ ] Review with PM and CAO (Day 5)

### Project Manager (Daily)
- [ ] Morning: Review agent standup updates
- [ ] Midday: Check for blockers, provide support
- [ ] Evening: Prepare next day priorities
- [ ] Friday: Weekly status update to CAO

## Week 2: Implementation Begins

### Backend Engineer Activation
- [ ] Read Backend Engineer spec: [backend-engineer.agent.md](./backend-engineer.agent.md)
- [ ] Review database schema (from Database Architect)
- [ ] Review API contracts needed
- [ ] Set up Next.js project / Express project
- [ ] Implement first CRUD endpoints

### Frontend Engineer Activation
- [ ] Read Frontend Engineer spec: [frontend-engineer.agent.md](./frontend-engineer.agent.md)
- [ ] Review design system (from UI/UX Designer)
- [ ] Set up Next.js project with Tailwind
- [ ] Implement base UI components
- [ ] Create layout components (sidebar, header)

### QA Engineer Activation
- [ ] Read QA Engineer spec: [qa-validation-engineer.agent.md](./qa-validation-engineer.agent.md)
- [ ] Review financial rules to understand validation needs
- [ ] Set up testing frameworks (Jest, Playwright)
- [ ] Begin creating Excel golden models

## Quality Gates

### Phase 1 Gate (Week 5)
- [ ] Database schema complete and reviewed
- [ ] Core API endpoints functional
- [ ] Single-year calculation works
- [ ] Design system approved by CAO
- [ ] 10+ reusable components ready
- [ ] All tests pass (>80% coverage)
- [ ] **PM approves** ✓
- [ ] **CAO approves** ✓

### Phase 2 Gate (Week 9)
- [ ] 30-year calculation completes in <1 second
- [ ] Balance sheet balances in all scenarios
- [ ] Cash flow reconciles
- [ ] All three rent models implemented
- [ ] Zero errors vs Excel golden models
- [ ] Tests pass (>90% coverage for financial code)
- [ ] **PM approves** ✓
- [ ] **QA approves** ✓
- [ ] **CAO approves** ✓

### Phase 3 Gate (Week 11)
- [ ] All user stories implemented
- [ ] Admin can input historical data
- [ ] Planner can create proposal in <10 minutes
- [ ] All forms have validation
- [ ] Financial statements display correctly
- [ ] Comparison dashboard works
- [ ] Responsive design tested
- [ ] **PM approves** ✓
- [ ] **UX approves** ✓
- [ ] **CAO approves** ✓

### Phase 4 Gate (Week 16 - Production)
- [ ] All features complete
- [ ] >80% test coverage
- [ ] Zero critical bugs
- [ ] Performance targets met
- [ ] User documentation complete
- [ ] Technical documentation complete
- [ ] Security review passed (if applicable)
- [ ] **PM approves** ✓
- [ ] **All agents sign off** ✓
- [ ] **CAO final approval** ✓
- [ ] **Deploy to production** 🚀

## Communication Checkpoints

### Daily (9:00 AM)
- [ ] All agents post standup update
- [ ] PM reviews and responds

### Weekly (Friday 10:00 AM)
- [ ] Sprint review meeting (PM + Agents + CAO)
- [ ] Demo working features
- [ ] Review metrics
- [ ] Plan next sprint

### As Needed
- [ ] Integration sync meetings (relevant agents)
- [ ] Design review sessions
- [ ] Emergency escalations

## Success Criteria Checklist

### Financial Accuracy
- [ ] Balance sheet balances every year (diff <$0.01)
- [ ] Cash flow reconciles every year (diff <$0.01)
- [ ] Calculations match Excel models (diff <$100)
- [ ] Circular solver converges (<10 iterations typical)

### Performance
- [ ] 30-year calculation: <1 second ✓
- [ ] API response time: <200ms (non-calc endpoints) ✓
- [ ] UI interaction: <200ms ✓
- [ ] Scenario slider update: <200ms ✓

### Quality
- [ ] Test coverage: >80% overall ✓
- [ ] Test coverage: >90% financial engine ✓
- [ ] Zero critical bugs ✓
- [ ] All user workflows tested ✓

### User Experience
- [ ] Proposal creation: <10 minutes ✓
- [ ] Intuitive navigation (no training needed) ✓
- [ ] Board-presentation quality ✓
- [ ] Responsive design (desktop + tablet) ✓
- [ ] Accessibility: WCAG 2.1 AA ✓

## Handoff Checklist

### Code Handoff (Agent → Agent)
- [ ] Code reviewed
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Types exported
- [ ] Examples provided
- [ ] No missing dependencies

### Design Handoff (UX → Frontend)
- [ ] Figma file shared
- [ ] Design tokens exported
- [ ] Component specs documented
- [ ] Responsive behaviors defined
- [ ] Assets exported
- [ ] CAO approval obtained

### API Handoff (Backend → Frontend)
- [ ] OpenAPI spec complete
- [ ] Postman collection provided
- [ ] Test endpoints available
- [ ] Authentication documented
- [ ] Error codes documented

## Final Deliverables

### Code
- [ ] Complete source code in Git
- [ ] README with setup instructions
- [ ] Environment configuration
- [ ] Deployment guide

### Documentation
- [ ] Technical architecture document
- [ ] API documentation
- [ ] Database schema documentation
- [ ] User guide (Admin, Planner, Viewer)

### Testing
- [ ] Automated test suite
- [ ] Validation test cases
- [ ] Performance test results
- [ ] Known issues log

### Training
- [ ] Video walkthrough (30 mins)
- [ ] Quick start guide
- [ ] Troubleshooting guide
- [ ] FAQ document

## Emergency Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Technical blocker | PM | 4 hours |
| Financial logic question | PM → CAO | 2 hours |
| Timeline risk | PM → CAO | 24 hours |
| Critical bug | QA → PM → CAO | 4 hours |

---

## Quick Reference

**Start Here:** [AGENT_IMPLEMENTATION_GUIDE.md](../AGENT_IMPLEMENTATION_GUIDE.md)

**Agent Specs:**
- [project-manager.agent.md](./project-manager.agent.md)
- [financial-architect.agent.md](./financial-architect.agent.md)
- [backend-engineer.agent.md](./backend-engineer.agent.md)
- [frontend-engineer.agent.md](./frontend-engineer.agent.md)
- [database-architect.agent.md](./database-architect.agent.md)
- [ui-ux-designer.agent.md](./ui-ux-designer.agent.md)
- [qa-validation-engineer.agent.md](./qa-validation-engineer.agent.md)

**Process:** [orchestration-config.md](./orchestration-config.md)

---

**Status:** Ready for Activation ✅
**Last Updated:** 2025-11-22
