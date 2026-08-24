import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 80);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = parseFloat(searchParams.get("minPrice") || "");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    where.isActive = true;

    if (brand) {
      // Normalize slug: hyphens to underscores to match DB format
      const normalizedBrand = brand.replace(/-/g, "_");
      where.brand = { slug: normalizedBrand };
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

    if (subCategory) {
      where.subCategory = subCategory;
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

    const [allProducts, total, priceStats, rawCategories] = await Promise.all([
      db.product.findMany({
        where,
        include: { brand: true },
        orderBy,
      }),
      db.product.count({ where }),
      db.product.aggregate({ where: { ...where, price: { ...where.price as any, gt: 0 } }, _min: { price: true }, _max: { price: true } }),
      db.product.findMany({
        where: { ...where, category: { not: "" } },
        select: { category: true, subCategory: true },
        orderBy: { category: "asc" },
      }),
    ]);

    // Group products by name — each group = one product family
    const grouped = new Map<string, any>();
    for (const p of allProducts) {
      const key = p.name;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ...p,
          colors: [{ id: p.id, slug: p.slug, color: p.color, imageUrl: p.imageUrl, price: p.price, stock: p.stock }],
        });
      } else {
        grouped.get(key)!.colors.push({ id: p.id, slug: p.slug, color: p.color, imageUrl: p.imageUrl, price: p.price, stock: p.stock });
      }
    }

    const products = Array.from(grouped.values());

    // Apply client-side sort on grouped products
    const sortedProducts = (() => {
      switch (sort) {
        case "price-asc": return [...products].sort((a, b) => a.price - b.price);
        case "price-desc": return [...products].sort((a, b) => b.price - a.price);
        case "name-asc": return [...products].sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc": return [...products].sort((a, b) => b.name.localeCompare(a.name));
        case "oldest": return [...products].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case "newest":
        default: return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    })();

    // Paginate grouped products
    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    // Build hierarchical categories: { name, subCategories[] }
    const catMap = new Map<string, Set<string>>();
    for (const c of rawCategories) {
      if (!catMap.has(c.category)) catMap.set(c.category, new Set());
      if (c.subCategory) catMap.get(c.category)!.add(c.subCategory);
    }
    const categories = Array.from(catMap.entries())
      .map(([name, subs]) => ({ name, subCategories: Array.from(subs).sort() }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit),
      },
      priceRange: {
        min: priceStats._min.price ?? 0,
        max: priceStats._max.price ?? 0,
      },
      categories,
    });
  } catch (error: any) {
    console.error("Products API error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const { name, color, size, brandId, imageUrl, price, stock, category, subCategory, description, tags, lowStockThreshold, retailerPrice, dealerPrice, distributorPrice, bulkPrice } = body;

    const product = await db.product.create({
      data: {
        name,
        slug: slugify(name) + "-" + Date.now(),
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
        category: category || "General",
        subCategory: subCategory || null,
        description: description || null,
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
