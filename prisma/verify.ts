import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function verify() {
  try {
    const users = await prisma.user.findMany();
    const configs = await prisma.systemConfig.findMany();

    console.log("\n📊 Database Status:");
    console.log(`Users: ${users.length}`);
    console.log(`SystemConfigs: ${configs.length}`);

    if (users.length === 0 && configs.length === 0) {
      console.log("\n❌ Database is empty - seed needed");
      process.exit(1);
    } else {
      console.log("\n✅ Database has data!");
      if (users.length > 0) {
        console.log(`\nUsers:`);
        users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
      }
      if (configs.length > 0) {
        console.log(`\nSystemConfig:`);
        configs.forEach((c) => console.log(`  - Zakat Rate: ${c.zakatRate}`));
      }
    }
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
