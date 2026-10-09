import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid offer id");

    const offer = await db.offer.findUnique({
      where: { id: numericId },
      include: {
        products: {
          select: {
            productId: true,
            product: {
              select: { id: true, name: true, slug: true, color: true, size: true, price: true, category: true, imageUrl: true, brand: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    return NextResponse.json({
      ...offer,
      productCount: offer.products.length,
      selectedProducts: offer.products.map((p) => p.product),
      products: undefined,
    });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Offer not found");
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid offer id");
    const body = await request.json();
    const { title, description, discountPct, deadline, isActive, festivalSlug, scopeType, scopeValue, productIds } = body;

    const existing = await db.offer.findUnique({ where: { id: numericId } });
    if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    if (productIds !== undefined) {
      await db.offerProduct.deleteMany({ where: { offerId: numericId } });
      if (productIds.length > 0) {
        await db.offerProduct.createMany({
          data: productIds.map((pid: number) => ({ offerId: numericId, productId: pid })),
        });
      }
    }

    const offer = await db.offer.update({
      where: { id: numericId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(discountPct !== undefined && { discountPct: parseFloat(discountPct) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(festivalSlug !== undefined && { festivalSlug: festivalSlug || null }),
        ...(scopeType !== undefined && { scopeType }),
        ...(scopeValue !== undefined && { scopeValue: scopeValue || null }),
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
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Offer not found");
    return NextResponse.json({ error: "Failed to update offer", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const numericId = parseId(id);
    if (!numericId) return badRequest("Invalid offer id");

    await db.offerProduct.deleteMany({ where: { offerId: numericId } });
    await db.offer.delete({ where: { id: numericId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) return notFoundJson("Offer not found");
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
