# PHASE 4 AGENT ORCHESTRATION RULES

**Project:** Project Zeta - Phase 4 Polish & Production
**Version:** 1.0
**Date:** November 24, 2025

---

## 🎯 ORCHESTRATION PRINCIPLES

### 1. **PARALLEL EXECUTION FIRST**
- **Rule:** Always identify tasks that can run in parallel
- **Benefit:** Reduces total calendar time from 35+ days to 15 days
- **Example:** Tracks 1, 2, 4, 5a have zero dependencies → run simultaneously

### 2. **CLEAR OWNERSHIP**
- **Rule:** Each task has ONE agent owner (no shared responsibility)
- **Benefit:** Clear accountability, no confusion
- **Example:** Track 1 = UI/UX Agent ONLY

### 3. **EXPLICIT DEPENDENCIES**
- **Rule:** All dependencies documented upfront
- **Benefit:** Prevents blocked agents, enables proactive planning
- **Example:** Track 3 (QA) depends on Track 2 (Performance) completion

### 4. **DAILY UPDATES MANDATORY**
- **Rule:** Every agent posts daily update (completed, in-progress, blockers)
- **Benefit:** Early identification of issues, transparency
- **Location:** PHASE_4_DAILY_TRACKER.md

### 5. **ESCALATE BLOCKERS IMMEDIATELY**
- **Rule:** Don't wait - escalate blockers within 2 hours
- **Benefit:** Prevents cascade delays
- **Process:** Post in tracker + notify project manager

---

## 🤖 AGENT RESPONSIBILITIES

### UI/UX Agent (Track 1)
**Primary Skills:** React, Next.js, UI/UX Design
**Secondary Skills:** API integration, RBAC

**Responsibilities:**
1. Implement all UI features (role-based UI, duplicate, bulk actions)
2. Ensure consistent design language
3. Test features manually before marking complete
4. Update tracker daily
5. Create UI components following existing patterns

**Key Files:**
- `src/app/**/*.tsx` (all pages)
- `src/components/**/*.tsx` (all components)
- `src/lib/hooks/useAuth.ts` (role-based access)

**Success Criteria:**
- All features work as specified
- No UI bugs
- Responsive design
- Accessible (keyboard nav, screen reader)

---

### Performance Agent (Track 2)
**Primary Skills:** React Performance, Database Optimization
**Secondary Skills:** Bundle Analysis, Web Performance

**Responsibilities:**
1. Implement all performance optimizations
2. Measure performance before and after (metrics!)
3. Run Lighthouse and share scores
4. Test with large datasets (50+ proposals)
5. Document optimization techniques used

**Key Files:**
- `src/lib/cache/calculation-cache.ts` (caching)
- `src/components/**/*.tsx` (React.memo, useMemo, useCallback)
- `prisma/schema.prisma` (indexes)
- `next.config.ts` (bundle config)

**Success Criteria:**
- Cache hit <100ms
- Bundle <300KB
- Lighthouse >90
- Database queries <50ms
- No N+1 query problems

**CRITICAL:** Track 2 must be 100% complete before Track 3 starts!

---

### QA Agent (Track 3)
**Primary Skills:** Testing (Unit, Integration, E2E), Financial Modeling
**Secondary Skills:** Load Testing, Security Testing

**Responsibilities:**
1. Write comprehensive test suite (>80% coverage)
2. Create Excel golden models (3 rent types)
3. Run load tests and document results
4. Perform security audit
5. Document all findings and fixes

**Key Files:**
- `tests/**/*.test.ts` (all tests)
- `tests/e2e/**/*.spec.ts` (Playwright E2E tests)
- `validation/golden-models/*.xlsx` (Excel references)
- `load-tests/scenarios.yml` (load testing config)

**Success Criteria:**
- >80% code coverage (target: 85%+)
- All tests passing
- Excel validation <$100 difference
- Load tests pass (50 users, p95 <2s)
- Zero critical security vulnerabilities

**DEPENDENCY:** Cannot start until Track 2 is 100% complete

---

### Documentation Agent (Track 4)
**Primary Skills:** Technical Writing, Documentation
**Secondary Skills:** Architecture Understanding, API Documentation

**Responsibilities:**
1. Write clear, comprehensive documentation
2. Include screenshots and examples
3. Test all instructions (can user follow them?)
4. Review for clarity and completeness
5. Organize docs logically

**Key Files:**
- `docs/user-guide/*.md` (3 user guides + FAQ)
- `docs/technical/*.md` (5 technical docs)

**Success Criteria:**
- All guides complete (8 documents)
- Screenshots included (or placeholders marked)
- Deployment guide tested (can deploy from scratch)
- FAQ addresses common questions (at least 10)
- Clear, concise writing (avoid jargon)

**NOTE:** No dependencies - can work independently!

---

### DevOps Agent (Track 5)
**Primary Skills:** CI/CD, Vercel, GitHub Actions
**Secondary Skills:** Monitoring, Database Administration

**Responsibilities:**
1. Configure all deployment infrastructure
2. Set up CI/CD pipeline (automated testing + deployment)
3. Configure monitoring and alerting
4. Execute production deployment
5. Handle launch checklist

**Key Files:**
- `.github/workflows/*.yml` (CI/CD pipelines)
- `vercel.json` (Vercel config)
- `sentry.*.config.ts` (error tracking)
- `load-tests/` (load testing setup)

**Success Criteria:**
- CI runs on every PR (lint, build, test)
- CD deploys on merge to main (with approval)
- Monitoring active (Sentry, Analytics, Uptime)
- Production deployed successfully
- CAO approval obtained

**SPLIT WORK:**
- Track 5a (Days 1-5): No dependencies - start immediately
- Track 5b (Days 13-15): Depends on Track 3 (all tests passing)

---

## 📋 COMMUNICATION PROTOCOLS

### Daily Stand-up (Async)
**Time:** End of day (agent's timezone)
**Location:** PHASE_4_DAILY_TRACKER.md
**Format:**
```
### Agent: [Name]
### Date: [YYYY-MM-DD]
### Track: [Number]

**Yesterday:**
- Completed: [list tasks]
- Achievements: [any wins]

**Today:**
- Working on: [current task]
- Expected completion: [ETA]

**Blockers:**
- [list any blockers or "None"]

**Metrics:**
- [relevant metrics for your track]
```

### Weekly Review
**Time:** End of Week 1, 2, 3
**Location:** Video call or async document
**Agenda:**
1. Review progress vs plan
2. Identify blockers and resolve
3. Adjust timeline if needed
4. Celebrate wins
5. Plan next week

### Blocker Escalation
**When:** Within 2 hours of identifying blocker
**How:**
1. Post in PHASE_4_DAILY_TRACKER.md (Issues & Risks section)
2. Notify project manager (Slack/email)
3. Tag as 🔴 CRITICAL if blocks progress

**Example Blockers:**
- "Waiting for Track 2 completion" (expected - not a blocker)
- "API endpoint returning 500 error" (blocker - escalate!)
- "Cannot deploy to Vercel - auth error" (blocker - escalate!)

---

## 🎯 DEPENDENCY MANAGEMENT

### Week 1 (Days 1-5): NO BLOCKERS
**Parallel Tracks:** 1, 2, 4, 5a

```
Day 1 ─┬─ Track 1 Agent ─┐
       ├─ Track 2 Agent ─┤
       ├─ Track 4 Agent ─┼─► All working independently
       └─ Track 5a Agent ┘
```

**No dependencies = maximum parallelism!**

### Week 2 (Days 6-12): ONE DEPENDENCY
**Sequential Track:** 3 (depends on Track 2)

```
Day 5 ─► Track 2 Complete ─► Day 6 ─► Track 3 Start
```

**Checkpoint:** Before Track 3 starts, verify:
- [ ] Track 2 100% complete
- [ ] All performance targets met
- [ ] Cache implemented and working
- [ ] Database optimized
- [ ] Bundle <300KB

**If Track 2 not complete:** Track 3 CANNOT start! Extend Track 2.

### Week 3 (Days 13-15): ONE DEPENDENCY
**Sequential Track:** 5b (depends on Track 3)

```
Day 12 ─► Track 3 Complete ─► Day 13 ─► Track 5b Start
```

**Checkpoint:** Before Track 5b starts, verify:
- [ ] Track 3 100% complete
- [ ] All tests passing (>80% coverage)
- [ ] Financial validation complete
- [ ] Load testing complete
- [ ] Security audit complete
- [ ] Zero critical bugs

**If Track 3 not complete:** Track 5b CANNOT start! Extend Track 3.

---

## 🚨 RISK MITIGATION

### Risk: Track 2 delayed → Blocks Track 3
**Mitigation:**
- Daily check-ins on Track 2 progress
- Identify delays early (Day 3-4)
- Reallocate resources if needed
- Extend Week 2 if necessary

**Contingency:**
- If Track 2 delayed by >2 days, shift Track 3 start by same amount
- Update all downstream dates
- Communicate to stakeholders

### Risk: Tests don't reach 80% coverage
**Mitigation:**
- Track coverage daily in Track 3
- Start with highest-priority code paths
- Don't write redundant tests (quality over quantity)

**Contingency:**
- If coverage stuck at 70-75%, reassess coverage target
- Focus on critical paths (calculation engine, RBAC, financial statements)
- Document uncovered code and rationale

### Risk: Production deployment fails
**Mitigation:**
- Test staging environment thoroughly (Week 2)
- Run smoke tests before production
- Have rollback plan ready

**Contingency:**
- If deployment fails, rollback to previous version
- Debug issue in staging
- Retry production deployment after fix

### Risk: CAO doesn't approve
**Mitigation:**
- Weekly reviews with CAO
- Address feedback immediately
- Demo working features frequently

**Contingency:**
- If CAO has concerns, create punch list
- Assign agent to address concerns
- Schedule follow-up approval meeting

---

## ✅ QUALITY GATES

### Quality Gate 1: End of Week 1 (Day 5)
**Required:** Tracks 1, 2, 4, 5a complete

**Checklist:**
- [ ] All advanced features working (Track 1)
- [ ] All performance targets met (Track 2)
- [ ] All documentation written (Track 4)
- [ ] CI/CD pipeline active (Track 5a)

**Decision:** Proceed to Week 2 (Track 3) OR extend Week 1

---

### Quality Gate 2: End of Week 2 (Day 12)
**Required:** Track 3 complete (all tests passing)

**Checklist:**
- [ ] >80% test coverage
- [ ] Zero critical bugs
- [ ] Financial validation complete
- [ ] Load testing complete
- [ ] Security audit complete

**Decision:** Proceed to Week 3 (Track 5b) OR extend Week 2

---

### Quality Gate 3: End of Week 3 (Day 15)
**Required:** Production deployed and launched

**Checklist:**
- [ ] Production deployed successfully
- [ ] All users onboarded
- [ ] Documentation distributed
- [ ] Monitoring active
- [ ] CAO approval obtained
- [ ] Launch announcement sent

**Decision:** Phase 4 COMPLETE OR continue with fixes

---

## 📊 SUCCESS METRICS BY TRACK

### Track 1: Advanced Features
- **Metric:** Features implemented
- **Target:** 4/4 features (role-based UI, duplicate, bulk actions, audit log)
- **Measurement:** Manual testing + code review

### Track 2: Performance
- **Metric 1:** Cache hit time
- **Target:** <100ms
- **Measurement:** Lighthouse, custom performance logs

- **Metric 2:** Bundle size
- **Target:** <300KB (gzipped)
- **Measurement:** `@next/bundle-analyzer`

- **Metric 3:** Database query time
- **Target:** <50ms (p95)
- **Measurement:** Prisma query logs

### Track 3: Testing
- **Metric 1:** Test coverage
- **Target:** >80%
- **Measurement:** `pnpm test:coverage`

- **Metric 2:** Financial validation
- **Target:** <$100 difference vs Excel
- **Measurement:** Custom validation tests

- **Metric 3:** Load testing
- **Target:** 50 concurrent users, p95 <2s
- **Measurement:** Artillery load tests

### Track 4: Documentation
- **Metric:** Documents written
- **Target:** 8/8 documents (3 user guides + FAQ + 4 technical docs)
- **Measurement:** Manual review + completeness check

### Track 5: Deployment
- **Metric 1:** CI/CD pipeline
- **Target:** 100% automated (no manual steps)
- **Measurement:** GitHub Actions success rate

- **Metric 2:** Production uptime
- **Target:** 99.9% (after launch)
- **Measurement:** Uptime monitoring service

---

## 🎓 BEST PRACTICES

### For All Agents

1. **Read before you write**
   - Review existing code patterns
   - Follow established conventions
   - Don't reinvent the wheel

2. **Test as you go**
   - Don't wait until Track 3 to test
   - Manual testing during development
   - Fix bugs immediately

3. **Document your work**
   - Add code comments for complex logic
   - Update relevant docs
   - Leave breadcrumbs for future maintainers

4. **Communicate proactively**
   - Daily updates (no exceptions)
   - Escalate blockers early
   - Share wins and learnings

5. **Quality over speed**
   - Don't rush to meet deadlines
   - Buggy code is worse than delayed code
   - If you need more time, ask

### Specific to UI/UX Agent

- Use existing component patterns (src/components/ui/)
- Ensure responsive design (test on mobile)
- Follow accessibility guidelines (WCAG AA)
- Test with different roles (ADMIN, PLANNER, VIEWER)

### Specific to Performance Agent

- Measure before optimizing (baseline metrics)
- Measure after optimizing (improvement metrics)
- Document optimization techniques
- Don't over-optimize (diminishing returns)

### Specific to QA Agent

- Prioritize critical paths first
- Write clear, maintainable tests
- Test edge cases (0% enrollment, negative income)
- Document test scenarios and expected results

### Specific to Documentation Agent

- Write for your audience (beginner-friendly)
- Include screenshots and examples
- Test instructions (can user follow?)
- Keep docs up-to-date as features change

### Specific to DevOps Agent

- Automate everything (no manual deployment steps)
- Test in staging before production
- Have rollback plan ready
- Monitor after deployment (first 24 hours critical)

---

## 🏁 LAUNCH CRITERIA

Phase 4 is complete and ready for launch when ALL of the following are met:

### Code Quality ✅
- [ ] All tests passing
- [ ] >80% code coverage
- [ ] Lint passing (zero warnings)
- [ ] Build passing
- [ ] Zero critical bugs

### Performance ✅
- [ ] 30-year calculation <1s
- [ ] Cached results <100ms
- [ ] Bundle size <300KB
- [ ] Lighthouse score >90
- [ ] Database queries <50ms

### Security ✅
- [ ] RBAC enforced on all endpoints
- [ ] No vulnerabilities (npm audit)
- [ ] Security audit passed
- [ ] Rate limiting configured
- [ ] No secrets in client bundle

### Documentation ✅
- [ ] All user guides complete (Admin, Planner, Viewer)
- [ ] FAQ complete (at least 10 Q&As)
- [ ] Technical docs complete (5 docs)
- [ ] Deployment guide tested

### Deployment ✅
- [ ] Staging environment working
- [ ] Production environment ready
- [ ] CI/CD pipeline active
- [ ] Monitoring active (Sentry, Analytics, Uptime)
- [ ] Database backups configured

### Stakeholder Approval ✅
- [ ] CAO approval obtained
- [ ] Users onboarded
- [ ] Launch announcement ready
- [ ] Support channels ready

**If ANY criterion is not met, launch is NO-GO. Fix issues and reassess.**

---

## 📞 ESCALATION PATH

### Level 1: Daily Stand-up
**For:** Minor issues, questions, status updates
**Response Time:** Next daily update
**Example:** "Need clarification on feature requirement"

### Level 2: Project Manager
**For:** Blockers, delays, resource issues
**Response Time:** Within 4 hours
**Example:** "Cannot deploy to Vercel - need access"

### Level 3: Technical Lead
**For:** Technical decisions, architecture questions
**Response Time:** Within 8 hours
**Example:** "Should we use LRU cache or Redis for caching?"

### Level 4: CAO / Stakeholder
**For:** Scope changes, major delays, budget issues
**Response Time:** Within 24 hours
**Example:** "Security audit found critical issue, need 2 extra days"

---

## 🎉 CELEBRATION MILESTONES

Celebrate progress to maintain team morale!

- **Day 5:** Week 1 complete! 🎊 (4 tracks done in parallel)
- **Day 12:** Week 2 complete! 🎉 (all tests passing)
- **Day 15:** LAUNCH DAY! 🚀 (production live)

**Team Recognition:**
- Top Performer Award (fastest track completion)
- Quality Award (zero bugs found in review)
- Documentation Award (best-written docs)

---

**Status:** 🚀 READY FOR ORCHESTRATION
**Next Step:** Assign agents to tracks and begin Week 1
**Prepared by:** Claude Code - Agent Orchestration
**Date:** November 24, 2025

---

**END OF AGENT ORCHESTRATION RULES**

*Follow these rules to ensure smooth parallel execution, clear communication, and successful Phase 4 completion!*
