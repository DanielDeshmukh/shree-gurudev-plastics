const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
  }

  const adapter = new PrismaLibSql({ url, authToken: token });
  const prisma = new PrismaClient({ adapter });

  const columns = [
    { name: "paymentMethod", type: "TEXT", default: "'cod'" },
    { name: "paymentStatus", type: "TEXT", default: "'unpaid'" },
    { name: "paymentNote", type: "TEXT", default: "NULL" },
  ];

  for (const col of columns) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Order" ADD COLUMN "${col.name}" ${col.type} DEFAULT ${col.default}`
      );
      console.log(`Added ${col.name} column`);
    } catch (e) {
      if (e.message?.includes("duplicate column")) {
        console.log(`${col.name} column already exists`);
      } else {
        console.error(`Error adding ${col.name}:`, e.message);
      }
    }
  }

  const count = await prisma.$queryRawUnsafe`SELECT COUNT(*) as cnt FROM "Order" WHERE "paymentStatus" IS NOT NULL`;
  console.log("Orders with payment data:", count);

  await prisma.$disconnect();
  console.log("Migration complete!");
}

main();
