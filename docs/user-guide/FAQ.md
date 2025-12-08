# Frequently Asked Questions (FAQ)

## Table of Contents
1. [General Questions](#general-questions)
2. [Account & Access](#account--access)
3. [Financial Concepts](#financial-concepts)
4. [Calculations & Formulas](#calculations--formulas)
5. [Proposals & Workflow](#proposals--workflow)
6. [Negotiations](#negotiations)
7. [Scenarios & Sensitivity](#scenarios--sensitivity)
8. [Comparisons](#comparisons)
9. [Exports & Reports](#exports--reports)
10. [Troubleshooting](#troubleshooting)
11. [Technical Questions](#technical-questions)

---

## General Questions

### What is this system for?

This system helps schools evaluate lease proposals from property developers. It creates 30-year financial projections showing the impact of different rent structures on the school's profitability, cash flow, and financial sustainability.

### Who should use this system?

- **Administrators**: Configure system settings, manage historical data
- **Planners**: Create proposals, run scenarios, compare options
- **Viewers**: Review proposals and reports (read-only)
- **Board Members**: Review comparison reports for decision-making

### What makes this system different from Excel?

- **Automation**: Automatically handles complex circular dependencies (interest ↔ debt ↔ zakat)
- **Speed**: Calculates 30 years of projections in <1 second
- **Accuracy**: Prevents formula errors and ensures balance sheet always balances
- **Collaboration**: Multiple users can work simultaneously
- **Audit Trail**: Tracks who changed what and when
- **Visual**: Built-in charts, tornado diagrams, comparison matrices

### How accurate are the projections?

Projections are mathematically accurate based on your inputs. However, accuracy of outcomes depends on:
- Quality of historical data (2023-2024)
- Realism of enrollment projections
- Accuracy of revenue/cost assumptions
- External factors (competition, demographics, regulations)

**Best practice:** Create Optimistic, Base, and Pessimistic scenarios to bracket uncertainty.

---

## Account & Access

### How do I get access to the system?

Contact your organization's Administrator. They will create an account and assign you a role (ADMIN, PLANNER, or VIEWER).

### I forgot my password. How do I reset it?

Click "Forgot Password" on the login page and follow the email instructions. If you don't receive the email, contact your Administrator.

### What's the difference between ADMIN, PLANNER, and VIEWER roles?

| Permission | ADMIN | PLANNER | VIEWER |
|------------|-------|---------|--------|
| View proposals | ✓ | ✓ | ✓ |
| Create proposals | ✓ | ✓ | ✗ |
| Edit proposals | ✓ | ✓ (own only) | ✗ |
| Delete proposals | ✓ | ✓ (own only) | ✗ |
| Run scenarios | ✓ | ✓ | ✗ |
| View saved scenarios | ✓ | ✓ | ✓ |
| Configure system | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Export reports | ✓ | ✓ | ✓ |

### Can I change my own role?

No. Only Administrators can change user roles. If you need different permissions, request a role change from your Administrator.

### Can I have multiple roles?

No. Each user has one role. If you need multiple permission sets, your Administrator can create separate accounts (not recommended - use the highest permission level you need).

---

## Financial Concepts

### What does "M" mean in financial statements?

**"M" = Millions**. All amounts are displayed in Millions of SAR with 2 decimal places for readability.

**Examples:**
- 0.50 M = 500,000 SAR
- 1.00 M = 1,000,000 SAR
- 15.50 M = 15,500,000 SAR
- 125.75 M = 125,750,000 SAR

**Why Millions?**
- Easier to read large numbers
- Standard in financial reporting for educational institutions
- Reduces clutter in tables and charts

**Hover for exact amount:** Hover your mouse over any "M" value to see the exact SAR amount in a tooltip.

### What is NPV (Net Present Value)?

NPV is the present value of all future cash flows, discounted back to today.

**Formula:**
```
NPV = Σ (Cash Flow in Year t) / (1 + Discount Rate)^t
```

**What it means:**
- Positive NPV = Good deal (creates value)
- Negative NPV = Bad deal (destroys value)
- Higher NPV = Better deal

**Example:**
- NPV = 125 M means this deal creates 125 million SAR of value in today's terms

**Note:** Current system calculates total net income as a proxy for NPV. Full NPV with discount rate is roadmap feature.

### What is IRR (Internal Rate of Return)?

IRR is the discount rate that makes NPV = 0. It represents the "return" the school earns on this investment.

**What it means:**
- Higher IRR = Better deal
- Compare IRR to your cost of capital or alternative investments
- Typical IRR for school real estate: 8-15%

**Example:**
- IRR = 12% means this deal earns an effective 12% annual return

**Note:** IRR calculation is a roadmap feature.

### What is EBITDA?

**EBITDA** = Earnings Before Interest, Tax, Depreciation, and Amortization

It measures operating profitability before financing costs and non-cash expenses.

**Formula:**
```
EBITDA = Revenue - Rent - Staff Costs - Other OpEx
```

**Why it matters:**
- Shows pure operating performance
- Useful for comparing proposals with different financing structures
- Lenders often use EBITDA to assess creditworthiness

**What's a good EBITDA margin?** 15-25% is typical for well-run schools.

### What is Zakat and how is it calculated?

**Zakat** is an Islamic wealth tax, mandatory in Saudi Arabia for companies.

**Formula:**
```
Zakat Base = Total Equity - Net PPE (fixed assets)
Zakat Expense = Zakat Base × 2.5% (if Zakat Base > 0)
```

**Example:**
- Total Equity: 10,000,000 SAR
- Net PPE: 8,000,000 SAR
- Zakat Base: 2,000,000 SAR
- **Zakat Expense: 50,000 SAR (2.5% of 2,000,000)**

**Why "Equity - PPE"?**
Zakat is calculated on "working capital" (current assets less current liabilities), which approximates Equity - Non-Current Assets.

**What if Zakat Base is negative?**
No zakat payable. This happens when Net PPE > Equity (high fixed assets, low equity).

### What is the "debt plug"?

The **debt plug** is an automatic mechanism that ensures the balance sheet always balances.

**How it works:**
```
Required Debt = Total Assets - Current Liabilities - Equity
```

If assets exceed liabilities + equity, the system automatically issues debt to make up the difference.

**Why is this needed?**
- Balance sheets must balance: Assets = Liabilities + Equity
- Cash shortfalls need to be financed
- Prevents negative cash (liquidity crisis)

**Example:**
- Assets: 100 M
- Current Liabilities: 20 M
- Equity: 70 M
- **Required Debt: 10 M** (100 - 20 - 70)

### What is the "circular solver"?

The **circular solver** resolves circular dependencies in financial calculations.

**The Problem:**
- Interest Expense depends on Debt Balance
- Zakat depends on Equity
- Net Income depends on Interest and Zakat
- Equity depends on Net Income (Retained Earnings)
- Debt Balance depends on Equity (via balance sheet balancing)
- **These are all interdependent!**

**The Solution:**
Fixed-point iteration:
1. Start with initial guess for debt (prior year's debt)
2. Calculate interest, zakat, net income, equity, and required debt
3. If required debt ≈ guessed debt, CONVERGED ✓
4. If not, adjust guess and repeat
5. Typically converges in 2-5 iterations

**Performance:** Solver runs in <10ms per year, ensuring <1 second for 30 years.

### Why is there OLD and NEW depreciation?

**OLD Depreciation:**
- Depreciation from historical assets (purchased before 2025)
- Entered via Historical Data by Administrators
- Cannot be modified (it's history)

**NEW Depreciation:**
- Depreciation from future capital expenditures (2025+)
- Configured via CapEx Module
- Can be edited for "what-if" analysis

**Why separate?**
- Preserves audit trail of historical facts
- Allows scenario analysis on future CapEx without changing history
- Ensures accurate PPE tracking on balance sheet

**Example:**
- OLD Depreciation (2035): 2.00 M (from pre-2025 building)
- NEW Depreciation (2035): 0.50 M (from 2028 equipment purchase)
- **Total Depreciation: 2.50 M**

---

## Calculations & Formulas

### How is Revenue calculated?

**Transition Period (2025-2027):**
```
Revenue = User Input (manual entry)
```

**Dynamic Period (2028-2053):**
```
Tuition Revenue = Σ (Enrollment per Grade × Tuition per Grade)
IB Revenue = IB Students × IB Fee (if IB toggle ON)
Total Revenue = Tuition Revenue + IB Revenue
```

**Tuition growth:**
```
Tuition (Year N) = Tuition (Year N-1) × (1 + Tuition Growth Rate)
```

### How is Rent calculated for each rent model?

**Fixed Rent Model:**
```
Rent (Year N) = Rent (Year 1) × (1 + CPI Rate)^(N-1)
```

**Revenue Share Model:**
```
Rent = max(Min Rent, min(Max Rent, Revenue × Revenue Share %))
```

**Partner Model:**
```
Rent = Fixed Base + max(0, (Revenue - Threshold) × Revenue Share %)
```

### How are Staff Costs calculated?

**Formula:**
```
Teachers = Total Enrollment / Student-Teacher Ratio
Non-Teacher Staff = Teachers × Non-Teacher %
Total Staff = Teachers + Non-Teacher Staff
Staff Costs = Total Staff × Average Salary × (1 + CPI)^(Year - 2028)
```

**Example (2028):**
- Enrollment: 1,200 students
- Ratio: 15:1
- Teachers: 1,200 / 15 = 80
- Non-Teacher %: 30%
- Non-Teacher Staff: 80 × 0.30 = 24
- Total Staff: 104
- Avg Salary: 120,000 SAR
- **Staff Costs: 104 × 120,000 = 12,480,000 SAR (12.48 M)**

### How is Interest calculated?

**Interest Expense:**
```
Average Debt = (Opening Debt + Closing Debt) / 2
Interest Expense = Average Debt × Debt Interest Rate
```

**Interest Income:**
```
Average Cash = (Opening Cash + Closing Cash) / 2
Excess Cash = max(0, Average Cash - Minimum Cash Balance)
Interest Income = Excess Cash × Deposit Interest Rate
```

**Why use average balances?**
More accurate than using opening or closing balance alone. Reflects the actual average debt/cash outstanding during the year.

### How does the Minimum Cash Balance work?

**Rule:**
```
If Calculated Cash < Minimum Cash:
    Issue Debt = Minimum Cash - Calculated Cash
    Final Cash = Minimum Cash
Else:
    Final Cash = Calculated Cash
```

**Example:**
- Calculated Cash: 500,000 SAR
- Minimum Cash: 1,000,000 SAR
- **Debt Issued: 500,000 SAR**
- **Final Cash: 1,000,000 SAR**

**Purpose:** Ensures the school never runs out of operating cash.

### How is the Balance Sheet balanced?

**Balance Sheet Identity:**
```
Assets = Liabilities + Equity
```

**Balance Check:**
```
Balance Difference = Total Assets - (Total Liabilities + Total Equity)
```

**If Balance Difference ≠ 0:**
The debt plug adjusts debt to close the gap:
```
Debt Balance = Total Assets - Current Liabilities - Equity
```

**Tolerance:** System considers balance sheet balanced if `|Balance Difference| < 1 SAR` (0.000001 M).

### How is Cash Flow calculated?

**Indirect Method:**

**Operating Cash Flow:**
```
Net Income
+ Depreciation (non-cash expense)
- Increase in AR (cash not collected)
+ Decrease in AR (cash collected)
- Increase in Prepaid (cash paid in advance)
+ Decrease in Prepaid
+ Increase in AP (cash owed, not paid)
- Decrease in AP (cash paid to vendors)
+ Increase in Accrued (expenses recognized but not paid)
- Decrease in Accrued
+ Increase in Deferred Revenue (cash collected in advance)
- Decrease in Deferred Revenue
= Operating Cash Flow
```

**Investing Cash Flow:**
```
- CapEx (capital expenditures, negative for cash outflow)
= Investing Cash Flow
```

**Financing Cash Flow:**
```
+ Debt Issuance (positive for cash inflow)
- Debt Repayment (negative for cash outflow)
= Financing Cash Flow
```

**Net Change in Cash:**
```
Net Change = Operating CF + Investing CF + Financing CF
Ending Cash = Beginning Cash + Net Change
```

---

## Proposals & Workflow

### How long does it take to create a proposal?

**With all information ready:** 15-30 minutes
**Without information:** 1-2 hours (gathering data)

**Tips for faster creation:**
- Prepare enrollment projections in advance
- Have term sheets/rent structure details ready
- Know your tuition pricing and growth assumptions
- Use "Save as Draft" to pause and resume later

### Can I save a draft and come back later?

**Yes!** Click "Save as Draft" at any step of the wizard. Your progress is saved and you can resume later.

**How to resume:**
1. Navigate to Proposals
2. Filter by Status: DRAFT
3. Click "Continue Editing" on your draft

### What's the difference between statuses?

**Proposal Statuses:**

| Status | Meaning | When to Use |
|--------|---------|-------------|
| **DRAFT** | Work in progress | Still gathering data or incomplete |
| **READY_TO_SUBMIT** | Complete, pending submission | Finished, awaiting approval to send |
| **SUBMITTED** | Sent to developer | Proposal delivered to landlord |
| **UNDER_REVIEW** | Developer is reviewing | Waiting for developer's response |
| **COUNTER_RECEIVED** | Developer sent counter | Received counter-proposal |
| **EVALUATING_COUNTER** | Analyzing counter | Team reviewing developer's counter |
| **ACCEPTED** | Deal agreed | Terms finalized, moving to contract |
| **REJECTED** | Deal declined | Proposal/counter not acceptable |
| **NEGOTIATION_CLOSED** | Discussion ended | Negotiations ended with no deal |

### Can I edit a proposal after it's submitted?

**As Planner:** You can edit your own proposals at any status.

**Best practice:**
- If terms change after submission, **duplicate** the proposal and edit the copy
- Keep the original as a record of what was submitted
- Use negotiation round tracking to link related proposals

### How do I track negotiation rounds?

**Use the built-in negotiation tracking:**
1. Create initial proposal (Round 1, Origin: OUR_OFFER)
2. When developer sends counter, create new proposal:
   - Use same Developer and Property
   - Set Round: 2
   - Set Origin: THEIR_COUNTER
   - Enter their counter terms
3. Create your counter (Round 3, OUR_OFFER)
4. Continue sequence...

**Benefits:**
- Clear audit trail of negotiation history
- Easy comparison across rounds
- Status tracking per round

### Can I delete a proposal?

**Yes, but be careful:**
- Deletion is permanent (cannot be undone)
- All associated data deleted (scenarios, sensitivity analyses)
- You can only delete your own proposals (unless Admin)

**Alternative:** Change status to REJECTED instead of deleting. Preserves history.

### How do I duplicate a proposal?

1. Open proposal detail page
2. Click "Duplicate" button (top right)
3. New proposal created with identical inputs
4. Edit the duplicate as needed
5. Save with new name

**Use cases:**
- Test variations (e.g., different rent models)
- Create counter-offers
- Build scenario families (optimistic/pessimistic versions)

---

## Negotiations

### What is a Negotiation?

A **Negotiation** is a grouping entity that organizes all proposals related to a specific developer and property combination. Think of it as a "thread" or "folder" containing all offers exchanged with a landlord during a lease negotiation.

**Key concepts:**
- One negotiation = one developer + one property
- Contains multiple proposals (offers and counter-offers)
- Has its own status (ACTIVE, ACCEPTED, REJECTED, CLOSED)
- Timeline view shows offer sequence

### How do I create a new negotiation?

1. Navigate to Negotiations page
2. Click "New Negotiation"
3. Enter developer name and property
4. Optionally add notes
5. Create or link the first proposal

The negotiation is created with ACTIVE status.

### What's the difference between Negotiation status and Proposal status?

**Negotiation Status** (thread-level):
- ACTIVE: Ongoing negotiations
- ACCEPTED: Deal agreed
- REJECTED: Negotiation failed
- CLOSED: Ended (neutral)

**Proposal Status** (per-offer):
- DRAFT, READY_TO_SUBMIT, SUBMITTED, UNDER_REVIEW, COUNTER_RECEIVED, EVALUATING_COUNTER, ACCEPTED, REJECTED, NEGOTIATION_CLOSED

You need to update both separately. A negotiation might be ACCEPTED even if some proposals within it are REJECTED.

### How do I add a counter-offer to a negotiation?

1. Open the negotiation timeline
2. Click "Add Counter"
3. Choose: Create New, Duplicate & Edit, or Link Existing
4. Set origin: OUR_OFFER (our counter) or THEIR_COUNTER (their counter)
5. Complete the proposal wizard (if creating new)
6. The offer appears in the timeline

### What do OUR_OFFER and THEIR_COUNTER mean?

**OUR_OFFER**: A proposal created by our organization to send to the developer
**THEIR_COUNTER**: A counter-offer received from the developer

The timeline uses color coding:
- Blue: OUR_OFFER
- Orange: THEIR_COUNTER

### Can I have multiple negotiations with the same developer?

Yes, but each must be for a **different property**. One negotiation = one unique developer + property combination.

Examples:
- Developer ABC / Downtown Campus → Negotiation 1
- Developer ABC / North District → Negotiation 2

### How do I view all offers in a negotiation?

Click on any negotiation card to open the **Timeline View**. This shows:
- All proposals in chronological order
- Offer number (1, 2, 3...)
- Origin (OUR/THEIR)
- Status of each offer
- Key metrics (NPV, Total Rent)

### Can I move a proposal to a different negotiation?

Yes. Unlink it from the current negotiation and link it to another. Steps:
1. Open the current negotiation
2. Find the proposal
3. Click "Unlink" or remove from thread
4. Open the target negotiation
5. Click "Link Proposal" and select it

### What happens if I delete a negotiation?

Deleting a negotiation will also delete all proposals within it. This is **permanent**.

**Better alternative:** Change the negotiation status to CLOSED instead. This preserves the history for audit purposes.

### How do I reopen a CLOSED negotiation?

Simply change the status back to ACTIVE. All history (offers, notes, statuses) is preserved.

### Can Viewers see negotiations?

Yes, Viewers can:
- ✓ View all negotiations and timelines
- ✓ See offer history and metrics
- ✓ Export reports

Viewers cannot:
- ✗ Create or edit negotiations
- ✗ Add counter-offers
- ✗ Update statuses

---

## Scenarios & Sensitivity

### What's the difference between scenarios and sensitivity analysis?

| Feature | Scenarios | Sensitivity Analysis |
|---------|-----------|----------------------|
| **Purpose** | Test specific combinations of assumptions | Identify which variable has most impact |
| **Variables** | Adjust multiple variables simultaneously | Test one variable at a time |
| **Output** | Metric comparison table | Tornado chart |
| **Use case** | "What-if" analysis (e.g., "High Growth Case") | Risk identification (e.g., "What matters most?") |
| **Interactivity** | Real-time sliders (<200ms) | Batch calculation (2-5 seconds) |

### How do scenarios work?

1. Open proposal → Scenarios tab
2. Adjust sliders:
   - Enrollment % (50-150% of baseline)
   - CPI % (0-10% annual)
   - Tuition Growth % (0-15% annual)
   - Rent Escalation % (0-10% annual)
3. Metrics update in real-time (<200ms)
4. View Baseline vs Current comparison
5. Save scenario with descriptive name

### How many scenarios should I create?

**Recommended: 3-5 scenarios**
1. **Baseline**: Your best estimate (100% enrollment, 5% tuition growth, 3% CPI, 3% rent escalation)
2. **Optimistic**: Best case (120% enrollment, 7% tuition growth, 2% CPI, 2% rent escalation)
3. **Pessimistic**: Worst case (80% enrollment, 3% tuition growth, 5% CPI, 4% rent escalation)
4. **Conservative**: Risk-averse (90% enrollment, 4% tuition growth, 4% CPI, 3% rent escalation)
5. **High Growth**: Aggressive (150% enrollment, 10% tuition growth, 3% CPI, 3% rent escalation)

**Avoid:** Saving too many scenarios (>10) clutters the list and makes comparison difficult.

### How does sensitivity analysis work?

**Process:**
1. Select variable to test (e.g., Enrollment %)
2. Set range to test (e.g., -20% to +20%)
3. Select impact metric (e.g., NPV)
4. Click "Run Analysis"
5. System tests variable at 11 points across range
6. Generates tornado chart showing impact

**Example: Enrollment Sensitivity on NPV**
- Tests enrollment at: 80%, 84%, 88%, 92%, 96%, 100%, 104%, 108%, 112%, 116%, 120%
- Measures NPV at each point
- Shows how NPV changes with enrollment

### How do I interpret a tornado chart?

**Tornado chart:** Horizontal bar chart showing impact of variable changes

**Reading the chart:**
- **X-axis**: Output metric (e.g., NPV in Millions SAR)
- **Y-axis**: Variables tested (e.g., Enrollment, CPI, Tuition Growth, Rent Escalation)
- **Bar width**: Impact of that variable
  - Wide bar = High impact (small change causes big impact)
  - Narrow bar = Low impact (variable doesn't matter much)

**Example:**
```
Enrollment %:     |=====================================| (±50M impact)
Tuition Growth %: |==========================| (±30M impact)
CPI Growth %:     |==================| (±20M impact)
Rent Escalation %:|==========| (±10M impact)
```

**Interpretation:**
- **Focus on enrollment accuracy** (biggest impact on NPV)
- Rent escalation less critical (narrow bar)
- Risk mitigation: ensure enrollment projections are realistic

### Why are scenario calculations so fast (<200ms)?

**Optimizations:**
1. **Decimal.js library**: High-precision math optimized for JavaScript
2. **Single-threaded iterative solver**: No thread overhead
3. **Efficient circular solver**: Converges in 2-5 iterations
4. **Debouncing**: Waits 300ms after slider stops moving before calculating
5. **In-memory calculation**: No database round-trips during scenario testing

**Performance target:** <200ms for 30 years (1 proposal)

**Actual:** Typically 50-150ms depending on browser and hardware

---

## Comparisons

### How many proposals can I compare?

**Minimum:** 2 proposals
**Maximum:** 5 proposals

**Why the limit?**
- More than 5 becomes visually cluttered
- Comparison matrix difficult to read with >5 columns
- Charts become too crowded

**Best practice:** Compare 2-3 proposals at a time. If you have more, run multiple comparisons.

### What does the green checkmark mean?

**Green checkmark** = "Winner" for that metric (best value)

**"Best" depends on metric:**
- **Total Rent, Peak Debt, Payback Period**: Lower is better → checkmark on lowest
- **NPV, EBITDA, Final Cash, IRR**: Higher is better → checkmark on highest

**Example:**
- Proposal A: Total Rent = 420 M ✓ (lowest, gets checkmark)
- Proposal B: Total Rent = 475 M (higher, no checkmark)

### Can I compare proposals with different rent models?

**Yes!** That's one of the best uses of comparison.

**Example use case:**
Compare three proposals for the same property:
- Proposal A: Fixed Rent
- Proposal B: Revenue Share
- Proposal C: Partner (Hybrid)

See which model works best for your school's situation.

### Can I export a comparison for my Board?

**Yes!** Click "Export Comparison" → PDF

**Comparison PDF includes:**
- Executive summary (1 page)
- Comparison metrics matrix with winners highlighted
- Rent trajectory chart
- Cost breakdown chart
- Side-by-side financial statements (Year 5, 15, 25)
- Assumptions comparison table

**Use for:**
- Board meetings
- Financial committee review
- Executive decision-making

### How do I compare scenarios across proposals?

**Process:**
1. Create scenarios in each proposal (e.g., "Optimistic" in Proposal A, B, C)
2. Go to Comparison page
3. Select proposals
4. View comparison matrix
5. Note: Comparison shows baseline metrics, not scenario metrics

**Limitation:** Cannot compare Proposal A's "Optimistic" scenario vs Proposal B's "Pessimistic" scenario directly.

**Workaround:** Create separate proposals for each scenario combination you want to compare.

---

## Exports & Reports

### What's the difference between PDF and Excel exports?

| Feature | PDF | Excel |
|---------|-----|-------|
| **Purpose** | Presentation, review | Analysis, custom reporting |
| **Format** | Formatted, professional | Raw data, tables |
| **Charts** | Included, static | Not included (build your own) |
| **Editing** | Not editable | Fully editable |
| **Use for** | Board meetings, sharing | Financial modeling, pivots |
| **File size** | Larger (2-5 MB) | Smaller (100-500 KB) |

### What's included in a Proposal PDF export?

**Proposal PDF Contents:**
1. Cover page with proposal name and summary
2. Executive summary (1 page with key metrics)
3. Metric cards (Total Rent, NPV, IRR, EBITDA, Cash, Debt)
4. Assumptions summary (enrollment, curriculum, rent, staff, opex)
5. Financial statements:
   - Profit & Loss (30 years)
   - Balance Sheet (30 years)
   - Cash Flow (30 years)
6. Charts:
   - Rent trajectory
   - Cumulative cash flow
   - Cost breakdown
7. Negotiation notes and status

**Page count:** 15-25 pages depending on detail level

### What's included in a Proposal Excel export?

**Excel Workbook Tabs:**
1. **Summary**: Key metrics and metadata
2. **P&L**: 30 years of profit & loss (all line items)
3. **Balance_Sheet**: 30 years of balance sheet (all line items)
4. **Cash_Flow**: 30 years of cash flow statement
5. **Assumptions**: All inputs (enrollment, tuition, rent, staff, opex)
6. **Metrics**: Calculated metrics (NPV, IRR, payback, etc.)

**Data format:** Excel tables with headers, ready for pivots and analysis

### How long do exports take to generate?

**Timing:**
- Individual proposal PDF: 1-2 seconds
- Individual proposal Excel: <1 second
- Comparison PDF (3 proposals): 3-5 seconds
- Comparison Excel (3 proposals): 2-3 seconds
- Large exports (5 proposals, full detail): up to 10 seconds

**If taking longer:**
- Check your internet connection
- Try refreshing and re-exporting
- Contact support if consistently slow (>30 seconds)

### Can I customize the PDF report format?

**Not currently.** The PDF follows a standard template for consistency.

**Workaround:** Export to Excel and build custom reports using your preferred format.

**Roadmap feature:** Custom PDF templates and branding

### Where do exported files download?

**Default:** Your browser's download folder

**Finding downloads:**
- Chrome: Ctrl+J (Windows) or Cmd+J (Mac)
- Firefox: Ctrl+Shift+Y (Windows) or Cmd+Shift+Y (Mac)
- Safari: View → Show Downloads
- Edge: Ctrl+J

**File naming convention:**
- Proposal PDF: `Proposal_[Name]_[Date].pdf`
- Comparison PDF: `Comparison_[Date].pdf`
- Excel: `Proposal_[Name]_[Date].xlsx`

---

## Troubleshooting

### The system is running slowly. What should I do?

**Checklist:**
1. **Check internet connection**: Slow connection affects loading
2. **Close other browser tabs**: Reduces memory usage
3. **Clear browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
4. **Try different browser**: Chrome recommended, Edge/Firefox also supported
5. **Restart browser**: Clears memory leaks
6. **Check system resources**: Close other applications

**Performance expectations:**
- Dashboard load: <2 seconds
- Proposal detail load: <1 second
- Scenario calculation: <200ms
- Export generation: 1-10 seconds

### I'm getting an "Access Denied" error. Why?

**Common causes:**
1. **Wrong role**: Your role (e.g., VIEWER) doesn't have permission for that action
2. **Session expired**: Log out and log back in
3. **Not your proposal**: Planners can only edit their own proposals
4. **Feature not enabled**: Contact Admin to enable feature

**Solution:** Check your role in Profile settings. Contact Admin if you need different permissions.

### My proposal won't calculate. What's wrong?

**Common issues:**
1. **Missing required fields**: Go back through wizard and check for empty fields
2. **Invalid values**: Check for negative numbers, percentages >100%, etc.
3. **Enrollment exceeds capacity**: Max capacity must be ≥ starting enrollment
4. **Circular solver timeout**: Rare, but can happen with extreme values

**Solution:**
- Review all inputs for errors
- Try more reasonable values (avoid extremes)
- Save as draft and contact support if issue persists

### Balance sheet won't balance. What's wrong?

**The system automatically balances the balance sheet**, so this shouldn't happen.

**If you see a "not balanced" warning:**
- Balance Difference shown (should be <0.000001 M)
- Check if Balance Difference is within tolerance (1 SAR)
- If >1 SAR, contact support (possible bug)

**Note:** Small rounding differences (<1 SAR) are normal and acceptable.

### Cash flow doesn't reconcile. What does that mean?

**Cash flow reconciliation check:**
```
Ending Cash (from CF Statement) = Ending Cash (from Balance Sheet)
```

**If these don't match:**
- Reconciliation difference shown
- Should be within tolerance (1 SAR)
- If >1 SAR, there's a calculation error

**When this happens:**
- Usually in complex scenarios with large cash flows
- System shows warning but still displays results
- Contact support if difference is significant (>1000 SAR)

### Scenario sliders aren't updating metrics. Why?

**Checklist:**
1. **Wait 300ms**: System debounces (waits for you to stop moving slider)
2. **Check for error messages**: Red banner at top indicates issue
3. **Refresh page**: Sometimes calculation gets stuck
4. **Check proposal status**: Must be calculated (not DRAFT)
5. **Browser compatibility**: Use Chrome, Edge, or Firefox (latest versions)

**If still not working:**
- Open browser console (F12) and check for errors
- Take screenshot and contact support

### Export is failing or taking too long. What should I do?

**Common causes:**
1. **Large file size**: Comparison with 5 proposals × 30 years = large PDF
2. **Server load**: Multiple users exporting simultaneously
3. **Browser timeout**: Browser gives up after 30 seconds

**Solutions:**
- **Reduce scope**: Export individual proposals instead of comparison
- **Try Excel**: Smaller file size, faster generation
- **Wait and retry**: Try again in a few minutes
- **Check downloads folder**: File may have downloaded without notification

**If export consistently fails:**
- Try different browser
- Clear browser cache
- Contact support

### I see an error message I don't understand. What should I do?

**Steps:**
1. **Take screenshot**: Capture entire screen including error message
2. **Note what you were doing**: What button did you click? What page were you on?
3. **Try refreshing**: Some errors are temporary (network glitches)
4. **Check [FAQ](#faq)**: Error may be documented here
5. **Contact support**: Provide screenshot and steps to reproduce

**Error message format:**
```
Error Code: [ERR_XXX]
Message: [Description of error]
```

**Common error codes:**
- ERR_AUTH: Authentication/permission issue → Check login status and role
- ERR_VALIDATION: Input validation failed → Check your inputs
- ERR_CALC: Calculation error → Check for extreme values
- ERR_EXPORT: Export failed → Try again or reduce scope

---

## Technical Questions

### What browsers are supported?

**Fully supported:**
- Google Chrome (latest 2 versions)
- Microsoft Edge (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Safari (latest 2 versions on macOS)

**Not supported:**
- Internet Explorer (any version)
- Old browser versions (>2 years old)

**Recommendation:** Use Chrome for best performance.

### What technology is the system built on?

**Tech stack:**
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (via Supabase or self-hosted)
- **ORM**: Prisma 7
- **Calculations**: Decimal.js (high-precision math)
- **Charts**: Recharts
- **Styling**: Tailwind CSS 4 + shadcn/ui

For details, see [Technical Documentation: Architecture](../technical/architecture.md)

### How is data stored?

**Storage:**
- **Database**: PostgreSQL (relational database)
- **User data**: Encrypted at rest and in transit
- **Financial data**: Stored in JSON fields for flexibility
- **Backups**: Automatic daily backups (managed by infrastructure)

**Privacy:**
- Role-based access control (RBAC)
- No data shared between organizations (if multi-tenant)
- Audit logging for compliance

### Is my data secure?

**Security measures:**
- ✓ HTTPS encryption (TLS 1.3)
- ✓ Authentication required for all access
- ✓ Role-based permissions (ADMIN, PLANNER, VIEWER)
- ✓ Session management with automatic timeout
- ✓ Rate limiting on API endpoints
- ✓ SQL injection prevention (Prisma ORM)
- ✓ XSS protection (React automatic escaping)
- ✓ Regular security updates

**Compliance:**
- Data residency: Can be configured for Saudi Arabia
- GDPR considerations for EU users
- Audit trails for financial compliance

### Can I integrate with other systems?

**Current integration options:**
- **Export to Excel**: Import into your financial models
- **PDF reports**: Attach to email or document management systems

**Roadmap features:**
- REST API for programmatic access
- Webhooks for real-time notifications
- SSO integration (SAML, OAuth)
- ERP integration (SAP, Oracle)

### How often is the system updated?

**Update schedule:**
- **Bug fixes**: As needed (usually within 24-48 hours)
- **Minor updates**: Monthly (new features, improvements)
- **Major releases**: Quarterly (Phase completion)

**Notification:**
- System shows banner for upcoming maintenance
- Email notification for major updates
- No downtime for most updates (rolling deploy)

### Where can I find technical documentation?

**Technical docs location:**
- [Architecture](../technical/ARCHITECTURE.md)
- [Database Schema](../technical/DATABASE_SCHEMA.md)
- [API Reference](../technical/API_REFERENCE.md)
- [Calculation Formulas](../technical/CALCULATION_FORMULAS.md)
- [Deployment Guide](../technical/DEPLOYMENT_GUIDE.md)

**For developers:**
- GitHub repository (if open source)
- API documentation (Swagger/OpenAPI)
- Developer forum or Slack channel

---

## Still Have Questions?

**Contact Support:**
- **Email**: support@schoolfinance.sa (example)
- **Phone**: +966 XX XXX XXXX (example)
- **Hours**: Sunday-Thursday, 9 AM - 5 PM (Saudi time)

**Resources:**
- [Admin Guide](ADMIN_GUIDE.md)
- [Planner Guide](PLANNER_GUIDE.md)
- [Viewer Guide](VIEWER_GUIDE.md)
- [Technical Documentation](../technical/)

**Training:**
- Request live training sessions for your team
- Schedule 1-on-1 walkthrough with support team
- Watch video tutorials (if available)

---

**Document Version:** 2.0
**Last Updated:** December 2025
**Maintained By:** Documentation Agent
