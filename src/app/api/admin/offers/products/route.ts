import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") || "";
    const category = request.nextUrl.searchParams.get("category") || "";
    const brand = request.nextUrl.searchParams.get("brand") || "";
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "100");

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { color: { contains: search } },
        { size: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (brand) where.brand = { slug: brand };

    const products = await db.product.findMany({
      where,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        size: true,
        price: true,
        category: true,
        imageUrl: true,
        brand: { select: { name: true, slug: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
