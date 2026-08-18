const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const cats = await db.product.groupBy({
    by: ["category"],
    _count: true,
    _avg: { price: true },
    orderBy: { _count: { category: "desc" } },
  });
  console.log("=== CATEGORIES ===");
  cats.forEach((c) => console.log(`  ${c.category}: ${c._count} products, avg Rs.${Math.round(c._avg.price)}`));

  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
  });
  console.log("\n=== BRANDS ===");
  brands.forEach((b) => console.log(`  ${b.name}: ${b._count.products} products`));

  const all = await db.product.findMany({
    select: { name: true, price: true, category: true, stock: true, brand: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  console.log(`\n=== ALL ${all.length} PRODUCTS ===`);
  all.forEach((p) => console.log(`  ${p.name} | ${p.category} | Rs.${p.price} | stock:${p.stock} | ${p.brand?.name || ""}`));
}

main().catch(console.error).finally(() => db.$disconnect());
