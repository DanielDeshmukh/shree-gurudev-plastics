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
  console.log("Creating/updating missing tables in Turso...\n");

  const tables = [
    // Order table (needs quotes because Order is reserved)
    `CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY,
      customer TEXT,
      phone TEXT,
      address TEXT,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      customerId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Invoice (
      id TEXT PRIMARY KEY,
      invoiceNumber TEXT UNIQUE,
      orderId TEXT,
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
    `CREATE TABLE IF NOT EXISTS InvoiceItem (
      id TEXT PRIMARY KEY,
      invoiceId TEXT NOT NULL,
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
    `CREATE TABLE IF NOT EXISTS Admin (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
  ];

  for (const sql of tables) {
    try {
      await turso.execute(sql);
      const match = sql.match(/CREATE TABLE IF NOT EXISTS "?(\w+)"?/);
      console.log(`  Created/verified table: ${match[1]}`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
