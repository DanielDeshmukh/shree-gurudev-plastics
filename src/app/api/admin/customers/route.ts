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
      orderBy: { lastOrderAt: "desc" },
    });

    const enriched = customers.map((c) => {
      const totalQty = c.orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      );
      const calculatedTier = getTierForQuantity(totalQty);
      return { ...c, totalQty, calculatedTier };
    });

    return NextResponse.json({ customers: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
