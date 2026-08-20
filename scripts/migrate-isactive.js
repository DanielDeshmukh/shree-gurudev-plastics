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

  try {
    // Add isActive column if it doesn't exist
    try {
      await prisma.$executeRaw`ALTER TABLE Product ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1`;
      console.log("Added isActive column to Product table");
    } catch (e) {
      if (e.message?.includes("duplicate column")) {
        console.log("isActive column already exists");
      } else {
        console.log("Column check:", e.message);
      }
    }

    const brands = await prisma.brand.findMany();
    console.log("Brands:", brands.length);
    brands.forEach((b) => console.log(`  ${b.name} (id=${b.id}, slug=${b.slug})`));

    const totalBefore = await prisma.product.count();
    console.log("Total products:", totalBefore);

    const mangoBrand = brands.find((b) => b.slug === "mango_chairs" || b.slug === "mango-chairs");

    if (mangoBrand) {
      const result = await prisma.product.updateMany({
        where: { brandId: { not: mangoBrand.id } },
        data: { isActive: false },
      });
      console.log(`Deactivated ${result.count} non-Mango products`);
    } else {
      console.log("No mango-chairs brand found. Deactivating by name...");
      const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
      const nonMangoIds = allProducts
        .filter((p) => !p.name.toLowerCase().includes("mango"))
        .map((p) => p.id);
      console.log(`Found ${nonMangoIds.length} non-Mango products out of ${allProducts.length}`);
      if (nonMangoIds.length > 0) {
        const result = await prisma.product.updateMany({
          where: { id: { in: nonMangoIds } },
          data: { isActive: false },
        });
        console.log(`Deactivated ${result.count} products`);
      }
    }

    const active = await prisma.product.count({ where: { isActive: true } });
    const inactive = await prisma.product.count({ where: { isActive: false } });
    console.log(`\nFinal: ${active} active, ${inactive} inactive`);
  } catch (e) {
    console.error("Error:", e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
