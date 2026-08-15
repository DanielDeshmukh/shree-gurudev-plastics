import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await db.recurringOrder.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch recurring orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { customerId, productId, productName, quantity, frequency, pricePerUnit, notes } = body;

    if (!customerId || !productId || !productName || !quantity || !pricePerUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();
    let nextOrderDate = new Date(now);
    switch (frequency || "weekly") {
      case "daily": nextOrderDate.setDate(nextOrderDate.getDate() + 1); break;
      case "weekly": nextOrderDate.setDate(nextOrderDate.getDate() + 7); break;
      case "biweekly": nextOrderDate.setDate(nextOrderDate.getDate() + 14); break;
      case "monthly": nextOrderDate.setMonth(nextOrderDate.getMonth() + 1); break;
    }

    const order = await db.recurringOrder.create({
      data: {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        productName,
        quantity: parseInt(quantity),
        frequency: frequency || "weekly",
        nextOrderDate,
        pricePerUnit: parseFloat(pricePerUnit),
        notes: notes || null,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create recurring order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status, frequency, quantity } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (frequency !== undefined) data.frequency = frequency;
    if (quantity !== undefined) data.quantity = parseInt(quantity);

    const order = await db.recurringOrder.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to update recurring order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.recurringOrder.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete recurring order" }, { status: 500 });
  }
}
