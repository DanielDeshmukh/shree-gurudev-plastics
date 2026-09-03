import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await getAuthUser();

    const offers = await db.offer.findMany({
      include: {
        products: {
          select: { productId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = offers.map((o) => ({
      ...o,
      productCount: o.products.length,
      productIds: o.products.map((p) => p.productId),
      products: undefined,
    }));

    return NextResponse.json({ offers: mapped });
  } catch {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getAuthUser();

    const body = await request.json();
    const { title, description, discountPct, deadline, isActive, festivalSlug, scopeType, scopeValue, productIds } = body;

    if (!title || !discountPct) {
      return NextResponse.json({ error: "Title and discount percentage are required" }, { status: 400 });
    }

    const offer = await db.offer.create({
      data: {
        title,
        description: description || null,
        discountPct: parseFloat(discountPct),
        deadline: deadline ? new Date(deadline) : null,
        isActive: isActive !== false,
        festivalSlug: festivalSlug || null,
        scopeType: scopeType || "all",
        scopeValue: scopeValue || null,
        products: productIds?.length
          ? { create: productIds.map((id: number) => ({ productId: id })) }
          : undefined,
      },
      include: {
        products: { select: { productId: true } },
      },
    });

    return NextResponse.json({
      ...offer,
      productCount: offer.products.length,
      productIds: offer.products.map((p) => p.productId),
      products: undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create offer", details: msg }, { status: 500 });
  }
}
