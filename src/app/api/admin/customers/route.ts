import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await db.customer.findMany({
      include: { orders: { select: { id: true, total: true, status: true, createdAt: true } } },
      orderBy: { lastOrderAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
