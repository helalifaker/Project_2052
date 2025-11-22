# UI/UX SPECIFICATION DOCUMENT

## School Lease Proposal Assessment Application

### Project Zeta

**Document Version:** 1.0
**Date:** November 22, 2025
**Status:** DRAFT - For Review

---

## 1. DESIGN PHILOSOPHY: "PREMIUM PRECISION"

The application must feel like a high-end financial instrument: precise, trustworthy, and incredibly fast. It should evoke the feeling of a modern "Bloomberg Terminal" reimagined for an executive iPad experience—clean, data-dense but not cluttered, and highly interactive.

**Core Design Pillars:**

1. **Clarity First:** Data is presented in "Millions (M)" by default. No visual noise.
2. **Tangible Interactivity:** Sliders and toggles should feel "heavy" and responsive. Charts update instantly (<16ms frame rate).
3. **Contextual Depth:** Start with the high-level KPI (The "What"), allow drill-down to the "Why" (Financial Statements).
4. **Board-Ready:** Every screen is a presentation slide. High contrast, readable fonts, professional color theory.

---

## 2. VISUAL IDENTITY SYSTEM

### 2.1 Color Palette

We will use a sophisticated, "Dark Mode First" aesthetic (optional Light Mode) to convey authority and reduce eye strain during long meetings.

**Primary Colors (Brand & UI):**

- **Midnight Slate (Background):** `#0F172A` (Rich, deep blue-grey)
- **Panel Surface:** `#1E293B` (Lighter slate for cards/panels)
- **Primary Accent (Action):** `#3B82F6` (Vibrant Royal Blue - for buttons/active states)
- **Text Primary:** `#F8FAFC` (Almost white - high readability)
- **Text Secondary:** `#94A3B8` (Muted blue-grey - for labels)

**Data Visualization Colors:**

- **Positive/Growth:** `#10B981` (Emerald - distinct from generic green)
- **Negative/Cost:** `#F43F5E` (Rose - less aggressive than pure red)
- **Neutral/Baseline:** `#64748B` (Slate)
- **Proposal A:** `#8B5CF6` (Violet)
- **Proposal B:** `#06B6D4` (Cyan)
- **Proposal C:** `#F59E0B` (Amber)

### 2.2 Typography

**Font Family:** `Inter` or `Plus Jakarta Sans` (Google Fonts).

- **Headings:** Bold, tight tracking.
- **Numbers:** Tabular figures (monospaced numbers) are MANDATORY for all financial tables to ensure alignment.

### 2.3 Layout Structure: "The Bento Grid"

The UI will follow a modular "Bento Grid" layout.

- **Sidebar (Collapsed by default on small screens):** Navigation icons.
- **Global Context Bar (Top):** Shows current Scenario Name and Key Assumptions (e.g., "Inflation: 3% | Enrollment: 100%").
- **Main Stage:** A grid of cards. Each card contains a specific insight (e.g., "Total Cost", "NPV", "Rent Trajectory").

---

## 3. KEY SCREEN SPECIFICATIONS

### 3.1 The "Executive Dashboard" (Landing)

![Executive Dashboard Mockup](/Users/fakerhelali/.gemini/antigravity/brain/fe997899-b457-4a1c-aa6d-d58f17928d42/executive_dashboard_mockup_1763828360009.png)
**Goal:** Instant status check.

- **Hero Card (Top Left):** "Best Performing Proposal" (highlighted).
- **KPI Cards (Top Row):可通过以下方式实现：** 25-Year Total Cost, NPV, Lowest Cash Point.
- **Main Chart (Center):** "Rent Trajectory (2028-2053)" - Line chart comparing all active proposals.
- **Action Area:** "Create New Proposal" or "Compare Selected".

### 3.2 Proposal Builder (The Wizard)

**Goal:** Painless data entry.

- **Step-by-Step Flow:**
    1. **Basics:** Developer Name, Rent Model Selection (Card selection with icons).
    2. **Transition (2025-27):** Simple table input.
    3. **Dynamic (2028+):**
        - **Enrollment:** Interactive curve editor (drag points to set ramp-up).
        - **Rent Terms:** Specific fields based on model (Fixed/RevShare/Partner).
- **Real-time Validation:** As user types, a mini-preview chart updates in the corner.

### 3.3 The "War Room" (Comparison Matrix)

**Goal:** Decision making.

- **Layout:** Columns = Proposals, Rows = Metrics.
- **Features:**
  - **"Winner" Highlighting:** The best value in each row is subtly highlighted in Green.
  - **Delta View:** Toggle to show "Difference from Baseline" instead of absolute numbers.
  - **Sync Scroll:** All columns scroll together.

### 3.4 Interactive Scenario Analysis

**Goal:** "What-if" exploration.

- **The Control Panel:** A floating or docked panel with sliders.
  - *Enrollment:* 50% <-> 150%
  - *Inflation:* 0% <-> 10%
- **Interaction:** Dragging a slider updates ALL visible charts *instantly* (no "Calculate" button).
- **Visual Feedback:** When a slider moves, changed numbers "flash" briefly to draw attention.

### 3.5 Financial Statements (Deep Dive)

**Goal:** Audit and verification.

- **Format:** Standard accounting table, but modernized.
- **Interactivity:**
  - **Hover:** Hovering a row (e.g., "Staff Costs") highlights the driver (e.g., "Teacher Ratio") in the assumptions panel.
  - **Drill-down:** Clicking "Total OpEx" expands to show Rent/Staff/Other breakdown.
- **Time Travel:** A timeline scrubber at the top to quickly jump between 2028, 2035, 2050.

---

## 4. MICRO-INTERACTIONS & ANIMATION

- **Page Transitions:** Smooth fade-in/slide-up (200ms).
- **Chart Animations:** Lines "grow" from left to right on load.
- **Number Ticking:** When values change (via sliders), numbers "tick" up/down quickly rather than instant replacement.
- **Buttons:** Subtle scale-down on click (tactile feel).

## 5. RESPONSIVENESS

- **Desktop (Boardroom TV):** Full density, all columns visible.
- **Tablet (iPad Pro):** Touch-optimized sliders, stacked cards if needed.
- **Mobile (Quick Check):** Read-only view of KPIs and Executive Summary.

## 6. IMPLEMENTATION NOTES (Tailwind CSS)

- Use `backdrop-blur-md` for floating panels (Glassmorphism).
- Use `tabular-nums` class for all financial data.
- Use `transition-all duration-200` for smooth UI states.
- Chart library: `Recharts` (highly customizable SVG charts).

---
**Summary:** This specification delivers a tool that is not just a calculator, but a *decision support system* designed for the high-stakes environment of a school board.
