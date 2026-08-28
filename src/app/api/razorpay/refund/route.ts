import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { paymentId, amount, reason } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    const payment = await db.payment.findFirst({ where: { razorpayPaymentId: paymentId } });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (payment.status !== "captured") {
      return NextResponse.json({ error: "Only captured payments can be refunded" }, { status: 400 });
    }

    const refundAmount = amount || payment.amount;
    const refund = await razorpay().payments.refund(paymentId, {
      amount: refundAmount,
    });

    await db.payment.update({
      where: { id: payment.id },
      data: { status: "refunded" },
    });

    if (payment.orderId) {
      await db.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: "Refunded",
          note: `Refund of Rs.${(refundAmount / 100).toLocaleString("en-IN")} processed. Refund ID: ${refund.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, refundId: refund.id, amount: refundAmount });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: error.message || "Refund failed" }, { status: 500 });
  }
}
