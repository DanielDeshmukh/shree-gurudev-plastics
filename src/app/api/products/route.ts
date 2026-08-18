import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = parseFloat(searchParams.get("minPrice") || "");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (brand) {
      where.brand = { slug: brand };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { color: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.price = {};
      if (!isNaN(minPrice)) (where.price as Record<string, number>).gte = minPrice;
      if (!isNaN(maxPrice)) (where.price as Record<string, number>).lte = maxPrice;
    }

    const orderBy = (() => {
      switch (sort) {
        case "price-asc": return { price: "asc" as const };
        case "price-desc": return { price: "desc" as const };
        case "name-asc": return { name: "asc" as const };
        case "name-desc": return { name: "desc" as const };
        case "oldest": return { createdAt: "asc" as const };
        case "newest":
        default: return { createdAt: "desc" as const };
      }
    })();

    const [products, total, priceStats, categories] = await Promise.all([
      db.product.findMany({
        where,
        include: { brand: true },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
      db.product.aggregate({ where: { ...where, price: { ...where.price as any, gt: 0 } }, _min: { price: true }, _max: { price: true } }),
      db.product.findMany({
        where: { ...where, category: { not: "" } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      priceRange: {
        min: priceStats._min.price ?? 0,
        max: priceStats._max.price ?? 0,
      },
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error: any) {
    console.error("Products API error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch products", detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAuthUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, color, size, brandId, imageUrl, price, stock, category, description, moq, tags, lowStockThreshold, retailerPrice, dealerPrice, distributorPrice, bulkPrice } = body;

    const product = await db.product.create({
      data: {
        name,
        color,
        size,
        brandId: parseInt(brandId),
        imageUrl,
        price: parseFloat(price) || 0,
        retailerPrice: parseFloat(retailerPrice) || 0,
        dealerPrice: parseFloat(dealerPrice) || 0,
        distributorPrice: parseFloat(distributorPrice) || 0,
        bulkPrice: parseFloat(bulkPrice) || 0,
        stock: parseInt(stock) || 0,
        category: category || "general",
        description: description || null,
        moq: parseInt(moq) || 1,
        tags: tags || "",
        lowStockThreshold: parseInt(lowStockThreshold) || 10,
      },
      include: { brand: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
