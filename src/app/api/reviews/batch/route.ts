import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get("ids");
    if (!idsParam) return NextResponse.json({ ratings: {} });

    const ids = idsParam.split(",").map(Number).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ ratings: {} });

    const reviews = await db.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
      _count: { id: true },
      where: { productId: { in: ids }, status: "approved" },
    });

    const orders = await db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      where: { productId: { in: ids } },
    });

    const ratings: Record<number, { avg: number; count: number; totalOrdered: number }> = {};
    for (const id of ids) {
      const r = reviews.find((x) => x.productId === id);
      const o = orders.find((x) => x.productId === id);
      ratings[id] = {
        avg: r?._avg.rating ?? 0,
        count: r?._count.id ?? 0,
        totalOrdered: o?._sum.quantity ?? 0,
      };
    }

    return NextResponse.json({ ratings });
  } catch {
    return NextResponse.json({ ratings: {} });
  }
}
