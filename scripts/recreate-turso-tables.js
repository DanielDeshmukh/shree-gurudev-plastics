const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const envFile = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf-8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Recreating Turso tables with correct schemas...\n");

  // Drop and recreate tables that had wrong schemas
  const drops = [
    "DROP TABLE IF EXISTS Review",
    "DROP TABLE IF EXISTS WishlistItem",
    "DROP TABLE IF EXISTS Session",
    "DROP TABLE IF EXISTS InvoiceItem",
    "DROP TABLE IF EXISTS Invoice",
    "DROP TABLE IF EXISTS OrderItem",
    'DROP TABLE IF EXISTS "Order"',
    "DROP TABLE IF EXISTS CustomerUser",
    "DROP TABLE IF EXISTS Admin",
    "DROP TABLE IF EXISTS ProductImage",
    "DROP TABLE IF EXISTS Product",
    "DROP TABLE IF EXISTS Brand",
    "DROP TABLE IF EXISTS Customer",
  ];

  for (const sql of drops) {
    try { await turso.execute(sql); } catch (e) {}
  }
  console.log("Dropped old tables");

  // Recreate with correct schemas matching Prisma
  const creates = [
    `CREATE TABLE Brand (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      logo TEXT
    )`,
    `CREATE TABLE Product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT,
      size TEXT,
      brandId INTEGER,
      imageUrl TEXT,
      price REAL DEFAULT 0,
      retailerPrice REAL,
      dealerPrice REAL,
      distributorPrice REAL,
      bulkPrice REAL,
      stock INTEGER DEFAULT 0,
      lowStockThreshold INTEGER DEFAULT 10,
      category TEXT,
      description TEXT,
      height REAL,
      width REAL,
      depth REAL,
      weight REAL,
      moq TEXT,
      tags TEXT,
      hsnCode TEXT,
      gstRate REAL DEFAULT 18,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (brandId) REFERENCES Brand(id)
    )`,
    `CREATE TABLE ProductImage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      imageUrl TEXT NOT NULL,
      color TEXT,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE Customer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      tier TEXT DEFAULT 'retailer',
      totalOrders INTEGER DEFAULT 0,
      totalSpent REAL DEFAULT 0,
      lastOrderAt TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE CustomerUser (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      googleId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      image TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE Session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      sessionToken TEXT UNIQUE NOT NULL,
      expires TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES CustomerUser(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE "Order" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT,
      phone TEXT,
      address TEXT,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      customerId INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES Customer(id)
    )`,
    `CREATE TABLE OrderItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE Invoice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceNumber TEXT UNIQUE,
      orderId INTEGER,
      customerName TEXT,
      customerPhone TEXT,
      customerAddress TEXT,
      customerGstin TEXT,
      placeOfSupply TEXT,
      subtotal REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      igst REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE InvoiceItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER NOT NULL,
      productName TEXT,
      hsnCode TEXT,
      quantity INTEGER DEFAULT 1,
      unitPrice REAL DEFAULT 0,
      gstRate REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      igst REAL DEFAULT 0,
      total REAL DEFAULT 0,
      FOREIGN KEY (invoiceId) REFERENCES Invoice(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE Admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
    `CREATE TABLE WishlistItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES CustomerUser(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE Review (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      approved INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )`,
  ];

  for (const sql of creates) {
    try {
      await turso.execute(sql);
      const match = sql.match(/CREATE TABLE (\w+|"[\w]+")/);
      console.log(`  Created: ${match[1]}`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log("\nDone! Now run sync-turso.js to populate data.");
}

main().catch(console.error);
