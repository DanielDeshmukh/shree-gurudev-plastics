import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, customer, phone } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: "orderId and amount required" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${order.publicId}`,
      notes: { orderId: String(orderId), customer: customer || order.customer, phone: phone || order.phone },
    });

    await db.payment.create({
      data: {
        orderId,
        razorpayOrderId: rpOrder.id,
        amount: Math.round(amount * 100),
        currency: "INR",
        status: "created",
      },
    });

    return NextResponse.json({
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
