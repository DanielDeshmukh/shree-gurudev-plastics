import { NextResponse } from "next/server";
import { db } from "@/lib/db";

let cache: { data: Record<string, unknown>; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ["festival_enabled", "festival_slug", "festival_discount_pct", "festival_banner_msg", "festival_end_date"],
        },
      },
    });

    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    const enabled = map.festival_enabled === "true";
    const endDate = map.festival_end_date || null;

    let isActive = enabled;
    if (isActive && endDate && new Date(endDate) < new Date()) {
      isActive = false;
    }

    const data = {
      enabled: isActive,
      slug: map.festival_slug || "",
      discountPct: parseInt(map.festival_discount_pct || "0"),
      bannerMessage: map.festival_banner_msg || "",
      endDate,
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ enabled: false, slug: "", discountPct: 0, bannerMessage: "", endDate: null });
  }
}
