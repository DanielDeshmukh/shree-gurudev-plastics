import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAuthUser();
    const { id } = await params;

    const offer = await db.offer.findUnique({
      where: { id: parseInt(id) },
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
  } catch {
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAuthUser();
    const { id } = await params;
    const body = await request.json();
    const { title, description, discountPct, deadline, isActive, festivalSlug, scopeType, scopeValue, productIds } = body;

    const existing = await db.offer.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    if (productIds !== undefined) {
      await db.offerProduct.deleteMany({ where: { offerId: parseInt(id) } });
      if (productIds.length > 0) {
        await db.offerProduct.createMany({
          data: productIds.map((pid: number) => ({ offerId: parseInt(id), productId: pid })),
        });
      }
    }

    const offer = await db.offer.update({
      where: { id: parseInt(id) },
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "Failed to update offer", details: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getAuthUser();
    const { id } = await params;

    await db.offerProduct.deleteMany({ where: { offerId: parseInt(id) } });
    await db.offer.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
