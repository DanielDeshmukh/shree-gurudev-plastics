const { createClient } = require("@libsql/client");
const db = createClient({
  url: "libsql://shreegurudevplastics-danieldeshmukh.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIzOWZmNTU4ZS0wZGE0LTQ4OGUtYjJlZC1mMTUwMWZkZjY0YTkiLCJpYXQiOjE3ODY3ODQ1NjgsImtpZCI6IkJibHRGV2h5VGxkUWpmaHJuNV9xamxxWGNUZXNFVjhQbXBBVkxscDVBdFEiLCJyaWQiOiI4MGJlYTYzYy02M2VjLTQwZmMtOTQ1YS1jMDc3NmY5YmZjNTcifQ.6_jYThjx0C8qhjym4G5D44oDN1QgApAsM53-aiVA91zhOG5dlnWK_Z2b84Tnbsb1ll_vmPvArajEG0_NAbiwAA",
});

(async () => {
  // Fix corrupted Product.updatedAt: "2026-08-22 06:08:31000Z" -> proper ISO
  const r = await db.execute("SELECT id, updatedAt FROM Product WHERE updatedAt LIKE '%000Z%'");
  console.log(`Found ${r.rows.length} corrupted Product.updatedAt`);
  for (const row of r.rows) {
    const raw = String(row.updatedAt);
    // "2026-08-22 06:08:31000Z" -> extract digits after last colon-like pattern
    const m = raw.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})\d+Z$/);
    if (m) {
      const fixed = `${m[1]}T${m[2]}:${m[3]}:${m[4]}.000Z`;
      await db.execute({ sql: "UPDATE Product SET updatedAt = ? WHERE id = ?", args: [fixed, row.id] });
    } else {
      console.log(`  Could not parse id=${row.id}: "${raw}"`);
    }
  }

  // Also fix Product.createdAt if any still broken
  const r2 = await db.execute("SELECT id, createdAt, updatedAt FROM Product WHERE createdAt NOT LIKE '%T%' OR updatedAt NOT LIKE '%T%'");
  console.log(`\nRemaining non-ISO Product dates: ${r2.rows.length}`);
  for (const row of r2.rows) {
    console.log(`  id=${row.id} createdAt="${row.createdAt}" updatedAt="${row.updatedAt}"`);
  }

  // Verify Customer 9 (the problematic one)
  const c = await db.execute("SELECT id, lastOrderAt, createdAt FROM Customer WHERE id = 9");
  console.log(`\nCustomer 9: lastOrderAt="${c.rows[0]?.lastOrderAt}" createdAt="${c.rows[0]?.createdAt}"`);
})();
