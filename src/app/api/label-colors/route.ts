import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DECISIONS_PATH = join(process.cwd(), "scripts", "ai-color-decisions.json");
const OUTPUT_PATH = join(process.cwd(), "scripts", "color-labeler-decisions.json");

export async function GET() {
  try {
    const images = await db.productImage.findMany({
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { id: "asc" },
    });

    let decisions = {};
    if (existsSync(DECISIONS_PATH)) {
      decisions = JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
    }

    let existingDecisions = {};
    if (existsSync(OUTPUT_PATH)) {
      existingDecisions = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    }

    const items = images.map((img) => {
      const relPath = img.imageUrl
        .replace(/^.*\/mango\//, "mango/")
        .replace(/^.*\/aristo\//, "aristo/")
        .replace(/^.*\/reego\//, "reego/")
        .replace(/^.*\/upload\//, "")
        .split("/")
        .slice(-3)
        .join("/");

      const key = Object.keys(decisions).find((k) => {
        const normalizedK = k.replace(/\\/g, "/");
        return normalizedK.includes(relPath) || relPath.includes(normalizedK.replace(".png", "").replace(".jpg", ""));
      });

      const decision = key ? decisions[key] : null;
      const savedDecision = existingDecisions[img.id];

      return {
        id: img.id,
        imageUrl: img.imageUrl,
        productName: img.product?.name || "Unknown",
        dbColor: img.color || "Unknown",
        aiColor: decision?.aiColor || null,
        aiRaw: decision?.raw || null,
        currentDecision: savedDecision?.decision || null,
      };
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageId, decision, color } = body;

    let existing = {};
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
