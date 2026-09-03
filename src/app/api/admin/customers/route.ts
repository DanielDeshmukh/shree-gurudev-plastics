import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getTierForQuantity } from "@/lib/pricing";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await db.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        },
      },
    });

    const enriched = customers.map((c) => {
      const totalQty = c.orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      );
      const calculatedTier = getTierForQuantity(totalQty);
      const totalOrders = c.orders.length;
      const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);
      const lastOrderAt = c.orders.length > 0
        ? c.orders.reduce((latest, o) => o.createdAt > latest ? o.createdAt : latest, c.orders[0].createdAt)
        : null;
      return { ...c, totalQty, calculatedTier, totalOrders, totalSpent, lastOrderAt };
    });

    enriched.sort((a, b) => {
      if (!a.lastOrderAt) return 1;
      if (!b.lastOrderAt) return -1;
      return b.lastOrderAt > a.lastOrderAt ? 1 : -1;
    });

    return NextResponse.json({ customers: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
