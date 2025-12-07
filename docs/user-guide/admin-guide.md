# Administrator Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Historical Data Management](#historical-data-management)
4. [System Configuration](#system-configuration)
5. [CapEx Module](#capex-module)
6. [User Management](#user-management)
7. [Audit Log](#audit-log)
8. [FAQs](#faqs)

---

## Introduction

Welcome to the Administrator Guide for the School Lease Financial Planning System. As an Administrator, you have full access to configure system-wide settings, manage historical data, configure capital expenditures, and oversee user access.

### Your Responsibilities
- Maintain accurate historical financial data (2023-2024)
- Configure system-wide financial parameters
- Manage capital expenditure settings
- Oversee user access and permissions
- Monitor system health and audit logs

### Key Features
- **Historical Data Management**: Input and verify 2023-2024 actual financial data
- **System Configuration**: Set Zakat rates, interest rates, and minimum cash requirements
- **CapEx Management**: Configure auto-reinvestment and manual capital expenditures
- **User Administration**: Manage user roles and access (ADMIN, PLANNER, VIEWER)

---

## Getting Started

### First-Time Setup

**Step 1: Access the Admin Dashboard**

1. Log in to the system with your administrator credentials
2. Navigate to `/admin` or click "Admin" in the main navigation
3. You'll see the Admin Dashboard with quick access to all admin functions

[Screenshot: Admin Dashboard Overview]

**Step 2: Verify Your Role**

Ensure your user profile shows `Role: ADMIN`. Only administrators can access configuration pages.

**Step 3: Initial Configuration Checklist**

Complete these tasks in order:
- ☐ Input 2023 historical data
- ☐ Input 2024 historical data
- ☐ Review and confirm working capital ratios
- ☐ Configure system parameters (Zakat, interest rates, minimum cash)
- ☐ Set up CapEx configuration
- ☐ Create user accounts for Planners and Viewers

---

## Historical Data Management

Historical data forms the foundation for all financial projections. The system requires actual financial data from 2023 and 2024.

### Accessing Historical Data

**Navigation**: Admin Dashboard → Historical Data

[Screenshot: Historical Data Page]

### Input 2023-2024 Data

**Required Financial Statements:**
- **Profit & Loss Statement**
- **Balance Sheet**
- **Cash Flow Statement** (optional - calculated automatically if not provided)

### Step-by-Step: Entering Historical Data

**Step 1: Select Year**

Choose between 2023 and 2024 from the year selector.

**Step 2: Input Profit & Loss Data**

Enter the following line items (all amounts in SAR):

| Line Item | Description | Example |
|-----------|-------------|---------|
| **Revenue** | Total school revenue | 50,000,000 |
| Tuition Revenue | Revenue from tuition fees | 45,000,000 |
| IB Revenue (optional) | International Baccalaureate fees | 5,000,000 |
| **Operating Expenses** | | |
| Rent Expense | Annual rent paid | 12,000,000 |
| Staff Costs | Salaries and benefits | 20,000,000 |
| Other OpEx | All other operating expenses | 8,000,000 |
| Depreciation | Depreciation expense | 2,000,000 |
| **EBIT** | Earnings Before Interest & Tax | 8,000,000 |
| Interest Expense | Debt interest paid | 500,000 |
| Interest Income | Bank deposit interest earned | 100,000 |
| **EBT** | Earnings Before Tax | 7,600,000 |
| Zakat Expense | Zakat payment | 190,000 |
| **Net Income** | Bottom line | 7,410,000 |

**Step 3: Input Balance Sheet Data**

Enter the following balance sheet items (all amounts in SAR):

| Line Item | Description | Example |
|-----------|-------------|---------|
| **Assets** | | |
| Cash | Cash and cash equivalents | 5,000,000 |
| Accounts Receivable | Tuition fees owed by families | 2,000,000 |
| Prepaid Expenses | Prepaid rent, insurance, etc. | 500,000 |
| Gross PPE | Property, Plant & Equipment (at cost) | 20,000,000 |
| Accumulated Depreciation | Cumulative depreciation | (5,000,000) |
| Net PPE | Gross PPE - Accumulated Depreciation | 15,000,000 |
| **Liabilities** | | |
| Accounts Payable | Amounts owed to vendors | 1,000,000 |
| Accrued Expenses | Salaries payable, etc. | 800,000 |
| Deferred Revenue | Tuition collected in advance | 3,000,000 |
| Debt Balance | Outstanding loans | 10,000,000 |
| **Equity** | | |
| Total Equity | Owner's equity | 7,700,000 |

**Step 4: Review Working Capital Ratios**

After entering 2024 data, the system automatically calculates working capital ratios:

- **AR%**: Accounts Receivable as % of Revenue
- **Prepaid%**: Prepaid Expenses as % of Revenue
- **AP%**: Accounts Payable as % of Operating Expenses
- **Accrued%**: Accrued Expenses as % of Operating Expenses
- **Deferred Revenue%**: Deferred Revenue as % of Revenue

[Screenshot: Working Capital Ratios Display]

**Step 5: Confirm or Edit Ratios**

- Click "Lock Ratios" if they look correct
- These ratios will be used for all future projections
- You can unlock and edit them later if needed

### Best Practices

✅ **DO:**
- Double-check all amounts against your audited financial statements
- Ensure balance sheet balances (Assets = Liabilities + Equity)
- Verify working capital ratios make sense (typically 2-10% for most items)
- Document the source of your data (attach Excel files or PDFs)

❌ **DON'T:**
- Enter estimated data - use actual audited figures only
- Mix currencies (use SAR only)
- Skip line items (enter 0 if not applicable)
- Forget to save after completing each year

### Data Validation

The system performs automatic validation:

✓ **Balance Sheet Check**: Assets must equal Liabilities + Equity (within 1 SAR tolerance)
✓ **Cash Flow Check**: Ending cash must match balance sheet cash
✓ **Ratio Check**: Working capital ratios must be between 0-50%

If validation fails, you'll see error messages indicating what needs to be corrected.

---

## System Configuration

System Configuration sets global parameters that affect all financial calculations across all proposals.

### Accessing System Configuration

**Navigation**: Admin Dashboard → System Configuration

[Screenshot: System Configuration Page]

### Financial Parameters

#### 1. Zakat Rate (GAP 18)

**What it is:** The percentage of Zakat applied to the Zakat base (Equity - Non-Current Assets).

**Default:** 2.5% (as per Islamic guidelines)

**When to change:**
- If Saudi Arabian regulations change
- If company operates under different jurisdiction

**Formula:**
```
Zakat Expense = (Total Equity - Net PPE) × Zakat Rate
```

**Example:**
- Total Equity: 10,000,000 SAR
- Net PPE: 8,000,000 SAR
- Zakat Base: 2,000,000 SAR
- Zakat Rate: 2.5%
- **Zakat Expense: 50,000 SAR**

#### 2. Debt Interest Rate

**What it is:** The annual interest rate charged on outstanding debt.

**Default:** 5.0%

**When to change:**
- When your actual borrowing costs change
- To model different financing scenarios

**Formula:**
```
Interest Expense = Average Debt Balance × Debt Interest Rate
```

**Note:** The system uses the average of opening and closing debt balances for more accurate interest calculation.

**Example:**
- Opening Debt: 10,000,000 SAR
- Closing Debt: 12,000,000 SAR
- Average Debt: 11,000,000 SAR
- Debt Interest Rate: 5%
- **Interest Expense: 550,000 SAR**

#### 3. Deposit Interest Rate (GAP 16)

**What it is:** The annual interest rate earned on bank deposits when cash balance exceeds the minimum requirement.

**Default:** 2.0%

**When to change:**
- When bank deposit rates change
- To reflect current market conditions

**Formula:**
```
Interest Income = Average Excess Cash × Deposit Interest Rate
Excess Cash = max(0, Cash - Minimum Cash Balance)
```

**Example:**
- Cash Balance: 5,000,000 SAR
- Minimum Cash: 1,000,000 SAR
- Excess Cash: 4,000,000 SAR
- Deposit Interest Rate: 2%
- **Interest Income: 80,000 SAR**

#### 4. Minimum Cash Balance (GAP 14)

**What it is:** The minimum cash balance the school must maintain at all times. Prevents cash from going negative.

**Default:** 1,000,000 SAR (1.0 M SAR)

**When to change:**
- To model different liquidity policies
- To ensure operational safety margin

**How it works:**
- If calculated cash falls below minimum, the system automatically issues debt to bring cash back to the minimum
- This ensures the school always has sufficient operating cash
- Excess cash above the minimum earns deposit interest

**Example:**
- Calculated Cash: 500,000 SAR (below minimum)
- Minimum Cash: 1,000,000 SAR
- **System issues 500,000 SAR debt to restore minimum**
- Final Cash: 1,000,000 SAR

### Saving Configuration

**Important:** Changes affect ALL future proposals and calculations.

**Step 1: Edit Values**
Modify any of the four parameters using the form fields.

**Step 2: Review Current Values**
The "Current Configuration" card shows a live preview of your changes.

**Step 3: Confirm Changes**
Click "Save Configuration" and review the confirmation dialog.

**Step 4: Verification**
After saving, verify that the new values appear in the Current Configuration display.

[Screenshot: Configuration Confirmation Dialog]

### Configuration History (Future Feature)

Track all configuration changes with:
- Timestamp
- User who made the change
- Old vs. New values
- Affected proposals

---

## CapEx Module

The Capital Expenditure (CapEx) module manages fixed asset purchases and depreciation.

### Accessing CapEx Configuration

**Navigation**: Admin Dashboard → CapEx Configuration

[Screenshot: CapEx Configuration Page]

### Auto-Reinvestment Configuration

**Purpose:** Automatically schedule recurring capital expenditures (e.g., furniture replacement, equipment upgrades).

#### Step 1: Enable Auto-Reinvestment

Toggle "Auto-Reinvestment Enabled" to ON.

#### Step 2: Configure Frequency

Set how often reinvestment occurs:
- Annual: Every year
- Every 3 years
- Every 5 years
- Custom: Specify years

**Example:** Furniture replacement every 5 years.

#### Step 3: Set Reinvestment Amount

Choose one of two methods:

**Method A: Fixed Amount**
- Enter a specific SAR amount
- Example: 2,000,000 SAR every 5 years

**Method B: Percentage of Revenue**
- Enter a percentage
- Example: 3% of revenue every year

#### Step 4: Asset Details

For auto-reinvested assets, specify:
- **Asset Name**: e.g., "Furniture Replacement"
- **Useful Life**: e.g., 10 years
- **Depreciation Method**: Straight-Line or Declining Balance

### Manual CapEx Items

**Purpose:** Add one-time or irregular capital expenditures.

#### Step 1: Add New CapEx Item

Click "Add CapEx Item" button.

#### Step 2: Enter Details

| Field | Description | Example |
|-------|-------------|---------|
| Year | When purchased | 2028 |
| Asset Name | Description | Computer Lab Equipment |
| Amount | Purchase price (SAR) | 500,000 |
| Useful Life | Years to depreciate | 5 |
| Depreciation Method | SL or DB | Straight-Line |

#### Step 3: Save Item

Click "Save" to add the item to the CapEx schedule.

### Depreciation Methods

#### Straight-Line (SL)

**Formula:**
```
Annual Depreciation = Cost / Useful Life
```

**Example:**
- Asset Cost: 100,000 SAR
- Useful Life: 10 years
- **Annual Depreciation: 10,000 SAR/year**

**Use for:** Buildings, furniture, vehicles

#### Declining Balance (DB)

**Formula:**
```
Annual Depreciation = NBV × (2 / Useful Life)
NBV = Net Book Value (Cost - Accumulated Depreciation)
```

**Example (Year 1):**
- Asset Cost: 100,000 SAR
- Useful Life: 10 years
- Rate: 20% (2/10)
- **Year 1 Depreciation: 20,000 SAR**

**Example (Year 2):**
- NBV: 80,000 SAR
- **Year 2 Depreciation: 16,000 SAR**

**Use for:** Technology, computers, equipment (assets that lose value faster early in life)

### CapEx Schedule View

View all scheduled capital expenditures in a timeline:
- Auto-reinvestment items (recurring)
- Manual items (one-time)
- Total CapEx by year
- Accumulated depreciation

[Screenshot: CapEx Schedule Timeline]

### Old vs. New Assets (Important!)

The system tracks assets separately based on purchase date:

**OLD Assets (pre-2025):**
- Entered via Historical Data
- Depreciation continues according to original schedule
- Cannot be modified (historical fact)

**NEW Assets (2025+):**
- Configured via CapEx Module
- Depreciation starts in purchase year
- Can be edited or removed

**Why this matters:**
- Ensures accurate balance sheet tracking
- Preserves historical audit trail
- Allows "what-if" analysis on future purchases

---

## User Management

Manage user accounts and assign roles. (Feature roadmap - may not be fully implemented yet)

### User Roles

The system has three roles with different permissions:

#### ADMIN (Administrator)
**Can:**
- ✓ Configure system settings
- ✓ Manage historical data
- ✓ Manage CapEx configuration
- ✓ Create, edit, delete proposals
- ✓ Run scenarios and sensitivity analysis
- ✓ View all proposals
- ✓ Manage users
- ✓ View audit logs

**Cannot:**
- (Full access - no restrictions)

#### PLANNER
**Can:**
- ✓ Create new proposals
- ✓ Edit own proposals
- ✓ Run scenarios and sensitivity analysis
- ✓ Compare proposals
- ✓ Export reports (PDF, Excel)
- ✓ View all proposals

**Cannot:**
- ✗ Configure system settings
- ✗ Manage historical data
- ✗ Manage CapEx configuration
- ✗ Manage users
- ✗ View audit logs

#### VIEWER
**Can:**
- ✓ View proposals (read-only)
- ✓ View scenarios and comparisons
- ✓ Export reports

**Cannot:**
- ✗ Create or edit proposals
- ✗ Run new scenarios
- ✗ Configure anything
- ✗ Manage users

### Adding a New User

**Step 1: Navigate to User Management**

Admin Dashboard → User Management

**Step 2: Click "Add User"**

**Step 3: Enter User Details**

| Field | Description | Example |
|-------|-------------|---------|
| Email | User's email address | john.doe@school.sa |
| Name | Full name | John Doe |
| Role | ADMIN, PLANNER, or VIEWER | PLANNER |

**Step 4: Send Invitation**

Click "Send Invitation" to email the user login credentials.

### Editing User Roles

**Step 1: Find User**

Search for the user by email or name.

**Step 2: Click "Edit"**

**Step 3: Change Role**

Select new role from dropdown.

**Step 4: Save Changes**

**Note:** Role changes take effect immediately.

### Deactivating Users

**To temporarily disable access:**

1. Find user in list
2. Click "Deactivate"
3. Confirm action
4. User can be reactivated later

**To permanently remove:**

1. Find user in list
2. Click "Delete"
3. Confirm action
4. **Warning:** This cannot be undone

---

## Audit Log

View a history of all system changes for compliance and troubleshooting. (Feature roadmap - may not be fully implemented yet)

### Accessing Audit Log

**Navigation**: Admin Dashboard → Audit Log

[Screenshot: Audit Log Page]

### What's Logged

The system logs:
- Configuration changes (Zakat rate, interest rates, etc.)
- Historical data edits
- CapEx configuration changes
- Proposal creation, editing, deletion
- User account changes
- Login/logout events
- Export actions (PDF, Excel)

### Viewing Log Entries

Each entry shows:
- **Timestamp**: When the action occurred
- **User**: Who performed the action
- **Action Type**: What was done (CREATE, UPDATE, DELETE, LOGIN, etc.)
- **Resource**: What was affected (Config, Proposal, User, etc.)
- **Details**: Specific changes made (old value → new value)

### Filtering the Log

**By Date Range:**
- Select start and end dates
- Click "Apply Filter"

**By User:**
- Select user from dropdown
- View all actions by that user

**By Action Type:**
- Filter by CREATE, UPDATE, DELETE, etc.

**By Resource:**
- Filter by Config, Proposal, User, etc.

### Exporting Audit Log

**For compliance or archival:**

1. Apply desired filters
2. Click "Export to CSV"
3. Save file with filtered log entries

---

## FAQs

### General Questions

**Q: Who can access the Admin dashboard?**

A: Only users with the ADMIN role can access admin functions. Contact your system administrator to request admin access.

**Q: Can I undo changes to system configuration?**

A: While there's no "undo" button, you can always re-enter previous values. Check the Audit Log to see what values were used before.

**Q: How often should I update historical data?**

A: Historical data (2023-2024) should only be entered once, using final audited financial statements. After initial setup, it should not change.

### Historical Data

**Q: What if my 2024 audit isn't complete yet?**

A: Use the best available figures (unaudited statements). You can update them later when the audit is finalized.

**Q: Can I enter monthly data instead of annual?**

A: No, the system requires annual aggregated data for 2023 and 2024 only.

**Q: What if I don't have all line items?**

A: Enter what you have. For missing items, enter 0. The system will calculate some items automatically (e.g., Net PPE from Gross PPE and Accumulated Depreciation).

**Q: The balance sheet won't balance. What's wrong?**

A: Check for common errors:
- Ensure Assets = Liabilities + Equity
- Verify signs (assets positive, liabilities positive, equity positive)
- Check for typos or missing decimal points
- Ensure Accumulated Depreciation is entered as a positive number (system subtracts it)

### System Configuration

**Q: What happens if I change the Zakat rate?**

A: All future proposals and calculations will use the new rate. Existing saved proposals are NOT recalculated automatically - you must re-run them manually.

**Q: Should I change interest rates to match current market conditions?**

A: Yes, update these periodically (quarterly or annually) to reflect actual borrowing and deposit rates your school can access.

**Q: What's a reasonable minimum cash balance?**

A: Typically 1-3 months of operating expenses. For a school with 40M annual OpEx, that's 3.3M - 10M SAR.

### CapEx Module

**Q: Should I use auto-reinvestment or manual items?**

A: Use **auto-reinvestment** for recurring expenses (furniture, computers). Use **manual items** for one-time purchases (building expansion, land).

**Q: What depreciation method should I choose?**

A:
- **Straight-Line**: Most common, simple, used for buildings, furniture, vehicles
- **Declining Balance**: For technology and equipment that loses value quickly

**Q: Can I delete a CapEx item after creating it?**

A: Yes, if it's a NEW asset (2025+). You cannot delete OLD assets from historical data.

**Q: Why do I see two depreciation amounts (Old vs. New)?**

A: The system separates depreciation from historical assets (OLD, pre-2025) and future purchases (NEW, 2025+). This ensures accurate tracking and allows "what-if" analysis.

### Troubleshooting

**Q: I'm getting an "Access Denied" error.**

A: Check your user role. You need ADMIN role to access admin functions. Contact your system administrator.

**Q: Changes I made aren't showing up.**

A: Ensure you clicked "Save" or "Confirm". Check the success/error message. Refresh the page.

**Q: The system is running slowly.**

A: The financial calculation engine is optimized for <1 second calculations. If you experience slowness:
- Check your internet connection
- Clear browser cache
- Try a different browser
- Contact technical support

**Q: I need help with a financial formula.**

A: See the [Technical Documentation: Calculation Formulas](../technical/CALCULATION_FORMULAS.md) for detailed formula documentation.

---

## Next Steps

After completing admin setup:

1. **Train Planners**: Share the [Planner Guide](PLANNER_GUIDE.md) with your financial planning team
2. **Create Test Proposal**: Have a planner create a sample proposal to verify all calculations work correctly
3. **Review Dashboard**: Check the [Dashboard Guide](VIEWER_GUIDE.md) to understand reporting capabilities
4. **Regular Maintenance**: Schedule quarterly reviews of system configuration and semi-annual working capital ratio checks

---

## Support

For technical support or questions:
- **Email**: support@schoolfinance.sa (example)
- **Documentation**: See full [Technical Documentation](../technical/)
- **Training**: Request live training sessions for your team

---

**Document Version:** 1.0
**Last Updated:** November 2024
**Maintained By:** Documentation Agent
