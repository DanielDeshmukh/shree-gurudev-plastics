import { NextRequest, NextResponse } from "next/server";
import { db, sqliteNow } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

const STATUS_MAP: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  arrived: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "Order Placed": "Order Placed",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  "Out for Delivery": "Out for Delivery",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

const STATUS_ORDER = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function normalizeStatus(raw: string): string {
  if (STATUS_MAP[raw]) return STATUS_MAP[raw];
  return raw;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
const VALID_STATUSES = [
  "pending", "confirmed", "processing", "shipped",
  "arrived", "out_for_delivery", "delivered", "cancelled",
  "Order Placed", "Confirmed", "Processing", "Shipped",
  "Out for Delivery", "Delivered",
];

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.customer !== undefined) data.customer = body.customer;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.total !== undefined) data.total = parseFloat(body.total);
    if (body.paymentStatus !== undefined) data.paymentStatus = body.paymentStatus;
    if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;
    if (body.paymentNote !== undefined) data.paymentNote = body.paymentNote;

    const order = await db.order.update({
      where: { id: parseInt(id) },
      data,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (body.status !== undefined && order) {
      const newStatus = normalizeStatus(body.status);
      const now = sqliteNow();

      if (newStatus !== "Cancelled") {
        const newIdx = STATUS_ORDER.indexOf(newStatus);
        if (newIdx > 0) {
          const existing = await db.orderStatusHistory.findMany({
            where: { orderId: order.id },
          });
          const existingStatuses = new Set(existing.map((e) => e.status));

          for (let i = 0; i < newIdx; i++) {
            const intermediate = STATUS_ORDER[i];
            if (!existingStatuses.has(intermediate)) {
              await db.orderStatusHistory.create({
                data: { orderId: order.id, status: intermediate, timestamp: now },
              });
            }
          }
        }
      }

      await db.orderStatusHistory.create({
        data: { orderId: order.id, status: newStatus, timestamp: now },
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    await db.order.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
