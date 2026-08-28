import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFestivalCache, setFestivalCache } from "@/lib/festival-cache";

export async function GET() {
  try {
    const cached = getFestivalCache();
    if (cached) {
      return NextResponse.json(cached);
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
      await db.setting.update({
        where: { key: "festival_enabled" },
        data: { value: "false" },
      }).catch(() => {});
    }

    const data = {
      enabled: isActive,
      slug: map.festival_slug || "",
      discountPct: parseInt(map.festival_discount_pct || "0"),
      bannerMessage: map.festival_banner_msg || "",
      endDate,
    };

    setFestivalCache(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ enabled: false, slug: "", discountPct: 0, bannerMessage: "", endDate: null });
  }
}
