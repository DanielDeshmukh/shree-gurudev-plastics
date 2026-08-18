const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Sample some mango image URLs
  const imgs = await prisma.productImage.findMany({
    where: { product: { brand: { slug: 'mango_chairs' } } },
    take: 10,
    select: { imageUrl: true, color: true, product: { select: { name: true } } },
  });
  console.log('Sample Mango image URLs:');
  imgs.forEach(i => console.log(`  ${i.product.name} | ${i.color} | ${i.imageUrl.substring(0, 100)}`));
  
  // Check for any URLs still using local paths
  const localCount = await prisma.productImage.count({
    where: { imageUrl: { startsWith: '/mango-images' } }
  });
  console.log(`\nImages with local paths: ${localCount}`);
  
  // Check for Cloudinary URLs
  const cloudCount = await prisma.productImage.count({
    where: { imageUrl: { contains: 'cloudinary' } }
  });
  console.log(`Images with Cloudinary URLs: ${cloudCount}`);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
