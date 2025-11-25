import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUserWithRole } from "@/middleware/auth";
import { Role } from "@prisma/client";
import { jsPDF } from "jspdf";

type ProposalMetrics = {
  npv?: number | string;
  irr?: number | string;
  paybackPeriod?: number | string;
  roiPercent?: number | string;
};

type RentParams = Record<string, string | number | boolean>;

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check auth
  const authResult = await authenticateUserWithRole([
    Role.ADMIN,
    Role.PLANNER,
    Role.VIEWER,
  ]);
  if (!authResult.success) return authResult.error;

  // Await params (Next.js 15+ requirement)
  const { id } = await params;

  try {
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text("Lease Proposal Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Proposal Info
    doc.setFontSize(12);
    doc.text(`Proposal: ${proposal.name}`, 20, yPos);
    yPos += 8;
    doc.text(`Rent Model: ${proposal.rentModel}`, 20, yPos);
    yPos += 8;
    doc.text(`Created: ${proposal.createdAt.toLocaleDateString()}`, 20, yPos);
    yPos += 8;
    doc.text(`Created By: ${proposal.creator.email}`, 20, yPos);
    yPos += 15;

    // Financial Metrics
    if (proposal.metrics) {
      const metrics = proposal.metrics as ProposalMetrics;
      doc.setFontSize(14);
      doc.text("Financial Metrics", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      if (metrics.npv !== undefined) {
        doc.text(
          `NPV: €${(toNumber(metrics.npv) / 1_000_000).toFixed(2)}M`,
          20,
          yPos,
        );
        yPos += 6;
      }
      if (metrics.irr !== undefined) {
        doc.text(`IRR: ${toNumber(metrics.irr).toFixed(2)}%`, 20, yPos);
        yPos += 6;
      }
      if (metrics.paybackPeriod !== undefined) {
        doc.text(
          `Payback Period: ${toNumber(metrics.paybackPeriod).toFixed(1)} years`,
          20,
          yPos,
        );
        yPos += 6;
      }
      if (metrics.roiPercent !== undefined) {
        doc.text(`ROI: ${toNumber(metrics.roiPercent).toFixed(2)}%`, 20, yPos);
        yPos += 10;
      }
    }

    // Rent Parameters
    if (proposal.rentParams) {
      const rentParams = proposal.rentParams as RentParams;
      doc.setFontSize(14);
      doc.text("Rent Parameters", 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      Object.entries(rentParams).forEach(([key, value]) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
        const valueText =
          typeof value === "number" ? value.toLocaleString() : String(value);
        doc.text(`${formattedKey}: ${valueText}`, 20, yPos);
        yPos += 6;
      });
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.name.replace(/\s+/g, "_")}_Report.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
