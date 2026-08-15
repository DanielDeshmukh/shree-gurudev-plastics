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
      recentOrders,
      ordersLast30Days,
      ordersLast7Days,
      allOrderItems,
      categoryCounts,
      ordersByDay,
      topCustomers,
    ] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.customer.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.order.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      }),
      db.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
      }),
      db.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { total: true, createdAt: true },
      }),
      db.orderItem.findMany({
        include: { product: { select: { name: true, category: true, price: true } } },
      }),
      db.product.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      db.order.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        _sum: { total: true },
        orderBy: { createdAt: "asc" },
      }),
      db.customer.findMany({
        orderBy: { totalSpent: "desc" },
        take: 10,
        select: { name: true, phone: true, totalOrders: true, totalSpent: true },
      }),
    ]);

    const totalRevenue = revenueResult._sum.total || 0;
    const revenueLast30Days = ordersLast30Days.reduce((sum, o) => sum + o.total, 0);
    const revenueLast7Days = ordersLast7Days.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const item of allOrderItems) {
      const key = item.product.name;
      if (!productSales[key]) {
        productSales[key] = { name: key, count: 0, revenue: 0 };
      }
      productSales[key].count += item.quantity;
      productSales[key].revenue += item.quantity * item.price;
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const categoryData = categoryCounts.map((c) => ({
      category: c.category,
      count: c._count.id,
    }));

    const dailyData: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (const o of ordersByDay) {
      const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
      }
      dailyData[dateStr].orders += o._count.id;
      dailyData[dateStr].revenue += o._sum.total || 0;
    }
    const salesTimeline = Object.values(dailyData).slice(-30);

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
      topCustomers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
