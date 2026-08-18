const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Normalize Color Names (hyphens -> spaces) ===\n');

  // Find all images with hyphenated color names
  const images = await prisma.productImage.findMany({
    where: { color: { contains: '-' } },
    select: { id: true, color: true },
  });

  console.log(`Found ${images.length} images with hyphens in color name`);

  let fixed = 0;
  for (const img of images) {
    const normalized = img.color.replace(/-/g, ' ');
    if (normalized !== img.color) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { color: normalized },
      });
      console.log(`  "${img.color}" -> "${normalized}"`);
      fixed++;
    }
  }

  console.log(`\nNormalized: ${fixed}`);

  // Show final unique color count
  const colors = await prisma.productImage.groupBy({ by: ['color'], _count: true });
  colors.sort((a, b) => b._count - a._count);
  console.log(`\nTotal unique colors: ${colors.length}`);
  console.log(`\nTop 30 colors:`);
  colors.slice(0, 30).forEach(c => console.log(`  ${c.color}: ${c._count}`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
