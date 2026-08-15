import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const schedules = await db.deliverySchedule.findMany({ orderBy: { date: "desc" }, take: 100 });
    return NextResponse.json({ schedules });
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { orderId, customerId, slotId, date, address, pincode, contactPhone, notes } = body;
    if (!orderId || !customerId || !slotId || !date || !address || !pincode || !contactPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const schedule = await db.deliverySchedule.create({
      data: {
        orderId: parseInt(orderId),
        customerId: parseInt(customerId),
        slotId: parseInt(slotId),
        date: new Date(date),
        address,
        pincode,
        contactPhone,
        notes: notes || null,
      },
    });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { id, status, driverName, driverPhone } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      data.status = status;
      if (status === "delivered") data.deliveredAt = new Date();
    }
    if (driverName !== undefined) data.driverName = driverName;
    if (driverPhone !== undefined) data.driverPhone = driverPhone;
    const schedule = await db.deliverySchedule.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
