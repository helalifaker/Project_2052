import { prisma } from "./src/lib/prisma";

async function checkProposal() {
  // Check the proposal being used for prefill from the screenshot URL
  const proposal = await prisma.leaseProposal.findUnique({
    where: { id: "552be42f-71da-4d5e-8147-363259273f7b" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      rentParams: true,
      curriculum: true,
      rentModel: true,
    },
  });

  if (!proposal) {
    console.log("Proposal not found with that ID");
    console.log("Checking all recent proposals...");
    const recent = await prisma.leaseProposal.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        rentParams: true,
        rentModel: true,
      },
    });
    console.log("\nRecent proposals:");
    recent.forEach((p) => {
      console.log(`\n${p.name} (${p.id})`);
      console.log("Created:", p.createdAt);
      console.log("Rent Model:", p.rentModel);
      console.log("Rent Params:", JSON.stringify(p.rentParams, null, 2));
    });
    await prisma.$disconnect();
    return;
  }

  console.log("\n=== PROPOSAL DATA ===");
  console.log("Name:", proposal.name);
  console.log("Created:", proposal.createdAt);
  console.log("Rent Model:", proposal.rentModel);
  console.log("\n--- Rent Params (raw from DB) ---");
  console.log(JSON.stringify(proposal.rentParams, null, 2));
  console.log("\n--- Curriculum (raw from DB) ---");
  console.log(JSON.stringify(proposal.curriculum, null, 2));

  await prisma.$disconnect();
}

checkProposal().catch(console.error);
