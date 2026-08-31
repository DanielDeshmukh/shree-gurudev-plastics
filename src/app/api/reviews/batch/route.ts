import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get("ids");
    if (!ids) return NextResponse.json({ ratings: {} });

    const productIds = ids.split(",").map(Number).filter(Boolean);
    if (productIds.length === 0) return NextResponse.json({ ratings: {} });

    const reviews = await db.review.findMany({
      where: { productId: { in: productIds }, approved: true },
      select: { productId: true, rating: true },
    });

    const orderItems = await db.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _sum: { quantity: true },
    });
    const orderMap: Record<number, number> = {};
    for (const oi of orderItems) {
      orderMap[oi.productId] = oi._sum.quantity ?? 0;
    }

    const ratings: Record<number, { avg: number; count: number; totalOrdered: number }> = {};
    for (const id of productIds) {
      const productReviews = reviews.filter((r) => r.productId === id);
      if (productReviews.length > 0) {
        const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        ratings[id] = { avg: Math.round(avg * 10) / 10, count: productReviews.length, totalOrdered: orderMap[id] ?? 0 };
      } else {
        ratings[id] = { avg: 0, count: 0, totalOrdered: orderMap[id] ?? 0 };
      }
    }

    return NextResponse.json({ ratings });
  } catch {
    return NextResponse.json({ ratings: {} });
  }
}
