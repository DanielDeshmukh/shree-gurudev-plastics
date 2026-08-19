import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid tracking link" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { trackingToken: token },
    select: {
      id: true,
      customer: true,
      phone: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { name: true, color: true, brand: { select: { name: true } } } },
        },
      },
      statusHistory: {
        orderBy: { timestamp: "asc" },
        select: { status: true, note: true, timestamp: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    customer: order.customer,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      name: item.product.name,
      color: item.product.color,
      brand: item.product.brand.name,
      quantity: item.quantity,
      price: item.price,
    })),
    timeline: order.statusHistory.map((h) => ({
      status: h.status,
      note: h.note,
      timestamp: h.timestamp,
    })),
  });
}
