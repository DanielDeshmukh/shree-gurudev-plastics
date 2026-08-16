const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.brand.findMany({ select: { id: true, name: true, _count: { select: { products: true } } } })
  .then(function(r) { console.log(JSON.stringify(r, null, 2)); })
  .catch(function(e) { console.error(e); })
  .then(function() { p.$disconnect(); });
