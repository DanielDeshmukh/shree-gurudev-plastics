import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    const orderItems = await db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const productIds = orderItems.map((oi) => oi.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { brand: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const mostBought = orderItems
      .map((oi) => {
        const product = productMap.get(oi.productId);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          color: product.color,
          size: product.size,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          category: product.category,
          brand: product.brand?.name || null,
          totalOrdered: oi._sum.quantity || 0,
          orderCount: oi._count.id || 0,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ mostBought });
  } catch (error) {
    return NextResponse.json({ mostBought: [] });
  }
}
