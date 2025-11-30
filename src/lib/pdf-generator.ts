import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Proposal } from "@/lib/types/proposal";

export const generateProposalPDF = async (
    proposal: Proposal,
    reportElementId: string
) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Helper Functions ---
    const addHeader = (pageNumber: number) => {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Project Zeta - Confidential", margin, 10);
        doc.text(
            `Page ${pageNumber}`,
            pageWidth - margin - 10,
            10
        );
        doc.setDrawColor(200);
        doc.line(margin, 12, pageWidth - margin, 12);
    };

    const addFooter = () => {
        const date = new Date().toLocaleDateString();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Generated on ${date} | Proposal ID: ${proposal.id.slice(0, 8)}`,
            margin,
            pageHeight - 10
        );
    };

    // --- Page 1: Executive Summary & Charts ---

    // Capture the hidden report element (which contains the charts)
    const element = document.getElementById(reportElementId);
    if (!element) {
        throw new Error("Report element not found");
    }

    // We need to ensure the element is visible for html2canvas to work, 
    // but it might be in a hidden container. 
    // Usually, it's best to render it off-screen but "visible" in CSS terms.

    const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // Force white background
    });

    const imgData = canvas.toDataURL("image/png");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = pageWidth - (margin * 2);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add the captured content (Charts + Summary Cards)
    // We assume the component is designed to fit on one A4 page width-wise
    doc.addImage(imgData, "PNG", margin, 20, pdfWidth, pdfHeight);

    addHeader(1);
    addFooter();

    // --- Page 2: Financial Tables ---
    doc.addPage();
    addHeader(2);
    addFooter();

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Financial Analysis", margin, 25);

    // Pivot Years Logic
    const allYears = proposal.financials?.map((f: any) => f.year) || [];
    const pivotYears = [
        2023, 2024, // History
        2025, // Transition
        2028, 2029, 2030, // Dynamic Start
        2040, 2041, // Mid
        2052, 2053 // End
    ].filter(y => allYears.includes(y));

    const tableData = pivotYears.map(year => {
        const fin = proposal.financials?.find((f: any) => f.year === year);
        if (!fin) return [];
        return [
            year.toString(),
            (Number(fin.revenue) / 1_000_000).toFixed(1),
            (Number(fin.rent) / 1_000_000).toFixed(1),
            (Number(fin.opex) / 1_000_000).toFixed(1),
            (Number(fin.ebitda) / 1_000_000).toFixed(1),
            (Number(fin.netIncome) / 1_000_000).toFixed(1),
            (Number(fin.cashFlow) / 1_000_000).toFixed(1),
        ];
    });

    autoTable(doc, {
        startY: 35,
        head: [["Year", "Revenue (M)", "Rent (M)", "OpEx (M)", "EBITDA (M)", "Net Income (M)", "Cash Flow (M)"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
    });

    // Add Commentary below table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Financial Commentary", margin, finalY);

    doc.setFontSize(10);
    doc.setTextColor(60);
    const commentary = "The financial projections indicate a steady ramp-up in revenue starting from 2028. Operational expenses are optimized, ensuring a healthy EBITDA margin throughout the lease term.";
    const splitText = doc.splitTextToSize(commentary, pageWidth - (margin * 2));
    doc.text(splitText, margin, finalY + 7);

    // Save
    doc.save(`${(proposal.name || "Proposal").replace(/\s+/g, "_")}_Report.pdf`);
};
