import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test 1: Simple count
    const productCount = await db.product.count();

    // Test 2: Find with brand
    const products = await db.product.findMany({
      include: { brand: true },
      take: 2,
    });

    return NextResponse.json({
      ok: true,
      productCount,
      sample: products.map(p => ({ id: p.id, name: p.name, brand: p.brand?.name })),
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error?.message,
      stack: error?.stack?.substring(0, 500),
    }, { status: 500 });
  }
}
