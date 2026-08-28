import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const payment = await db.payment.findFirst({ where: { razorpayOrderId: razorpay_order_id } });
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        paymentNote: `Razorpay: ${razorpay_payment_id}`,
      },
    });

    await db.orderStatusHistory.create({
      data: {
        orderId,
        status: "Payment Received",
        note: `Razorpay payment captured: ${razorpay_payment_id}`,
      },
    });

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
