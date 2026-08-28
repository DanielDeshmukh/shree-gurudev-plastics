import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { clearFestivalCache } from "@/lib/festival-cache";

const FESTIVAL_KEYS = [
  "festival_enabled",
  "festival_slug",
  "festival_discount_pct",
  "festival_banner_msg",
  "festival_end_date",
];

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await db.setting.findMany({
      where: { key: { in: FESTIVAL_KEYS } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    return NextResponse.json({
      enabled: map.festival_enabled === "true",
      slug: map.festival_slug || "",
      discountPct: parseInt(map.festival_discount_pct || "0"),
      bannerMessage: map.festival_banner_msg || "",
      endDate: map.festival_end_date || null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch festival settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { enabled, slug, discountPct, bannerMessage, endDate } = body;

    const upserts = [
      db.setting.upsert({ where: { key: "festival_enabled" }, update: { value: String(enabled) }, create: { key: "festival_enabled", value: String(enabled) } }),
      db.setting.upsert({ where: { key: "festival_slug" }, update: { value: slug || "" }, create: { key: "festival_slug", value: slug || "" } }),
      db.setting.upsert({ where: { key: "festival_discount_pct" }, update: { value: String(discountPct || 0) }, create: { key: "festival_discount_pct", value: String(discountPct || 0) } }),
      db.setting.upsert({ where: { key: "festival_banner_msg" }, update: { value: bannerMessage || "" }, create: { key: "festival_banner_msg", value: bannerMessage || "" } }),
      db.setting.upsert({ where: { key: "festival_end_date" }, update: { value: endDate || "" }, create: { key: "festival_end_date", value: endDate || "" } }),
    ];

    await Promise.all(upserts);

    clearFestivalCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save festival settings" }, { status: 500 });
  }
}
