import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { calculateTier } from "@/lib/pricing";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    let tier = body.tier;
    if (!tier) {
      const customer = await db.customer.findUnique({ where: { id: parseInt(id) } });
      if (customer) {
        tier = calculateTier(customer.totalOrders, customer.totalSpent);
      }
    }

    const customer = await db.customer.update({
      where: { id: parseInt(id) },
      data: { tier },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}
