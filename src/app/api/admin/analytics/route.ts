import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueResult,
      ordersLast30Days,
      ordersLast7Days,
      categoryCounts,
      topCustomers,
    ] = await Promise.all([
      db.order.count().catch(() => 0),
      db.product.count().catch(() => 0),
      db.customer.count().catch(() => 0),
      db.order.aggregate({ _sum: { total: true } }).catch(() => ({ _sum: { total: 0 } })),
      db.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
      }).catch(() => []),
      db.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { total: true, createdAt: true },
      }).catch(() => []),
      db.product.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }).catch(() => []),
      db.customer.findMany({
        orderBy: { totalSpent: "desc" },
        take: 10,
        select: { name: true, phone: true, totalOrders: true, totalSpent: true },
      }).catch(() => []),
    ]);

    const totalRevenue = revenueResult._sum?.total || 0;
    const revenueLast30Days = (ordersLast30Days as any[]).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const revenueLast7Days = (ordersLast7Days as any[]).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order items for product sales — separate query so it can't break the rest
    let topProducts: { name: string; count: number; revenue: number }[] = [];
    try {
      const allOrderItems = await db.orderItem.findMany({
        include: { product: { select: { name: true, category: true, price: true } } },
      });
      const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
      for (const item of allOrderItems) {
        const key = item.product?.name || "Unknown";
        if (!productSales[key]) productSales[key] = { name: key, count: 0, revenue: 0 };
        productSales[key].count += item.quantity;
        productSales[key].revenue += item.quantity * item.price;
      }
      topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch {}

    const categoryData = (categoryCounts as any[]).map((c: any) => ({
      category: c.category || "Uncategorized",
      count: c._count?.id || 0,
    }));

    // Build sales timeline from order-level data (avoid groupBy on DateTime)
    const salesTimelineData = (ordersLast30Days as any[]).reduce((acc: Record<string, { date: string; orders: number; revenue: number }>, o: any) => {
      const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
      acc[dateStr].orders += 1;
      acc[dateStr].revenue += o.total || 0;
      return acc;
    }, {} as Record<string, { date: string; orders: number; revenue: number }>);
    const salesTimeline = Object.values(salesTimelineData).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        avgOrderValue,
        revenueLast30Days,
        revenueLast7Days,
      },
      topProducts,
      categoryData,
      salesTimeline,
      topCustomers: topCustomers || [],
    });
  } catch (error) {
    console.error("[Analytics API]", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
