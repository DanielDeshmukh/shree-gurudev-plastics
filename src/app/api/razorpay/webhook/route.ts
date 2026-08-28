import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    switch (eventType) {
      case "payment.captured": {
        const paymentData = payload.payment?.entity;
        if (paymentData) {
          const orderIdMatch = paymentData.notes?.orderId;
          if (orderIdMatch) {
            const orderId = parseInt(orderIdMatch);
            const payment = await db.payment.findFirst({ where: { razorpayOrderId: paymentData.order_id } });
            if (payment) {
              await db.payment.update({
                where: { id: payment.id },
                data: {
                  razorpayPaymentId: paymentData.id,
                  status: "captured",
                  method: paymentData.method,
                },
              });
              await db.order.update({
                where: { id: orderId },
                data: {
                  paymentStatus: "paid",
                  paymentMethod: "razorpay",
                  paymentNote: `Razorpay: ${paymentData.id}`,
                },
              });
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const failedData = payload.payment?.entity;
        if (failedData) {
          const orderIdMatch = failedData.notes?.orderId;
          if (orderIdMatch) {
            const orderId = parseInt(orderIdMatch);
            const payment = await db.payment.findFirst({ where: { razorpayOrderId: failedData.order_id } });
            if (payment) {
              await db.payment.update({
                where: { id: payment.id },
                data: {
                  razorpayPaymentId: failedData.id,
                  status: "failed",
                  description: failedData.error_description || "Payment failed",
                },
              });
            }
            await db.orderStatusHistory.create({
              data: {
                orderId,
                status: "Payment Failed",
                note: `Razorpay payment failed: ${failedData.error_description || "unknown error"}`,
              },
            });
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
