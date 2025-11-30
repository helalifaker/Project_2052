/**
 * Helper types for Prisma operations when the Prisma client isn't available
 * These types provide basic type safety without requiring the generated Prisma client
 */

import { ProposalStatus } from "./roles";

// Generic JSON value type
export type InputJsonValue =
  | string
  | number
  | boolean
  | null
  | InputJsonObject
  | InputJsonArray;
export type InputJsonObject = { [key: string]: InputJsonValue };
export type InputJsonArray = InputJsonValue[];

// JSON null constant
export const JsonNull = null as const;

// String filter type
export type StringFilter = string | { contains?: string; mode?: "insensitive" };

// Where input types
export type UserWhereInput = {
  id?: string;
  email?: StringFilter;
  name?: StringFilter;
  role?: string;
  OR?: UserWhereInput[];
};

export type LeaseProposalWhereInput = {
  id?: string;
  name?: StringFilter;
  developer?: string;
  property?: string;
  rentModel?: string;
  status?: ProposalStatus | { in: ProposalStatus[] };
  createdBy?: string;
  createdAt?: { gte?: Date; lte?: Date };
};

// Update input types
export type UserUpdateInput = {
  email?: string;
  name?: string;
  role?: string;
};

export type LeaseProposalUpdateInput = {
  name?: string | null;
  developer?: string | null;
  property?: string | null;
  rentModel?: string | null;
  status?: string | null;
  enrollment?: InputJsonValue;
  curriculum?: InputJsonValue;
  staff?: InputJsonValue;
  rentParams?: InputJsonValue;
  financials?: InputJsonValue;
  metrics?: InputJsonValue;
  otherOpexPercent?: number | null;
  calculatedAt?: Date | null;
  transitionConfigUpdatedAt?: Date;
  version?: string | null;
  origin?: string | null;
  negotiationRound?: number | null;
  submittedDate?: Date | null;
  responseReceivedDate?: Date | null;
};

// Error types
export class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;

  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message);
    this.name = "PrismaClientKnownRequestError";
    this.code = code;
    this.meta = meta;
  }
}
