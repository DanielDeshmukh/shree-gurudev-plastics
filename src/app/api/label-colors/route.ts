import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const DECISIONS_PATH = join(process.cwd(), "scripts", "color-labeler-decisions.json");
const MANGO_DIR = join(process.cwd(), "mango-images");

interface Decision {
  newColor: string;
  timestamp: string;
}

function findLocalFile(productSlug: string, color: string): string | null {
  const normalizedColor = color.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
  if (!productSlug || !normalizedColor) return null;

  function searchDir(dir: string): string | null {
    if (!existsSync(dir)) return null;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        const found = searchDir(full);
        if (found) return found;
      } else if (stat.isFile()) {
        const fileBase = entry.replace(/\.[^.]+$/, "").toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_-]/g, "");
        if (fileBase === normalizedColor) {
          return full;
        }
      }
    }
    return null;
  }

  return searchDir(MANGO_DIR);
}

function findAllProductDirs(): string[] {
  const results: string[] = [];
  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (readdirSync(full).some((f) => statSync(join(full, f)).isFile() && /\.(png|jpg|jpeg)$/i.test(f))) {
          results.push(full);
        } else {
          walk(full);
        }
      }
    }
  }
  walk(MANGO_DIR);
  return results;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productFilter = searchParams.get("product");
    const statusFilter = searchParams.get("status");

    const images = await db.productImage.findMany({
      orderBy: { id: "asc" },
    });

    let decisions: Record<string, Decision> = {};
    if (existsSync(DECISIONS_PATH)) {
      decisions = JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
    }

    const productIds = [...new Set(images.map((img) => img.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const productDirMap = new Map<number, string>();
    const allDirs = findAllProductDirs();
    for (const p of products) {
      const dir = allDirs.find((d) => {
        const dirName = normalize(d.split(/[\\/]/).pop() || "");
        const pName = normalize(p.name);
        return dirName === pName || dirName.includes(pName) || pName.includes(dirName);
      });
      if (dir) productDirMap.set(p.id, dir);
    }

    const dirFilesCache = new Map<string, string[]>();
    for (const dir of allDirs) {
      if (existsSync(dir)) {
        dirFilesCache.set(dir, readdirSync(dir));
      }
    }

    let items = images.map((img) => {
      const saved = decisions[String(img.id)];
      const product = productMap.get(img.productId);
      let localFile: string | null = null;

      const productDir = productDirMap.get(img.productId);
      if (productDir) {
        const normalizedColor = (img.color || "").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
        const files = dirFilesCache.get(productDir) || [];
        for (const entry of files) {
          const fileBase = entry.replace(/\.[^.]+$/, "").toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_-]/g, "");
          if (fileBase === normalizedColor) {
            localFile = `/api/serve-image?file=${encodeURIComponent(join(productDir, entry))}`;
            break;
          }
        }
      }

      return {
        id: img.id,
        imageUrl: img.imageUrl,
        localUrl: localFile,
        productName: product?.name || "Unknown",
        dbColor: img.color || "Unknown",
        newColor: saved?.newColor || null,
        decided: !!saved,
      };
    });

    if (productFilter) items = items.filter((i) => i.productName === productFilter);
    if (statusFilter === "decided") items = items.filter((i) => i.decided);
    else if (statusFilter === "pending") items = items.filter((i) => !i.decided);

    const allProductNames = [...new Set(images.map((img) => productMap.get(img.productId)?.name).filter(Boolean))].sort() as string[];

    return NextResponse.json({
      items,
      products: allProductNames,
      stats: {
        total: images.length,
        decided: items.filter((i) => i.decided).length,
        pending: items.filter((i) => !i.decided).length,
      },
      total: items.length,
    });
  } catch (error) {
    console.error("Label colors API error:", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, newColor } = body;

    if (!imageId || !newColor) {
      return NextResponse.json({ error: "Missing imageId or newColor" }, { status: 400 });
    }

    let existing: Record<string, Decision> = {};
    if (existsSync(DECISIONS_PATH)) {
      existing = JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
    }

    existing[String(imageId)] = {
      newColor,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(DECISIONS_PATH, JSON.stringify(existing, null, 2));
    return NextResponse.json({ success: true, total: Object.keys(existing).length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save decision" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");
    if (!imageId) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }

    let existing: Record<string, Decision> = {};
    if (existsSync(DECISIONS_PATH)) {
      existing = JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
    }

    delete existing[String(imageId)];
    writeFileSync(DECISIONS_PATH, JSON.stringify(existing, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete decision" }, { status: 500 });
  }
}
