import { NextRequest, NextResponse } from "next/server";
import { db, sqliteNow } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.json({ error: "Invalid tracking link" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { trackingToken: token },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (["cancelled", "delivered"].includes(order.status)) {
    return NextResponse.json(
      { error: `Order is already ${order.status}` },
      { status: 400 }
    );
  }

  let body: { reason?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const reason = body.reason || "Cancelled by customer";

  // Restore stock
  for (const item of order.items) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  // Update order status
  await db.order.update({
    where: { id: order.id },
    data: { status: "cancelled", notes: `Cancelled by customer: ${reason}` },
  });

  // Create status history
  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "Cancelled",
      note: `Customer cancelled: ${reason}`,
      timestamp: sqliteNow(),
    },
  });

  // Notify admin
  await db.notification.create({
    data: {
      type: "warning",
      title: `Order #${order.publicId} Cancelled by Customer`,
      message: `${order.customer} (${order.phone}) cancelled their order. Reason: ${reason}. Total: ₹${order.total.toLocaleString("en-IN")} — stock has been restored.`,
      orderId: order.id,
      createdAt: sqliteNow(),
    },
  });

  return NextResponse.json({ success: true, message: "Order cancelled successfully" });
}
