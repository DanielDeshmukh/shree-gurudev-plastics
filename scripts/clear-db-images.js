const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, imageUrl: true } });
  const withImages = products.filter(p => p.imageUrl);
  console.log(`Products with image URLs: ${withImages.length}`);
  withImages.forEach(p => console.log(`  ${p.id}: ${p.name} -> ${p.imageUrl.substring(0, 60)}...`));

  const result = await prisma.product.updateMany({ data: { imageUrl: '' } });
  console.log(`\nCleared ${result.count} image URLs`);

  const verify = await prisma.product.findMany({ where: { imageUrl: { not: '' } } });
  console.log(`Remaining with URLs: ${verify.length}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
