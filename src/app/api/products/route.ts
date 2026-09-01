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

const COMING_SOON_BRAND_SLUGS = ["reego"];

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
  const ids = searchParams.get("ids");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const ungrouped = searchParams.get("ungrouped") === "true";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

  if (ids) {
    const idList = ids.split(",").map(Number).filter(Boolean);
    where.id = { in: idList };
  }

    where.isActive = true;

    // Exclude coming soon brands from public listings
    if (brand) {
      const normalized = brand.replace(/-/g, "_");
      if (COMING_SOON_BRAND_SLUGS.includes(normalized)) {
        return NextResponse.json({
          products: [],
          pagination: { page: 1, limit: 0, total: 0, totalPages: 0 },
          priceRange: { min: 0, max: 0 },
          categories: [],
        });
      }
      where.brand = { slug: normalized };
    } else {
      where.brand = { slug: { notIn: COMING_SOON_BRAND_SLUGS } };
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

    // Fetch products and categories separately (avoid aggregate issues with Turso)
    const [allProducts, rawCategories] = await Promise.all([
      db.product.findMany({
        where,
        include: { brand: true },
      }),
      db.product.findMany({
        where: { ...where, category: { not: "" } },
        select: { category: true, subCategory: true },
      }),
    ]);

    // Compute price range from fetched data (avoids Turso aggregate issues)
    const prices = allProducts.map(p => p.price).filter(p => p > 0);
    const priceStats = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    // Group products by name — each group = one product family
    let products: any[];
    if (ungrouped) {
      products = allProducts;
    } else {
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
      products = Array.from(grouped.values());
    }

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
        min: priceStats.min,
        max: priceStats.max,
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
