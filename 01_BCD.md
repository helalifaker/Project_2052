# BUSINESS CASE DOCUMENT
## School Lease Proposal Assessment Application

---

**Document Version:** 1.0  
**Date:** November 22, 2025  
**Prepared By:** Board Member  
**Status:** DRAFT - Under Review

---

## 1. EXECUTIVE SUMMARY

**Purpose:** This business case outlines the development of a personal assessment tool to evaluate long-term lease proposals for school facilities. As a board member, this tool will enable systematic comparison of different developer proposals and their financial impact on the school over extended time horizons.

**Problem Statement:** The school board regularly receives lease proposals from multiple developers, each presenting different lease models, payment structures, escalation clauses, and terms. With a planned 2028 relocation and 25-year lease commitment (through 2053), comparing these proposals and understanding their long-term financial implications is critical. The 25-year time horizon adds significant complexity: small differences in escalation rates compound dramatically, making manual spreadsheet analysis time-consuming, error-prone, and difficult to present clearly to fellow board members.

**Proposed Solution:** Develop a web-based application that allows input of various lease proposal scenarios from different developers, simulates the financial impact over the lease term (revenue and cost projections, particularly rental costs), and provides comparative analysis to support informed board decision-making.

**Expected Benefits:** 
- Rapid comparison of multiple lease proposals side-by-side
- Clear visualization of long-term financial impacts
- Scenario sensitivity analysis (e.g., enrollment changes, inflation variations)
- Professional presentation materials for board meetings
- Reusable tool for future lease evaluations

**Investment Required:** Personal time investment for development (hobby project). Minimal monetary cost (hosting, domain if needed).

**Recommendation:** Proceed with requirements definition and incremental development of a minimum viable product (MVP) focusing on core comparison capabilities.

---

## 2. BUSINESS CONTEXT

### 2.1 Background

As a board member of the school, one of the critical responsibilities is evaluating facility-related decisions that impact the school's financial sustainability over decades. The school is planning a major relocation expected to occur by 2028, requiring evaluation of long-term lease agreements spanning 25 years. These lease decisions are among the most consequential, as they:

- Lock the school into 25-year financial commitments
- Impact cash flow stability and budgeting flexibility through 2053
- Affect the school's ability to respond to enrollment changes over multiple decades
- Influence overall operational costs and tuition pricing for a generation of students
- Determine facility quality and expansion options for the school's long-term future

**Critical Timeline:**
- **Target Relocation Date:** 2028
- **Lease Commencement:** 2028 (projected)
- **Lease Term:** 25 years
- **Lease End:** 2053
- **Decision Timeline:** Proposals must be evaluated and decision made in advance of 2028 relocation

### 2.2 Current Challenges

**Multiple Proposal Formats:** Developers present proposals in different formats, making direct comparison difficult. Some focus on monthly rates, others on annual commitments, and escalation clauses vary widely.

**Complex Lease Structures:** Proposals include various components:
- Base rent with different escalation models (fixed %, CPI-based, step increases)
- Maintenance and operating cost allocations
- Capital improvement responsibilities
- Renewal options and terms
- Early termination clauses and penalties

**25-Year Time Horizon Complexity:** A 25-year commitment (2028-2053) presents unique analytical challenges:
- Small differences in year 1 rent become massive differences by year 25
- A 3% vs 4% escalation rate: $500K → $1.05M vs $1.33M (64% difference in year 25)
- Compounding effects over 25 years make accurate modeling essential
- Economic assumptions (inflation, enrollment, demographics) become increasingly uncertain
- Multiple business cycles, potential recessions, and demographic shifts must be considered
- The school will serve multiple generations of students under this one lease decision

**Long-Term Impact Assessment:** Understanding how a lease proposal affects the school 5, 10, 15, 20, and 25 years into the future requires modeling:
- Revenue projections (enrollment-driven tuition over 25 years)
- Cost projections (rent escalation, utilities, maintenance through 2053)
- Cash flow implications across multiple decades
- Break-even analysis at various time points
- Sensitivity to key assumptions over an extended horizon
- Impact of potential demographic and economic changes

**Board Communication:** Presenting complex financial scenarios to board members with varying financial backgrounds requires clear, visual, and intuitive analysis.

### 2.3 Personal Motivation

This tool serves as both a practical solution for board responsibilities and a personal development project to:
- Apply financial planning and analysis skills
- Develop software development capabilities
- Create lasting value for the school community
- Build a reusable framework for future board service

---

## 3. PROBLEM STATEMENT

### 3.1 Current State

The board currently evaluates lease proposals through:
- Excel spreadsheet models built ad-hoc for each proposal
- Manual data entry and formula creation
- Static comparison tables that don't support "what-if" analysis
- Presentation slides created separately from analysis
- Limited ability to quickly adjust assumptions during board discussions

This approach has several limitations:
- Time-intensive preparation (4-8 hours per proposal comparison)
- Error-prone manual processes
- Difficulty incorporating last-minute proposal changes
- Limited ability to explore scenarios during meetings
- No standardized comparison methodology
- Models aren't reusable for future lease evaluations

### 3.2 Impact of Not Addressing

Without a systematic assessment tool:
- Risk of suboptimal lease decisions due to incomplete analysis
- Inability to effectively negotiate with developers (lack of clear comparison data)
- Board discussions limited by static presentations rather than interactive exploration
- Missed insights from scenario analysis
- Future boards repeating the same manual work

---

## 4. PROPOSED SOLUTION

### 4.1 Solution Overview

Develop a **School Lease Proposal Assessment Application** with the following core capabilities:

**Three-Period Financial Modeling Framework**

The application will implement a sophisticated three-period approach aligned with the school's relocation timeline:

1. **Historical Period (2023-2024):** Baseline data for ratio calculations and trend analysis
2. **Transition Period (2025-2027):** Pre-relocation years using ratio-based projections from 2024 actuals
3. **Dynamic Period (2028-2053):** Post-relocation 25-year projections with full scenario modeling

This phased approach ensures accurate modeling across different operational contexts while maintaining continuity.

**Core Financial Capabilities**

**Comprehensive Financial Statements:**
- Profit & Loss (P&L) statement with revenue, operating expenses, EBITDA, depreciation, interest, and net income
- Balance Sheet with assets, liabilities, and equity tracking
- Cash Flow Statement using indirect method
- Working capital management (accounts receivable, payable, deferred revenue)

**Lease Proposal Modeling:**
- Multiple rent models support:
  - **Fixed Escalation Model:** Base rent with percentage escalation (e.g., 3% annually)
  - **Revenue Share Model:** Rent as percentage of school revenue
  - **Partner Model:** Complex structures with base rent, revenue share, and profit sharing
- Model different escalation mechanisms (fixed %, CPI-based, step increases, hybrid)
- Calculate total cost of occupancy including CAM charges, utilities, maintenance
- Project rental costs over full 25-year term (2028-2053)

**Revenue & Enrollment Modeling:**
- Dual curriculum support (French and International Baccalaureate)
- Student capacity and ramp-up projections (2028-2032 growth phase)
- Tuition growth modeling with configurable rates and frequencies
- Other revenue streams (cafeteria, programs) automatically scaled to tuition
- Enrollment sensitivity analysis

**Operating Cost Projections:**
- Staff cost modeling (teachers and non-teaching staff based on student ratios)
- CPI-based cost escalation from 2028 baseline
- Operating expense categories with revenue-based percentages
- Depreciation tracking for old and new assets
- Zakat calculations (2.5% on equity minus non-current assets)

**Scenario Comparison Engine:**
- Side-by-side comparison of multiple developer proposals
- Normalize different lease structures for apples-to-apples comparison
- Calculate Net Present Value (NPV) and financial metrics
- Identify break-even points and crossover scenarios
- Sensitivity analysis on key assumptions (enrollment, inflation, tuition growth)

### 4.2 Key Features and Functionality

#### Three-Period Modeling Approach

**Historical Period (2023-2024):**
- Direct data retrieval from actuals
- Establishes baseline ratios for transition period
- No calculations performed (pure historical data)

**Transition Period (2025-2027):**
- Ratio-based projections from 2024 baseline
- Student count × average tuition for revenue
- Operating costs scale with revenue using 2024 ratios
- Simple rent escalation from current campus
- French curriculum only (no IB program during transition)

**Dynamic Period (2028-2053):**
- Full 25-year projection post-relocation
- Three rent model options for developer proposals
- Capacity-based enrollment with 5-year ramp-up (2028-2032)
- Dual curriculum support (French + optional IB)
- CPI-based cost escalation
- Comprehensive financial statements (P&L, Balance Sheet, Cash Flow)

#### Lease Proposal Comparison Module

**Three Rent Model Options:**

1. **Fixed Escalation Model**
   - Base annual rent
   - Fixed percentage escalation (e.g., 3% per year)
   - Predictable cost trajectory
   - Simple comparison metric

2. **Revenue Share Model**
   - Rent as percentage of school revenue
   - Aligns landlord interest with school success
   - Variable annual rent based on enrollment and tuition
   - Natural hedge against enrollment decline

3. **Partner Model** (Hybrid)
   - Base rent + revenue share component
   - Optional profit share after certain thresholds
   - Complex structure requiring detailed modeling
   - Potential for aligned incentives

**Comparison Analytics:**
- Total cost over 25 years for each model
- Year-by-year cost comparison
- NPV calculations at specified discount rates
- Cost per student metrics
- Rent as percentage of revenue over time
- Crossover analysis (when proposals switch ranking)

#### Revenue & Enrollment Engine

**Student Enrollment Modeling:**
- Maximum capacity input (e.g., 2,000 students)
- 5-year ramp-up plan (2028-2032): Year 1: 60%, Year 2: 75%, Year 3: 85%, Year 4: 95%, Year 5: 100%
- Steady state from Year 6 onwards (2033-2053)
- Separate French and IB curriculum tracking

**Tuition Projection:**
- Base tuition per curriculum (2028 starting point)
- Tuition growth rate (separate from CPI)
- Configurable growth frequency (annual, biennial, etc.)
- Different rates for French vs IB if needed

**Other Revenue:**
- Automatically calculated as ratio of tuition (based on 2024 baseline)
- Includes cafeteria, transportation, programs, facilities rental
- Scales proportionally with enrollment and tuition growth

#### Operating Cost Modeling

**Staff Costs:**
- Teacher staffing: Students per teacher ratio (e.g., 14:1)
- Non-teaching staff: Students per staff ratio (e.g., 50:1)
- Average salary per category
- 2028 baseline calculation
- CPI-based escalation from 2029 onwards

**Other Operating Expenses:**
- Single percentage of revenue (e.g., 46%)
- Simplified approach for long-term projection
- Includes all non-staff, non-rent operating costs

**Depreciation:**
- Old assets: Fixed annual depreciation until fully depreciated
- New assets: Rate-based depreciation on net book value
- CapEx module for additions and disposals

**Financial Calculations:**
- Interest expense based on debt position
- Zakat at 2.5% on (equity - non-current assets)
- Circular dependency solver for interest and zakat

#### Working Capital Management

**Auto-Calculated Based on 2024 Ratios:**
- Accounts Receivable (days outstanding)
- Prepaid Expenses (days)
- Accounts Payable (days outstanding)
- Accrued Expenses (days)
- Deferred Revenue (tuition collected in advance)

**Cash Management:**
- Automatic balancing with 1M SAR minimum
- Debt auto-balancing if cash insufficient
- No shareholder injections or dividends (foundation structure)

#### Reporting & Visualization Module

**Financial Statements:**
- 10-line P&L statement (Revenue through Net Income)
- Balance Sheet (Assets, Liabilities, Equity)
- Cash Flow Statement (Operating, Investing, Financing)
- 30-year view (2023-2053)

**Lease Comparison Dashboards:**
- Line charts showing rent trajectory for all proposals
- Bar charts comparing total costs
- Tables with key metrics side-by-side
- Heat maps highlighting best/worst performers

**Scenario Analysis:**
- Enrollment sensitivity (optimistic, base, conservative)
- CPI variation impact
- Tuition growth scenarios
- Combined scenario matrices

**Export Capabilities:**
- Board-ready presentation materials
- PDF reports
- Excel export for detailed review
- Summary slides with key recommendations

---

## 5. ALTERNATIVES ANALYSIS

### 5.1 Option 1: Custom Web Application (Recommended)

**Description:** Build a custom web application using modern web technologies (React/Next.js frontend, backend for financial calculations and data persistence). The application will implement sophisticated financial modeling with three distinct periods, multiple rent models, and complete financial statement generation.

**Advantages:**
- Tailored exactly to school's lease evaluation needs
- Implements complex business logic not available in commercial tools
- Full control over features and future enhancements
- Accessible from any device during board meetings
- Reusable for future lease evaluations
- Personal skill development in full-stack financial application development

**Disadvantages:**
- Requires significant time investment (80-120 hours given complexity)
- Ongoing maintenance responsibility
- Need to learn/apply web development skills
- Complex financial logic requires careful testing and validation

**Estimated Effort:** 80-120 hours over 3-4 months

**Technical Complexity Notes:**
- Three-period calculation engine with different methodologies per period
- Circular dependency solver for interest and zakat calculations
- Balance sheet auto-balancing with debt management
- Working capital calculations based on days outstanding
- Multiple rent model implementations
- 30-year financial projection (2023-2053)

### 5.2 Option 2: Advanced Excel Model

**Description:** Develop a sophisticated Excel workbook with multiple sheets, macros, and charts.

**Advantages:**
- Familiar tool for most board members
- No hosting or deployment requirements
- Can be shared as a file
- Relatively quick to build (20-30 hours)

**Disadvantages:**
- Limited interactivity compared to web app
- Version control challenges
- Less professional presentation
- Difficult to use during meetings (screen sharing limitations)
- Not easily accessible on mobile devices
- Macro compatibility issues across platforms

**Estimated Effort:** 20-30 hours

### 5.3 Option 3: Google Sheets with Apps Script

**Description:** Create a Google Sheets model enhanced with Apps Script for automation and custom functions.

**Advantages:**
- Cloud-based collaboration
- Accessible from anywhere
- Familiar spreadsheet interface
- No hosting costs
- Real-time collaboration during meetings

**Disadvantages:**
- Limited UI/UX capabilities
- Performance issues with complex models
- Less polished than custom app
- Constraints of spreadsheet paradigm

**Estimated Effort:** 25-35 hours

### 5.4 Option 4: Commercial Real Estate Software

**Description:** Use commercial lease analysis software (e.g., Argus, CoStar Suite).

**Advantages:**
- Professional-grade analysis
- Comprehensive features
- Industry-standard outputs

**Disadvantages:**
- Expensive ($1,000s+ annually)
- Overkill for school board needs
- Steep learning curve
- Not customized to educational context

**Estimated Effort:** 10-15 hours learning, plus subscription costs

### 5.5 Recommendation

**Proceed with Option 1 (Custom Web Application)** for the following reasons:

1. **Optimal long-term value** - Reusable for all future lease evaluations
2. **Best user experience** - Interactive, modern interface suitable for board presentations
3. **Skill development** - Aligns with personal learning goals
4. **Flexibility** - Can evolve with board's needs
5. **Professional presentation** - Enhances credibility in board discussions

The time investment is justified by the tool's reusability and the value it brings to board decision-making.

---

## 6. COST-BENEFIT ANALYSIS

### 6.1 Costs

**Time Investment:**
- Requirements and design: 15 hours
- Core three-period modeling engine: 50-70 hours
- Three rent model implementations: 20-25 hours
- Financial statements (P&L, BS, CF): 15-20 hours
- Testing and validation: 15-20 hours
- Documentation and user guide: 5-10 hours
- **Total: 120-160 hours over 3-4 months**

**Monetary Costs:**
- Domain name (optional): $10-15/year
- Hosting (Vercel/Netlify may require paid tier for backend): $0-20/month
- Development tools: $0 (using open source)
- **Total: $0-255/year**

**Note on Time Investment:**
The higher time estimate (vs. original 65-90 hours) reflects the sophisticated financial modeling requirements discovered during detailed planning. The application now includes:
- Three distinct calculation methodologies by period
- Complete financial statement generation (P&L, Balance Sheet, Cash Flow)
- Circular dependency solvers
- Three rent model options
- Working capital management
- 30-year projection capabilities

This is effectively a comprehensive financial planning system, not just a simple lease comparison tool.

### 6.2 Benefits (Quantitative)

**Time Savings:**
- Current proposal analysis time: 6-8 hours per proposal
- With tool: 1-2 hours per proposal (data entry and review)
- Time savings: 4-6 hours per proposal
- Typical board cycle: 2-3 major lease evaluations per term
- **Annual time savings: 8-18 hours** (after tool is built)

**Break-even Analysis:**
- Development time: 140 hours (midpoint estimate)
- Time savings per use: 6-8 hours per proposal (given tool sophistication)
- **Break-even: ~18-23 lease proposal evaluations or major financial analyses**

However, this calculation understates the value:
- The tool enables analysis that would be practically impossible manually (30-year projections with three rent models, complete financial statements)
- Can be used for scenarios beyond lease evaluation (enrollment planning, tuition modeling, financial sustainability analysis)
- Provides board-quality outputs that manual spreadsheets cannot match
- Skills developed are transferable to professional role

### 6.3 Benefits (Qualitative)

**Decision Quality:**
- More comprehensive analysis leads to better-informed decisions
- A superior lease decision could save the school hundreds of thousands over a 25-year term
- Even a 2% improvement in lease terms on a $500K/year lease = $10K/year × 25 years = $250K+ in cumulative savings (before compounding)
- The difference between 3% and 4% annual escalation over 25 years is enormous (year 25: $1.05M vs $1.33M annual rent)

**Board Effectiveness:**
- Professional presentation enhances board credibility
- Interactive analysis during meetings improves discussion quality
- Clear visualization helps all board members (regardless of financial background) participate

**Risk Mitigation:**
- Thorough scenario analysis identifies risks earlier
- Sensitivity analysis prevents over-optimistic assumptions
- Standardized methodology ensures consistent evaluation

**Personal Development:**
- Enhanced software development skills
- Deeper understanding of financial modeling
- Stronger analytical capabilities applicable to professional role

**Future Value:**
- Tool remains useful for entire board tenure and beyond
- Can be transferred to future board members
- Potential adaptation for other board decisions (e.g., capital projects)

### 6.4 Return on Investment

Even if the tool directly influences just one lease decision over a 5-year period, improving terms by 2-3% would generate value far exceeding the development time investment. The qualitative benefits (better discussions, risk identification, skill development) provide additional return.

**ROI Assessment: Strongly Positive**

---

## 7. RISK ASSESSMENT

### 7.1 Development Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Scope creep and extended development time | Medium | Medium | Start with MVP, add features incrementally; set time limits per phase |
| Technical complexity underestimation | Medium | Medium | Begin with prototype, validate approach early; use familiar technologies |
| Loss of motivation / competing priorities | Medium | High | Set realistic timeline; develop in sprints; celebrate milestones; focus on immediate value |
| Tool not used by board | Low | High | Involve fellow board members in requirements; demonstrate early; ensure ease of use |

### 7.2 Operational Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Data accuracy issues | Low | Medium | Validation rules, double-check formulas against manual calculations |
| Browser compatibility problems | Low | Low | Test on common browsers; use standard web technologies |
| Data privacy concerns | Low | Medium | No personally identifiable information stored; consider local-only version |

### 7.3 Usage Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Over-reliance on tool without judgment | Low | Medium | Document assumptions clearly; emphasize tool as decision support, not replacement for judgment |
| Misinterpretation of results | Low | Medium | Clear labeling, help text, documentation; review outputs with financially literate board members |

---

## 8. IMPLEMENTATION APPROACH

### 8.1 Phased Development Plan

#### Phase 1: MVP Core Functionality (Weeks 1-5, ~40 hours)

**Objectives:**
- Prove concept with basic three-period framework
- Validate one rent model (Fixed Escalation)
- Get early feedback from self-testing

**Deliverables:**
- Data models for historical, transition, and dynamic periods
- Basic revenue calculation (French curriculum only)
- Fixed Escalation rent model
- Simple P&L statement (revenue, rent, EBITDA)
- Single proposal comparison view

**Success Criteria:**
- Three periods calculate with correct methodologies
- Fixed Escalation model produces accurate 25-year projection
- Calculations verified against manual Excel validation

#### Phase 2: Enhanced Modeling (Weeks 5-6, ~20 hours)

**Objectives:**
- Add comprehensive three-period modeling framework
- Implement the three rent models
- Add financial statement calculations

**Deliverables:**
- Historical data input and storage
- Transition period ratio-based calculations
- Dynamic period full projection engine
- Fixed Escalation rent model
- Revenue Share rent model
- Partner rent model (base + revenue share + profit share)
- Basic P&L statement generation

**Success Criteria:**
- All three periods calculate correctly
- Three rent models produce accurate results
- Results validated against spreadsheet models
- Circular dependencies (interest, zakat) resolve correctly

#### Phase 3: Revenue & Enrollment Engine (Weeks 7-8, ~20 hours)

**Objectives:**
- Implement enrollment and revenue projections
- Add curriculum modeling (French + IB)
- Complete operating cost calculations

**Deliverables:**
- Student capacity and ramp-up modeling (2028-2032)
- Dual curriculum support with tuition growth rates
- Staff cost calculations (teacher and non-teacher ratios)
- Other OpEx percentage-based calculation
- Working capital auto-calculation
- Balance Sheet and Cash Flow statements

**Success Criteria:**
- Enrollment ramps up correctly over 5 years
- Revenue projections accurate for both curricula
- Operating costs scale appropriately with enrollment
- All three financial statements balance and reconcile

#### Phase 4: Reporting & Polish (Weeks 11-14, ~30 hours)

**Objectives:**
- Professional reporting and visualization
- Scenario comparison features
- User experience refinement
- Comprehensive testing

**Deliverables:**
- Enhanced charts and dashboards
- Lease proposal comparison module
- Scenario sensitivity analysis
- PDF/export functionality
- Help documentation and user guide
- Mobile-responsive design
- Comprehensive validation and testing

**Success Criteria:**
- Board-presentation-ready outputs
- Can compare 3+ proposals simultaneously
- Scenario analysis runs interactively
- All financial statements reconcile
- Zero calculation errors vs validated spreadsheet models

### 8.2 Technology Stack (Preliminary)

**Frontend:**
- React with TypeScript (type-safe component development)
- Next.js (server-side rendering, API routes)
- Chart library (Recharts or Chart.js for financial visualizations)
- Tailwind CSS (styling)

**Backend:**
- Next.js API routes or Node.js + Express
- TypeScript for financial calculation engine
- SQLite or PostgreSQL (data persistence)
- Circular dependency solver library (for interest/zakat calculations)

**Financial Calculation Engine:**
- TypeScript implementation of all business rules
- Modular design: separate engines for each period
- Validation layer to ensure financial statement reconciliation
- Test suite with known scenarios

**Deployment:**
- Vercel or similar (supports backend + database)
- GitHub for version control
- Automated testing and validation on deployment

**Key Technical Challenges:**
- Circular dependency resolution (interest ↔ zakat ↔ cash ↔ debt)
- Balance sheet auto-balancing algorithm
- 30-year calculation performance optimization
- Data model design for three distinct periods
- Complex business rule implementation and testing

### 8.3 Development Principles

**Incremental Value:** Each phase delivers usable functionality, not just components.

**Validate Early:** Test calculations against known spreadsheet results before proceeding.

**Keep It Simple:** Favor simple, maintainable code over complex optimizations.

**User-Centric:** Design for use during actual board meetings (clear, fast, intuitive).

---

## 9. SUCCESS METRICS AND KPIs

### 9.1 Development Success Metrics

**Completion Metrics:**
- Phase 1 MVP delivered within 4 weeks: ✓ / ✗
- All phases completed within 10 weeks: ✓ / ✗
- Total development time under 100 hours: ✓ / ✗

**Quality Metrics:**
- Financial calculations validated (0 errors vs spreadsheet): ✓ / ✗
- Application works on desktop and tablet: ✓ / ✗
- No critical bugs in core functionality: ✓ / ✗

### 9.2 Usage Metrics

**Adoption:**
- Tool used for next lease proposal evaluation: ✓ / ✗
- Tool demonstrated to at least 2 other board members: ✓ / ✗
- Positive feedback from board colleagues: ✓ / ✗

**Effectiveness:**
- Time to analyze proposal reduced from 6-8 hours to 1-2 hours: ✓ / ✗
- Able to compare 3+ proposals side-by-side: ✓ / ✗
- Scenario analysis completed during board meeting: ✓ / ✗

### 9.3 Impact Metrics

**Decision Quality:**
- Tool insights identified in board discussions: Count instances
- Questions answered that wouldn't have been addressed manually: Track examples
- Board confidence in lease decision (subjective assessment): High / Medium / Low

**Reusability:**
- Tool used for multiple lease evaluations over time: Count uses
- Tool adapted for other financial decisions (future): ✓ / ✗

---

## 10. RECOMMENDATIONS AND NEXT STEPS

### 10.1 Primary Recommendation

**PROCEED** with development of the School Lease Proposal Assessment Application following the phased approach outlined in Section 8.

Rationale:
- Clear value proposition for improving board decision-making
- Manageable time investment with incremental delivery
- Aligns with personal development goals
- Creates lasting value for the school

### 10.2 Immediate Next Steps

**Week 1-2: Requirements & Design**
1. Document detailed requirements for MVP (Phase 1)
2. Create Product Requirements Document (PRD)
3. Design basic data model for lease proposals
4. Sketch wireframes for key screens
5. Set up development environment

**Week 3-4: MVP Development**
1. Build proposal input form
2. Implement basic rent calculation engine
3. Create comparison table view
4. Develop simple time-series chart
5. Validate calculations against test data

**Week 5-6: Review & Iterate**
1. Test with 2-3 real proposal scenarios
2. Gather feedback (self and potentially one board colleague)
3. Refine based on learning
4. Decide: proceed to Phase 2 or iterate on MVP

### 10.3 Go/No-Go Decision Points

**After Phase 1 (Week 4):**
- Is the MVP functionally correct?
- Does it provide clear value over manual spreadsheets?
- Am I motivated to continue development?
- **Decision:** Proceed to Phase 2 or stop at MVP

**After Phase 2 (Week 6):**
- Can I accurately model real proposals?
- Is the tool usable in a board meeting context?
- **Decision:** Proceed to Phase 3 or stop and polish current state

**After Phase 3 (Week 8):**
- Does scenario analysis provide actionable insights?
- **Decision:** Proceed to Phase 4 or deploy current version

### 10.4 Approval and Commitment

This is a personal project undertaken in a volunteer capacity. The commitment is to:

- [ ] Allocate 8-12 hours per week for 12-16 weeks
- [ ] Complete at minimum Phase 1 MVP (40 hours)
- [ ] Validate tool with at least one real lease proposal scenario
- [ ] Develop comprehensive financial model for 2028-2053 projection
- [ ] Share tool with board for feedback (if successful)
- [ ] Maintain tool for duration of board service (bug fixes, minor updates)

**Target Completion Date:** [14-16 weeks from start date]

**Phased Go-Live:**
- Phase 1 MVP: Week 5 (basic functionality for initial feedback)
- Phase 2 Complete: Week 9 (all rent models functional)
- Phase 3 Complete: Week 11 (full financial modeling)
- Phase 4 Complete: Week 14-16 (production-ready with all features)

**Realistic Timeline Acknowledgment:**
Given the sophistication of the financial modeling requirements (three periods, three rent models, complete financial statements, circular dependencies), the 120-160 hour estimate represents a substantial but justified investment for a tool that will serve the school for years to come.

---

## 11. CONCLUSION

The School Lease Proposal Assessment Application addresses a real and recurring need for the school board: evaluating complex long-term lease proposals in a systematic, comprehensive manner. The current manual approach is time-consuming and limits the depth of analysis possible during board discussions.

**Scope Evolution:** During detailed planning, the true sophistication required for proper lease evaluation became clear. What initially seemed like a "simple" comparison tool evolved into a comprehensive financial planning system with:
- Three distinct calculation periods (Historical, Transition, Dynamic)
- Complete financial statement generation (P&L, Balance Sheet, Cash Flow)
- Three rent model options (Fixed, Revenue Share, Partner)
- 30-year projection capabilities (2023-2053)
- Circular dependency resolution (interest, zakat, cash, debt)
- Working capital and balance sheet auto-balancing

This complexity is not "scope creep" but rather a realistic assessment of what's required to properly evaluate a 25-year, multi-million SAR commitment. The tool must model the entire school's financial picture, not just rent in isolation.

By developing a custom web application, several objectives are achieved:

**Practical Value:** A tool that enables comprehensive financial analysis impossible with manual spreadsheets, supporting better decisions on a critical 25-year commitment (2028-2053).

**Board Service:** Enhanced ability to fulfill board responsibilities by bringing sophisticated financial modeling to lease evaluations and strategic planning.

**Personal Development:** Significant application of both financial modeling and software development skills to create something of lasting value. The complexity level makes this a substantial learning opportunity.

**Reusability:** A tool that serves not just the current lease decision, but all future facility-related decisions during board tenure and beyond. Can be extended to other financial planning scenarios.

**Time Investment Justification:** While the 120-160 hour estimate is substantial, it reflects building a production-grade financial planning system. The alternative—making a 25-year commitment based on inadequate analysis—carries far greater risk. Even a 1-2% better decision on a $500K/year lease generates $250K-500K in value over the term, easily justifying the time investment.

The phased approach ensures incremental value delivery and allows for course correction. Each phase delivers working functionality that can be used independently if needed.

**Recommendation: Proceed with development, acknowledging the increased scope but recognizing the commensurate value.**

---

## APPENDIX A: GLOSSARY OF TERMS

**Base Rent:** The fundamental rental payment before escalations, typically expressed as annual or monthly amount.

**CAM (Common Area Maintenance):** Charges for shared facility costs (parking, landscaping, common areas) allocated to tenants.

**CPI (Consumer Price Index):** Economic indicator used to index rent escalations to inflation.

**Escalation Clause:** Provision in lease specifying how rent increases over time (fixed %, CPI-based, step increases).

**Net Present Value (NPV):** Total value of future cash flows discounted to present value, accounting for time value of money.

**Triple Net Lease (NNN):** Lease structure where tenant pays property taxes, insurance, and maintenance in addition to rent.

**Tenant Improvement Allowance:** Funds provided by landlord for tenant to customize space.

**Lease Term:** Duration of the lease agreement (e.g., 10 years, 15 years).

**Cost Per Student:** Total facility costs divided by enrolled students, key metric for educational institutions.

**Break-Even Enrollment:** Minimum student enrollment needed to cover costs under a given lease scenario.

---

## APPENDIX B: KEY ASSUMPTIONS

### Financial Modeling Assumptions (Initial)

**Discount Rate:** 3-5% (for NPV calculations)

**Enrollment Growth:**
- Base case: 2% annual growth
- Conservative: 0% growth (flat)
- Optimistic: 5% annual growth

**Tuition Escalation:** 3-4% annually (historical average)

**Inflation (CPI):** 2-3% annually (long-term average)

**Lease Term Analysis:** Model full 25-year initial term (2028-2053) plus one renewal period (if applicable)

**Cost Allocation:** Facilities cost target: ≤20% of total revenue

### Scope Boundaries

**In Scope:**
- Rental cost analysis
- Revenue projections (enrollment-driven)
- Net financial impact
- Scenario comparisons

**Out of Scope (Initially):**
- Detailed capital improvement planning
- Staffing cost modeling
- Non-facility operational costs
- Grant and fundraising revenue projections

**Future Enhancements (Post-MVP):**
- Historical data import
- Benchmark comparisons (other schools)
- Detailed cash flow statements
- Risk probability modeling

---

## APPENDIX C: SAMPLE LEASE PROPOSAL COMPARISON

*Note: This appendix will be populated with example proposals once the tool is functional, serving as documentation and validation.*

### Example Scenarios to Model:

**Proposal A: Fixed Escalation**
- Base rent: $500,000/year
- Term: 25 years (2028-2053)
- Escalation: 3% annually
- CAM: $50,000/year (fixed)
- TI Allowance: $200,000
- Total cost by year 25: ~$950,000/year

**Proposal B: CPI-Based**
- Base rent: $480,000/year
- Term: 25 years (2028-2053)
- Escalation: CPI + 1% annually
- CAM: Proportional share (~$45,000/year estimated)
- TI Allowance: $150,000
- Assumes CPI averages 2.5% (total escalation 3.5% annually)

**Proposal C: Step Increases**
- Base rent: $475,000/year
- Term: 25 years (2028-2053)
- Escalation: 5% every 3 years (8 total increases)
- CAM: $55,000/year (escalates with rent)
- TI Allowance: $250,000
- Year 25 rent: ~$715,000/year

**Key Comparison Questions:**
1. What is the total cost over 25 years for each proposal?
2. Which proposal has the lowest cost in years 1-5? Years 11-15? Years 21-25?
3. At what year does Proposal A become more expensive than Proposal C?
4. How do proposals compare at different enrollment levels?
5. What if CPI averages 4% vs 2% over the 25-year period?
6. What is the NPV of each proposal at 4% discount rate?
7. How sensitive are results to changes in year 1 rent vs escalation rate?
8. What happens to school financials in years 20-25 when rent peaks?

---

**— END OF DOCUMENT —**