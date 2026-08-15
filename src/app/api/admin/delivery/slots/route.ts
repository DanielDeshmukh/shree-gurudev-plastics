import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const slots = await db.deliverySlot.findMany({ orderBy: { startTime: "asc" } });
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { label, startTime, endTime, maxOrders } = body;
    if (!label || !startTime || !endTime) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const slot = await db.deliverySlot.create({ data: { label, startTime, endTime, maxOrders: maxOrders || 5 } });
    return NextResponse.json({ slot }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { id, active, maxOrders } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (active !== undefined) data.active = active;
    if (maxOrders !== undefined) data.maxOrders = maxOrders;
    const slot = await db.deliverySlot.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json({ slot });
  } catch {
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.deliverySlot.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
