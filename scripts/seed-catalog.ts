import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
  }
});

cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const CATALOG_DIR = path.join(__dirname, "..", "catalog_extractor", "output");

const BRAND_MAP: Record<string, { name: string; slug: string }> = {
  ARISTO: { name: "Aristo", slug: "aristo" },
  KG_PLAST: { name: "KG Plast", slug: "kg-plast" },
  MANGO_CHAIRS: { name: "Mango Chairs", slug: "mango-chairs" },
};

function parseProductFilename(filename: string) {
  const name = path.parse(filename).name;
  const parts = name.split("_");

  let productNumber = "";
  const lastPart = parts[parts.length - 1];
  if (/^\d{3,4}$/.test(lastPart)) {
    productNumber = lastPart;
    parts.pop();
  }

  let color = "";
  const knownColors = [
    "red", "blue", "green", "black", "white", "yellow", "orange",
    "pink", "brown", "grey", "gray", "maroon", "cream", "beige",
    "purple", "navy", "teal", "gold", "silver", "ivory", "peach",
    "olive", "rose", "violet", "magenta", "cyan", "lime", "wine",
  ];
  for (let i = 1; i < parts.length; i++) {
    if (knownColors.includes(parts[i].toLowerCase())) {
      color = parts[i];
      break;
    }
  }

  const knownSizes = [
    "small", "medium", "large", "big", "xl", "xxl", "l", "m", "s",
    "4kg", "5kg", "6kg", "3kg", "10kg", "15kg", "20kg",
  ];
  let size = "";
  for (let i = parts.length - 1; i >= 1; i--) {
    if (knownSizes.includes(parts[i].toLowerCase())) {
      size = parts[i];
      break;
    }
  }

  const nameWords = parts.filter((p, idx) => {
    if (idx === 0) return true;
    if (p.toLowerCase() === color.toLowerCase()) return false;
    if (p.toLowerCase() === size.toLowerCase()) return false;
    return true;
  });

  let productName = nameWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  if (!color) color = "Various";
  if (!size) size = "Standard";

  return { productName, color, size, productNumber };
}

function inferCategory(productName: string): string {
  const lower = productName.toLowerCase();
  if (lower.includes("chair") || lower.includes("stool") || lower.includes("bench"))
    return "Furniture";
  if (lower.includes("table")) return "Furniture";
  if (lower.includes("bucket") || lower.includes("tub") || lower.includes("mug"))
    return "Containers";
  if (lower.includes("box") || lower.includes("basket") || lower.includes("crate"))
    return "Storage";
  if (lower.includes("tray") || lower.includes("plate") || lower.includes("dish"))
    return "Kitchen";
  if (lower.includes("bag") || lower.includes("cover") || lower.includes("apron"))
    return "Accessories";
  if (lower.includes("cushion") || lower.includes("pillow"))
    return "Furniture";
  if (lower.includes("trash") || lower.includes("dustbin") || lower.includes("bin"))
    return "Containers";
  if (lower.includes("bottle") || lower.includes("flask") || lower.includes("glass"))
    return "Kitchen";
  if (lower.includes("rope") || lower.includes("cord") || lower.includes("hanger"))
    return "Accessories";
  return "General";
}

async function uploadToCloudinary(
  filePath: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `shree-gurudev/${folder}`,
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

async function main() {
  console.log("Starting seed...\n");

  const brandFolders = fs.readdirSync(CATALOG_DIR).filter((f) => {
    const fp = path.join(CATALOG_DIR, f);
    return fs.statSync(fp).isDirectory();
  });

  for (const folderName of brandFolders) {
    const brandInfo = BRAND_MAP[folderName];
    if (!brandInfo) {
      console.log(`Skipping unknown folder: ${folderName}`);
      continue;
    }

    console.log(`\n=== Processing brand: ${brandInfo.name} ===`);

    const brand = await prisma.brand.upsert({
      where: { slug: brandInfo.slug },
      update: {},
      create: { name: brandInfo.name, slug: brandInfo.slug },
    });

    const imageFiles = fs
      .readdirSync(path.join(CATALOG_DIR, folderName))
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    console.log(`Found ${imageFiles.length} images`);

    let uploaded = 0;
    let skipped = 0;

    for (const file of imageFiles) {
      const filePath = path.join(CATALOG_DIR, folderName, file);

      const existing = await prisma.product.findFirst({
        where: { name: file.replace(/\.[^.]+$/, ""), brandId: brand.id },
      });

      if (existing) {
        skipped++;
        continue;
      }

      try {
        const { url } = await uploadToCloudinary(filePath, brandInfo.slug);
        const parsed = parseProductFilename(file);
        const category = inferCategory(parsed.productName);

        await prisma.product.create({
          data: {
            name: parsed.productName,
            color: parsed.color,
            size: parsed.size,
            brandId: brand.id,
            imageUrl: url,
            price: 0,
            stock: 100,
            category,
          },
        });

        uploaded++;
        if (uploaded % 50 === 0) {
          console.log(`  Uploaded ${uploaded}/${imageFiles.length}...`);
        }
      } catch (err: any) {
        console.error(`  Failed: ${file} - ${err.message}`);
      }
    }

    console.log(`Done: ${uploaded} uploaded, ${skipped} skipped`);
  }

  const total = await prisma.product.count();
  console.log(`\nSeed complete! Total products in DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
