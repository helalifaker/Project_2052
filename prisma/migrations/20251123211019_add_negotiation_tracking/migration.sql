-- CreateEnum
CREATE TYPE "ProposalOrigin" AS ENUM ('OUR_OFFER', 'THEIR_COUNTER');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'READY_TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW', 'COUNTER_RECEIVED', 'EVALUATING_COUNTER', 'ACCEPTED', 'REJECTED', 'NEGOTIATION_CLOSED');

-- AlterTable
ALTER TABLE "LeaseProposal" ADD COLUMN "developer" TEXT,
ADD COLUMN "property" TEXT,
ADD COLUMN "negotiationRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "version" TEXT,
ADD COLUMN "origin" "ProposalOrigin" NOT NULL DEFAULT 'OUR_OFFER',
ADD COLUMN "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "parentProposalId" TEXT,
ADD COLUMN "submittedDate" TIMESTAMP(3),
ADD COLUMN "responseReceivedDate" TIMESTAMP(3),
ADD COLUMN "negotiationNotes" TEXT,
ADD COLUMN "boardComments" TEXT,
ADD CONSTRAINT "LeaseProposal_parentProposalId_fkey" FOREIGN KEY ("parentProposalId") REFERENCES "LeaseProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "idx_negotiation_thread" ON "LeaseProposal"("developer", "property", "negotiationRound");

-- CreateIndex
CREATE INDEX "idx_status" ON "LeaseProposal"("status");
