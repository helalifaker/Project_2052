/**
 * Test Data Generators and Constants
 * Provides realistic test data for E2E tests
 */

export const TEST_DATA = {
  HISTORICAL: {
    YEAR_2023: {
      revenue: 50000000,
      cogs: 25000000,
      opex: 15000000,
      assets: 100000000,
      liabilities: 60000000,
    },
    YEAR_2024: {
      revenue: 55000000,
      cogs: 27000000,
      opex: 16000000,
      assets: 110000000,
      liabilities: 65000000,
    },
  },
  CONFIG: {
    zakatRate: 2.5,
    corporateTaxRate: 20,
    interestRate: 5,
    minCashBalance: 1000000,
    inflationRate: 2.5,
  },
  CAPEX: {
    autoReinvestment: true,
    reinvestmentRate: 3,
    manualItems: [
      {
        year: 2025,
        description: "Building Renovation",
        amount: 5000000,
      },
    ],
  },
  PROPOSAL: {
    developerName: "Test School Developer",
    rentModel: "FIXED",
    transitionPeriod: {
      year2025: {
        revenue: 60000000,
        enrollment: 1000,
      },
      year2026: {
        revenue: 65000000,
        enrollment: 1100,
      },
      year2027: {
        revenue: 70000000,
        enrollment: 1200,
      },
    },
    enrollment: {
      maxCapacity: 2000,
      year1Enrollment: 400, // 20% of max capacity
      rampUpYears: 5,
    },
    curriculum: {
      hasFrench: true,
      hasIB: true,
    },
    rentModelDetails: {
      fixed: {
        annualRent: 8000000,
        escalationRate: 3,
      },
    },
    opex: {
      teacherSalary: 8000,
      supportStaffSalary: 4000,
      studentTeacherRatio: 15,
      opexPercentage: 35,
    },
  },
};

export function generateProposalTestData(
  overrides?: Partial<typeof TEST_DATA.PROPOSAL>,
) {
  const timestamp = Date.now();
  return {
    ...TEST_DATA.PROPOSAL,
    developerName: `Test Developer ${timestamp}`,
    ...overrides,
  };
}

export function generateHistoricalData(year: number) {
  return {
    year,
    revenue: 50000000 + (year - 2023) * 5000000,
    cogs: 25000000 + (year - 2023) * 2000000,
    salaries: 10000000 + (year - 2023) * 1000000,
    rent: 5000000 + (year - 2023) * 500000,
    otherOpex: 5000000 + (year - 2023) * 500000,
    capex: 2000000,
    depreciation: 1000000,
    assets: 100000000 + (year - 2023) * 10000000,
    liabilities: 60000000 + (year - 2023) * 5000000,
    equity: 40000000 + (year - 2023) * 5000000,
  };
}

export const PERFORMANCE_THRESHOLDS = {
  PROPOSAL_CALCULATION: 2000, // 2 seconds
  SCENARIO_UPDATE: 500, // 500ms
  PAGE_LOAD: 2000, // 2 seconds
  EXPORT_GENERATION: 5000, // 5 seconds
  OPTIMAL_SCENARIO_UPDATE: 200, // 200ms (optimal target)
};

export const ACCESSIBILITY_REQUIREMENTS = {
  WCAG_AA_CONTRAST_RATIO: 4.5,
  MIN_TOUCH_TARGET_SIZE: 44, // pixels
  TAB_ORDER_REQUIREMENTS: [
    "form inputs should be accessible via Tab",
    "buttons should be accessible via Tab",
    "links should be accessible via Tab",
    "interactive elements should have visible focus indicators",
  ],
};

export const TEST_ROUTES = {
  HOME: "/",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_HISTORICAL: "/admin/historical",
  ADMIN_CONFIG: "/admin/config",
  ADMIN_CAPEX: "/admin/capex",
  PROPOSALS_LIST: "/proposals",
  PROPOSALS_NEW: "/proposals/new",
  PROPOSALS_DETAIL: (id: string) => `/proposals/${id}`,
  PROPOSALS_COMPARE: "/proposals/compare",
  DASHBOARD: "/dashboard",
};

export const API_ENDPOINTS = {
  PROPOSALS_CALCULATE: "/api/proposals/calculate",
  PROPOSALS_LIST: "/api/proposals",
  PROPOSALS_DETAIL: (id: string) => `/api/proposals/${id}`,
  SCENARIOS: (id: string) => `/api/proposals/${id}/scenarios`,
  SENSITIVITY: (id: string) => `/api/proposals/${id}/sensitivity`,
  EXPORT_EXCEL: (id: string) => `/api/proposals/${id}/export/excel`,
  EXPORT_PDF: (id: string) => `/api/proposals/${id}/export/pdf`,
  HISTORICAL: "/api/historical",
  CONFIG: "/api/config",
};

export const SELECTORS = {
  // Common
  LOADING_SPINNER: '[data-testid="loading"]',
  TOAST: '[role="status"], [data-sonner-toast]',

  // Forms
  FORM_INPUT: 'input[type="text"], input[type="number"], input[type="email"]',
  FORM_SELECT: "select",
  FORM_BUTTON_SUBMIT: 'button[type="submit"]',

  // Tables
  TABLE: "table",
  TABLE_ROW: "table tbody tr",
  TABLE_CELL: "table tbody tr td",

  // Wizard
  WIZARD_STEP: '[data-testid="wizard-step"]',
  WIZARD_NEXT: 'button:has-text("Next")',
  WIZARD_PREVIOUS: 'button:has-text("Previous")',
  WIZARD_SUBMIT: 'button:has-text("Calculate")',

  // Proposal Detail Tabs
  TAB_OVERVIEW: 'button:has-text("Overview")',
  TAB_TRANSITION: 'button:has-text("Transition")',
  TAB_DYNAMIC: 'button:has-text("Dynamic")',
  TAB_FINANCIAL: 'button:has-text("Financial Statements")',
  TAB_SCENARIOS: 'button:has-text("Scenarios")',
  TAB_SENSITIVITY: 'button:has-text("Sensitivity")',

  // Export
  EXPORT_EXCEL: 'button:has-text("Export Excel")',
  EXPORT_PDF: 'button:has-text("Export PDF")',
};
