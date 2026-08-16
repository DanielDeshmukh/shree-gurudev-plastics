const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({
  select: { id: true, name: true, imageUrl: true, brand: { select: { name: true } } },
  where: { brand: { name: 'KG Plast' } }
})
  .then(function(r) { r.forEach(function(p) { console.log(p.id + ' | ' + p.name + ' | ' + (p.imageUrl || 'no img').substring(0, 80)); }); })
  .catch(function(e) { console.error(e); })
  .then(function() { p.$disconnect(); });
