const { createClient } = require("@libsql/client");
const db = createClient({
  url: "libsql://shreegurudevplastics-danieldeshmukh.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIzOWZmNTU4ZS0wZGE0LTQ4OGUtYjJlZC1mMTUwMWZkZjY0YTkiLCJpYXQiOjE3ODY3ODQ1NjgsImtpZCI6IkJibHRGV2h5VGxkUWpmaHJuNV9xamxxWGNUZXNFVjhQbXBBVkxscDVBdFEiLCJyaWQiOiI4MGJlYTYzYy02M2VjLTQwZmMtOTQ1YS1jMDc3NmY5YmZjNTcifQ.6_jYThjx0C8qhjym4G5D44oDN1QgApAsM53-aiVA91zhOG5dlnWK_Z2b84Tnbsb1ll_vmPvArajEG0_NAbiwAA",
});

function toISO(val) {
  if (!val || typeof val !== "string") return val;
  // Already valid ISO with T and Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) return val;
  // Space-separated "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS.000Z"
  const m = val.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (m) return `${m[1]}T${m[2]}.000Z`;
  // ISO without Z: "YYYY-MM-DDTHH:MM:SS" -> add .000Z
  const m2 = val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})$/);
  if (m2) return `${m2[1]}.000Z`;
  // ISO with offset but no Z: "YYYY-MM-DDTHH:MM:SS+00:00" -> "YYYY-MM-DDTHH:MM:SS.000Z"
  const m3 = val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})[+-]\d{2}:\d{2}$/);
  if (m3) return `${m3[1]}.000Z`;
  // ISO with T, Z, no millis: "YYYY-MM-DDTHH:MM:SSZ" -> add .000
  const m4 = val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})Z$/);
  if (m4) return `${m4[1]}.000Z`;
  return val;
}

(async () => {
  const tables = [
    ["Product", ["createdAt", "updatedAt"]],
    ["Customer", ["createdAt", "lastOrderAt"]],
    ["Order", ["createdAt", "updatedAt"]],
    ["OrderStatusHistory", ["timestamp"]],
    ["Invoice", ["createdAt", "updatedAt"]],
    ["Review", ["createdAt"]],
    ["PriceLock", ["createdAt", "expiresAt"]],
    ["PriceHistory", ["createdAt"]],
    ["DeliverySchedule", ["createdAt", "deliveredAt"]],
  ];

  let totalFixed = 0;
  for (const [table, cols] of tables) {
    for (const col of cols) {
      try {
        const r = await db.execute(`SELECT id, [${col}] FROM [${table}] WHERE [${col}] IS NOT NULL`);
        let fixed = 0;
        for (const row of r.rows) {
          const original = String(row[col]);
          const fixed_val = toISO(original);
          if (fixed_val !== original) {
            await db.execute({ sql: `UPDATE [${table}] SET [${col}] = ? WHERE id = ?`, args: [fixed_val, row.id] });
            fixed++;
          }
        }
        if (fixed > 0) {
          console.log(`${table}.${col}: fixed ${fixed} rows ("${r.rows[0]?.[col]}" -> "${toISO(String(r.rows[0]?.[col]))}")`);
          totalFixed += fixed;
        }
      } catch (e) {
        // skip missing tables/columns
      }
    }
  }
  console.log(`\nTotal fixed: ${totalFixed}`);
})();
