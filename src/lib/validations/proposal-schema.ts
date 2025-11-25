import { z } from "zod";

// Rent Model Schema
export const rentModelSchema = z.enum([
  "FIXED_RENT",
  "REVENUE_SHARE",
  "HYBRID",
]);

// Step 1: Property Details
export const propertyDetailsSchema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  location: z.string().min(1, "Location is required"),
  totalArea: z.number().positive("Total area must be positive"),
  usableArea: z.number().positive("Usable area must be positive"),
  zoneType: z.string().min(1, "Zone type is required"),
  accessibilityScore: z.number().min(1).max(10, "Score must be between 1-10"),
});

// Step 2: Rent Model Configuration
export const rentConfigSchema = z.discriminatedUnion("rentModel", [
  // Fixed Rent
  z.object({
    rentModel: z.literal("FIXED_RENT"),
    annualRent: z.number().positive("Annual rent must be positive"),
    escalationRate: z.number().min(0).max(20, "Escalation rate must be 0-20%"),
    rentFreeMonths: z.number().int().min(0).max(24),
  }),
  // Revenue Share
  z.object({
    rentModel: z.literal("REVENUE_SHARE"),
    revenueSharePercentage: z.number().min(1).max(50, "Must be between 1-50%"),
    minimumGuarantee: z.number().min(0),
    escalationRate: z.number().min(0).max(20),
  }),
  // Hybrid
  z.object({
    rentModel: z.literal("HYBRID"),
    baseRent: z.number().positive("Base rent must be positive"),
    revenueSharePercentage: z.number().min(1).max(30),
    revenueThreshold: z.number().positive(),
    escalationRate: z.number().min(0).max(20),
  }),
]);

// Step 3: CapEx Requirements
export const capexSchema = z.object({
  buildingStructure: z.number().min(0),
  refrigeration: z.number().min(0),
  shelving: z.number().min(0),
  checkouts: z.number().min(0),
  lighting: z.number().min(0),
  hvac: z.number().min(0),
  security: z.number().min(0),
  signage: z.number().min(0),
  other: z.number().min(0),
  contingency: z.number().min(0).max(30, "Contingency must be 0-30%"),
});

// Step 4: Operating Assumptions
export const operatingAssumptionsSchema = z.object({
  openingYear: z.number().int().min(2024).max(2030),
  leaseTerm: z.number().int().min(5).max(50),
  annualRevenueGrowth: z.number().min(-10).max(30),
  operatingMargin: z.number().min(0).max(50),
  discountRate: z.number().min(1).max(30),
  terminalGrowthRate: z.number().min(0).max(10),
});

// Step 5: Market Data
export const marketDataSchema = z.object({
  competitorCount: z.number().int().min(0),
  marketGrowthRate: z.number().min(-20).max(50),
  averageBasketSize: z.number().positive(),
  footfallEstimate: z.number().int().positive(),
  seasonalityFactor: z.number().min(0.5).max(2),
});

// Step 6: Risk Factors
export const riskFactorsSchema = z.object({
  economicRisk: z.number().min(1).max(10),
  competitionRisk: z.number().min(1).max(10),
  regulatoryRisk: z.number().min(1).max(10),
  operationalRisk: z.number().min(1).max(10),
  locationRisk: z.number().min(1).max(10),
});

// Step 7: Review & Submit
export const reviewSchema = z.object({
  proposalName: z.string().min(1, "Proposal name is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Complete Proposal Schema (all steps combined)
export const completeProposalSchema = z.object({
  propertyDetails: propertyDetailsSchema,
  rentConfig: rentConfigSchema,
  capex: capexSchema,
  operatingAssumptions: operatingAssumptionsSchema,
  marketData: marketDataSchema,
  riskFactors: riskFactorsSchema,
  review: reviewSchema,
});

// Type exports
export type RentModel = z.infer<typeof rentModelSchema>;
export type PropertyDetails = z.infer<typeof propertyDetailsSchema>;
export type RentConfig = z.infer<typeof rentConfigSchema>;
export type CapEx = z.infer<typeof capexSchema>;
export type OperatingAssumptions = z.infer<typeof operatingAssumptionsSchema>;
export type MarketData = z.infer<typeof marketDataSchema>;
export type RiskFactors = z.infer<typeof riskFactorsSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type CompleteProposal = z.infer<typeof completeProposalSchema>;
