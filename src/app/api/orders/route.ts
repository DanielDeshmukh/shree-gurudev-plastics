import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { validate, createOrderSchema } from "@/lib/validation";
import crypto from "crypto";

export async function GET() {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validate(createOrderSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { customer, phone, deliveryMethod, address, notes, items } = validation.data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Server-side price validation: verify prices against database
    const productIds = items.map((item) => item.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

    const validatedItems = items.map((item) => {
      const dbPrice = priceMap.get(item.productId);
      if (dbPrice === undefined) {
        throw new Error(`Product ${item.productId} not found`);
      }
      return { ...item, price: dbPrice };
    });

    const total = validatedItems.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + item.quantity * item.price,
      0
    );

    const existingCustomer = await db.customer.findUnique({
      where: { phone },
    });

    let customerId: number | undefined;
    if (existingCustomer) {
      await db.customer.update({
        where: { id: existingCustomer.id },
        data: {
          totalOrders: existingCustomer.totalOrders + 1,
          totalSpent: existingCustomer.totalSpent + total,
          lastOrderAt: new Date(),
          address: address || existingCustomer.address,
        },
      });
      customerId = existingCustomer.id;
    } else {
      const newCustomer = await db.customer.create({
        data: {
          name: customer,
          phone,
          address: address || null,
          totalOrders: 1,
          totalSpent: total,
          lastOrderAt: new Date(),
        },
      });
      customerId = newCustomer.id;
    }

    const trackingToken = crypto.randomBytes(16).toString("hex");

    const orderAddress = deliveryMethod === "pickup"
      ? (address || "Store Pickup - Bhayander")
      : (address || null);

    const order = await db.order.create({
      data: {
        customer,
        phone,
        address: orderAddress,
        deliveryMethod: deliveryMethod || "delivery",
        notes: notes || null,
        total,
        trackingToken,
        customerId: customerId || null,
        items: {
          create: validatedItems.map((item: { productId: number; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        statusHistory: {
          create: { status: "Order Placed" },
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Create notification for admin
    const itemSummary = order.items
      .map((i: any) => `${i.product.name} x${i.quantity}`)
      .join(", ");
    await db.notification.create({
      data: {
        type: "order",
        title: `New Order #${order.id}`,
        message: `${customer} (${phone}) placed an order: ${itemSummary}. Total: ₹${total.toLocaleString("en-IN")}`,
        orderId: order.id,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
