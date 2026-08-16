const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({select:{id:true,name:true,imageUrl:true,brand:{select:{name:true}}}})
  .then(function(r){console.log(JSON.stringify(r,null,2))})
  .catch(function(e){console.error(e)})
  .then(function(){p.$disconnect()});
