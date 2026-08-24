import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@libsql/client";

// Load .env manually
const envPath = resolve(__dirname, "../.env");
const envFile = readFileSync(envPath, "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  if (!process.env[key]) process.env[key] = value;
}

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Check if color column already exists on OrderItem
  const tableInfo = await client.execute("PRAGMA table_info(OrderItem)");
  const hasColor = tableInfo.rows.some((r) => r.name === "color");

  if (hasColor) {
    console.log("OrderItem already has 'color' column. Skipping.");
    return;
  }

  // Add color column to OrderItem
  await client.execute("ALTER TABLE OrderItem ADD COLUMN color TEXT");
  console.log("Successfully added 'color' column to OrderItem table");

  // Verify
  const verify = await client.execute("PRAGMA table_info(OrderItem)");
  const columns = verify.rows.map((r) => r.name);
  console.log("OrderItem columns:", columns.join(", "));
}

main().catch(console.error).finally(() => process.exit());
