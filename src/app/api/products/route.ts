import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
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

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { brand: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
