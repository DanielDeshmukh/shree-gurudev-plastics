import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orders = await db.purchaseOrder.findMany({}).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));
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
    const numericId = parseId(id == null ? null : String(id));
    if (!numericId) return badRequest("Invalid id");
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (receivedDate !== undefined) data.receivedDate = new Date(receivedDate);
    const order = await db.purchaseOrder.update({ where: { id: numericId }, data });
    return NextResponse.json({ order });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Purchase order not found");
    return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const numericId = parseId(searchParams.get("id"));
    if (!numericId) return badRequest("Invalid id");
    await db.purchaseOrder.delete({ where: { id: numericId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Purchase order not found");
    return NextResponse.json({ error: "Failed to delete purchase order" }, { status: 500 });
  }
}
