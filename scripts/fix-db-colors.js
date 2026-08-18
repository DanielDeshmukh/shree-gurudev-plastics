const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MANGO_DIR = path.join(__dirname, '..', 'mango-images');

function norm(c) {
  if (!c) return '';
  return c.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  console.log('=== Fix Mango ProductImage Colors from Filenames ===\n');

  // Build local file map: product_folder -> [{ file, color }]
  const localMap = {};
  const cats = fs.readdirSync(MANGO_DIR).filter(f => fs.statSync(path.join(MANGO_DIR, f)).isDirectory());
  for (const cat of cats) {
    const prods = fs.readdirSync(path.join(MANGO_DIR, cat)).filter(f => fs.statSync(path.join(MANGO_DIR, cat, f)).isDirectory());
    for (const prod of prods) {
      const dir = path.join(MANGO_DIR, cat, prod);
      const imgs = fs.readdirSync(dir)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort()
        .map(f => ({
          file: f,
          color: f.replace(/\.(png|jpg|jpeg)$/i, '').replace(/_/g, ' '),
        }));
      localMap[prod.toLowerCase()] = imgs;
    }
  }
  console.log(`Local folders: ${Object.keys(localMap).length}\n`);

  // Get mango brand
  const brand = await prisma.brand.findUnique({ where: { slug: 'mango_chairs' } });
  const products = await prisma.product.findMany({
    where: { brandId: brand.id },
    select: { id: true, name: true },
  });
  console.log(`DB products: ${products.length}\n`);

  let fixed = 0, correct = 0, noMatch = 0;

  for (const product of products) {
    // Find matching local folder
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let localImgs = null;
    for (const [folder, imgs] of Object.entries(localMap)) {
      const fSlug = folder.replace(/[^a-z0-9]/g, '');
      if (fSlug === slug || folder === product.name.toLowerCase()) {
        localImgs = imgs;
        break;
      }
    }
    if (!localImgs) {
      // Try partial
      for (const [folder, imgs] of Object.entries(localMap)) {
        if (slug.includes(folder.replace(/[^a-z0-9]/g, '')) ||
            folder.replace(/[^a-z0-9]/g, '').includes(slug)) {
          localImgs = imgs;
          break;
        }
      }
    }
    if (!localImgs || localImgs.length === 0) { noMatch++; continue; }

    const dbImgs = await prisma.productImage.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, color: true, sortOrder: true },
    });

    for (let i = 0; i < dbImgs.length; i++) {
      const db = dbImgs[i];
      const local = localImgs[i] || localImgs[localImgs.length - 1];
      const correctColor = local.color;
      const currentNorm = norm(db.color);
      const correctNorm = norm(correctColor);

      if (currentNorm === correctNorm) {
        correct++;
        continue;
      }

      await prisma.productImage.update({
        where: { id: db.id },
        data: { color: correctColor },
      });
      console.log(`  ${product.name}: "${db.color}" -> "${correctColor}"`);
      fixed++;
    }
  }

  console.log(`\nFixed: ${fixed}, Already correct: ${correct}, No folder match: ${noMatch}`);

  // Show final color distribution for mango
  const colors = await prisma.productImage.groupBy({
    by: ['color'],
    _count: true,
    where: { product: { brandId: brand.id } },
  });
  colors.sort((a, b) => b._count - a._count);
  console.log(`\nMango colors (${colors.length} unique):`);
  colors.forEach(c => console.log(`  ${c.color}: ${c._count}`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
