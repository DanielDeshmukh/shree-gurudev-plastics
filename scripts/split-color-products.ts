/**
 * Product Color Split Migration Script
 *
 * Splits multi-color products into individual color-variant products.
 * Each color becomes its own product with a clean slug (e.g., "bella-black").
 *
 * What this script does:
 * 1. Finds all products that have multiple unique color images in ProductImage
 * 2. For each color variant, creates a new product with:
 *    - Clean slug: {parent-slug}-{color-name}
 *    - Own stock (copied from parent — admin must verify physical counts)
 *    - Own imageUrl (the image for that specific color)
 *    - Same brand, category, prices as parent
 * 3. Moves ProductImage records to the new product
 * 4. Preserves the original product as a "ghost" (isActive=false) for historical orders
 *
 * What this script does NOT do:
 * - Does NOT update existing OrderItems to point to new product IDs (old orders keep old IDs)
 * - Does NOT delete the original products (kept inactive for order history)
 * - Does NOT split stock — each variant gets the parent's stock (admin adjusts manually)
 *
 * Safety: This script is idempotent — running it twice won't create duplicates.
 */

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalize(s: string) {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // 1. Find products with multiple unique image colors
  const allProducts = await client.execute(`
    SELECT p.id, p.name, p.slug, p.color, p.stock, p."imageUrl",
           p."brandId", p.category, p.price, p."retailerPrice",
           p."dealerPrice", p."distributorPrice", p."bulkPrice",
           p."lowStockThreshold", p.description, p.height, p.width,
           p.depth, p.weight, p.moq, p.tags, p."hsnCode", p."gstRate"
    FROM Product p
    WHERE p.isActive = 1
  `);

  console.log(`Found ${allProducts.rows.length} active products`);

  // 2. For each product, get unique image colors
  let splitCount = 0;
  let skipCount = 0;
  const redirectMap: Record<string, string> = {};

  for (const product of allProducts.rows) {
    const images = await client.execute({
      sql: `SELECT id, imageUrl, color, sortOrder FROM ProductImage WHERE productId = ? ORDER BY sortOrder ASC`,
      args: [product.id],
    });

    // Extract unique non-empty colors
    const colorSet = new Set<string>();
    const colorImages: Record<string, { id: number; imageUrl: string; sortOrder: number }> = {};
    for (const img of images.rows) {
      const rawColor = String(img.color || "").trim();
      if (rawColor) {
        // Normalize color: lowercase for grouping
        const normalizedColor = rawColor.toLowerCase().replace(/-/g, " ");
        if (!colorSet.has(normalizedColor)) {
          colorSet.add(normalizedColor);
          colorImages[normalizedColor] = {
            id: Number(img.id),
            imageUrl: String(img.imageUrl),
            sortOrder: Number(img.sortOrder),
          };
        }
      }
    }

    const uniqueColors = Array.from(colorSet);

    // Skip products with 0 or 1 unique colors — they don't need splitting
    if (uniqueColors.length <= 1) {
      skipCount++;
      continue;
    }

    console.log(`\nSplitting: "${product.name}" (ID: ${product.id}) — ${uniqueColors.length} colors: ${uniqueColors.join(", ")}`);

    // Check if already split (look for slug-{color} products)
    const existingSplit = await client.execute({
      sql: `SELECT id FROM Product WHERE slug LIKE ? AND isActive = 1 LIMIT 1`,
      args: [`${product.slug}-%`],
    });

    if (existingSplit.rows.length > 0) {
      console.log(`  → Already split, skipping`);
      skipCount++;
      continue;
    }

    const parentSlug = String(product.slug);

    // 3. For each color, create a new product
    for (const colorName of uniqueColors) {
      const colorSlug = `${parentSlug}-${slugify(colorName)}`;
      const displayColor = capitalize(colorName);
      const img = colorImages[colorName];

      // Check if this exact slug already exists
      const existing = await client.execute({
        sql: `SELECT id FROM Product WHERE slug = ?`,
        args: [colorSlug],
      });

      if (existing.rows.length > 0) {
        console.log(`  → "${displayColor}" slug already exists (${colorSlug}), skipping`);
        continue;
      }

      // Insert new product
      const result = await client.execute({
        sql: `
          INSERT INTO Product (
            name, slug, color, size, brandId, imageUrl, price,
            "retailerPrice", "dealerPrice", "distributorPrice", "bulkPrice",
            stock, "lowStockThreshold", category, description,
            height, width, depth, weight, moq, tags, "hsnCode", "gstRate",
            isActive, createdAt, updatedAt
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            1, datetime('now'), datetime('now')
          )
        `,
        args: [
          product.name,              // name (same as parent)
          colorSlug,                 // slug: bella-black
          displayColor,              // color: Black
          String(product.size || ""), // size
          Number(product.brandId),    // brandId
          img ? img.imageUrl : String(product.imageUrl), // imageUrl
          Number(product.price),      // price
          Number(product.retailerPrice || 0),
          Number(product.dealerPrice || 0),
          Number(product.distributorPrice || 0),
          Number(product.bulkPrice || 0),
          Number(product.stock),      // stock (copied from parent — admin adjusts)
          Number(product.lowStockThreshold || 10),
          String(product.category || ""),
          String(product.description || ""),
          product.height ? Number(product.height) : null,
          product.width ? Number(product.width) : null,
          product.depth ? Number(product.depth) : null,
          product.weight ? Number(product.weight) : null,
          Number(product.moq || 1),
          String(product.tags || ""),
          String(product."hsnCode" || "3924"),
          Number(product."gstRate" || 18),
        ],
      });

      const newProductId = Number(result.lastInsertRowid);
      console.log(`  → Created "${displayColor}" (ID: ${newProductId}, slug: ${colorSlug})`);

      // Move this color's images to the new product
      if (img) {
        // Move the specific color image
        await client.execute({
          sql: `UPDATE ProductImage SET productId = ? WHERE id = ?`,
          args: [newProductId, img.id],
        });
        console.log(`    → Moved image ID ${img.id} to new product`);
      }

      // Also move any other images for this color that share the same raw color text
      for (const otherImg of images.rows) {
        const otherColor = String(otherImg.color || "").trim().toLowerCase().replace(/-/g, " ");
        if (otherColor === colorName && Number(otherImg.id) !== img?.id) {
          await client.execute({
            sql: `UPDATE ProductImage SET productId = ? WHERE id = ?`,
            args: [newProductId, Number(otherImg.id)],
          });
          console.log(`    → Moved additional image ID ${otherImg.id} to new product`);
        }
      }

      redirectMap[parentSlug] = colorSlug;
    }

    // 4. Mark original product as inactive (keep for historical orders)
    await client.execute({
      sql: `UPDATE Product SET isActive = 0 WHERE id = ?`,
      args: [product.id],
    });
    console.log(`  → Deactivated original product (ID: ${product.id})`);

    splitCount++;
  }

  // 5. Save redirect map
  const redirectPath = resolve(__dirname, "../public/slug-redirects.json");
  const { writeFileSync } = await import("fs");
  writeFileSync(redirectPath, JSON.stringify(redirectMap, null, 2));
  console.log(`\nSaved ${Object.keys(redirectMap).length} redirects to public/slug-redirects.json`);

  // Summary
  const finalCount = await client.execute(`SELECT COUNT(*) as c FROM Product WHERE isActive = 1`);
  console.log(`\n=== Migration Complete ===`);
  console.log(`Products split: ${splitCount}`);
  console.log(`Products skipped (single/no color): ${skipCount}`);
  console.log(`Total active products now: ${finalCount.rows[0].c}`);
}

main().catch(console.error).finally(() => process.exit());
