import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const PEPPER = "shreegurudevplastics";

function pepperPassword(password: string): string {
  return crypto.createHash("sha256").update(PEPPER + password).digest("hex");
}

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("SECURITY: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existingCount = await prisma.admin.count();

  if (existingCount > 1) {
    console.error("SECURITY: Multiple admin accounts detected. Aborting.");
    process.exit(1);
  }

  if (existingCount === 0) {
    const peppered = pepperPassword(password);
    const hash = await bcrypt.hash(peppered, 12);
    await prisma.admin.create({
      data: { username, password: hash },
    });
    console.log(`Admin seeded: ${username}`);
  } else {
    console.log("Admin already exists. Skipping seed.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
