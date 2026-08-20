import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const enabled = process.env.MAINTENANCE_MODE === "true";
  const eta = process.env.MAINTENANCE_ETA || null;
  return NextResponse.json({ enabled, eta });
}

export async function POST(request: Request) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const enabled = body.enabled === true;
  const eta = body.eta || null;

  process.env.MAINTENANCE_MODE = enabled ? "true" : "false";
  process.env.MAINTENANCE_ETA = eta;

  return NextResponse.json({ enabled, eta });
}
