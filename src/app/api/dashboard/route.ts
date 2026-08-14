import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalProducts, totalOrders, totalBrands, revenueResult, recentOrders, topProducts] =
      await Promise.all([
        db.product.count(),
        db.order.count(),
        db.brand.count(),
        db.order.aggregate({ _sum: { total: true } }),
        db.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { items: { include: { product: true } } },
        }),
        db.orderItem.groupBy({
          by: ["productId"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        }),
      ]);

    const topProductIds = topProducts.map((tp) => tp.productId);
    const topProductDetails = await db.product.findMany({
      where: { id: { in: topProductIds } },
    });

    const topProductsWithCount = topProducts.map((tp) => ({
      ...topProductDetails.find((p) => p.id === tp.productId),
      orderCount: tp._count.id,
    }));

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.total || 0,
      totalBrands,
      recentOrders,
      topProducts: topProductsWithCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
