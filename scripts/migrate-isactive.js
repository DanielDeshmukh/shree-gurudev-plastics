const { PrismaClient } = require("@prisma/client");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
    process.exit(1);
  }

  const { createClient } = require("@libsql/client");
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");

  const libsql = createClient({ url, authToken: token });
  const adapter = new PrismaLibSQL(libsql);
  const prisma = new PrismaClient({ adapter });

  try {
    const brands = await prisma.brand.findMany();
    console.log("Brands:", brands.length);
    brands.forEach((b) => console.log(`  ${b.name} (id=${b.id}, slug=${b.slug})`));

    const mangoBrand = brands.find((b) => b.slug === "mango-chairs");

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
    console.log(`Final: ${active} active, ${inactive} inactive`);
  } catch (e) {
    console.error("Error:", e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
