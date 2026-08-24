import { NextRequest, NextResponse } from "next/server";
import { db, normalizeDate } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const orders = await db.order.findMany({
      where,
      select: {
        total: true,
        createdAt: true,
      },
    }).then(r => r.sort((a, b) => new Date(normalizeDate(a.createdAt)).getTime() - new Date(normalizeDate(b.createdAt)).getTime()));

    const grouped: Record<string, { orders: number; revenue: number }> = {};

    for (const order of orders) {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { orders: 0, revenue: 0 };
      }
      grouped[date].orders += 1;
      grouped[date].revenue += order.total;
    }

    const sales = Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data,
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    return NextResponse.json({ sales, totalRevenue, totalOrders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
