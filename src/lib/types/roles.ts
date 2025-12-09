/**
 * Shared types for client-side use
 *
 * These enums mirror the Prisma enums but can be safely imported
 * in client components without pulling in the Prisma client.
 */

export enum Role {
  ADMIN = "ADMIN",
  PLANNER = "PLANNER",
  VIEWER = "VIEWER",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ProposalOrigin {
  OUR_OFFER = "OUR_OFFER",
  THEIR_COUNTER = "THEIR_COUNTER",
}

export enum ProposalStatus {
  DRAFT = "DRAFT",
  READY_TO_SUBMIT = "READY_TO_SUBMIT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  COUNTER_RECEIVED = "COUNTER_RECEIVED",
  EVALUATING_COUNTER = "EVALUATING_COUNTER",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  NEGOTIATION_CLOSED = "NEGOTIATION_CLOSED",
}

export enum NegotiationStatus {
  ACTIVE = "ACTIVE",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}

export enum ProposalPurpose {
  NEGOTIATION = "NEGOTIATION",
  STRESS_TEST = "STRESS_TEST",
  SIMULATION = "SIMULATION",
}

export type RoleType = keyof typeof Role;
export type ApprovalStatusType = keyof typeof ApprovalStatus;
export type ProposalOriginType = keyof typeof ProposalOrigin;
export type ProposalStatusType = keyof typeof ProposalStatus;
export type NegotiationStatusType = keyof typeof NegotiationStatus;
export type ProposalPurposeType = keyof typeof ProposalPurpose;
