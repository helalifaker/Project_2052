import { prisma } from "./src/lib/prisma";
import { proposalToFormData } from "./src/lib/proposals/transform-to-form";

async function testTransform() {
  try {
    // Fetch the actual proposal
    const proposal = await prisma.leaseProposal.findUnique({
      where: { id: "b52be42f-71da-4d5e-8147-363259273f7b" },
      select: {
        id: true,
        name: true,
        rentModel: true,
        contractPeriodYears: true,
        enrollment: true,
        curriculum: true,
        staff: true,
        rentParams: true,
        otherOpexPercent: true,
      },
    });

    if (!proposal) {
      console.error("Proposal not found");
      return;
    }

    console.log("\n=== RAW DATABASE DATA ===");
    console.log("Name:", proposal.name);
    console.log("Rent Model:", proposal.rentModel);
    console.log("Contract Period:", proposal.contractPeriodYears);
    console.log("Enrollment:", JSON.stringify(proposal.enrollment, null, 2));
    console.log("Curriculum:", JSON.stringify(proposal.curriculum, null, 2));
    console.log("Staff:", JSON.stringify(proposal.staff, null, 2));
    console.log("Rent Params:", JSON.stringify(proposal.rentParams, null, 2));
    console.log("Other OpEx %:", proposal.otherOpexPercent);

    // Transform it
    const formData = proposalToFormData(proposal);

    console.log("\n=== TRANSFORMED FORM DATA ===");
    console.log("Developer Name:", formData.developerName);
    console.log("Rent Model:", formData.rentModel);
    console.log("Contract Period:", formData.contractPeriodYears);
    console.log("\nEnrollment:");
    console.log("  French Capacity:", formData.frenchCapacity);
    console.log("  Ramp FR Year 1:", formData.rampUpFRYear1Percentage + "%");
    console.log("  Ramp FR Year 2:", formData.rampUpFRYear2Percentage + "%");
    console.log("  Ramp FR Year 3:", formData.rampUpFRYear3Percentage + "%");
    console.log("  Ramp FR Year 4:", formData.rampUpFRYear4Percentage + "%");
    console.log("  Ramp FR Year 5:", formData.rampUpFRYear5Percentage + "%");
    console.log("\nCurriculum:");
    console.log("  French Base Tuition 2028:", formData.frenchBaseTuition2028);
    console.log(
      "  French Growth Rate:",
      formData.frenchTuitionGrowthRate + "%",
    );
    console.log(
      "  French Growth Frequency:",
      formData.frenchTuitionGrowthFrequency,
    );
    console.log("\nStaff:");
    console.log("  Students per Teacher:", formData.studentsPerTeacher);
    console.log("  Avg Teacher Salary:", formData.avgTeacherSalary);
    console.log("  CPI Rate:", formData.cpiRate + "%");
    console.log("  CPI Frequency:", formData.cpiFrequency);
    console.log("\nOther OpEx %:", formData.otherOpexPercent + "%");

    console.log("\n=== VERIFICATION ===");
    const checks = [
      {
        name: "French Capacity",
        expected: 2000,
        actual: formData.frenchCapacity,
      },
      {
        name: "Ramp Year 1",
        expected: 92.5,
        actual: formData.rampUpFRYear1Percentage,
      },
      {
        name: "French Base Tuition",
        expected: 38200,
        actual: formData.frenchBaseTuition2028,
      },
      {
        name: "French Growth Rate",
        expected: 5,
        actual: formData.frenchTuitionGrowthRate,
      },
      {
        name: "Students per Teacher",
        expected: 13,
        actual: formData.studentsPerTeacher,
      },
      {
        name: "Avg Teacher Salary",
        expected: 16300,
        actual: formData.avgTeacherSalary,
      },
      {
        name: "CPI Rate",
        expected: 2,
        actual: formData.cpiRate,
      },
    ];

    let allPass = true;
    checks.forEach((check) => {
      const pass = check.actual === check.expected;
      const status = pass ? "✓" : "✗";
      console.log(
        `${status} ${check.name}: expected ${check.expected}, got ${check.actual}`,
      );
      if (!pass) allPass = false;
    });

    if (allPass) {
      console.log("\n✅ All checks passed! Transformation working correctly.");
    } else {
      console.log("\n❌ Some checks failed. Review transformation logic.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testTransform();
