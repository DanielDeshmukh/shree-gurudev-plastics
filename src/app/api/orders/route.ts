import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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
    const { customer, phone, address, notes, items } = body;

    const total = items.reduce(
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

    const order = await db.order.create({
      data: {
        customer,
        phone,
        address: address || null,
        notes: notes || null,
        total,
        customerId: customerId || null,
        items: {
          create: items.map((item: { productId: number; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
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
