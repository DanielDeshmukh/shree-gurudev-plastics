import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const productCount = await db.product.count();
    const brandCount = await db.brand.count();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      counts: { products: productCount, brands: brandCount },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "disconnected", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
