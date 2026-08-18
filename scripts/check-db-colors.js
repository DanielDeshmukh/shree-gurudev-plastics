const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.productImage.groupBy({ by: ['color'], _count: true });
  groups.sort((a, b) => b._count - a._count);
  console.log('Colors in DB:');
  groups.forEach(g => console.log(`  ${g.color}: ${g._count}`));
  const total = await prisma.productImage.count();
  console.log(`Total ProductImage records: ${total}`);
  
  // Check how many have null/empty color
  const nullColor = await prisma.productImage.count({ where: { color: null } });
  const emptyColor = await prisma.productImage.count({ where: { color: '' } });
  console.log(`Null color: ${nullColor}, Empty color: ${emptyColor}`);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
