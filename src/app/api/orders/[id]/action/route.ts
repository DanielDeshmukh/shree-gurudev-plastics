import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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
      // Check stock availability
      const stockIssues: string[] = [];
      for (const item of order.items) {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock < item.quantity) {
          stockIssues.push(`${product.name}: need ${item.quantity}, have ${product.stock}`);
        }
      }

      if (stockIssues.length > 0) {
        return NextResponse.json({
          error: "Insufficient stock",
          stockIssues,
        }, { status: 400 });
      }

      // Deduct stock and update order status
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const trackingUrl = `https://shreegurudevplastics.com/track/${order.trackingToken}`;

      await db.order.update({
        where: { id: orderId },
        data: { status: "confirmed" },
      });

      await db.orderStatusHistory.create({
        data: { orderId, status: "Confirmed" },
      });

      await db.notification.create({
        data: {
          type: "success",
          title: `Order #${orderId} Confirmed`,
          message: `Order from ${order.customer} (${order.phone}) confirmed. Stock deducted. Total: ₹${order.total.toLocaleString("en-IN")}`,
          orderId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order confirmed and stock deducted",
        whatsappUrl: `https://wa.me/91${order.phone}?text=${encodeURIComponent(
          `Hi ${order.customer}, your order #${orderId} has been confirmed! Total: ₹${order.total.toLocaleString("en-IN")}. Track your order here: ${trackingUrl} — Shree Gurudev Plastics`
        )}`,
      });
    }

    if (action === "cancel") {
      const cancelReason = reason || "Item unavailable";

      const trackingUrl = `https://shreegurudevplastics.com/track/${order.trackingToken}`;

      await db.order.update({
        where: { id: orderId },
        data: { status: "cancelled", notes: `Cancelled: ${cancelReason}` },
      });

      await db.orderStatusHistory.create({
        data: { orderId, status: "Cancelled", note: cancelReason },
      });

      await db.notification.create({
        data: {
          type: "warning",
          title: `Order #${orderId} Cancelled`,
          message: `Order from ${order.customer} (${order.phone}) cancelled. Reason: ${cancelReason}`,
          orderId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order cancelled",
        whatsappUrl: `https://wa.me/91${order.phone}?text=${encodeURIComponent(
          `Hi ${order.customer}, we regret to inform you that your order #${orderId} has been cancelled by the store due to: ${cancelReason}. Track your order status here: ${trackingUrl} — Shree Gurudev Plastics`
        )}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
