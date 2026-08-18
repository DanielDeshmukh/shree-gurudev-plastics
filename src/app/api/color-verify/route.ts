import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "mango-images");
const LOG_FILE = path.join(process.cwd(), "scripts", "color-verify-log.json");

function loadLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
  }
  return { assignments: {}, history: [] };
}

function saveLog(log: any) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function getAllImages(category?: string, product?: string): string[] {
  const images: string[] = [];
  let categories = fs.readdirSync(IMAGES_DIR).filter((d) => {
    const full = path.join(IMAGES_DIR, d);
    return fs.statSync(full).isDirectory();
  });

  if (category) {
    categories = categories.filter((c) => c === category);
  }

  for (const cat of categories) {
    const catPath = path.join(IMAGES_DIR, cat);
    let products = fs.readdirSync(catPath).filter((d) => {
      return fs.statSync(path.join(catPath, d)).isDirectory();
    });

    if (product) {
      products = products.filter((p) => p === product);
    }

    for (const prod of products) {
      const prodPath = path.join(catPath, prod);
      const files = fs.readdirSync(prodPath).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
      for (const file of files) {
        images.push(path.join(cat, prod, file));
      }
    }
  }
  return images.sort();
}

function getCategories() {
  return fs.readdirSync(IMAGES_DIR).filter((d) => {
    return fs.statSync(path.join(IMAGES_DIR, d)).isDirectory();
  });
}

function getProducts(category: string) {
  const catPath = path.join(IMAGES_DIR, category);
  if (!fs.existsSync(catPath)) return [];
  return fs.readdirSync(catPath).filter((d) => {
    return fs.statSync(path.join(catPath, d)).isDirectory();
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get("index") || "0");
    const all = searchParams.get("all") === "true";
    const category = searchParams.get("category") || undefined;
    const product = searchParams.get("product") || undefined;
    const listOnly = searchParams.get("list") === "true";
    const results = searchParams.get("results") === "true";

    const log = loadLog();

    if (results) {
      return NextResponse.json({ results: log.assignments, history: log.history });
    }

    if (listOnly) {
      const categories = getCategories();
      const productsMap: Record<string, string[]> = {};
      for (const cat of categories) {
        productsMap[cat] = getProducts(cat);
      }
      return NextResponse.json({ categories, products: productsMap });
    }

    const images = getAllImages(category, product);

    if (all) {
      return NextResponse.json({ images, total: images.length, assignments: log.assignments });
    }

    if (index < 0 || index >= images.length) {
      return NextResponse.json({ error: "Index out of range" }, { status: 400 });
    }

    const relativePath = images[index];
    const absolutePath = path.join(IMAGES_DIR, relativePath);
    const buffer = fs.readFileSync(absolutePath);
    const ext = path.extname(relativePath).toLowerCase();
    const mimeMap: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
    const mime = mimeMap[ext] || "image/png";

    const assigned = log.assignments[relativePath] || [];

    return NextResponse.json({
      image: relativePath,
      base64: `data:${mime};base64,${buffer.toString("base64")}`,
      index,
      total: images.length,
      assigned,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, colors } = body;

    if (!imagePath || !colors || !Array.isArray(colors)) {
      return NextResponse.json({ error: "Missing imagePath or colors" }, { status: 400 });
    }

    const log = loadLog();
    log.assignments[imagePath] = colors;
    saveLog(log);

    return NextResponse.json({ ok: true, assigned: colors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, colors } = body;

    if (!imagePath || !colors || !Array.isArray(colors)) {
      return NextResponse.json({ error: "Missing imagePath or colors" }, { status: 400 });
    }

    const log = loadLog();
    const oldAbsPath = path.join(IMAGES_DIR, imagePath);

    if (!fs.existsSync(oldAbsPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const dir = path.dirname(oldAbsPath);
    const ext = path.extname(imagePath);
    const colorName = colors.join("-");
    let newName = `${colorName}${ext}`;
    let newAbsPath = path.join(dir, newName);

    let counter = 2;
    while (fs.existsSync(newAbsPath) && newAbsPath !== oldAbsPath) {
      newName = `${colorName}_${counter}${ext}`;
      newAbsPath = path.join(dir, newName);
      counter++;
    }

    fs.renameSync(oldAbsPath, newAbsPath);

    const newRelative = path.relative(IMAGES_DIR, newAbsPath).replace(/\\/g, "/");
    const oldRelative = imagePath;

    log.assignments[newRelative] = colors;
    delete log.assignments[oldRelative];
    log.history.push({ oldPath: oldRelative, newPath: newRelative });
    saveLog(log);

    return NextResponse.json({ ok: true, oldPath: oldRelative, newPath: newRelative });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const log = loadLog();
    if (log.history.length === 0) {
      return NextResponse.json({ error: "Nothing to undo" }, { status: 400 });
    }

    const last = log.history.pop();
    const currentPath = path.join(IMAGES_DIR, last.newPath);
    const originalPath = path.join(IMAGES_DIR, last.oldPath);

    if (fs.existsSync(currentPath)) {
      fs.renameSync(currentPath, originalPath);
    }

    const restored = last.oldPath;
    log.assignments[restored] = log.assignments[last.newPath] || [];
    delete log.assignments[last.newPath];
    saveLog(log);

    return NextResponse.json({ ok: true, restored, undone: last.newPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
