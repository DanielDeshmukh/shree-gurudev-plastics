import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await db.setting.findUnique({ where: { key: "maintenance_mode" } });
    const etaSetting = await db.setting.findUnique({ where: { key: "maintenance_eta" } });
    const enabled = setting?.value === "true";
    const eta = etaSetting?.value || null;
    return NextResponse.json({ enabled, eta });
  } catch {
    return NextResponse.json({ enabled: false, eta: null });
  }
}
