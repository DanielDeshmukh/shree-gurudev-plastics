import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.admin.count();

  if (existingCount > 1) {
    console.error("SECURITY: Multiple admin accounts detected. Blocking.");
    process.exit(1);
  }

  if (existingCount === 0) {
    const hash = await bcrypt.hash("SGP@admin2026", 10);
    await prisma.admin.create({
      data: { username: "shreegurudev", password: hash },
    });
    console.log("Admin seeded: shreegurudev / SGP@admin2026");
  } else {
    console.log("Admin already exists. Skipping seed.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
