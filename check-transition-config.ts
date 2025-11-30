import { prisma } from "./src/lib/prisma";

async function checkTransitionConfig() {
  try {
    const config = await prisma.transitionConfig.findFirst();
    console.log("TransitionConfig:", JSON.stringify(config, null, 2));

    if (!config) {
      console.log("\n⚠️ TransitionConfig is missing!");
      console.log("To fix: Run `pnpm tsx seed-transition-config.ts`");
    } else {
      console.log("\n✅ TransitionConfig exists");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTransitionConfig();
