import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orders = await db.purchaseOrder.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { supplierId, productId, productName, quantity, unitCost, expectedDate, invoiceNumber, notes } = body;
    if (!supplierId || !productId || !productName || !quantity || !unitCost) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const order = await db.purchaseOrder.create({
      data: {
        supplierId: parseInt(supplierId),
        productId: parseInt(productId),
        productName,
        quantity: parseInt(quantity),
        unitCost: parseFloat(unitCost),
        totalCost: parseInt(quantity) * parseFloat(unitCost),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        invoiceNumber: invoiceNumber || null,
        notes: notes || null,
      },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { id, status, receivedDate } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (receivedDate !== undefined) data.receivedDate = new Date(receivedDate);
    const order = await db.purchaseOrder.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.purchaseOrder.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete purchase order" }, { status: 500 });
  }
}
