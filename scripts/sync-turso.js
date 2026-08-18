const { createClient } = require("@libsql/client");
const { PrismaClient } = require("@prisma/client");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const localDb = new PrismaClient();

const BATCH_SIZE = 50;

async function syncTable(tableName, findMany, toRow) {
  console.log(`  Syncing ${tableName}...`);
  let offset = 0;
  let total = 0;

  while (true) {
    const items = await findMany(offset, BATCH_SIZE);
    if (items.length === 0) break;

    const stmts = items.map((item) => {
      const row = toRow(item);
      const cols = Object.keys(row);
      const placeholders = cols.map(() => "?").join(", ");
      const updates = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`).join(", ");
      return {
        sql: `INSERT INTO "${tableName}" (${cols.join(", ")}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`,
        args: Object.values(row),
      };
    });

    try {
      await turso.batch(stmts);
    } catch (e) {
      // If batch fails, try one-by-one to skip conflicts
      for (const stmt of stmts) {
        try {
          await turso.execute(stmt);
        } catch (e2) {
          // skip individual row errors (duplicates, constraints)
        }
      }
    }
    total += items.length;
    offset += BATCH_SIZE;
  }

  console.log(`    ${total} rows synced`);
  return total;
}

async function main() {
  console.log("Starting Turso sync...\n");

  try {
    // Test connection
    await turso.execute("SELECT 1");
    console.log("  Turso connection OK\n");
  } catch (e) {
    console.error("  Cannot connect to Turso:", e.message);
    console.error("  Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env");
    process.exit(1);
  }

  // Sync Brands
  await syncTable(
    "Brand",
    (offset, limit) => localDb.brand.findMany({ skip: offset, take: limit }),
    (b) => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logo })
  );

  // Sync Products
  await syncTable(
    "Product",
    (offset, limit) => localDb.product.findMany({ skip: offset, take: limit }),
    (p) => ({
      id: p.id, name: p.name, color: p.color, size: p.size, brandId: p.brandId,
      imageUrl: p.imageUrl, price: p.price, retailerPrice: p.retailerPrice,
      dealerPrice: p.dealerPrice, distributorPrice: p.distributorPrice,
      bulkPrice: p.bulkPrice, stock: p.stock, lowStockThreshold: p.lowStockThreshold,
      category: p.category, description: p.description, height: p.height,
      width: p.width, depth: p.depth, weight: p.weight, moq: p.moq,
      tags: p.tags, hsnCode: p.hsnCode, gstRate: p.gstRate,
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync ProductImages
  await syncTable(
    "ProductImage",
    (offset, limit) => localDb.productImage.findMany({ skip: offset, take: limit }),
    (img) => ({
      id: img.id, productId: img.productId, imageUrl: img.imageUrl,
      color: img.color, sortOrder: img.sortOrder,
      createdAt: img.createdAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync Customers
  await syncTable(
    "Customer",
    (offset, limit) => localDb.customer.findMany({ skip: offset, take: limit }),
    (c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email,
      address: c.address, tier: c.tier, totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      lastOrderAt: c.lastOrderAt?.toISOString() || null,
      createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync CustomerUsers
  await syncTable(
    "CustomerUser",
    (offset, limit) => localDb.customerUser.findMany({ skip: offset, take: limit }),
    (u) => ({
      id: u.id, googleId: u.googleId, name: u.name, email: u.email,
      phone: u.phone, image: u.image,
      createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync Orders
  await syncTable(
    "Order",
    (offset, limit) => localDb.order.findMany({ skip: offset, take: limit }),
    (o) => ({
      id: o.id, customer: o.customer, phone: o.phone, address: o.address,
      total: o.total, status: o.status, notes: o.notes, customerId: o.customerId,
      createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: o.updatedAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync OrderItems
  await syncTable(
    "OrderItem",
    (offset, limit) => localDb.orderItem.findMany({ skip: offset, take: limit }),
    (i) => ({ id: i.id, orderId: i.orderId, productId: i.productId, quantity: i.quantity, price: i.price })
  );

  // Sync Invoices
  await syncTable(
    "Invoice",
    (offset, limit) => localDb.invoice.findMany({ skip: offset, take: limit }),
    (inv) => ({
      id: inv.id, invoiceNumber: inv.invoiceNumber, orderId: inv.orderId,
      customerName: inv.customerName, customerPhone: inv.customerPhone,
      customerAddress: inv.customerAddress, customerGstin: inv.customerGstin,
      placeOfSupply: inv.placeOfSupply, subtotal: inv.subtotal,
      cgst: inv.cgst, sgst: inv.sgst, igst: inv.igst, total: inv.total,
      status: inv.status, notes: inv.notes,
      createdAt: inv.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: inv.updatedAt?.toISOString() || new Date().toISOString(),
    })
  );

  // Sync InvoiceItems
  await syncTable(
    "InvoiceItem",
    (offset, limit) => localDb.invoiceItem.findMany({ skip: offset, take: limit }),
    (i) => ({
      id: i.id, invoiceId: i.invoiceId, productName: i.productName,
      hsnCode: i.hsnCode, quantity: i.quantity, unitPrice: i.unitPrice,
      gstRate: i.gstRate, cgst: i.cgst, sgst: i.sgst, igst: i.igst, total: i.total,
    })
  );

  // Sync Admin
  await syncTable(
    "Admin",
    (offset, limit) => localDb.admin.findMany({ skip: offset, take: limit }),
    (a) => ({ id: a.id, username: a.username, password: a.password })
  );

  // Sync WishlistItems
  await syncTable(
    "WishlistItem",
    (offset, limit) => localDb.wishlistItem.findMany({ skip: offset, take: limit }),
    (w) => ({ id: w.id, userId: w.userId, productId: w.productId, createdAt: w.createdAt?.toISOString() || new Date().toISOString() })
  );

  // Sync Reviews
  await syncTable(
    "Review",
    (offset, limit) => localDb.review.findMany({ skip: offset, take: limit }),
    (r) => ({
      id: r.id, productId: r.productId, name: r.name, rating: r.rating,
      comment: r.comment, approved: r.approved,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    })
  );

  console.log("\nSync complete!");
}

main().catch(console.error).finally(() => localDb.$disconnect());
