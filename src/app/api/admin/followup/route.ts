import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { SITE_URL, PHONE } from "@/lib/seo";

const WHATSAPP_NUMBER = PHONE;

const TEMPLATES = {
  order_confirmation: (customerName: string, publicId: string, total: number) =>
    `Hello ${customerName}! 🎉\n\nYour order #${publicId} has been confirmed.\nTotal: ₹${total.toLocaleString("en-IN")}\n\nThank you for shopping with Shree Gurudev Plastics!\nWe'll notify you when your order ships.\n\n— SGP Team`,
  
  delivery_followup: (customerName: string, publicId: string) =>
    `Hi ${customerName}! 📦\n\nJust checking in — has your order #${publicId} been delivered?\nPlease reply with:\n✅ Delivered\n❌ Not yet\n⚠️ Issue\n\nYour feedback helps us serve you better!\n\n— SGP Team`,
  
  review_request: (customerName: string, publicId: string) =>
    `Hi ${customerName}! ⭐\n\nWe hope you're enjoying your recent purchase (Order #${publicId})!\n\nWe'd love your feedback — it helps other customers and helps us improve.\n\nCould you take a moment to leave a review?\n\nThank you for choosing Shree Gurudev Plastics! 🙏`,
  
  restock_alert: (customerName: string, productName: string) =>
    `Hi ${customerName}! 📢\n\nGreat news — ${productName} is back in stock!\n\nOrder now before it runs out again.\n\nShop now: ${SITE_URL}/products\n\n— SGP Team`,

  arrival_notification: (customerName: string, publicId: string, items: { name: string; quantity: number; price: number }[], total: number) => {
    const itemList = items.map((item, i) => `${i + 1}. ${item.name} x ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}`).join("\n");
    return `Hi ${customerName}!\n\nGreat news! Your order #${publicId} has arrived at our store and is ready for pickup!\n\nItems:\n${itemList}\n\nTotal: ₹${total.toLocaleString("en-IN")}\n\nVisit us at:\nShree Gurudev Plastics\nNaigaon, Maharashtra\nPhone: ${PHONE}\n\nPlease collect at your earliest convenience.\n\n- SGP Team`;
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
      include: {
        items: { include: { product: { select: { name: true } } } },
        customerRef: true,
      },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime()));

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
      message = TEMPLATES.order_confirmation(order.customer, order.publicId, order.total);
    } else if (template === "delivery_followup") {
      message = TEMPLATES.delivery_followup(order.customer, order.publicId);
    } else if (template === "review_request") {
      message = TEMPLATES.review_request(order.customer, order.publicId);
    } else if (template === "restock_alert") {
      message = TEMPLATES.restock_alert(order.customer, order.items[0]?.product?.name || "your product");
    } else if (template === "arrival_notification") {
      const items = order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));
      message = TEMPLATES.arrival_notification(order.customer, order.publicId, items, order.total);
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
