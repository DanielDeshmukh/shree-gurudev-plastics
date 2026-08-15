import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

const WHATSAPP_NUMBER = "918552084251";

const TEMPLATES = {
  order_confirmation: (customerName: string, orderId: number, total: number) =>
    `Hello ${customerName}! 🎉\n\nYour order #${orderId} has been confirmed.\nTotal: ₹${total.toLocaleString("en-IN")}\n\nThank you for shopping with Shree Gurudev Plastics!\nWe'll notify you when your order ships.\n\n— SGP Team`,
  
  delivery_followup: (customerName: string, orderId: number) =>
    `Hi ${customerName}! 📦\n\nJust checking in — has your order #${orderId} been delivered?\nPlease reply with:\n✅ Delivered\n❌ Not yet\n⚠️ Issue\n\nYour feedback helps us serve you better!\n\n— SGP Team`,
  
  review_request: (customerName: string, orderId: number) =>
    `Hi ${customerName}! ⭐\n\nWe hope you're enjoying your recent purchase (Order #${orderId})!\n\nWe'd love your feedback — it helps other customers and helps us improve.\n\nCould you take a moment to leave a review?\n\nThank you for choosing Shree Gurudev Plastics! 🙏`,
  
  restock_alert: (customerName: string, productName: string) =>
    `Hi ${customerName}! 📢\n\nGreat news — ${productName} is back in stock!\n\nOrder now before it runs out again.\n\nShop now: https://shreegurudevplastics.com/products\n\n— SGP Team`,

  arrival_notification: (customerName: string, orderId: number, items: { name: string; quantity: number; price: number }[], total: number) => {
    const itemList = items.map((item, i) => `${i + 1}. ${item.name} x ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}`).join("\n");
    return `Hi ${customerName}! 📦✨\n\nGreat news! Your order #${orderId} has arrived at our store and is ready for pickup!\n\nItems:\n${itemList}\n\nTotal: ₹${total.toLocaleString("en-IN")}\n\n📍 Visit us at:\nShree Gurudev Plastics\nNaigaon, Maharashtra\n📞 918552084251\n\nPlease collect at your earliest convenience.\n\n— SGP Team`;
  },
};

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentOrders = await db.order.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true } } } },
        customerRef: true,
      },
    });

    return NextResponse.json({ orders: recentOrders, templates: Object.keys(TEMPLATES) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch follow-up data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, template, customMessage } = body;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let message: string;
    if (template === "order_confirmation") {
      message = TEMPLATES.order_confirmation(order.customer, order.id, order.total);
    } else if (template === "delivery_followup") {
      message = TEMPLATES.delivery_followup(order.customer, order.id);
    } else if (template === "review_request") {
      message = TEMPLATES.review_request(order.customer, order.id);
    } else if (template === "restock_alert") {
      message = TEMPLATES.restock_alert(order.customer, order.items[0]?.product?.name || "your product");
    } else if (template === "arrival_notification") {
      const items = order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));
      message = TEMPLATES.arrival_notification(order.customer, order.id, items, order.total);
    } else if (customMessage) {
      message = customMessage;
    } else {
      return NextResponse.json({ error: "Template or custom message required" }, { status: 400 });
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.phone}?text=${encodedMessage}`;

    return NextResponse.json({
      message,
      whatsappUrl,
      phone: order.phone,
      customer: order.customer,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate follow-up" },
      { status: 500 }
    );
  }
}
