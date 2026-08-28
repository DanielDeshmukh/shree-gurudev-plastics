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

      case "subscription.authenticated": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: sub.id },
            data: {
              status: "authenticated",
              razorpayPaymentMethod: sub.payment_method || null,
              mandateId: sub.token_id || null,
              currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : null,
              currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : null,
            },
          }).catch(() => {});
        }
        break;
      }

      case "subscription.activated": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: sub.id },
            data: {
              status: "active",
              currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : null,
              currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : null,
              nextBillingDate: sub.current_end ? new Date(sub.current_end * 1000) : null,
            },
          }).catch(() => {});
        }
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: sub.id },
            data: {
              status: "active",
              currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : null,
              currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : null,
              nextBillingDate: sub.current_end ? new Date(sub.current_end * 1000) : null,
            },
          }).catch(() => {});
        }
        break;
      }

      case "subscription.cancelled": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: sub.id },
            data: { status: "cancelled" },
          }).catch(() => {});
        }
        break;
      }

      case "subscription.paused": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: sub.id },
            data: { status: "paused" },
          }).catch(() => {});
        }
        break;
      }

      case "invoice.paid": {
        const invoice = payload.invoice?.entity;
        if (invoice?.subscription_id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: invoice.subscription_id },
            data: {
              status: "active",
              nextBillingDate: invoice.next_invoice_at ? new Date(invoice.next_invoice_at * 1000) : null,
            },
          }).catch(() => {});
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = payload.invoice?.entity;
        if (invoice?.subscription_id) {
          await db.subscription.update({
            where: { razorpaySubscriptionId: invoice.subscription_id },
            data: { status: "past_due" },
          }).catch(() => {});
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
