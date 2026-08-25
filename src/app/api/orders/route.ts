import { NextRequest, NextResponse } from "next/server";
import { db, sqliteNow, normalizeDate } from "@/lib/db";
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
    });

    orders.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime());

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[Orders GET]", error);
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
    const { customer, phone, deliveryMethod, address, notes, items, paymentMethod } = validation.data;

    // Generate unique 10-digit public ID
    let publicId: string;
    let attempts = 0;
    do {
      publicId = String(Math.floor(1000000000 + Math.random() * 9000000000));
      const existing = await db.order.findUnique({ where: { publicId } }).catch(() => null);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const trackingToken = crypto.randomBytes(16).toString("hex");

    // Atomic transaction: validate stock, deduct stock, create order
    const order = await db.$transaction(async (tx) => {
      // 1. Fetch products with stock info (select for update equivalent via transaction)
      const productIds = items.map((item) => item.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, stock: true, name: true, color: true },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 2. Validate prices AND check stock
      const stockIssues: { productId: number; name: string; requested: number; available: number }[] = [];
      const validatedItems = items.map((item) => {
        const dbProduct = productMap.get(item.productId);
        if (!dbProduct) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (dbProduct.stock < item.quantity) {
          stockIssues.push({
            productId: dbProduct.id,
            name: `${dbProduct.name}${dbProduct.color ? ` (${dbProduct.color})` : ""}`,
            requested: item.quantity,
            available: dbProduct.stock,
          });
        }
        return { ...item, price: dbProduct.price, color: dbProduct.color };
      });

      if (stockIssues.length > 0) {
        throw new Error(`INSUFFICIENT_STOCK:${JSON.stringify(stockIssues)}`);
      }

      // 3. Deduct stock
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Create or update customer
      let customerId: number | undefined;
      const total = validatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price, 0
      );

      const existingCustomer = await tx.customer.findUnique({ where: { phone } });
      if (existingCustomer) {
        await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            totalOrders: existingCustomer.totalOrders + 1,
            totalSpent: existingCustomer.totalSpent + total,
            lastOrderAt: sqliteNow(),
            address: address || existingCustomer.address,
          },
        });
        customerId = existingCustomer.id;
      } else {
        const newCustomer = await tx.customer.create({
          data: {
            name: customer,
            phone,
            address: address || null,
            totalOrders: 1,
            totalSpent: total,
            lastOrderAt: sqliteNow(),
          },
        });
        customerId = newCustomer.id;
      }

      // 5. Create order with items and status history
      const orderAddress = deliveryMethod === "pickup"
        ? (address || "Store Pickup - Bhayander")
        : (address || null);

      const order = await tx.order.create({
        data: {
          customer,
          phone,
          address: orderAddress,
          publicId,
          deliveryMethod: deliveryMethod || "delivery",
          paymentMethod: paymentMethod || "cod",
          paymentStatus: "unpaid",
          notes: notes || null,
          total,
          trackingToken,
          customerId: customerId || null,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              color: item.color || null,
            })),
          },
          statusHistory: {
            create: { status: "Order Placed", timestamp: sqliteNow() },
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      return order;
    });

    // 6. Create notification (outside transaction — non-critical)
    const itemSummary = order.items
      .map((i: any) => `${i.product.name} x${i.quantity}`)
      .join(", ");
    await db.notification.create({
      data: {
        type: "order",
        title: `New Order #${order.publicId}`,
        message: `${customer} (${phone}) placed an order: ${itemSummary}. Total: ₹${order.total.toLocaleString("en-IN")}`,
        orderId: order.id,
        createdAt: sqliteNow(),
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    // Handle specific transaction errors
    if (error?.message?.startsWith("INSUFFICIENT_STOCK:")) {
      const issues = JSON.parse(error.message.replace("INSUFFICIENT_STOCK:", ""));
      return NextResponse.json(
        { error: "Insufficient stock", stockIssues: issues },
        { status: 400 }
      );
    }
    if (error?.message?.startsWith("STOCK_RACE_CONDITION:")) {
      return NextResponse.json(
        { error: "Sorry, an item just went out of stock. Please refresh and try again." },
        { status: 409 }
      );
    }
    console.error("[Order Creation]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
