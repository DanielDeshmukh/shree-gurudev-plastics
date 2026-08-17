import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseBaseColor(rawColor: string, productName: string): string {
  let c = rawColor || "";
  const prefix = productName.toLowerCase().trim();
  const prefixHyphen = prefix.replace(/\s+/g, "-");
  if (c.toLowerCase().startsWith(prefix + " ")) {
    c = c.substring(prefix.length + 1);
  } else if (c.toLowerCase().startsWith(prefixHyphen + " ")) {
    c = c.substring(prefixHyphen.length + 1);
  } else if (c.toLowerCase().startsWith(prefixHyphen + "-")) {
    c = c.substring(prefixHyphen.length + 1);
  }
  c = c.replace(/\s+\d+$/, "").trim();
  return c;
}

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  "dark grey": "#555555",
  grey: "#888888",
  white: "#f5f5f5",
  red: "#dc2626",
  "brick red": "#a0323c",
  "rose red": "#e11d48",
  cherry: "#dc2626",
  orange: "#f97316",
  "mango orange": "#f97316",
  yellow: "#eab308",
  "mango yellow": "#eab308",
  gold: "#d4a017",
  green: "#16a34a",
  "citrus green": "#65a30d",
  "olive green": "#4d6b35",
  blue: "#2563eb",
  "mist blue": "#7ba7c2",
  pink: "#ec4899",
  "dark peach": "#d97757",
  beige: "#d4c5a9",
  "marble beige": "#c8bfa9",
  "rattan dark beige": "#a0845c",
  brown: "#92400e",
  "eagle brown": "#6b4226",
  "teak wood": "#8b6914",
  "siesta brown": "#8b5e3c",
  "weather brown": "#a08050",
  "sandal wood": "#c8ad7f",
  "sandal yellow": "#d4b86a",
  cream: "#fffdd0",
  "milky white": "#f0ead6",
  purple: "#7c3aed",
  "plaza top": "#b8860b",
};

function getColorHex(name: string): string {
  const lower = name.toLowerCase();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  const h = lower.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = h % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

export async function GET() {
  try {
    const images = await db.productImage.findMany({
      select: { color: true, product: { select: { name: true } } },
    });

    const colorSet = new Map<string, number>();

    for (const img of images) {
      if (!img.color) continue;
      const base = parseBaseColor(img.color, img.product.name);
      if (!base || base.toLowerCase() === "other") continue;
      const key = base.toLowerCase();
      colorSet.set(base, (colorSet.get(base) || 0) + 1);
    }

    const colors = Array.from(colorSet.entries())
      .map(([name, count]) => ({
        name,
        hex: getColorHex(name),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    return NextResponse.json({ colors });
  } catch {
    return NextResponse.json({ colors: [] });
  }
}
