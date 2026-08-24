import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";

// Rate limiting: in-memory map of IP -> request count with TTL
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await params;

  // Strict token format: must be exactly 32 hex characters
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.json({ error: "Invalid tracking link" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { trackingToken: token },
    select: {
      publicId: true,
      customer: true,
      status: true,
      deliveryMethod: true,
      paymentMethod: true,
      paymentStatus: true,
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
        select: { status: true, note: true, timestamp: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.publicId,
    customer: order.customer,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      name: item.product.name,
      color: item.color || item.product.color,
      brand: item.product.brand?.name || "Unknown",
      quantity: item.quantity,
      price: item.price,
    })),
    timeline: order.statusHistory
      .map((h: any) => ({
        status: h.status,
        note: h.note,
        timestamp: normalizeDate(h.timestamp),
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  });
}
