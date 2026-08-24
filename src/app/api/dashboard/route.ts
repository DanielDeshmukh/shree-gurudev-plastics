import { NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    // 12 months ago from start of current month
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalProducts, totalOrders, totalBrands, totalCustomers,
      revenueResult, recentOrders, topProducts, allProducts,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.brand.count(),
      db.customer.count(),
      db.order.aggregate({ _sum: { total: true } }).catch(() => ({ _sum: { total: 0 } })),
      db.order.findMany({
        take: 5,
        include: { items: { include: { product: true } } },
      }).then(r => r.sort((a, b) => new Date(normalizeDate(b.createdAt)).getTime() - new Date(normalizeDate(a.createdAt)).getTime())).catch(() => []),
      db.orderItem.groupBy({
        by: ["productId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }).catch(() => []),
      db.product.findMany({ select: { stock: true, lowStockThreshold: true } }).catch(() => []),
    ]);

    const lowStockCount = allProducts.filter((p) => p.stock <= p.lowStockThreshold).length;
    const totalRevenue = revenueResult._sum?.total || 0;

    const topProductIds = topProducts.map((tp) => tp.productId);
    const topProductDetails = topProductIds.length > 0
      ? await db.product.findMany({ where: { id: { in: topProductIds } } }).catch(() => [])
      : [];
    const topProductsWithCount = topProducts
      .map((tp) => {
        const detail = topProductDetails.find((p) => p.id === tp.productId);
        if (!detail) return null;
        return { ...detail, orderCount: tp._count.id };
      })
      .filter(Boolean);

    // Optional enhanced data — wrapped in catches so dashboard always loads
    const [revenueThisYearResult, ordersThisMonth, ordersLastMonth, ordersByStatus, brandRevenueRaw, ordersByDay30, orders12Months] = await Promise.all([
      db.order.findMany({ where: { createdAt: { gte: thisYearStart } }, select: { total: true } }).catch(() => []),
      db.order.findMany({ where: { createdAt: { gte: thisMonthStart } }, select: { total: true } }).catch(() => []),
      db.order.findMany({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }, select: { total: true } }).catch(() => []),
      db.order.groupBy({ by: ["status"], _count: { id: true } }).catch(() => []),
      db.orderItem.findMany({ include: { product: { select: { brand: { select: { name: true } } } } } }).catch(() => []),
      db.order.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { total: true, createdAt: true } }).then(r => r.sort((a, b) => new Date(normalizeDate(a.createdAt)).getTime() - new Date(normalizeDate(b.createdAt)).getTime())).catch(() => []),
      db.order.findMany({ where: { createdAt: { gte: twelveMonthsAgo } }, select: { total: true, createdAt: true } }).then(r => r.sort((a, b) => new Date(normalizeDate(a.createdAt)).getTime() - new Date(normalizeDate(b.createdAt)).getTime())).catch(() => []),
    ]);

    const revenueThisYear = (revenueThisYearResult as any[]).reduce((sum: number, o: any) => sum + o.total, 0);
    const revenueThisMonth = (ordersThisMonth as any[]).reduce((sum: number, o: any) => sum + o.total, 0);
    const revenueLastMonth = (ordersLastMonth as any[]).reduce((sum: number, o: any) => sum + o.total, 0);

    // Build 12-month revenue breakdown
    const monthlyMap: Record<string, number> = {};
    // Initialize all 12 months with 0
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = 0;
    }
    for (const o of orders12Months as any[]) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyMap) monthlyMap[key] += o.total;
    }
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue12Months = Object.entries(monthlyMap).map(([key, revenue]) => {
      const [y, m] = key.split("-");
      return { month: `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`, revenue: Math.round(revenue) };
    });

    const orderStatusData = (ordersByStatus as any[]).map((s: any) => ({
      status: s.status,
      count: s._count.id,
    }));

    const brandRevenue: Record<string, number> = {};
    for (const item of brandRevenueRaw as any[]) {
      const brandName = item.product?.brand?.name || "Unknown";
      brandRevenue[brandName] = (brandRevenue[brandName] || 0) + item.quantity * item.price;
    }
    const brandRevenueData = Object.entries(brandRevenue)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const dailyData: Record<string, { date: string; revenue: number }> = {};
    for (const o of ordersByDay30 as any[]) {
      const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
      if (!dailyData[dateStr]) dailyData[dateStr] = { date: dateStr, revenue: 0 };
      dailyData[dateStr].revenue += o.total;
    }
    const revenueTimeline = Object.values(dailyData);

    return NextResponse.json({
      totalProducts, totalOrders, totalBrands, totalCustomers,
      totalRevenue, lowStockCount, recentOrders,
      topProducts: topProductsWithCount,
      revenueThisYear, revenueThisMonth, revenueLastMonth,
      monthlyRevenue12Months,
      orderStatusData, brandRevenueData, revenueTimeline,
    });
  } catch (error) {
    console.error("[Dashboard API]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
