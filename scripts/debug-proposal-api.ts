import { prisma } from "./src/lib/prisma";

async function debugProposal() {
  try {
    console.log("Fetching first proposal...");

    const proposal = await prisma.leaseProposal.findFirst({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assets: true,
      },
    });

    if (!proposal) {
      console.log("No proposals found in database");
      return;
    }

    console.log("\n✅ Proposal fetched successfully!");
    console.log("ID:", proposal.id);
    console.log("Name:", proposal.name);
    console.log("Rent Model:", proposal.rentModel);
    console.log(
      "Has transitionConfigUpdatedAt:",
      !!proposal.transitionConfigUpdatedAt,
    );
    console.log(
      "transitionConfigUpdatedAt:",
      proposal.transitionConfigUpdatedAt,
    );

    // Try to serialize as JSON (this is what the API does)
    console.log("\nTesting JSON serialization...");
    const serialized = JSON.stringify(proposal);
    console.log("Serialization length:", serialized.length);
    console.log("✅ JSON serialization successful");

    // Check for otherOpexPercent (Decimal field)
    console.log("\nChecking Decimal fields...");
    console.log("otherOpexPercent type:", typeof proposal.otherOpexPercent);
    console.log("otherOpexPercent value:", proposal.otherOpexPercent);
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugProposal();
