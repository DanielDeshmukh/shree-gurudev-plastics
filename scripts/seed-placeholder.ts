import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const KNOWN_COLORS = ["red","blue","green","black","white","yellow","orange","pink","brown","grey","gray","maroon","cream","beige","purple","navy","teal","gold","silver","ivory","peach","olive","rose","violet","magenta"];
const KNOWN_SIZES = ["small","medium","large","big","xl","xxl","4kg","5kg","6kg","3kg","10kg","15kg","20kg"];

function parseFilename(filename: string) {
  const name = path.parse(filename).name;
  const parts = name.split("_");
  const last = parts[parts.length - 1];
  if (/^\d{3,4}$/.test(last)) parts.pop();

  let color = "";
  for (let i = 1; i < parts.length; i++) {
    if (KNOWN_COLORS.includes(parts[i].toLowerCase())) { color = parts[i]; break; }
  }

  let size = "";
  for (let i = parts.length - 1; i >= 1; i--) {
    if (KNOWN_SIZES.includes(parts[i].toLowerCase())) { size = parts[i]; break; }
  }

  const nameWords = parts.filter((p, idx) => {
    if (idx === 0) return true;
    if (p.toLowerCase() === color.toLowerCase()) return false;
    if (p.toLowerCase() === size.toLowerCase()) return false;
    return true;
  });

  const productName = nameWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return { productName, color: color || "Various", size: size || "Standard" };
}

function inferCategory(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("chair") || l.includes("stool") || l.includes("bench") || l.includes("armchair")) return "Furniture";
  if (l.includes("table")) return "Furniture";
  if (l.includes("bucket") || l.includes("mug") || l.includes("tub")) return "Containers";
  if (l.includes("box") || l.includes("basket") || l.includes("crate")) return "Storage";
  if (l.includes("tray") || l.includes("plate") || l.includes("dish")) return "Kitchen";
  if (l.includes("bag") || l.includes("cover") || l.includes("apron")) return "Accessories";
  if (l.includes("cushion")) return "Furniture";
  if (l.includes("trash") || l.includes("dustbin") || l.includes("bin")) return "Containers";
  return "General";
}

const BRANDS = [
  { name: "Aristo", slug: "aristo", folder: "ARISTO" },
  { name: "KG Plast", slug: "kg-plast", folder: "KG_PLAST" },
  { name: "Mango Chairs", slug: "mango-chairs", folder: "MANGO_CHAIRS" },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();

  const PUBLIC_DIR = path.join(__dirname, "..", "public", "products");

  for (const brandInfo of BRANDS) {
    const brand = await prisma.brand.create({
      data: { name: brandInfo.name, slug: brandInfo.folder.toLowerCase() },
    });

    const srcDir = path.join(__dirname, "..", "catalog_extractor", "output", brandInfo.folder);
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f)).slice(0, 15);
    let count = 0;

    for (const file of files) {
      const { productName, color, size } = parseFilename(file);
      const category = inferCategory(productName);

      await prisma.product.create({
        data: {
          name: productName,
          color,
          size,
          brandId: brand.id,
          imageUrl: `/products/${file}`,
          price: Math.floor(Math.random() * 1800) + 200,
          stock: Math.floor(Math.random() * 100) + 10,
          category,
        },
      });
      count++;
    }

    console.log(`${brandInfo.name}: ${count} products`);
  }

  const total = await prisma.product.count();
  console.log(`Total: ${total} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
