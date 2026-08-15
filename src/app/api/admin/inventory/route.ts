import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getAuthUser();
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allProducts = await db.product.findMany({
      include: { brand: true },
      orderBy: { stock: "asc" },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.stock <= p.lowStockThreshold
    );

    return NextResponse.json({ products: lowStockProducts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch inventory alerts" },
      { status: 500 }
    );
  }
}
