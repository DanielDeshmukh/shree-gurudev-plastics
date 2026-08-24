import { NextRequest, NextResponse } from "next/server";
import { db, sqliteNow } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/seo";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

  try {
    const body = await request.json();
    const { action, reason } = body;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (action === "process") {
      // Idempotency: skip if already confirmed or later
      if (["confirmed", "shipped", "delivered"].includes(order.status)) {
        return NextResponse.json({
          success: true,
          message: `Order already ${order.status}`,
        });
      }

      // Stock already deducted at order creation — just update status
      const trackingUrl = `${SITE_URL}/track/${order.trackingToken}`;

      await db.order.update({
        where: { id: orderId },
        data: { status: "confirmed" },
      });

      await db.orderStatusHistory.create({
        data: { orderId, status: "Confirmed", timestamp: sqliteNow() },
      });

      await db.notification.create({
        data: {
          type: "success",
          title: `Order #${order.publicId} Confirmed`,
          message: `Order from ${order.customer} (${order.phone}) confirmed. Total: ₹${order.total.toLocaleString("en-IN")}`,
          orderId,
          createdAt: sqliteNow(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order confirmed",
        whatsappUrl: `https://wa.me/91${order.phone}?text=${encodeURIComponent(
          `Hi ${order.customer}, your order #${order.publicId} has been confirmed! Total: ₹${order.total.toLocaleString("en-IN")}. Track your order here: ${trackingUrl} — Shree Gurudev Plastics`
        )}`,
      });
    }

    if (action === "cancel") {
      // Idempotency: skip if already cancelled
      if (order.status === "cancelled") {
        return NextResponse.json({
          success: true,
          message: "Order already cancelled",
        });
      }

      const cancelReason = reason || "Item unavailable";
      const trackingUrl = `${SITE_URL}/track/${order.trackingToken}`;

      // Restore stock for each item
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await db.order.update({
        where: { id: orderId },
        data: { status: "cancelled", notes: `Cancelled: ${cancelReason}` },
      });

      await db.orderStatusHistory.create({
        data: { orderId, status: "Cancelled", note: cancelReason, timestamp: sqliteNow() },
      });

      await db.notification.create({
        data: {
          type: "warning",
          title: `Order #${order.publicId} Cancelled`,
          message: `Order from ${order.customer} (${order.phone}) cancelled. Reason: ${cancelReason}`,
          orderId,
          createdAt: sqliteNow(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order cancelled",
        whatsappUrl: `https://wa.me/91${order.phone}?text=${encodeURIComponent(
          `Hi ${order.customer}, we regret to inform you that your order #${order.publicId} has been cancelled by the store due to: ${cancelReason}. Track your order status here: ${trackingUrl} — Shree Gurudev Plastics`
        )}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
