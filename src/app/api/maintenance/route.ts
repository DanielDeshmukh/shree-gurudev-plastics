import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

export async function POST(request: Request) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const enabled = body.enabled === true;
  const eta = body.eta || null;

  await db.setting.upsert({
    where: { key: "maintenance_mode" },
    update: { value: String(enabled) },
    create: { key: "maintenance_mode", value: String(enabled) },
  });

  await db.setting.upsert({
    where: { key: "maintenance_eta" },
    update: { value: eta || "" },
    create: { key: "maintenance_eta", value: eta || "" },
  });

  // Also set env var as fallback for middleware
  process.env.MAINTENANCE_MODE = String(enabled);
  process.env.MAINTENANCE_ETA = eta || "";

  return NextResponse.json({ enabled, eta });
}
