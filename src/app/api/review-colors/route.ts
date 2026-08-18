import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DECISIONS_FILE = path.join(process.cwd(), "scripts", "ai-color-decisions.json");
const IMAGES_DIR = path.join(process.cwd(), "mango-images");

function loadDecisions() {
  if (fs.existsSync(DECISIONS_FILE)) {
    return JSON.parse(fs.readFileSync(DECISIONS_FILE, "utf8"));
  }
  return {};
}

function saveDecisions(data: any) {
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const product = searchParams.get("product");
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const filter = searchParams.get("filter"); // "pending", "approved", "rejected", "all"

    const decisions = loadDecisions();
    let entries = Object.entries(decisions) as [string, any][];

    if (category) {
      entries = entries.filter(([rel]) => rel.startsWith(`${category}/`));
    }
    if (product) {
      entries = entries.filter(([rel]) => rel.includes(`/${product}/`));
    }
    if (filter === "approved") {
      entries = entries.filter(([, d]) => d.approved === true);
    } else if (filter === "rejected") {
      entries = entries.filter(([, d]) => d.approved === false);
    } else if (filter === "pending") {
      entries = entries.filter(([, d]) => d.approved === null);
    }

    const total = entries.length;
    const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);

    const results = await Promise.all(
      pageEntries.map(async ([rel, decision]) => {
        const abs = path.join(IMAGES_DIR, rel);
        let base64 = "";
        if (fs.existsSync(abs)) {
          const ext = path.extname(abs).toLowerCase();
          const mimeMap: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
          const mime = mimeMap[ext] || "image/png";
          const buf = fs.readFileSync(abs);
          base64 = `data:${mime};base64,${buf.toString("base64")}`;
        }
        return { rel, ...decision, base64 };
      })
    );

    return NextResponse.json({ entries: results, total, page, pageSize });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rel, approved } = body;

    const decisions = loadDecisions();
    if (!decisions[rel]) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    decisions[rel].approved = approved;
    saveDecisions(decisions);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
