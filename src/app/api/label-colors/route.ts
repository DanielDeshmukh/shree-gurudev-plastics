import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DECISIONS_PATH = join(process.cwd(), "scripts", "ai-color-decisions.json");
const OUTPUT_PATH = join(process.cwd(), "scripts", "color-labeler-decisions.json");

export async function GET() {
  try {
    const images = await db.productImage.findMany({
      orderBy: { id: "asc" },
    });

    let decisions: Record<string, { aiColor: string; raw: string }> = {};
    if (existsSync(DECISIONS_PATH)) {
      decisions = JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
    }

    let existingDecisions: Record<number, { decision: string; color: string }> = {};
    if (existsSync(OUTPUT_PATH)) {
      existingDecisions = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    }

    const productIds = [...new Set(images.map((img) => img.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const items = images.map((img) => {
      const relPath = img.imageUrl
        .replace(/^.*\/upload\//, "")
        .split("/")
        .slice(-3)
        .join("/");

      let decision = null;
      for (const key of Object.keys(decisions)) {
        const normalizedK = key.replace(/\\/g, "/");
        if (normalizedK.includes(relPath.replace(".png", "").replace(".jpg", "").split("/").pop() || "")) {
          decision = decisions[key];
          break;
        }
      }

      const savedDecision = existingDecisions[img.id];

      return {
        id: img.id,
        imageUrl: img.imageUrl,
        productName: productMap.get(img.productId) || "Unknown",
        dbColor: img.color || "Unknown",
        aiColor: decision?.aiColor || null,
        currentDecision: savedDecision?.decision || null,
      };
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Label colors API error:", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, decision, color } = body;

    let existing: Record<number, { decision: string; color: string; timestamp: string }> = {};
    if (existsSync(OUTPUT_PATH)) {
      existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    }

    existing[imageId] = {
      decision,
      color: color || null,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2));

    return NextResponse.json({ success: true, total: Object.keys(existing).length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save decision" }, { status: 500 });
  }
}
